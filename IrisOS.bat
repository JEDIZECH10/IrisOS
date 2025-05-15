@echo off
title IrisOS Boot Loader
color 1F
cls

:: Set console size
mode con: cols=80 lines=30

:: Function to display centered text
call :CenterText "IrisOS Boot Loader v1.0"
call :CenterText "======================"
echo.
call :CenterText "Simulating system reboot..."
timeout /t 2 /nobreak >nul

:: BIOS POST screen
cls
color 0F
echo.
echo IrisOS BIOS v2.0
echo ===================================
echo.
echo Performing Power-On Self Test (POST)
echo.
echo Detecting CPU... 
timeout /t 1 /nobreak >nul
echo OK

echo Initializing RAM... 
timeout /t 1 /nobreak >nul
echo OK

echo Checking storage devices... 
timeout /t 1 /nobreak >nul
echo OK

echo Initializing peripherals... 
timeout /t 1 /nobreak >nul
echo OK

echo.
echo All hardware checks passed.
echo.
echo Press any key to enter boot menu...
pause >nul

:: Boot Menu
cls
color 1F
echo.
echo =============================================
echo         IrisOS Boot Menu
echo =============================================
echo.
echo Select boot option:
echo.
echo [1] IrisOS
echo [2] IrisOS (Safe Mode)
echo [3] Boot from Hard Drive
echo [4] System Recovery
echo.
echo Press 1-4 to select an option...

:: Get user input
choice /c 1234 /n

if %errorlevel%==1 (
  cls
  color 2F
  echo.
  echo Loading IrisOS...
  echo.
  call :ProgressBar 40
  timeout /t 1 /nobreak >nul
  
  cls
  echo.
  echo Loading IrisOS...
  echo.
  call :ProgressBar 80
  timeout /t 1 /nobreak >nul
  
  cls
  echo.
  echo Loading IrisOS...
  echo.
  call :ProgressBar 100
  timeout /t 1 /nobreak >nul
  
  echo.
  echo Boot successful! Starting IrisOS...
  timeout /t 2 /nobreak >nul
  
  set IRISOS_SAFE_MODE=false
) else if %errorlevel%==2 (
  cls
  color 1F
  echo.
  echo Loading IrisOS in Safe Mode...
  echo.
  call :ProgressBar 100
  timeout /t 2 /nobreak >nul
  
  echo.
  echo Boot successful! Starting IrisOS in Safe Mode...
  timeout /t 2 /nobreak >nul
  
  set IRISOS_SAFE_MODE=true
) else if %errorlevel%==3 (
  cls
  color 4F
  echo.
  echo ERROR: No operating system found on hard drive.
  echo Restart and select a different boot option.
  echo.
  timeout /t 3 /nobreak >nul
  exit /b 1
) else if %errorlevel%==4 (
  cls
  color 1F
  echo.
  echo IrisOS System Recovery
  echo ======================
  echo.
  echo Loading recovery console...
  timeout /t 3 /nobreak >nul
  
  echo.
  echo Recovery mode not implemented in this version.
  echo.
  echo Press any key to exit...
  pause >nul
  exit /b 1
)

:: Clear screen and start IrisOS
cls
color 0F
echo IrisOS is now starting... Please wait.
timeout /t 2 /nobreak >nul

:: Export environment variables for IrisOS
set IRISOS_BOOTING=true
if not defined IRISOS_VERBOSE set IRISOS_VERBOSE=false
if not defined IRISOS_SAFE_MODE set IRISOS_SAFE_MODE=false

if "%IRISOS_SAFE_MODE%"=="true" (
  echo Starting IrisOS in Safe Mode...
)

:: Launch the actual IrisOS program using Node.js
node index.js

:: Exit when IrisOS is closed
exit /b 0

:CenterText
setlocal
set "text=%~1"
for /f "tokens=2" %%a in ('mode con ^| find "Columns"') do set /a cols=%%a
set /a padlen=(%cols%-%~1:~0,-0%-2)/2
set "spaces=                                                                                "
call echo %%spaces:~0,%padlen%%%"%~1%"
endlocal
goto :eof

:ProgressBar
setlocal enabledelayedexpansion
set /a filled=%~1*40/100
set /a empty=40-filled
set progressbar=[
for /l %%i in (1,1,%filled%) do set progressbar=!progressbar!#
for /l %%i in (1,1,%empty%) do set progressbar=!progressbar! 
set progressbar=!progressbar!] %~1%%
echo !progressbar!
endlocal
goto :eof