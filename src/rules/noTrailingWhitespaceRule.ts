import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

export class NoTrailingWhitespaceRule implements Rule {
    
    id = 'noTrailingWhitespace';
    description = '检查行末尾是否有空格';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        // 如果 options 为 false，则不进行检查
        if (options === false) {
            return issues;
        }
        
        console.log(`[NoTrailingWhitespaceRule] 开始检查文件: ${document.fileName}`);
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            
            // 跳过空行（只包含空格的行）
            if (lineText.trim().length === 0) {
                continue;
            }
            
            // 检查行末尾是否有空格
            const trailingWhitespaceMatch = lineText.match(/\s+$/);
            if (trailingWhitespaceMatch) {
                const startPosition = trailingWhitespaceMatch.index || 0;
                const length = trailingWhitespaceMatch[0].length;
                
                console.log(`[NoTrailingWhitespaceRule] 在第 ${i+1} 行发现 ${length} 个尾部空格`);
                
                issues.push({
                    line: i,
                    character: startPosition,
                    length: length,
                    message: '行末尾不应有空格',
                    severity: this.severity,
                    ruleId: this.id
                });
            }
        }
        
        console.log(`[NoTrailingWhitespaceRule] 检查完成，发现 ${issues.length} 个问题`);
        
        return issues;
    }
}
