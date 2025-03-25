import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export interface IndentOptions {
    indentSize: number | boolean;
    useSpaces: boolean;
}

export class IndentRule implements Rule {
    
    id = 'indent';
    description = '检查缩进大小和类型（空格或制表符）';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: IndentOptions): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        // 如果 indentSize 为 false，则不进行检查
        if (options.indentSize === false) {
            return issues;
        }
        
        const { indentSize, useSpaces } = options;
        
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;
            
            // 跳过注释行
            if (CommentUtils.isCommentLine(lineText)) {
                continue;
            }
            
            const indentMatch = lineText.match(/^(\s+)/);
            
            if (indentMatch) {
                const indent = indentMatch[1];
                
                // 检查是否使用空格或制表符
                if (useSpaces && indent.includes('\t')) {
                    issues.push({
                        line: i,
                        character: 0,
                        length: indent.length,
                        message: '应该使用空格而不是制表符进行缩进',
                        severity: this.severity,
                        ruleId: `${this.id}.useSpaces`
                    });
                } else if (!useSpaces && !indent.includes('\t')) {
                    issues.push({
                        line: i,
                        character: 0,
                        length: indent.length,
                        message: '应该使用制表符而不是空格进行缩进',
                        severity: this.severity,
                        ruleId: `${this.id}.useTabs`
                    });
                }
                
                // 检查缩进大小
                if (useSpaces && typeof indentSize === 'number' && indentSize > 0) {
                    if (indent.length % indentSize !== 0) {
                        issues.push({
                            line: i,
                            character: 0,
                            length: indent.length,
                            message: `缩进大小应该是${indentSize}的倍数`,
                            severity: this.severity,
                            ruleId: `${this.id}.size`
                        });
                    }
                }
            }
        }
        
        return issues;
    }
}
