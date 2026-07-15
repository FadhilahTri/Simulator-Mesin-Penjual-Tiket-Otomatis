@echo off
title SmartTicket
color 0A

echo.
echo  =========================================
echo   SmartTicket - Simulator Mesin Tiket
echo  =========================================
echo.

:: Gunakan Python 3.10 yang sudah terbukti kompatibel
set PYTHON="C:\Users\fadhi\AppData\Local\Programs\Python\Python310\python.exe"

echo  [*] Menjalankan SmartTicket di http://localhost:5000
echo  =========================================
echo.

cd /d "%~dp0backend"
start "" "http://localhost:5000"
%PYTHON% app.py
