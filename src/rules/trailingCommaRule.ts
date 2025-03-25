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
            
            // 跳过注释行
            if (this.isCommentLine(line)) {
                continue;
            }
            
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
            if (line.match(/(\{|\[)/) && !line.includes('import') && !this.isCommentLine(line)) {
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
                if (!this.isCommentLine(line) && 
                    !line.match(/^\s*$/) && 
                    !line.match(/^\s*[\}\]]/) && 
                    !line.includes('@')) {  // 忽略包含装饰器的行
                    
                    // 检查是否是枚举或对象的最后一个元素（下一个非空行是结束括号）
                    let isLastElement = false;
                    for (let j = i + 1; j < lines.length; j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine.length > 0) {
                            // 跳过注释行
                            if (this.isCommentLine(nextLine)) {
                                continue;
                            }
                            isLastElement = nextLine.startsWith('}') || nextLine.startsWith(']');
                            break;
                        }
                    }
                    
                    // 如果不是最后一个元素，则必须以逗号结尾
                    // 检查行是否以逗号结尾，但忽略行内注释后的部分
                    const lineWithoutComment = this.removeInlineComment(line);
                    if (!isLastElement && !lineWithoutComment.endsWith(',')) {
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
    
    /**
     * 检查一行是否是注释行
     * @param line 要检查的行
     * @returns 如果是注释行则返回 true，否则返回 false
     */
    private isCommentLine(line: string): boolean {
        
        // 检查是否是单行注释 (//)
        if (line.trim().startsWith('//')) {
            return true;
        }
        
        // 检查是否是多行注释的开始 (/* 或 /**) 或结束 (*/)
        if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().endsWith('*/')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 移除行内注释
     * @param line 要处理的行
     * @returns 移除注释后的行
     */
    private removeInlineComment(line: string): string {
        
        // 查找行内注释的起始位置
        const commentPos = line.indexOf('//');
        if (commentPos !== -1) {
            // 返回注释前的部分
            return line.substring(0, commentPos).trim();
        }
        
        // 查找多行注释的起始位置
        const multiCommentPos = line.indexOf('/*');
        if (multiCommentPos !== -1) {
            // 查找多行注释的结束位置
            const endCommentPos = line.indexOf('*/', multiCommentPos);
            if (endCommentPos !== -1) {
                // 如果多行注释在同一行内结束，则返回注释前的部分和注释后的部分
                return (line.substring(0, multiCommentPos) + line.substring(endCommentPos + 2)).trim();
            } else {
                // 如果多行注释没有在同一行内结束，则返回注释前的部分
                return line.substring(0, multiCommentPos).trim();
            }
        }
        
        return line;
    }
}
