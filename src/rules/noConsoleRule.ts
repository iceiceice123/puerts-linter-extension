import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NoConsoleRule implements Rule {
    
    id = 'noConsole';
    description = '禁止使用console语句';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const consoleRegex = /console\.(log|warn|error|info|debug)/g;
        let match;
        
        while ((match = consoleRegex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            issues.push({
                line: pos.line,
                character: pos.character,
                length: match[0].length,
                message: '不应该使用console语句',
                severity: this.severity,
                ruleId: this.id
            });
        }
        
        return issues;
    }
}
