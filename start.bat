@echo off
title AeroTwin MALE-UAV Aero-Piston Engine Digital Twin
color 0B
echo =====================================================================
echo   AEROTWIN: Real-Time Digital Twin for MALE-UAV Aero-Piston Engine
echo   Smart India Hackathon (SIH) - Rotax 914F Core Powerplant Console
echo =====================================================================
echo.

:: Navigate to the frontend directory relative to this .bat file
cd /d "%~dp0frontend"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Could not navigate to the frontend directory.
    echo Expected path: %~dp0frontend
    goto :end
)
echo [INFO] Working directory: %cd%

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/ and run this file again.
    goto :end
)
echo [INFO] Node.js found: 
call node --version

:: Check if node_modules exists; if not, install dependencies automatically
if not exist "node_modules\" (
    echo.
    echo [INFO] First-time setup detected: Installing npm dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo.
        echo [ERROR] Dependency installation encountered an issue.
        goto :end
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

echo.
echo [INFO] Launching AeroTwin Real-Time Digital Twin dev server...
echo [INFO] The dashboard will open automatically in your default browser.
echo [INFO] Press Ctrl+C to stop the server.
echo.

:: Start Vite dev server with --open flag to auto-launch the browser
call npx vite --open

:end
echo.
pause
