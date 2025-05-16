@echo off
title IrisOS Windows Installer
color 1F
cls

:: Set console size
mode con: cols=80 lines=30

:: Title and header
echo.
echo  _____          _         ____   _____ 
echo |_   _|        (_)       / __ \ / ____|
echo   | |    _ __   _   ___  | |  | | (___  
echo   | |   | '__\ | | / __| | |  | |\___ \ 
echo  _| |_  | |    | | \__ \ | |__| |____) |
echo |_____| |_|    |_|  ___/ \____/ |_____/ 
echo.
color 2F
echo IrisOS Windows Installer
echo ========================================
echo.
color 0F

:: Check for Node.js
echo Checking for Node.js... 
where node >nul 2>nul
if %errorlevel% neq 0 (
  color 4F
  echo ERROR: Node.js not found!
  echo IrisOS requires Node.js to run. Please install Node.js and try again.
  echo You can install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
) else (
  for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
  color 2F
  echo Found Node.js %NODE_VERSION%
  color 0F
)

:: Set installation directory
set "INSTALL_DIR=%USERPROFILE%\IrisOS"
echo.
echo Installing IrisOS to: %INSTALL_DIR%

if exist "%INSTALL_DIR%" (
  color 6F
  echo.
  echo Installation directory already exists.
  set /p OVERWRITE=Do you want to overwrite the existing installation? (Y/N): 
  if /i "%OVERWRITE%" neq "Y" (
    color 4F
    echo Installation cancelled.
    pause
    exit /b 1
  )
  echo Removing old installation...
  rmdir /s /q "%INSTALL_DIR%"
  color 0F
)

:: Create directories
echo Creating directories...
mkdir "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%\lib" 2>nul

:: Copy files
echo Copying files...
if exist "lib" (
  xcopy /e /i /y "lib" "%INSTALL_DIR%\lib" >nul
)
copy /y "*.js" "%INSTALL_DIR%\" >nul
copy /y "*.bat" "%INSTALL_DIR%\" >nul

:: Create desktop shortcut
echo Creating shortcuts...
set SHORTCUT_PATH=%USERPROFILE%\Desktop\IrisOS.lnk
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%SHORTCUT_PATH%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%INSTALL_DIR%\RebootToIrisOS.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "IrisOS - Custom Text-Based Operating System" >> CreateShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\SHELL32.dll,15" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript //nologo CreateShortcut.vbs
del CreateShortcut.vbs

:: Create Start Menu shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateStartMenuShortcut.vbs
echo sLinkFile = "%APPDATA%\Microsoft\Windows\Start Menu\Programs\IrisOS.lnk" >> CreateStartMenuShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateStartMenuShortcut.vbs
echo oLink.TargetPath = "%INSTALL_DIR%\RebootToIrisOS.bat" >> CreateStartMenuShortcut.vbs
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> CreateStartMenuShortcut.vbs
echo oLink.Description = "IrisOS - Custom Text-Based Operating System" >> CreateStartMenuShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\SHELL32.dll,15" >> CreateStartMenuShortcut.vbs
echo oLink.Save >> CreateStartMenuShortcut.vbs
cscript //nologo CreateStartMenuShortcut.vbs
del CreateStartMenuShortcut.vbs

:: Create uninstaller
echo Creating uninstaller...
set "UNINSTALLER=%INSTALL_DIR%\uninstall.bat"

echo @echo off > "%UNINSTALLER%"
echo title IrisOS Uninstaller >> "%UNINSTALLER%"
echo color 4F >> "%UNINSTALLER%"
echo set /p CONFIRM=Are you sure you want to uninstall IrisOS? (Y/N): >> "%UNINSTALLER%"
echo if /i "%%CONFIRM%%" neq "Y" exit /b >> "%UNINSTALLER%"
echo echo. >> "%UNINSTALLER%"
echo echo Removing IrisOS... >> "%UNINSTALLER%"
echo del "%SHORTCUT_PATH%" >> "%UNINSTALLER%"
echo del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\IrisOS.lnk" >> "%UNINSTALLER%"
echo rmdir /s /q "%INSTALL_DIR%" >> "%UNINSTALLER%"
echo echo. >> "%UNINSTALLER%"
echo echo IrisOS has been uninstalled successfully. >> "%UNINSTALLER%"
echo pause >> "%UNINSTALLER%"

:: Installation complete
color 2F
echo.
echo IrisOS has been successfully installed!
echo.
color 0F
echo You can start IrisOS by:
echo  - Using the desktop shortcut
echo  - Using the Start Menu shortcut
echo  - Running %INSTALL_DIR%\RebootToIrisOS.bat
echo.
echo To uninstall, run the uninstall.bat file in the installation directory.
echo.
pause
exit /b 0