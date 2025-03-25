@echo off
chcp 65001 > nul
echo ===== TypeScript Linter 扩展打包脚本 =====
echo.

REM 检查是否安装了 Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo 错误：未找到 Node.js，请先安装 Node.js
    echo 您可以从 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)

REM 检查是否安装了 npm
where npm >nul 2>nul
if errorlevel 1 (
    echo 错误：未找到 npm，请确保 npm 已正确安装
    pause
    exit /b 1
)

REM 检查是否安装了 vsce
call npx vsce --version >nul 2>nul
if errorlevel 1 (
    echo 未找到 vsce，正在全局安装...
    call npm install -g @vscode/vsce
    if errorlevel 1 (
        echo 安装 vsce 失败，请检查网络连接或手动安装：npm install -g @vscode/vsce
        pause
        exit /b 1
    )
)

echo 正在安装依赖...
call npm install
if errorlevel 1 (
    echo 安装依赖失败，请检查 package.json 文件或网络连接
    pause
    exit /b 1
)

echo 正在增加版本号...
node ./scripts/bump-version.js
if errorlevel 1 (
    echo 增加版本号失败
    pause
    exit /b 1
)

echo 正在编译代码...
call npm run compile
if errorlevel 1 (
    echo 编译代码失败，请检查代码中的错误
    pause
    exit /b 1
)

echo 正在打包扩展...
call npx vsce package
if errorlevel 1 (
    echo 打包扩展失败
    pause
    exit /b 1
)

echo.
echo ===== 打包完成 =====
echo 您可以在当前目录找到打包好的 .vsix 文件
echo.

pause
