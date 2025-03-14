import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NamingConventionRule implements Rule {
    
    id = 'namingConvention';
    description = '函数和变量的首字母必须小写，但是对于继承自UE的类首字母大写';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        
        // 查找所有类声明，以确定哪些类继承自UE
        const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+(?:\.\w+)*))?/g;
        const ueClasses = new Set<string>();
        let classMatch;
        
        // 首先识别所有继承自UE的类
        while ((classMatch = classRegex.exec(text)) !== null) {
            const className = classMatch[1];
            const parentClass = classMatch[2];
            
            // 检查是否是UE类（以UE.开头的类）
            if (parentClass && parentClass.startsWith('UE.')) {
                ueClasses.add(className);
                ueClasses.add(parentClass); // 父类也添加到UE类集合中
            }
        }
        
        // 检查函数声明
        const functionRegex = /(?:function|async function)\s+(\w+)/g;
        let functionMatch;
        
        while ((functionMatch = functionRegex.exec(text)) !== null) {
            const functionName = functionMatch[1];
            
            // 检查函数名是否以大写字母开头
            if (/^[A-Z]/.test(functionName)) {
                const pos = document.positionAt(functionMatch.index + functionMatch[0].indexOf(functionName));
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: functionName.length,
                    message: '函数名应该以小写字母开头',
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        }
        
        // 检查方法声明
        const methodRegex = /(\w+)\s*\([^)]*\)\s*{/g;
        let methodMatch;
        
        while ((methodMatch = methodRegex.exec(text)) !== null) {
            const methodName = methodMatch[1];
            
            // 跳过构造函数和特殊方法
            if (methodName === 'constructor' || methodName === 'get' || methodName === 'set') {
                continue;
            }
            
            // 检查方法名是否以大写字母开头
            if (/^[A-Z]/.test(methodName)) {
                const pos = document.positionAt(methodMatch.index);
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: methodName.length,
                    message: '方法名应该以小写字母开头',
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        }
        
        // 检查变量声明
        const varRegex = /(?:let|const|var)\s+(\w+)/g;
        let varMatch;
        
        while ((varMatch = varRegex.exec(text)) !== null) {
            const varName = varMatch[1];
            
            // 检查变量名是否以大写字母开头
            if (/^[A-Z]/.test(varName)) {
                // 检查是否是UE类的实例
                let isUEInstance = false;
                for (const ueClass of ueClasses) {
                    if (text.includes(`new ${ueClass}`)) {
                        isUEInstance = true;
                        break;
                    }
                }
                
                if (!isUEInstance) {
                    const pos = document.positionAt(varMatch.index + varMatch[0].indexOf(varName));
                    issues.push({
                        line: pos.line,
                        character: pos.character,
                        length: varName.length,
                        message: '变量名应该以小写字母开头',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        return issues;
    }
}
