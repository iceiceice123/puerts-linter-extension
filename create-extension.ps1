# 创建VSCode扩展的PowerShell脚本
$extensionName = "typescript-linter"
$extensionDisplayName = "TypeScript Linter"
$extensionDescription = "A VSCode extension to check TypeScript coding standards with customizable rules"
$publisherName = "typescript-linter-publisher"

# 创建package.json文件
$packageJson = @"
{
  "name": "$extensionName",
  "displayName": "$extensionDisplayName",
  "description": "$extensionDescription",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Linters"
  ],
  "activationEvents": [
    "onLanguage:typescript",
    "onLanguage:typescriptreact"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "typescript-linter.checkCurrentFile",
        "title": "TypeScript Linter: Check Current File"
      }
    ],
    "configuration": {
      "title": "TypeScript Linter",
      "properties": {
        "typescriptLinter.rules": {
          "type": "object",
          "default": {
            "maxLineLength": 100,
            "indentSize": 2,
            "useSpaces": true,
            "semicolons": true,
            "quotes": "single",
            "trailingComma": true,
            "noConsole": true,
            "noVar": true,
            "noAny": true
          },
          "description": "Custom TypeScript linting rules"
        },
        "typescriptLinter.autoCheck": {
          "type": "boolean",
          "default": true,
          "description": "Automatically check files on save"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/glob": "^8.1.0",
    "@types/mocha": "^10.0.1",
    "@types/node": "20.2.5",
    "@typescript-eslint/eslint-plugin": "^5.59.8",
    "@typescript-eslint/parser": "^5.59.8",
    "eslint": "^8.41.0",
    "glob": "^8.1.0",
    "mocha": "^10.2.0",
    "typescript": "^5.1.3",
    "@vscode/test-electron": "^2.3.2"
  }
}
"@

# 创建tsconfig.json文件
$tsconfigJson = @"
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true
  },
  "exclude": ["node_modules", ".vscode-test"]
}
"@

# 创建目录结构
New-Item -ItemType Directory -Force -Path "D:\typescript-linter-extension\src"
New-Item -ItemType Directory -Force -Path "D:\typescript-linter-extension\src\test"

# 写入配置文件
Set-Content -Path "D:\typescript-linter-extension\package.json" -Value $packageJson
Set-Content -Path "D:\typescript-linter-extension\tsconfig.json" -Value $tsconfigJson

Write-Host "VSCode扩展项目结构已创建完成！"
