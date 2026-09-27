@echo off
title AeroTwin MALE-UAV Aero-Piston Engine Digital Twin
color 0B
echo =====================================================================
echo   AEROTWIN: Real-Time Digital Twin for MALE-UAV Aero-Piston Engine
echo   Smart India Hackathon (SIH) - Rotax 914F Core Powerplant Console
echo =====================================================================
echo.

cd /d "%~dp0frontend"

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/ and run this file again.
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists; if not, install dependencies automatically
if not exist "node_modules\" (
    echo [INFO] First-time setup detected: Installing npm dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo.
        echo [ERROR] Dependency installation encountered an issue.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

echo [INFO] Launching AeroTwin Real-Time Digital Twin dev server...
echo [INFO] Opening dashboard in your default browser at http://localhost:3000/
echo.

:: Automatically launch default browser at http://localhost:3000/
start /min "" cmd /c "timeout /t 2 /nobreak >nul 2>&1 || ping -n 3 127.0.0.1 >nul & start http://localhost:3000/"

:: Start Vite dev server
call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Server stopped.
    pause
)
