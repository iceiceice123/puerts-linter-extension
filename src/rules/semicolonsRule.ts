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
            if (lineText === '' || lineText.startsWith('//') || lineText.startsWith('/*')) {
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
            
            // 忽略多行函数调用或对象字面量的中间行
            if (this.isPartOfMultilineExpression(lines, i)) {
                continue;
            }
            
            const hasSemicolon = lineText.endsWith(';');
            
            if (requireSemicolon && !hasSemicolon) {
                issues.push({
                    line: i,
                    character: line.text.length,
                    message: '语句应该以分号结尾',
                    severity: this.severity,
                    ruleId: this.id
                });
            } else if (!requireSemicolon && hasSemicolon) {
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
     * 检查一行是否是多行表达式的一部分（如多行函数调用、对象字面量等）
     * @param lines 所有行
     * @param lineIndex 当前行索引
     * @returns 如果是多行表达式的一部分则返回 true，否则返回 false
     */
    private isPartOfMultilineExpression(lines: string[], lineIndex: number): boolean {
        const line = lines[lineIndex].trim();
        
        // 检查这一行是否是多行函数调用或对象字面量的中间行
        
        // 如果当前行以逗号结尾，可能是多行函数调用或对象字面量的一部分
        if (line.endsWith(',')) {
            return true;
        }
        
        // 如果当前行包含左括号但不包含右括号和分号，可能是多行函数调用的开始
        if (line.includes('(') && !line.includes(');') && !line.endsWith(';')) {
            return true;
        }
        
        // 检查前一行
        if (lineIndex > 0) {
            const prevLine = lines[lineIndex - 1].trim();
            
            // 如果前一行以逗号结尾，当前行可能是多行函数调用或对象字面量的一部分
            if (prevLine.endsWith(',')) {
                return true;
            }
            
            // 如果前一行包含左括号但不包含右括号和分号，当前行可能是多行函数调用的一部分
            if (prevLine.includes('(') && !prevLine.includes(');') && !prevLine.endsWith(';')) {
                return true;
            }
            
            // 如果前一行以左大括号结尾，当前行可能是对象字面量的一部分
            if (prevLine.endsWith('{')) {
                return true;
            }
        }
        
        // 检查下一行
        if (lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1].trim();
            
            // 如果下一行以右括号和分号结尾，当前行可能是多行函数调用的一部分
            if (nextLine.includes('});') || nextLine.includes(');')) {
                return true;
            }
            
            // 如果下一行以右大括号开头，当前行可能是对象字面量的一部分
            if (nextLine.startsWith('}')) {
                return true;
            }
        }
        
        return false;
    }
}
