@echo off
echo Setting PowerShell execution policy to RemoteSigned for current user...
powershell -Command "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force"
echo Done. You can now run .ps1 scripts directly.
pause
