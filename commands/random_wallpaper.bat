@echo off
setlocal enabledelayedexpansion

:: Get the folder this .bat file is located in
set "WALLPAPER_DIR=%~dp0"

:: === Find all .jpg and .png files in this folder and subfolders ===
set "file_count=0"
for /R "%WALLPAPER_DIR%" %%F in (*.jpg *.png) do (
    set /A file_count+=1
    set "file_!file_count!=%%F"
)

:: === Check if any image files were found ===
if %file_count%==0 (
    echo ❌ No JPG or PNG files found in: %WALLPAPER_DIR%
    timeout /t 5
    exit /b
)

:: === Pick a random image ===
set /A rand_num=%RANDOM% %% file_count + 1
set "random_file=!file_%rand_num%!"

:: === Set as desktop wallpaper using PowerShell ===
powershell -command ^
"Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\"user32.dll\", SetLastError = true)] public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }'; [Wallpaper]::SystemParametersInfo(20, 0, \"%random_file%\", 3)"

echo ✅ Wallpaper set to:
echo !random_file!
timeout /t 3
exit
