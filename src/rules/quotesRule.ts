import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export class QuotesRule implements Rule {
    
    id = 'quotes';
    description = '检查字符串引号风格';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: 'single' | 'double'): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        
        if (options === 'single') {
            // 查找所有双引号字符串
            const doubleQuoteRegex = /"([^"\\]|\\.)*"/g;
            let match;
            
            while ((match = doubleQuoteRegex.exec(text)) !== null) {
                // 忽略模板字符串中的引号
                const prevChar = text.charAt(match.index - 1);
                if (prevChar === '$') {
                    continue;
                }
                
                const pos = document.positionAt(match.index);
                
                // 检查是否在注释行中
                const line = lines[pos.line];
                if (CommentUtils.isInComment(line, pos.character)) {
                    continue;
                }
                
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: match[0].length,
                    message: '应该使用单引号而不是双引号',
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        } else if (options === 'double') {
            // 查找所有单引号字符串
            const singleQuoteRegex = /'([^'\\]|\\.)*'/g;
            let match;
            
            while ((match = singleQuoteRegex.exec(text)) !== null) {
                const pos = document.positionAt(match.index);
                
                // 检查是否在注释行中
                const line = lines[pos.line];
                if (CommentUtils.isInComment(line, pos.character)) {
                    continue;
                }
                
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: match[0].length,
                    message: '应该使用双引号而不是单引号',
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        }
        
        return issues;
    }
}
