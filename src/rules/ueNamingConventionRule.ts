import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export class UENamingConventionRule implements Rule {
    
    id = 'ueNamingConvention';
    description = '在继承自UE的类中，函数和变量的首字母必须大写';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        
        // 检查文件是否是 UE 脚本（通过 export default 判断）
        const isUEScript = this.isUEScriptFile(text);
        
        // 如果不是 UE 脚本，则不进行检查
        if (!isUEScript) {
            return issues;
        }
        
        // 查找所有类声明，以确定哪些类继承自UE
        const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
        const ueClasses = new Set<string>();
        const classInheritance = new Map<string, string>(); // 类继承关系映射
        let classMatch;
        
        // 首先识别所有类的继承关系
        while ((classMatch = classRegex.exec(text)) !== null) {
            const className = classMatch[1];
            const parentClass = classMatch[2];
            
            if (parentClass) {
                classInheritance.set(className, parentClass);
                
                // 检查是否是UE类（以UE.开头的类）
                if (parentClass.startsWith('UE.')) {
                    ueClasses.add(className);
                }
            }
            
            // 如果文件是 UE 脚本，则所有类都视为 UE 类
            ueClasses.add(className);
        }
        
        // 递归检查类的继承链，找出所有直接或间接继承自UE类的类
        const isUEDerivedClass = (className: string): boolean => {
            if (ueClasses.has(className)) {
                return true;
            }
            
            const parentClass = classInheritance.get(className);
            if (!parentClass) {
                return false;
            }
            
            if (parentClass.startsWith('UE.')) {
                ueClasses.add(className); // 缓存结果
                return true;
            }
            
            const isParentUEDerived = isUEDerivedClass(parentClass);
            if (isParentUEDerived) {
                ueClasses.add(className); // 缓存结果
            }
            
            return isParentUEDerived;
        };
        
        // 对所有类进行检查，找出所有直接或间接继承自UE类的类
        for (const [className] of classInheritance) {
            isUEDerivedClass(className);
        }
        
        // 获取所有装饰器位置
        const decoratorRegex = /@[\w.]+(?:\(\))?/g;
        const decoratorPositions = new Map<number, string>(); // 行号 -> 装饰器名称
        let decoratorMatch;
        
        while ((decoratorMatch = decoratorRegex.exec(text)) !== null) {
            const decoratorPos = document.positionAt(decoratorMatch.index);
            const decoratorLine = decoratorPos.line;
            decoratorPositions.set(decoratorLine, decoratorMatch[0]);
        }
        
        // 检查方法声明
        const methodRegex = /(?:public|private|protected|static|async|override)?\s+(?!if|for|while|switch|return|throw|break|continue|new)(\w+)\s*\([^)]*\)\s*{/g;
        let methodMatch;
        
        while ((methodMatch = methodRegex.exec(text)) !== null) {
            const methodName = methodMatch[1];
            
            // 跳过构造函数和特殊方法
            if (methodName === 'constructor' || methodName === 'get' || methodName === 'set') {
                continue;
            }
            
            // 检查方法名是否以小写字母开头
            if (/^[a-z]/.test(methodName)) {
                // 检查是否在UE派生类中
                let isInUEClass = true; // 在 UE 脚本中，默认所有方法都在 UE 类中
                
                // 查找方法所在的类
                const methodPos = document.positionAt(methodMatch.index);
                const methodLine = methodPos.line;
                
                // 检查方法上方是否有 UE 装饰器
                let hasUEDecorator = false;
                for (let i = methodLine - 1; i >= Math.max(0, methodLine - 5); i--) {
                    if (decoratorPositions.has(i)) {
                        const decorator = decoratorPositions.get(i) || '';
                        if (decorator.startsWith('@UE.')) {
                            hasUEDecorator = true;
                            break;
                        }
                    }
                    
                    // 如果遇到非空行且不是装饰器，则停止向上查找
                    const lineText = document.lineAt(i).text.trim();
                    if (lineText && !lineText.startsWith('@')) {
                        break;
                    }
                }
                
                // 如果方法有 UE 装饰器，则不检查命名规则
                if (hasUEDecorator) {
                    continue;
                }
                
                // 查找最近的类声明
                const classDeclarationRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
                let classDeclarationMatch;
                let nearestClassBeforeMethodLine = '';
                let nearestClassLineBeforeMethodLine = -1;
                
                while ((classDeclarationMatch = classDeclarationRegex.exec(text)) !== null) {
                    const classPos = document.positionAt(classDeclarationMatch.index);
                    const classLine = classPos.line;
                    
                    if (classLine < methodLine && classLine > nearestClassLineBeforeMethodLine) {
                        nearestClassLineBeforeMethodLine = classLine;
                        nearestClassBeforeMethodLine = classDeclarationMatch[1];
                    }
                }
                
                if (isInUEClass) {
                    const pos = document.positionAt(methodMatch.index + methodMatch[0].indexOf(methodName));
                    issues.push({
                        line: pos.line,
                        character: pos.character,
                        length: methodName.length,
                        message: '在UE类中，方法名应该以大写字母开头',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        // 检查属性声明
        const propRegex = /(?:public|private|protected|static)?\s+(?:readonly)?\s+(\w+)(?:\s*:\s*[\w\[\]<>.]+)?(?:\s*=\s*[\w\[\]<>.(){}]+)?;/g;
        let propMatch;
        
        while ((propMatch = propRegex.exec(text)) !== null) {
            const propName = propMatch[1];
            
            // 检查属性名是否以小写字母开头
            if (/^[a-z]/.test(propName)) {
                // 检查是否在UE派生类中
                let isInUEClass = true; // 在 UE 脚本中，默认所有属性都在 UE 类中
                
                // 查找属性所在的类
                const propPos = document.positionAt(propMatch.index);
                const propLine = propPos.line;
                
                // 查找最近的类声明
                const classDeclarationRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
                let classDeclarationMatch;
                let nearestClassBeforePropLine = '';
                let nearestClassLineBeforePropLine = -1;
                
                while ((classDeclarationMatch = classDeclarationRegex.exec(text)) !== null) {
                    const classPos = document.positionAt(classDeclarationMatch.index);
                    const classLine = classPos.line;
                    
                    if (classLine < propLine && classLine > nearestClassLineBeforePropLine) {
                        nearestClassLineBeforePropLine = classLine;
                        nearestClassBeforePropLine = classDeclarationMatch[1];
                    }
                }
                
                if (isInUEClass) {
                    const pos = document.positionAt(propMatch.index + propMatch[0].indexOf(propName));
                    issues.push({
                        line: pos.line,
                        character: pos.character,
                        length: propName.length,
                        message: '在UE类中，属性名应该以大写字母开头',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        // 检查局部变量声明
        const localVarRegex = /(?:let|const|var)\s+(\w+)(?:\s*:\s*[\w\[\]<>.]+)?(?:\s*=\s*[\w\[\]<>.(){}]+)?;/g;
        let localVarMatch;
        
        while ((localVarMatch = localVarRegex.exec(text)) !== null) {
            const localVarName = localVarMatch[1];
            
            // 检查局部变量名是否以小写字母开头
            if (/^[a-z]/.test(localVarName)) {
                // 检查是否在UE派生类中
                let isInUEClass = true; // 在 UE 脚本中，默认所有局部变量都在 UE 类中
                
                // 查找局部变量所在的类
                const localVarPos = document.positionAt(localVarMatch.index);
                const localVarLine = localVarPos.line;
                
                // 查找最近的类声明
                const classDeclarationRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
                let classDeclarationMatch;
                let nearestClassBeforeLocalVarLine = '';
                let nearestClassLineBeforeLocalVarLine = -1;
                
                while ((classDeclarationMatch = classDeclarationRegex.exec(text)) !== null) {
                    const classPos = document.positionAt(classDeclarationMatch.index);
                    const classLine = classPos.line;
                    
                    if (classLine < localVarLine && classLine > nearestClassLineBeforeLocalVarLine) {
                        nearestClassLineBeforeLocalVarLine = classLine;
                        nearestClassBeforeLocalVarLine = classDeclarationMatch[1];
                    }
                }
                
                if (isInUEClass) {
                    const pos = document.positionAt(localVarMatch.index + localVarMatch[0].indexOf(localVarName));
                    issues.push({
                        line: pos.line,
                        character: pos.character,
                        length: localVarName.length,
                        message: '在UE类中，局部变量名应该以大写字母开头',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * 检查文件是否是 UE 脚本（通过 export default 判断）
     * @param text 文件内容
     * @returns 如果是 UE 脚本则返回 true，否则返回 false
     */
    private isUEScriptFile(text: string): boolean {
        // 检查文件末尾是否有 export default XXXXXX
        const exportDefaultRegex = /export\s+default\s+\w+\s*;?\s*$/;
        return exportDefaultRegex.test(text);
    }
}
