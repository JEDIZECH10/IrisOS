@echo off
title System Reboot Simulation
color 1F
cls

:: Set console size
mode con: cols=80 lines=30

echo.
echo   SYSTEM REBOOT SIMULATION
echo   =======================
echo.
color 0F
echo   WARNING: This will simulate a system reboot and launch IrisOS.
echo   Your actual computer will NOT be restarted.
echo.
echo   Press any key to continue or Ctrl+C to cancel...
pause >nul

:: Begin shutdown simulation
cls
color 1F
echo.
echo.
echo    Shutting down system services...
timeout /t 2 /nobreak >nul
echo    Stopping background processes...
timeout /t 2 /nobreak >nul
echo    Saving system state...
timeout /t 2 /nobreak >nul
echo.
echo    Your computer will restart in a moment.
echo.
echo    Do not turn off your computer.
timeout /t 3 /nobreak >nul

:: Black screen to simulate shutdown
cls
color 0F
timeout /t 3 /nobreak >nul

:: BIOS simulation
cls
color 1F
echo.
echo System BIOS
echo ===========================================
echo.
echo Performing POST...
timeout /t 1 /nobreak >nul
echo CPU: Intel Core i7 @ 3.40GHz
timeout /t 1 /nobreak >nul
echo Memory: 16384MB (16GB)
timeout /t 1 /nobreak >nul
echo Storage: 1TB SSD
timeout /t 1 /nobreak >nul
echo.
echo All hardware checks passed.
echo.
echo Scanning boot devices...
timeout /t 2 /nobreak >nul
echo IrisOS Boot Loader detected.
timeout /t 1 /nobreak >nul
echo.
echo Press F12 for boot menu or wait to continue...
timeout /t 3 /nobreak >nul

:: Start IrisOS boot loader
cls
call IrisOS.bat

:: Exit when IrisOS is closed
exit /b 0