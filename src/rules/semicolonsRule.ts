import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

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
            const lineText = line.text.trim();
            
            // 忽略注释行和空行
            if (lineText === '' || this.isCommentLine(lineText)) {
                continue;
            }
            
            // 忽略装饰器行
            if (lineText.startsWith('@')) {
                continue;
            }
            
            // 忽略包含装饰器的行
            if (lineText.includes('@')) {
                continue;
            }
            
            // 忽略控制结构行（if, for, while等）
            if (lineText.match(/^(if|for|while|switch|function|class|interface|type|import|export)\b/)) {
                continue;
            }
            
            // 忽略以大括号结尾的行
            if (lineText.endsWith('{') || lineText.endsWith('}')) {
                continue;
            }
            
            // 忽略以冒号结尾的行（对象属性或case语句）
            if (lineText.endsWith(':')) {
                continue;
            }
            
            // 忽略多行函数调用或对象字面量的中间行
            if (this.isPartOfMultilineExpression(lineText, i, lines)) {
                continue;
            }
            
            // 检查是否以分号结尾
            const hasSemicolon = lineText.endsWith(';');
            
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
                issues.push({
                    line: i,
                    character: line.text.length - 1,
                    length: 1,
                    message: '语句不应该以分号结尾',
                    severity: this.severity,
                    ruleId: this.id
                });
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
        if (lineText.match(/[+\-*/%&|^<>=?:]$/)) {
            return true;
        }
        
        // 如果行以左括号结尾，可能是多行函数调用的开始
        if (lineText.endsWith('(')) {
            return true;
        }
        
        // 如果行以右括号开头，可能是多行函数调用的结束
        if (lineText.startsWith(')')) {
            return true;
        }
        
        // 如果行包含左括号但不包含右括号和分号，可能是多行函数调用的开始
        if (lineText.includes('(') && !lineText.includes(')') && !lineText.endsWith(';')) {
            return true;
        }
        
        // 如果行包含右括号但不包含左括号和分号，可能是多行函数调用的结束
        if (lineText.includes(')') && !lineText.includes('(') && !lineText.endsWith(';')) {
            return true;
        }
        
        // 检查前一行
        if (lineIndex > 0) {
            const prevLine = lines[lineIndex - 1].trim();
            
            // 如果前一行以逗号结尾，当前行可能是多行表达式的一部分
            if (prevLine.endsWith(',')) {
                return true;
            }
            
            // 如果前一行以操作符结尾，当前行可能是多行表达式的一部分
            if (prevLine.match(/[+\-*/%&|^<>=?:]$/)) {
                return true;
            }
            
            // 如果前一行以左括号结尾，当前行可能是多行函数调用的一部分
            if (prevLine.endsWith('(')) {
                return true;
            }
        }
        
        // 检查下一行
        if (lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1].trim();
            
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
    
    /**
     * 检查一行是否是注释行
     * @param line 要检查的行
     * @returns 如果是注释行则返回 true，否则返回 false
     */
    private isCommentLine(line: string): boolean {
        
        // 检查是否是单行注释 (//)
        if (line.trim().startsWith('//')) {
            return true;
        }
        
        // 检查是否是多行注释的开始 (/* 或 /**) 或结束 (*/)
        if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().endsWith('*/')) {
            return true;
        }
        
        return false;
    }
}
