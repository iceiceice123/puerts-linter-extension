import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NoEmptyFunctionsRule implements Rule {
    
    id = 'noEmptyFunctions';
    description = '禁止使用空函数';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        // 匹配形如 function name() {} 或 const name = () => {} 或 name() {} 的空函数
        const emptyFunctionRegex = /(\bfunction\s+\w+\s*\([^)]*\)\s*\{\s*\})|(\b\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\})|(\b\w+\s*\([^)]*\)\s*\{\s*\})/g;
        let match;
        
        while ((match = emptyFunctionRegex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            issues.push({
                line: pos.line,
                character: pos.character,
                length: match[0].length,
                message: '不应该使用空函数，应该至少添加注释说明',
                severity: this.severity,
                ruleId: this.id
            });
        }
        
        return issues;
    }
}
