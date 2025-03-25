/**
 * 注释相关的工具函数
 */
export class CommentUtils {
    
    /**
     * 检查一行是否是注释行
     * @param line 要检查的行
     * @returns 如果是注释行则返回 true，否则返回 false
     */
    public static isCommentLine(line: string): boolean {
        
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
     * 检查给定位置是否在注释中
     * @param line 当前行文本
     * @param charPos 字符位置
     * @returns 如果在注释中则返回 true，否则返回 false
     */
    public static isInComment(line: string, charPos: number): boolean {
        
        // 检查是否在单行注释中
        const singleCommentPos = line.indexOf('//');
        if (singleCommentPos !== -1 && charPos > singleCommentPos) {
            return true;
        }
        
        // 检查是否在多行注释中
        // 这是一个简化的检查，完整的检查需要考虑跨行的多行注释
        const multiCommentStart = line.indexOf('/*');
        const multiCommentEnd = line.indexOf('*/', multiCommentStart);
        
        if (multiCommentStart !== -1) {
            if (multiCommentEnd !== -1) {
                // 多行注释在同一行内开始和结束
                return charPos > multiCommentStart && charPos < multiCommentEnd + 2;
            } else {
                // 多行注释开始但未在同一行结束
                return charPos > multiCommentStart;
            }
        }
        
        // 检查是否是多行注释的中间行或结束行
        if (line.trim().startsWith('*')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 移除行内注释
     * @param line 要处理的行
     * @returns 移除注释后的行
     */
    public static removeInlineComment(line: string): string {
        
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
