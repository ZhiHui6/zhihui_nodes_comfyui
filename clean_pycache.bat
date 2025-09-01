@echo off
echo Deleting all __pycache__ folders...
echo.

:: Recursively delete all __pycache__ folders in current directory and subdirectories
for /d /r . %%d in (__pycache__) do (
    if exist "%%d" (
        echo Deleting: %%d
        rmdir /s /q "%%d"
    )
)

echo.
echo Cleanup completed!
echo Press any key to exit...
pause >nul