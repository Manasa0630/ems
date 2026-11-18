@echo off
echo Starting Event Management System...
echo ===================================
cd /d "%~dp0backend"
start http://localhost:5000
node server.js
pause
