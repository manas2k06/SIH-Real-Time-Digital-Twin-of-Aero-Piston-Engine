@echo off
title AeroTwin MALE-UAV Aero-Piston Engine Digital Twin
color 0B
echo =====================================================================
echo   AEROTWIN: Real-Time Digital Twin for MALE-UAV Aero-Piston Engine
echo   Smart India Hackathon (SIH) - Rotax 914F Core Powerplant Console
echo =====================================================================
echo.

cd /d "%~dp0frontend"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Could not navigate to the frontend directory.
    goto end
)
echo [INFO] Working directory: %cd%

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    goto end
)
echo [INFO] Node.js found.

if not exist "node_modules\" (
    echo [INFO] Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed.
        goto end
    )
    echo [SUCCESS] Dependencies installed.
)

echo.
echo [INFO] Starting dev server and opening browser...
echo [INFO] Press Ctrl+C to stop.
echo.
call npx vite --open

:end
echo.
pause