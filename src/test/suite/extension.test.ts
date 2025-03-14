import * as assert from 'assert';
import * as vscode from 'vscode';
import { TypeScriptLinter, LinterRules } from '../../linter';

suite('TypeScript Linter Test Suite', () => {
    
    vscode.window.showInformationMessage('开始运行测试');

    test('测试行长度规则', () => {
        const rules: LinterRules = {
            maxLineLength: 10
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('const longLine = "这是一个超过10个字符的长行";');
        
        const issues = linter.lint(document);
        
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(issues[0].ruleId, 'maxLineLength');
    });

    test('测试缩进规则', () => {
        const rules: LinterRules = {
            indentSize: 2,
            useSpaces: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('function test() {\n    console.log("缩进为4个空格");\n}');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'indentSize'));
    });

    test('测试分号规则', () => {
        const rules: LinterRules = {
            semicolons: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('const test = "没有分号"');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'semicolons'));
    });

    test('测试引号规则', () => {
        const rules: LinterRules = {
            quotes: 'single'
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('const test = "双引号";');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'quotes'));
    });

    test('测试console规则', () => {
        const rules: LinterRules = {
            noConsole: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('console.log("不应该使用console");');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'noConsole'));
    });

    test('测试var规则', () => {
        const rules: LinterRules = {
            noVar: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('var test = "应该使用let或const";');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'noVar'));
    });

    test('测试any规则', () => {
        const rules: LinterRules = {
            noAny: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('function test(param: any): any { return param; }');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'noAny'));
    });

    test('测试空函数规则', () => {
        const rules: LinterRules = {
            noEmptyFunctions: true
        };
        
        const linter = new TypeScriptLinter(rules);
        const document = createMockDocument('function emptyFunc() {} const arrowFunc = () => {}');
        
        const issues = linter.lint(document);
        
        assert.ok(issues.some(issue => issue.ruleId === 'noEmptyFunctions'));
    });
});

function createMockDocument(content: string): vscode.TextDocument {
    return {
        getText: () => content,
        positionAt: (offset: number) => {
            const lines = content.substring(0, offset).split('\n');
            const line = lines.length - 1;
            const character = lines[line].length;
            return new vscode.Position(line, character);
        },
        lineAt: (line: number | vscode.Position) => {
            const lineNumber = typeof line === 'number' ? line : line.line;
            const lines = content.split('\n');
            return {
                text: lines[lineNumber],
                lineNumber,
                range: new vscode.Range(
                    new vscode.Position(lineNumber, 0),
                    new vscode.Position(lineNumber, lines[lineNumber].length)
                ),
                firstNonWhitespaceCharacterIndex: lines[lineNumber].search(/\S/),
                isEmptyOrWhitespace: lines[lineNumber].trim().length === 0
            };
        },
        lineCount: content.split('\n').length,
        uri: vscode.Uri.parse('file:///test.ts'),
        fileName: 'test.ts',
        languageId: 'typescript',
        version: 1,
        isDirty: false,
        isUntitled: false,
        eol: vscode.EndOfLine.LF,
        save: () => Promise.resolve(true)
    } as any;
}
