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
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text.trim();
            
            // 忽略注释行和空行
            if (lineText === '' || lineText.startsWith('//') || lineText.startsWith('/*')) {
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
}
