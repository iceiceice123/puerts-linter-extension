@echo off
chcp 65001 >nul
title TypeScript Linter 扩展打包工具

echo ===== TypeScript Linter 扩展打包工具 =====
echo.

echo 1. 正在安装依赖...
call npm install
if errorlevel 1 (
    echo 安装依赖失败，请检查错误信息。
    goto ERROR
)

echo 2. 正在增加版本号...
node ./scripts/bump-version.js
if errorlevel 1 (
    echo 增加版本号失败，请检查错误信息。
    goto ERROR
)

echo 3. 正在编译代码...
call npm run compile
if errorlevel 1 (
    echo 编译代码失败，请检查错误信息。
    goto ERROR
)

echo 4. 正在打包扩展...
call npx vsce package
if errorlevel 1 (
    echo 打包扩展失败，请检查错误信息。
    goto ERROR
)

echo.
echo ===== 打包完成 =====
echo 您可以在当前目录找到打包好的 .vsix 文件
goto END

:ERROR
echo.
echo 打包过程中出现错误，请查看上面的错误信息。

:END
echo.
pause
