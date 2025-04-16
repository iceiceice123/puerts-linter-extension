import * as vscode from 'vscode';
import { LintIssue } from './linter';

export class DiagnosticCollection implements vscode.Disposable {
    
    private collection: vscode.DiagnosticCollection;
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

    constructor() {
        
        this.collection = vscode.languages.createDiagnosticCollection('typescript-linter');
    }

    public set(uri: vscode.Uri, issues: LintIssue[]): void {
        
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            // 创建诊断范围，如果提供了length，则使用精确范围
            const line = issue.line;
            let range;
            
            if (issue.length !== undefined) {
                range = new vscode.Range(
                    line, issue.character,
                    line, issue.character + issue.length
                );
            } else {
                // 如果没有提供length，则使用整行范围
                range = new vscode.Range(
                    line, 0,
                    line, Number.MAX_SAFE_INTEGER
                );
            }
            
            const diagnostic = new vscode.Diagnostic(
                range,
                issue.message,
                this.getSeverity(issue.severity)
            );
            
            diagnostic.source = 'TypeScript Linter';
            diagnostic.code = issue.ruleId;
            
            // 对于行尾空格规则，添加特殊标记
            if (issue.ruleId === 'noTrailingWhitespace') {
                diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
            }
            
            return diagnostic;
        });

        this.collection.set(uri, diagnostics);
        
        // 清除旧的装饰，然后应用新的装饰
        this.clearDecorations(uri);
        this.applyDecorations(uri, issues);
    }

    /**
     * 应用自定义装饰
     * @param uri 文档URI
     * @param issues 问题列表
     */
    private applyDecorations(uri: vscode.Uri, issues: LintIssue[]): void {
        
        const editor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.toString() === uri.toString());
        if (!editor) {
            return;
        }
        
        // 创建行尾空格的装饰类型
        const trailingWhitespaceDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 0, 0, 0.3)', // 红色背景，更明显
            isWholeLine: false, // 不是整行高亮
        });
        
        // 创建其他问题的装饰类型
        const highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.3)', // 亮黄色背景
            isWholeLine: true, // 整行高亮
        });
        
        // 保存装饰类型以便稍后清除
        const uriString = uri.toString();
        if (this.decorationTypes.has(uriString)) {
            // 如果已经存在，先清除旧的
            this.decorationTypes.get(uriString)?.dispose();
        }
        this.decorationTypes.set(uriString, highlightDecorationType);
        
        // 分类装饰
        const trailingWhitespaceDecorations: vscode.DecorationOptions[] = [];
        const otherDecorations: vscode.DecorationOptions[] = [];
        
        issues.forEach(issue => {
            if (issue.ruleId === 'noTrailingWhitespace' && issue.length !== undefined) {
                // 行尾空格问题
                trailingWhitespaceDecorations.push({
                    range: new vscode.Range(
                        issue.line, issue.character,
                        issue.line, issue.character + issue.length
                    ),
                    hoverMessage: issue.message
                });
            } else {
                // 其他问题
                otherDecorations.push({
                    range: new vscode.Range(
                        issue.line, 0,
                        issue.line, Number.MAX_SAFE_INTEGER
                    )
                });
            }
        });
        
        // 应用装饰
        editor.setDecorations(trailingWhitespaceDecorationType, trailingWhitespaceDecorations);
        editor.setDecorations(highlightDecorationType, otherDecorations);
        
        // 保存行尾空格装饰类型
        const trailingWhitespaceKey = uriString + '-trailingWhitespace';
        if (this.decorationTypes.has(trailingWhitespaceKey)) {
            this.decorationTypes.get(trailingWhitespaceKey)?.dispose();
        }
        this.decorationTypes.set(trailingWhitespaceKey, trailingWhitespaceDecorationType);
    }

    /**
     * 清除指定URI的装饰
     * @param uri 文档URI
     */
    private clearDecorations(uri: vscode.Uri): void {
        
        const uriString = uri.toString();
        
        // 清除常规装饰
        if (this.decorationTypes.has(uriString)) {
            const decorationType = this.decorationTypes.get(uriString);
            if (decorationType) {
                // 找到对应的编辑器
                const editor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.toString() === uriString);
                if (editor) {
                    // 清除装饰
                    editor.setDecorations(decorationType, []);
                }
                decorationType.dispose();
            }
            this.decorationTypes.delete(uriString);
        }
        
        // 清除行尾空格装饰
        const trailingWhitespaceKey = uriString + '-trailingWhitespace';
        if (this.decorationTypes.has(trailingWhitespaceKey)) {
            const decorationType = this.decorationTypes.get(trailingWhitespaceKey);
            if (decorationType) {
                // 找到对应的编辑器
                const editor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.toString() === uriString);
                if (editor) {
                    // 清除装饰
                    editor.setDecorations(decorationType, []);
                }
                decorationType.dispose();
            }
            this.decorationTypes.delete(trailingWhitespaceKey);
        }
    }

    /**
     * 获取指定URI的诊断信息
     * @param uri 文档URI
     */
    public getDiagnostics(uri: vscode.Uri): vscode.Diagnostic[] {
        
        const diagnostics = this.collection.get(uri);
        return diagnostics ? Array.from(diagnostics) : [];
    }

    public clear(uri?: vscode.Uri): void {
        
        if (uri) {
            this.collection.delete(uri);
            this.clearDecorations(uri);
        } else {
            this.collection.clear();
            // 清除所有装饰
            for (const [uriString, decorationType] of this.decorationTypes.entries()) {
                const uri = vscode.Uri.parse(uriString);
                this.clearDecorations(uri);
            }
        }
    }

    public dispose(): void {
        
        this.collection.dispose();
        // 释放所有装饰类型
        for (const decorationType of this.decorationTypes.values()) {
            decorationType.dispose();
        }
        this.decorationTypes.clear();
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        
        switch (severity) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            case 'hint':
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }
}
