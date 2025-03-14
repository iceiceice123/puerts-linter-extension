import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NoVarRule implements Rule {
    
    id = 'noVar';
    description = '禁止使用var声明';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const varRegex = /\bvar\s+/g;
        let match;
        
        while ((match = varRegex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            issues.push({
                line: pos.line,
                character: pos.character,
                length: match[0].length,
                message: '应该使用let或const而不是var',
                severity: this.severity,
                ruleId: this.id
            });
        }
        
        return issues;
    }
}
