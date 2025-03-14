import * as vscode from 'vscode';
import { LintIssue } from '../linter';

/**
 * 规则接口，所有规则都必须实现这个接口
 */
export interface Rule {
    /**
     * 规则的唯一标识符
     */
    id: string;
    
    /**
     * 规则的描述
     */
    description: string;
    
    /**
     * 规则的严重程度
     */
    severity: 'error' | 'warning' | 'info' | 'hint';
    
    /**
     * 检查文档是否符合规则
     * @param document 要检查的文档
     * @param options 规则的配置选项
     * @returns 检查结果，包含所有违反规则的问题
     */
    check(document: vscode.TextDocument, options: any): LintIssue[];
}
