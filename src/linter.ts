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
    maxLineLength?: number | boolean;
    indentSize?: number;
    useSpaces?: boolean;
    semicolons?: boolean;
    noConsole?: boolean;
    noVar?: boolean;
    noAny?: boolean;
    noEmptyFunctions?: boolean;
    namingConvention?: boolean;
    functionEmptyLine?: boolean;
    ueNamingConvention?: boolean;
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
    
    private isRuleEnabled(ruleId: string): boolean {
        
        switch (ruleId) {
            case 'maxLineLength':
                return this.rules.maxLineLength !== false && this.rules.maxLineLength !== undefined && (typeof this.rules.maxLineLength !== 'number' || this.rules.maxLineLength > 0);
            case 'indent':
                return this.rules.indentSize !== undefined && this.rules.indentSize > 0;
            case 'semicolons':
                return this.rules.semicolons !== undefined;
            case 'noConsole':
                return this.rules.noConsole === true;
            case 'noVar':
                return this.rules.noVar === true;
            case 'noAny':
                return this.rules.noAny === true;
            case 'noEmptyFunctions':
                return this.rules.noEmptyFunctions === true;
            case 'namingConvention':
                return this.rules.namingConvention === true;
            case 'functionEmptyLine':
                return this.rules.functionEmptyLine === true;
            case 'ueNamingConvention':
                return this.rules.ueNamingConvention === true;
            default:
                return false;
        }
    }
    
    private getRuleOptions(ruleId: string): any {
        
        switch (ruleId) {
            case 'maxLineLength':
                return this.rules.maxLineLength;
            case 'indent':
                return {
                    indentSize: this.rules.indentSize,
                    useSpaces: this.rules.useSpaces
                };
            case 'semicolons':
                return this.rules.semicolons;
            case 'noConsole':
            case 'noVar':
            case 'noAny':
            case 'noEmptyFunctions':
            case 'namingConvention':
            case 'functionEmptyLine':
            case 'ueNamingConvention':
                return true;
            default:
                return undefined;
        }
    }
}
