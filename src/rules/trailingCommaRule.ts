import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';

/**
 * 检查是否以逗号结尾的规则
 * 特殊处理枚举和对象构造的情况
 */
export class TrailingCommaRule implements Rule {
    
    public id: string = 'trailingComma';
    public description: string = '枚举或对象的元素应该以逗号结尾';
    public severity: 'error' | 'warning' | 'info' | 'hint' = 'warning';

    /**
     * 检查文档是否符合规则
     * @param document 要检查的文档
     * @param options 规则的配置选项
     * @returns 检查结果，包含所有违反规则的问题
     */
    public check(document: vscode.TextDocument, options: any): LintIssue[] {
        
        if (options === false) {
            return [];
        }

        const issues: LintIssue[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        // 跟踪是否在枚举或对象构造中
        let inEnum = false;
        let inObject = false;
        let braceLevel = 0;
        let inIfStatement = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 忽略装饰器行
            if (line.startsWith('@')) {
                continue;
            }
            
            // 检查是否是 if 语句
            if (line.match(/^\s*if\s*\(/)) {
                inIfStatement = true;
            }
            
            // 检查是否进入或离开枚举定义
            if (line.match(/enum\s+\w+\s*\{/)) {
                inEnum = true;
                braceLevel++;
            }
            
            // 检查是否进入对象构造
            // 排除 if 语句条件中的大括号
            if (line.match(/(\{|\[)/) && !line.includes('import') && !line.includes('//')) {
                const openBraces = (line.match(/\{|\[/g) || []).length;
                braceLevel += openBraces;
                
                // 如果是 if 语句中的大括号，不认为是对象构造
                if (inIfStatement && line.includes('{')) {
                    inIfStatement = false; // 重置 if 语句标记
                } else if (braceLevel > 0 && !inEnum && !inIfStatement) {
                    // 检查是否是对象字面量定义而不是代码块
                    // 对象字面量通常有键值对格式 key: value 或者是数组 [item1, item2]
                    if (line.match(/[\w'"]+\s*:/)) {
                        inObject = true;
                    }
                }
            }
            
            // 检查是否离开枚举或对象构造
            if (line.match(/\}|\]/)) {
                const closeBraces = (line.match(/\}|\]/g) || []).length;
                braceLevel -= closeBraces;
                
                if (braceLevel <= 0) {
                    inEnum = false;
                    inObject = false;
                    braceLevel = 0; // 重置为0，防止负数
                }
            }
            
            // 如果在枚举或对象构造中，检查行是否以逗号结尾
            if ((inEnum || inObject) && line.length > 0) {
                // 忽略注释行、空行、结束大括号行、包含注释的行和装饰器行
                if (!line.startsWith('//') && 
                    !line.match(/^\s*$/) && 
                    !line.match(/^\s*[\}\]]/) && 
                    !line.includes('*/') &&
                    !line.match(/^\s*\/\//) &&
                    !line.includes('@')) {  // 忽略包含装饰器的行
                    
                    // 检查是否是枚举或对象的最后一个元素（下一个非空行是结束括号）
                    let isLastElement = false;
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine.length > 0) {
                            isLastElement = nextLine.startsWith('}') || nextLine.startsWith(']');
                            break;
                        }
                    }
                    
                    // 如果不是最后一个元素，则必须以逗号结尾
                    if (!isLastElement && !line.endsWith(',') && !line.match(/,\s*\/\//)) {
                        issues.push({
                            line: i,
                            character: line.length,
                            length: 1,
                            message: this.description,
                            ruleId: this.id,
                            severity: this.severity
                        });
                    }
                }
            }
        }
        
        return issues;
    }
}
