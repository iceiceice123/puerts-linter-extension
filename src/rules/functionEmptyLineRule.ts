import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class FunctionEmptyLineRule implements Rule {
    
    id = 'functionEmptyLine';
    description = '函数实现的首行跟函数名之间空一行';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        
        // 匹配函数声明
        const functionRegex = /(?:function|async function)\s+\w+\s*\([^)]*\)\s*{/g;
        let functionMatch;
        
        while ((functionMatch = functionRegex.exec(text)) !== null) {
            const functionStartPos = document.positionAt(functionMatch.index);
            const functionEndPos = document.positionAt(functionMatch.index + functionMatch[0].length);
            
            // 检查函数声明后是否有空行
            if (functionStartPos.line === functionEndPos.line) {
                // 函数声明在同一行
                if (functionEndPos.line + 1 < lines.length && lines[functionEndPos.line + 1].trim() !== '') {
                    issues.push({
                        line: functionEndPos.line,
                        character: functionEndPos.character,
                        message: '函数实现的首行跟函数名之间应该空一行',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            } else {
                // 函数声明跨多行
                const openBraceLineIndex = this.findOpenBraceLine(lines, functionStartPos.line);
                if (openBraceLineIndex >= 0 && openBraceLineIndex + 1 < lines.length && lines[openBraceLineIndex + 1].trim() !== '') {
                    issues.push({
                        line: openBraceLineIndex,
                        character: lines[openBraceLineIndex].indexOf('{') + 1,
                        message: '函数实现的首行跟函数名之间应该空一行',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        // 匹配方法声明
        const methodRegex = /(\w+)\s*\([^)]*\)\s*{/g;
        let methodMatch;
        
        while ((methodMatch = methodRegex.exec(text)) !== null) {
            // 跳过构造函数和特殊方法
            const methodName = methodMatch[1];
            if (methodName === 'constructor' || methodName === 'get' || methodName === 'set') {
                continue;
            }
            
            // 检查是否真的是方法（而不是函数调用）
            const prevChar = text.charAt(methodMatch.index - 1);
            if (prevChar && /[^\s:{]/.test(prevChar)) {
                continue;
            }
            
            const methodStartPos = document.positionAt(methodMatch.index);
            const methodEndPos = document.positionAt(methodMatch.index + methodMatch[0].length);
            
            // 检查方法声明后是否有空行
            if (methodStartPos.line === methodEndPos.line) {
                // 方法声明在同一行
                if (methodEndPos.line + 1 < lines.length && lines[methodEndPos.line + 1].trim() !== '') {
                    issues.push({
                        line: methodEndPos.line,
                        character: methodEndPos.character,
                        message: '方法实现的首行跟方法名之间应该空一行',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            } else {
                // 方法声明跨多行
                const openBraceLineIndex = this.findOpenBraceLine(lines, methodStartPos.line);
                if (openBraceLineIndex >= 0 && openBraceLineIndex + 1 < lines.length && lines[openBraceLineIndex + 1].trim() !== '') {
                    issues.push({
                        line: openBraceLineIndex,
                        character: lines[openBraceLineIndex].indexOf('{') + 1,
                        message: '方法实现的首行跟方法名之间应该空一行',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * 查找包含开括号的行
     * @param lines 文档的所有行
     * @param startLine 开始查找的行
     * @returns 包含开括号的行索引，如果没找到则返回-1
     */
    private findOpenBraceLine(lines: string[], startLine: number): number {
        
        for (let i = startLine; i < lines.length; i++) {
            if (lines[i].includes('{')) {
                return i;
            }
        }
        return -1;
    }
}
