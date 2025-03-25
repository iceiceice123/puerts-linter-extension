import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

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
                if (functionEndPos.line + 1 < lines.length) {
                    // 查找第一个非空且非注释的行
                    let firstNonEmptyNonCommentLine = -1;
                    for (let i = functionEndPos.line + 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line !== '' && !CommentUtils.isCommentLine(line)) {
                            firstNonEmptyNonCommentLine = i;
                            break;
                        }
                    }
                    
                    // 如果找到了第一个非空且非注释的行，并且它紧跟在函数声明后面（没有空行）
                    if (firstNonEmptyNonCommentLine !== -1 && firstNonEmptyNonCommentLine === functionEndPos.line + 1) {
                        issues.push({
                            line: functionEndPos.line,
                            character: functionEndPos.character,
                            message: '函数实现的首行跟函数名之间应该空一行',
                            severity: this.severity,
                            ruleId: this.id
                        });
                    }
                }
            } else {
                // 函数声明跨多行
                const openBraceLineIndex = this.findOpenBraceLine(lines, functionStartPos.line);
                if (openBraceLineIndex >= 0 && openBraceLineIndex + 1 < lines.length) {
                    // 查找第一个非空且非注释的行
                    let firstNonEmptyNonCommentLine = -1;
                    for (let i = openBraceLineIndex + 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line !== '' && !CommentUtils.isCommentLine(line)) {
                            firstNonEmptyNonCommentLine = i;
                            break;
                        }
                    }
                    
                    // 如果找到了第一个非空且非注释的行，并且它紧跟在函数声明后面（没有空行）
                    if (firstNonEmptyNonCommentLine !== -1 && firstNonEmptyNonCommentLine === openBraceLineIndex + 1) {
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
        }
        
        // 匹配类方法声明
        // 使用更精确的正则表达式来匹配类方法
        // 这里我们需要处理多行的方法声明，包括返回类型等
        const methodDeclarationRegex = /\b(public|private|protected|static|async|override)?\s+(\w+)\s*\([^)]*\)\s*(\:\s*[^{]+)?\s*{/g;
        
        let methodMatch;
        while ((methodMatch = methodDeclarationRegex.exec(text)) !== null) {
            const methodName = methodMatch[2];
            // 跳过构造函数
            if (methodName === 'constructor') {
                continue;
            }
            
            const methodStartPos = document.positionAt(methodMatch.index);
            const methodEndPos = document.positionAt(methodMatch.index + methodMatch[0].length);
            
            // 找到方法体的开始位置（开括号的位置）
            let openBracePos = methodMatch[0].indexOf('{');
            if (openBracePos === -1) {
                continue; // 没有找到开括号，跳过
            }
            
            const openBracePosition = document.positionAt(methodMatch.index + openBracePos);
            
            // 检查方法声明后是否有空行
            if (openBracePosition.line + 1 < lines.length) {
                // 找到方法体内的第一个非空且非注释行
                let firstNonEmptyNonCommentLine = -1;
                for (let i = openBracePosition.line + 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line !== '' && !CommentUtils.isCommentLine(line)) {
                        firstNonEmptyNonCommentLine = i;
                        break;
                    }
                }
                
                // 如果找到了第一个非空且非注释行
                if (firstNonEmptyNonCommentLine !== -1) {
                    // 判断是否是紧跟在方法声明后面（没有空行）
                    if (firstNonEmptyNonCommentLine === openBracePosition.line + 1) {
                        // 检查这一行是否是多行函数调用的开始
                        if (!this.isPartOfMultilineCall(lines, firstNonEmptyNonCommentLine)) {
                            issues.push({
                                line: openBracePosition.line,
                                character: openBracePosition.character + 1,
                                message: '方法实现的首行跟方法名之间应该空一行',
                                severity: this.severity,
                                ruleId: this.id
                            });
                        }
                    }
                }
            }
        }
        
        return issues;
    }
    
    /**
     * 查找函数声明中的开括号所在行
     * @param lines 文件的所有行
     * @param startLine 函数声明的起始行
     * @returns 开括号所在行的索引，如果没有找到则返回 -1
     */
    private findOpenBraceLine(lines: string[], startLine: number): number {
        
        for (let i = startLine; i < lines.length; i++) {
            if (lines[i].includes('{')) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * 检查一行是否是多行函数调用的一部分
     * @param lines 文件的所有行
     * @param lineIndex 要检查的行索引
     * @returns 如果是多行函数调用的一部分则返回 true，否则返回 false
     */
    private isPartOfMultilineCall(lines: string[], lineIndex: number): boolean {
        
        const line = lines[lineIndex].trim();
        
        // 如果行以标识符和左括号开始，但不以分号或右括号结束，可能是多行函数调用的开始
        if (/^\w+\s*\(/.test(line) && !line.endsWith(';') && !line.endsWith(')')) {
            return true;
        }
        
        // 如果行以逗号开始或结束，可能是多行函数调用的中间部分
        if (line.startsWith(',') || line.endsWith(',')) {
            return true;
        }
        
        // 如果行以右括号开始或结束，可能是多行函数调用的结束部分
        if (line.startsWith(')') || (line.endsWith(')') && !line.endsWith(');'))) {
            return true;
        }
        
        // 如果行包含左括号但不包含右括号，可能是多行函数调用的开始
        if (line.includes('(') && !line.includes(')')) {
            return true;
        }
        
        // 如果行包含右括号但不包含左括号，可能是多行函数调用的结束
        if (line.includes(')') && !line.includes('(')) {
            return true;
        }
        
        return false;
    }
}
