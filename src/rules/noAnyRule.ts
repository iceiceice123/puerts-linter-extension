import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NoAnyRule implements Rule {
    
    id = 'noAny';
    description = '禁止使用any类型';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const anyRegex = /: any(\s*[,)]|$)/g;
        let match;
        
        while ((match = anyRegex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            issues.push({
                line: pos.line,
                character: pos.character,
                length: 4, // ": any" 的长度
                message: '应该避免使用any类型',
                severity: this.severity,
                ruleId: this.id
            });
        }
        
        return issues;
    }
}
