import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

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
        
        // 检查方法声明
        const methodRegex = /(?:public|private|protected|static|async|override)?\s+(\w+)\s*\([^)]*\)\s*{/g;
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
        
        // 检查变量声明
        const varRegex = /(?:let|const|var)\s+(\w+)/g;
        let varMatch;
        
        while ((varMatch = varRegex.exec(text)) !== null) {
            const varName = varMatch[1];
            
            // 检查变量名是否以小写字母开头
            if (/^[a-z]/.test(varName)) {
                // 检查是否在UE派生类中
                let isInUEClass = true; // 在 UE 脚本中，默认所有变量都在 UE 类中
                
                // 查找变量所在的类
                const varPos = document.positionAt(varMatch.index);
                const varLine = varPos.line;
                
                // 查找最近的类声明
                const classDeclarationRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
                let classDeclarationMatch;
                let nearestClassBeforeVarLine = '';
                let nearestClassLineBeforeVarLine = -1;
                
                while ((classDeclarationMatch = classDeclarationRegex.exec(text)) !== null) {
                    const classPos = document.positionAt(classDeclarationMatch.index);
                    const classLine = classPos.line;
                    
                    if (classLine < varLine && classLine > nearestClassLineBeforeVarLine) {
                        nearestClassLineBeforeVarLine = classLine;
                        nearestClassBeforeVarLine = classDeclarationMatch[1];
                    }
                }
                
                if (isInUEClass) {
                    const pos = document.positionAt(varMatch.index + varMatch[0].indexOf(varName));
                    issues.push({
                        line: pos.line,
                        character: pos.character,
                        length: varName.length,
                        message: '在UE类中，变量名应该以大写字母开头',
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
