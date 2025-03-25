@echo off
echo ===== TypeScript Linter Extension Packaging =====
echo.

echo 1. Installing dependencies...
call npm install
if errorlevel 1 goto ERROR

echo 2. Bumping version...
node ./scripts/bump-version.js
if errorlevel 1 goto ERROR

echo 3. Compiling code...
call npm run compile
if errorlevel 1 goto ERROR

echo 4. Packaging extension...
call npx vsce package
if errorlevel 1 goto ERROR

echo.
echo ===== Packaging completed successfully! =====
echo You can find the .vsix file in the current directory.
echo.
goto END

:ERROR
echo.
echo An error occurred during packaging. Please check the error messages above.
echo.

:END
pause
