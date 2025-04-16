import * as vscode from 'vscode';
import { Rule } from './ruleInterface';
import { LintIssue } from '../linter';
import { CommentUtils } from '../utils/commentUtils';

export class ArrayCopyRule implements Rule {
    
    id = 'arrayCopy';
    description = '检查是否使用数组展开符 ... 来拷贝数组';
    severity = 'warning' as const;
    
    check(document: vscode.TextDocument, options: boolean): LintIssue[] {
        
        const issues: LintIssue[] = [];
        
        if (!options) {
            return issues;
        }
        
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        
        // 查找可能的数组拷贝循环
        for (let i = 0; i < lines.length - 4; i++) {
            // 移除注释后的行内容
            const line1 = CommentUtils.removeInlineComment(lines[i]).trim();
            const line2 = CommentUtils.removeInlineComment(lines[i + 1]).trim();
            const line3 = CommentUtils.removeInlineComment(lines[i + 2]).trim();
            const line4 = CommentUtils.removeInlineComment(lines[i + 3]).trim();
            
            // 检查是否是数组初始化和循环模式
            // 模式1: 常见的for循环拷贝数组
            if (this.isArrayInitialization(line1) && 
                this.isForLoopInit(line2) && 
                this.isForLoopCondition(line3, line1) && 
                this.isArrayCopyInLoop(line4)) {
                
                const pos = document.positionAt(document.offsetAt(new vscode.Position(i, 0)));
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: line1.length,
                    message: '【必须】使用数组展开符 ... 来拷贝数组，例如: const itemsCopy = [...items];',
                    severity: this.severity,
                    ruleId: this.id
                });
                
                // 跳过已检测的行
                i += 3;
                continue;
            }
            
            // 模式2: 使用数组长度变量的for循环拷贝
            if (this.isArrayLengthVariable(line1) && 
                this.isArrayInitialization(line2) && 
                this.isForLoopWithLengthVar(line3, line1) && 
                this.isArrayCopyInLoop(line4)) {
                
                const pos = document.positionAt(document.offsetAt(new vscode.Position(i, 0)));
                issues.push({
                    line: pos.line,
                    character: pos.character,
                    length: line1.length,
                    message: '【必须】使用数组展开符 ... 来拷贝数组，例如: const itemsCopy = [...items];',
                    severity: this.severity,
                    ruleId: this.id
                });
                
                // 跳过已检测的行
                i += 3;
                continue;
            }
        }
        
        return issues;
    }
    
    /**
     * 检查是否是数组初始化行
     * @param line 要检查的行
     * @returns 如果是数组初始化则返回 true
     */
    private isArrayInitialization(line: string): boolean {
        
        return /(?:const|let|var)\s+(\w+)\s*=\s*\[\];/.test(line);
    }
    
    /**
     * 检查是否是数组长度变量声明
     * @param line 要检查的行
     * @returns 如果是数组长度变量声明则返回 true
     */
    private isArrayLengthVariable(line: string): boolean {
        
        return /(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\.length;/.test(line);
    }
    
    /**
     * 检查是否是for循环初始化
     * @param line 要检查的行
     * @returns 如果是for循环初始化则返回 true
     */
    private isForLoopInit(line: string): boolean {
        
        return /(?:let|var)?\s*(\w+)(?:\s*=\s*0)?;/.test(line) || 
               /for\s*\(\s*(?:let|var)?\s*(\w+)\s*=\s*0\s*;/.test(line);
    }
    
    /**
     * 检查是否是使用数组长度的for循环条件
     * @param line 要检查的行
     * @param arrayInitLine 数组初始化行
     * @returns 如果是使用数组长度的for循环条件则返回 true
     */
    private isForLoopCondition(line: string, arrayInitLine: string): boolean {
        
        // 提取数组名
        const arrayMatch = /(?:const|let|var)\s+(\w+)\s*=\s*\[\];/.exec(arrayInitLine);
        if (!arrayMatch) {
            return false;
        }
        
        // 检查for循环条件是否使用了另一个数组的长度
        return /(\w+)\s*<\s*(\w+)\.length/.test(line) || 
               /(\w+)\s*<\s*(\w+)/.test(line);
    }
    
    /**
     * 检查是否是使用长度变量的for循环
     * @param line 要检查的行
     * @param lengthVarLine 长度变量声明行
     * @returns 如果是使用长度变量的for循环则返回 true
     */
    private isForLoopWithLengthVar(line: string, lengthVarLine: string): boolean {
        
        // 提取长度变量名
        const lengthVarMatch = /(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\.length;/.exec(lengthVarLine);
        if (!lengthVarMatch) {
            return false;
        }
        const lengthVar = lengthVarMatch[1];
        
        // 检查for循环是否使用了长度变量
        return new RegExp(`for\\s*\\(\\s*(?:let|var)?\\s*(\\w+)\\s*=\\s*0\\s*;\\s*\\1\\s*<\\s*${lengthVar}`).test(line) ||
               new RegExp(`(\\w+)\\s*<\\s*${lengthVar}`).test(line);
    }
    
    /**
     * 检查是否是在循环中进行数组拷贝
     * @param line 要检查的行
     * @returns 如果是在循环中进行数组拷贝则返回 true
     */
    private isArrayCopyInLoop(line: string): boolean {
        
        return /(\w+)\[(\w+)\]\s*=\s*(\w+)\[(\w+)\]/.test(line);
    }
}
