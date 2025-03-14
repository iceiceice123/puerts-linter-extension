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
        
        // 匹配类方法声明
        // 使用更精确的正则表达式来匹配类方法
        // 这里我们需要处理多行的方法声明，包括返回类型等
        const methodDeclarationRegex = /\b(public|private|protected|static|async)?\s+(\w+)\s*\([^)]*\)\s*(\:\s*[^{]+)?\s*{/g;
        
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
                // 找到方法体内的第一个非空行
                let firstNonEmptyLineIndex = -1;
                for (let i = openBracePosition.line + 1; i < lines.length; i++) {
                    if (lines[i].trim() !== '') {
                        firstNonEmptyLineIndex = i;
                        break;
                    }
                }
                
                // 如果找到了第一个非空行
                if (firstNonEmptyLineIndex !== -1) {
                    // 判断是否是紧跟在方法声明后面（没有空行）
                    if (firstNonEmptyLineIndex === openBracePosition.line + 1) {
                        // 检查这一行是否是多行函数调用的开始
                        const firstLine = lines[firstNonEmptyLineIndex].trim();
                        
                        // 如果这一行不是多行函数调用的一部分，则报错
                        // 多行函数调用通常以函数名和左括号开始，不会包含分号
                        if (!this.isPartOfMultilineCall(lines, firstNonEmptyLineIndex)) {
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
     * 检查一行是否是多行函数调用的一部分
     * @param lines 所有行
     * @param lineIndex 当前行索引
     * @returns 如果是多行函数调用的一部分则返回 true，否则返回 false
     */
    private isPartOfMultilineCall(lines: string[], lineIndex: number): boolean {
        const line = lines[lineIndex].trim();
        
        // 如果行以分号结尾，则不是多行函数调用的一部分
        if (line.endsWith(';')) {
            return false;
        }
        
        // 检查这一行是否包含函数调用（包含左括号但不包含右括号）
        if (line.includes('(') && !line.includes(');')) {
            return true;
        }
        
        // 检查这一行是否是前一行函数调用的延续
        if (lineIndex > 0) {
            const prevLine = lines[lineIndex - 1].trim();
            // 如果前一行包含左括号但不包含右括号，则当前行可能是函数调用的延续
            if (prevLine.includes('(') && !prevLine.includes(');') && !prevLine.endsWith(';')) {
                return true;
            }
            
            // 如果前一行以逗号结尾，则当前行可能是函数参数的延续
            if (prevLine.endsWith(',')) {
                return true;
            }
            
            // 如果前一行以左大括号结尾，则当前行可能是对象字面量的一部分
            if (prevLine.endsWith('{')) {
                return true;
            }
        }
        
        // 检查下一行是否是当前行的延续
        if (lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1].trim();
            // 如果当前行以逗号结尾，且下一行不为空，则当前行可能是函数参数的一部分
            if (line.endsWith(',') && nextLine.length > 0) {
                return true;
            }
            
            // 如果下一行以右括号和分号结尾，则当前行可能是函数调用的一部分
            if (nextLine.includes('});') || nextLine.includes(');')) {
                return true;
            }
        }
        
        return false;
    }
    
    // 查找包含开括号的行
    private findOpenBraceLine(lines: string[], startLine: number): number {
        for (let i = startLine; i < lines.length; i++) {
            if (lines[i].includes('{')) {
                return i;
            }
        }
        return -1;
    }
}
