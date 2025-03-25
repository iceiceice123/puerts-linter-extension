import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export class MaxLineLengthRule implements Rule {
    
    id = 'maxLineLength';
    description = '检查行长度是否超过最大限制';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: number | boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        // 如果 options 为 false 或不是正数，则不进行检查
        if (options === false || typeof options !== 'number' || options <= 0) {
            return issues;
        }
        
        const maxLength = options;
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            
            // 跳过注释行
            if (CommentUtils.isCommentLine(lineText)) {
                continue;
            }
            
            if (lineText.length > maxLength) {
                issues.push({
                    line: i,
                    character: maxLength,
                    message: `行长度超过${maxLength}个字符`,
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        }
        
        return issues;
    }
}
