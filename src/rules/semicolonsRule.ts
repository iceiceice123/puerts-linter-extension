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
        const openParenCount = (lineText.match(/\(/g) || []).length;
        const closeParenCount = (lineText.match(/\)/g) || []).length;
        const openBracketCount = (lineText.match(/\[/g) || []).length;
        const closeBracketCount = (lineText.match(/\]/g) || []).length;
        const openBraceCount = (lineText.match(/{/g) || []).length;
        const closeBraceCount = (lineText.match(/}/g) || []).length;
        
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
        }
        
        return false;
    }
}
