import * as vscode from 'vscode';
import { RuleRegistry } from './rules/ruleRegistry';

export interface LintIssue {
    line: number;
    character: number;
    length?: number;
    message: string;
    severity: string;
    ruleId: string;
}

export interface LinterRules {
    maxLineLength?: number;
    indentSize?: number;
    useSpaces?: boolean;
    semicolons?: boolean;
    quotes?: 'single' | 'double';
    noConsole?: boolean;
    noVar?: boolean;
    noAny?: boolean;
    noEmptyFunctions?: boolean;
    namingConvention?: boolean;
    functionEmptyLine?: boolean;
    trailingComma?: boolean;
    // 可以添加更多自定义规则
    [key: string]: any;
}

export class TypeScriptLinter {
    
    private rules: LinterRules;
    private ruleRegistry: RuleRegistry;

    constructor(rules: LinterRules) {
        
        this.rules = rules;
        this.ruleRegistry = RuleRegistry.getInstance();
    }

    public lint(document: vscode.TextDocument): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        // 使用规则注册表中的规则进行检查
        for (const rule of this.ruleRegistry.getAllRules()) {
            const ruleId = rule.id;
            
            // 检查规则是否启用
            if (this.isRuleEnabled(ruleId)) {
                const ruleOptions = this.getRuleOptions(ruleId);
                const ruleIssues = rule.check(document, ruleOptions);
                issues.push(...ruleIssues);
            }
        }
        
        return issues;
    }
    
    /**
     * 检查规则是否启用
     * @param ruleId 规则ID
     */
    private isRuleEnabled(ruleId: string): boolean {
        
        const option = this.rules[ruleId];
        return option !== undefined && option !== false;
    }
    
    /**
     * 获取规则的配置选项
     * @param ruleId 规则ID
     */
    private getRuleOptions(ruleId: string): any {
        
        return this.rules[ruleId];
    }
}
