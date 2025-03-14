# TypeScript Linter

一个自定义的 VSCode 扩展，用于检查 TypeScript 代码规范，支持高亮显示问题并提供悬停提示。

## 功能

- 支持多种代码规范规则检查
- 实时显示代码问题，使用亮黄色背景高亮整行
- 鼠标悬停时提示违反的规则
- 完全可配置的规则

## 支持的规则

| 规则 ID | 描述 | 默认值 |
|---------|------|--------|
| maxLineLength | 最大行长度 | 100 |
| indentSize | 缩进大小 | 2 |
| useSpaces | 是否使用空格缩进 | true |
| semicolons | 是否使用分号 | true |
| quotes | 引号风格 | 'single' |
| noConsole | 禁止使用console语句 | true |
| noVar | 禁止使用var声明 | true |
| noAny | 禁止使用any类型 | true |
| noEmptyFunctions | 禁止使用空函数 | true |
| namingConvention | 函数和变量的首字母必须小写，但是对于继承自UE的类首字母大写 | true |
| functionEmptyLine | 函数实现的首行跟函数名之间空一行 | true |
| trailingComma | 枚举或对象的元素应该以逗号结尾 | true |

## 安装方法

### 从 VSIX 文件安装

1. 下载最新的 `.vsix` 文件
2. 在 VSCode 中，点击左侧活动栏的扩展图标
3. 点击扩展视图右上角的 `...` 菜单，选择 "从 VSIX 安装..."
4. 选择下载的 `.vsix` 文件
5. 安装完成后，重启 VSCode

### 从源代码构建安装

1. 克隆仓库到本地
   ```bash
   git clone https://github.com/your-username/typescript-linter-extension.git
   cd typescript-linter-extension
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 编译扩展
   ```bash
   npm run compile
   ```

4. 打包扩展
   ```bash
   npm install -g vsce
   vsce package
   ```

5. 安装生成的 `.vsix` 文件
   - 在 VSCode 中，点击左侧活动栏的扩展图标
   - 点击扩展视图右上角的 `...` 菜单，选择 "从 VSIX 安装..."
   - 选择生成的 `.vsix` 文件

## 使用方法

1. 安装扩展后，它将自动检查您的 TypeScript 文件
2. 代码问题将在编辑器中以亮黄色背景高亮显示整行
3. 将鼠标悬停在问题行上可以查看详细信息，包括违反的规则
4. 使用命令面板（Ctrl+Shift+P）并输入 "TypeScript Linter: 检查当前文件" 手动检查当前文件
5. 在保存文件时自动检查（默认启用）

## 配置指南

### 修改扩展设置的方法

无论您是通过 .vsix 文件安装还是从扩展市场安装，设置的修改方法都是一样的。

#### 方法一：通过 VSCode 设置界面

1. 打开 VSCode 设置
   - 点击左下角的齿轮图标，选择"设置"
   - 或者使用快捷键 `Ctrl+,`（Windows/Linux）或 `Cmd+,`（Mac）

2. 在设置搜索框中输入 `typescriptLinter`
   - 这将筛选出所有与 TypeScript Linter 相关的设置

3. 在设置界面中，您可以：
   - 勾选或取消勾选 `typescriptLinter.autoCheck` 选项来启用或禁用自动检查
   - 点击 `Edit in settings.json` 链接来直接编辑 JSON 格式的设置

#### 方法二：直接编辑 settings.json 文件

1. 打开 settings.json 文件
   - 按下 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（Mac）打开命令面板
   - 输入 `Preferences: Open Settings (JSON)` 并选择该选项

2. 在 settings.json 文件中添加或修改以下配置：

```json
{
  "typescriptLinter.autoCheck": true,
  "typescriptLinter.rules": {
    "maxLineLength": 100,
    "indentSize": 2,
    "useSpaces": true,
    "semicolons": true,
    "quotes": "single",
    "noConsole": true,
    "noVar": true,
    "noAny": true,
    "noEmptyFunctions": true,
    "namingConvention": true,
    "functionEmptyLine": true,
    "trailingComma": true
  }
}
```

3. 保存文件后，设置将立即生效

#### 方法三：为特定工作区设置规则

如果您想为特定项目设置不同的规则，可以创建工作区设置：

1. 在项目根目录创建 `.vscode` 文件夹（如果不存在）
2. 在该文件夹中创建 `settings.json` 文件
3. 添加与上面相同格式的配置
4. 这些设置将仅应用于当前项目

#### 验证设置是否生效

修改设置后，您可以通过以下方式验证设置是否生效：

1. 打开一个 TypeScript 文件
2. 故意违反一条规则（例如，添加一个超过最大行长度的行）
3. 保存文件或运行 `TypeScript Linter: 检查当前文件` 命令
4. 查看是否有相应的错误提示（亮黄色背景高亮）

### 基本配置

您可以通过 VSCode 的设置界面或 `settings.json` 文件自定义规则：

1. 打开 VSCode 设置（文件 > 首选项 > 设置，或按 `Ctrl+,`）
2. 搜索 "typescriptLinter"
3. 根据需要调整各项规则

### 通过 settings.json 配置

在 `settings.json` 中添加以下配置：

```json
{
  "typescriptLinter.autoCheck": true,
  "typescriptLinter.rules": {
    "maxLineLength": 100,
    "indentSize": 2,
    "useSpaces": true,
    "semicolons": true,
    "quotes": "single",
    "noConsole": true,
    "noVar": true,
    "noAny": true,
    "noEmptyFunctions": true,
    "namingConvention": true,
    "functionEmptyLine": true,
    "trailingComma": true
  }
}
```

### 工作区配置

您可以为不同的项目设置不同的规则配置：

1. 在项目根目录创建 `.vscode` 文件夹
2. 在该文件夹中创建 `settings.json` 文件
3. 添加上述配置，根据项目需要调整规则

### 禁用特定规则

如果您想禁用某些规则，可以在VSCode的设置中进行配置。例如，要禁用引号风格检查，请在`settings.json`中添加以下配置：

```json
{
  "typescriptLinter.rules": {
    "quotes": false
  }
}
```

这将覆盖扩展的默认配置，并禁用引号风格检查。您也可以使用相同的方法禁用其他规则。

### 自定义规则值

某些规则支持自定义值：

```json
{
  "typescriptLinter.rules": {
    "maxLineLength": 120,         // 将最大行长度设置为 120
    "indentSize": 4,              // 将缩进大小设置为 4 个空格
    "quotes": "double"            // 使用双引号而不是单引号
  }
}
```

## 命令

扩展提供以下命令，可以通过命令面板（Ctrl+Shift+P）访问：

- `TypeScript Linter: 检查当前文件` - 手动检查当前文件

## 常见问题

### 问题：扩展没有检查我的 TypeScript 文件

确保：
- 文件扩展名为 `.ts` 或 `.tsx`
- 文件语言模式设置为 TypeScript
- `typescriptLinter.autoCheck` 设置为 `true`

### 问题：某些规则不适合我的项目

您可以在项目的 `.vscode/settings.json` 中禁用或自定义特定规则，如上述"禁用特定规则"和"自定义规则值"部分所示。

### 问题：我想添加自定义规则

该扩展采用模块化设计，您可以通过以下步骤添加自定义规则：

1. 在 `src/rules` 目录下创建新的规则文件
2. 实现 `Rule` 接口
3. 在 `src/rules/ruleRegistry.ts` 中注册新规则
4. 在 `package.json` 中添加规则配置

## 扩展规则

该扩展采用模块化设计，可以轻松添加新的规则。如果您想添加自定义规则，可以参考现有规则的实现方式。

## 贡献

欢迎提交问题报告和功能请求！如果您想贡献代码，请先创建一个 issue 讨论您的想法。

## 许可证

MIT

## 声明

纯AI生成
