@echo off
title Campus Notes - Development Server
color 0B
echo ===================================================
echo     STARTING INDUSTRIAL CAMPUS NOTES SYSTEM
echo ===================================================
echo.

:: 1. Verify MongoDB
echo [1/3] Checking MongoDB Database Service...
sc query "MongoDB" | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB service is running.
) else (
    echo [!] MongoDB service is not running. Starting MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MongoDB started successfully.
    ) else (
        echo [INFO] MongoDB might already be running. Proceeding...
    )
)
echo.

:: 2. Detect and display IP address
echo [2/3] Detecting Network IP Address...
set CURRENT_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1 delims= " %%b in ("%%a") do (
        if not defined CURRENT_IP set CURRENT_IP=%%b
    )
)

if defined CURRENT_IP (
    echo [OK] Active Wi-Fi/LAN IP: %CURRENT_IP%
    echo.
    echo ===================================================
    echo   Open in your browser:
    echo.
    echo   PC (Local):       http://localhost:5173
    echo   Mobile (Campus):  http://%CURRENT_IP%:5173
    echo   Backend API:      http://localhost:5000/api
    echo ===================================================
) else (
    echo [!] No active network connection found.
    echo   PC (Local):       http://localhost:5173
)
echo.

echo [3/3] Starting Frontend and Backend servers...
echo (Keep this window open while using the app. Press Ctrl+C to stop.)
echo.

npm run dev
pause
