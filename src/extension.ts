import * as vscode from 'vscode';
import { TypeScriptLinter } from './linter';
import { DiagnosticCollection } from './diagnosticCollection';

let diagnosticCollection: DiagnosticCollection;
let linter: TypeScriptLinter;

export function activate(context: vscode.ExtensionContext) {
    
    console.log('TypeScript Linter extension is now active!');

    // 创建诊断集合
    diagnosticCollection = new DiagnosticCollection();
    
    // 注册命令
    const checkCurrentFileCommand = vscode.commands.registerCommand('typescript-linter.checkCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            lintDocument(editor.document);
        }
    });

    // 注册文档保存事件
    const onSaveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
        const config = vscode.workspace.getConfiguration('typescriptLinter');
        const autoCheck = config.get<boolean>('autoCheck', true);
        
        if (autoCheck && isTypeScriptDocument(document)) {
            lintDocument(document);
        }
    });

    // 注册文档打开事件
    const onOpenEvent = vscode.workspace.onDidOpenTextDocument((document) => {
        if (isTypeScriptDocument(document)) {
            lintDocument(document);
        }
    });

    // 注册文档更改事件
    const onChangeEvent = vscode.workspace.onDidChangeTextDocument((event) => {
        // 可以考虑添加防抖动逻辑，避免频繁检查
        if (isTypeScriptDocument(event.document)) {
            lintDocument(event.document);
        }
    });
    
    // 注册编辑器变化事件，以便在切换编辑器时重新应用装饰
    const onActiveEditorChanged = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && isTypeScriptDocument(editor.document)) {
            // 重新应用当前文档的诊断
            lintDocument(editor.document);
        }
    });

    // 将所有注册的事件和命令添加到上下文中
    context.subscriptions.push(
        checkCurrentFileCommand,
        onSaveEvent,
        onOpenEvent,
        onChangeEvent,
        onActiveEditorChanged,
        diagnosticCollection
    );

    // 检查当前打开的文档
    if (vscode.window.activeTextEditor) {
        const document = vscode.window.activeTextEditor.document;
        if (isTypeScriptDocument(document)) {
            lintDocument(document);
        }
    }
}

function isTypeScriptDocument(document: vscode.TextDocument): boolean {
    
    return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
}

function lintDocument(document: vscode.TextDocument) {
    
    // 获取配置的规则
    const config = vscode.workspace.getConfiguration('typescriptLinter');
    const rules = config.get('rules', {});
    
    // 创建linter实例并进行检查
    linter = new TypeScriptLinter(rules);
    const issues = linter.lint(document);
    
    // 更新诊断信息
    diagnosticCollection.set(document.uri, issues);
}

export function deactivate() {
    
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
