@echo off
REM Helper script for nvm-windows to use the version from .nvmrc
REM nvm-windows doesn't automatically read .nvmrc files

echo Reading Node version from .nvmrc...
set /p NODE_VERSION=<.nvmrc

echo Switching to Node %NODE_VERSION%...
nvm use %NODE_VERSION%

if %errorlevel% neq 0 (
    echo.
    echo Node %NODE_VERSION% not found. Installing...
    nvm install %NODE_VERSION%
    nvm use %NODE_VERSION%
)

echo.
node --version
echo Done!

