import { Rule } from './ruleInterface';
import { MaxLineLengthRule } from './maxLineLengthRule';
import { IndentRule } from './indentRule';
import { SemicolonsRule } from './semicolonsRule';
import { NoConsoleRule } from './noConsoleRule';
import { NoVarRule } from './noVarRule';
import { NoAnyRule } from './noAnyRule';
import { NoEmptyFunctionsRule } from './noEmptyFunctionsRule';
import { NamingConventionRule } from './namingConventionRule';
import { FunctionEmptyLineRule } from './functionEmptyLineRule';
import { UENamingConventionRule } from './ueNamingConventionRule';

/**
 * 规则注册表，用于管理所有可用的规则
 */
export class RuleRegistry {
    
    private static instance: RuleRegistry;
    private rules: Map<string, Rule> = new Map();
    
    private constructor() {
        
        // 注册默认规则
        this.registerRule(new MaxLineLengthRule());
        this.registerRule(new IndentRule());
        this.registerRule(new SemicolonsRule());
        this.registerRule(new NoConsoleRule());
        this.registerRule(new NoVarRule());
        this.registerRule(new NoAnyRule());
        this.registerRule(new NoEmptyFunctionsRule());
        this.registerRule(new NamingConventionRule());
        this.registerRule(new FunctionEmptyLineRule());
        this.registerRule(new UENamingConventionRule());
        // 在这里注册更多规则...
    }
    
    /**
     * 获取规则注册表的单例实例
     */
    public static getInstance(): RuleRegistry {
        
        if (!RuleRegistry.instance) {
            RuleRegistry.instance = new RuleRegistry();
        }
        return RuleRegistry.instance;
    }
    
    /**
     * 注册一个新规则
     * @param rule 要注册的规则
     */
    public registerRule(rule: Rule): void {
        
        this.rules.set(rule.id, rule);
    }
    
    /**
     * 获取指定ID的规则
     * @param id 规则ID
     */
    public getRule(id: string): Rule | undefined {
        
        return this.rules.get(id);
    }
    
    /**
     * 获取所有注册的规则
     */
    public getAllRules(): Rule[] {
        
        return Array.from(this.rules.values());
    }
    
    /**
     * 检查是否存在指定ID的规则
     * @param id 规则ID
     */
    public hasRule(id: string): boolean {
        
        return this.rules.has(id);
    }
}
