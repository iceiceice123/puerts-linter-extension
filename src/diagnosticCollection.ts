import * as vscode from 'vscode';
import { LintIssue } from './linter';

export class DiagnosticCollection implements vscode.Disposable {
    
    private collection: vscode.DiagnosticCollection;

    constructor() {
        
        this.collection = vscode.languages.createDiagnosticCollection('typescript-linter');
    }

    public set(uri: vscode.Uri, issues: LintIssue[]): void {
        
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            // 创建整行范围的诊断
            const line = issue.line;
            const lineRange = new vscode.Range(
                line, 0,
                line, Number.MAX_SAFE_INTEGER
            );
            
            const diagnostic = new vscode.Diagnostic(
                lineRange,
                issue.message,
                this.getSeverity(issue.severity)
            );
            
            diagnostic.source = 'TypeScript Linter';
            diagnostic.code = issue.ruleId;
            
            // 设置自定义装饰，使用亮黄色背景
            const decoration = { backgroundColor: 'rgba(255, 255, 0, 0.3)' };
            diagnostic.tags = [vscode.DiagnosticTag.Unnecessary]; // 这会使波浪线变淡
            
            return diagnostic;
        });

        this.collection.set(uri, diagnostics);
        
        // 应用自定义装饰
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
        
        // 创建装饰类型
        const highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.3)', // 亮黄色背景
            isWholeLine: true, // 整行高亮
        });
        
        // 创建装饰范围
        const decorations = issues.map(issue => {
            return {
                range: new vscode.Range(
                    issue.line, 0,
                    issue.line, Number.MAX_SAFE_INTEGER
                )
            };
        });
        
        // 应用装饰
        editor.setDecorations(highlightDecorationType, decorations);
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
        } else {
            this.collection.clear();
        }
    }

    public dispose(): void {
        
        this.collection.dispose();
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
