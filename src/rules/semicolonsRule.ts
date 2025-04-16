import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export class SemicolonsRule implements Rule {
    
    id = 'semicolons';
    description = '检查语句是否以分号结尾';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (options === undefined) {
            return issues;
        }
        
        const requireSemicolon = options;
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        
        // 跟踪条件语句的状态
        let inCondition = false;
        let conditionStartLine = -1;
        let openParenCount = 0;
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            
            // 忽略注释行和空行
            if (lineText.trim() === '' || CommentUtils.isCommentLine(lineText)) {
                continue;
            }
            
            // 移除行内注释，以便正确检查分号
            const codeWithoutComment = CommentUtils.removeInlineComment(lineText);
            const trimmedCode = codeWithoutComment.trim();
            
            // 检查是否是条件语句的开始
            if (trimmedCode.match(/^(if|for|while|switch)\s*\(/)) {
                inCondition = true;
                conditionStartLine = i;
                openParenCount = this.countChars(trimmedCode, '(') - this.countChars(trimmedCode, ')');
                continue;
            }
            
            // 如果在条件语句中，检查括号是否平衡
            if (inCondition) {
                openParenCount += this.countChars(trimmedCode, '(') - this.countChars(trimmedCode, ')');
                
                // 如果括号已平衡，说明条件语句结束
                if (openParenCount <= 0) {
                    inCondition = false;
                }
                
                // 在条件语句内部的行不需要以分号结尾
                continue;
            }
            
            // 忽略装饰器行
            if (trimmedCode.startsWith('@')) {
                continue;
            }
            
            // 忽略控制结构行（if, for, while等）
            if (trimmedCode.match(/^(if|for|while|switch|function|class|interface|type|import|export)\b/)) {
                continue;
            }
            
            // 忽略以大括号结尾的行
            if (trimmedCode.endsWith('{') || trimmedCode.endsWith('}')) {
                continue;
            }
            
            // 忽略以冒号结尾的行（对象属性或case语句）
            if (trimmedCode.endsWith(':')) {
                continue;
            }
            
            // 忽略多行函数调用或对象字面量的中间行
            if (this.isPartOfMultilineExpression(trimmedCode, i, lines)) {
                continue;
            }
            
            // 检查是否以分号结尾
            const hasSemicolon = trimmedCode.endsWith(';');
            
            if (requireSemicolon && !hasSemicolon) {
                // 需要分号但没有
                issues.push({
                    line: i,
                    character: line.text.length,
                    message: '语句应该以分号结尾',
                    severity: this.severity,
                    ruleId: this.id
                });
            } else if (!requireSemicolon && hasSemicolon) {
                // 不需要分号但有
                // 找到分号在原始行中的位置
                const semicolonPos = lineText.lastIndexOf(';');
                if (semicolonPos !== -1) {
                    issues.push({
                        line: i,
                        character: semicolonPos,
                        length: 1,
                        message: '语句不应该以分号结尾',
                        severity: this.severity,
                        ruleId: this.id
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * 检查一行是否是多行表达式的一部分（如多行函数调用或对象字面量）
     * @param lineText 当前行文本
     * @param lineIndex 当前行索引
     * @param lines 所有行
     * @returns 如果是多行表达式的一部分则返回 true，否则返回 false
     */
    private isPartOfMultilineExpression(lineText: string, lineIndex: number, lines: string[]): boolean {
        
        // 如果行以逗号结尾，可能是多行表达式的一部分
        if (lineText.endsWith(',')) {
            return true;
        }
        
        // 如果行以操作符结尾，可能是多行表达式的一部分
        if (lineText.match(/[+\-*/%=&|<>?:]\s*$/)) {
            return true;
        }
        
        // 如果行以左括号结尾，可能是多行函数调用的开始
        if (lineText.endsWith('(')) {
            return true;
        }
        
        // 如果行以左方括号结尾，可能是多行数组的开始
        if (lineText.endsWith('[')) {
            return true;
        }
        
        // 如果行以左大括号结尾，可能是多行对象的开始
        if (lineText.endsWith('{')) {
            return true;
        }
        
        // 检查是否是多行函数调用或数组的中间部分
        const openParenCount = this.countChars(lineText, '(');
        const closeParenCount = this.countChars(lineText, ')');
        const openBracketCount = this.countChars(lineText, '[');
        const closeBracketCount = this.countChars(lineText, ']');
        const openBraceCount = this.countChars(lineText, '{');
        const closeBraceCount = this.countChars(lineText, '}');
        
        // 如果括号不平衡，可能是多行表达式的一部分
        if (openParenCount !== closeParenCount || openBracketCount !== closeBracketCount || openBraceCount !== closeBraceCount) {
            return true;
        }
        
        // 检查下一行是否是多行表达式的一部分
        if (lineIndex < lines.length - 1) {
            const nextLineRaw = lines[lineIndex + 1];
            const nextLine = CommentUtils.removeInlineComment(nextLineRaw).trim();
            
            // 如果下一行以右括号开头，当前行可能是多行函数调用的一部分
            if (nextLine.startsWith(')')) {
                return true;
            }
            
            // 如果下一行以逗号开头，当前行可能是多行表达式的一部分
            if (nextLine.startsWith(',')) {
                return true;
            }
            
            // 如果下一行以操作符开头，当前行可能是多行表达式的一部分
            if (nextLine.match(/^[+\-*/%=&|<>?:]/)) {
                return true;
            }
            
            // 如果下一行以 || 或 && 开头，当前行可能是多行条件表达式的一部分
            if (nextLine.startsWith('||') || nextLine.startsWith('&&')) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 计算字符串中指定字符的出现次数
     * @param str 要检查的字符串
     * @param char 要计数的字符
     * @returns 字符出现的次数
     */
    private countChars(str: string, char: string): number {
        return (str.match(new RegExp('\\' + char, 'g')) || []).length;
    }
}
