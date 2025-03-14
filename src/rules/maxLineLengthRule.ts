import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class MaxLineLengthRule implements Rule {
    
    id = 'maxLineLength';
    description = '检查行长度是否超过最大限制';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: number): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options || options <= 0) {
            return issues;
        }
        
        const maxLength = options;
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            
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
