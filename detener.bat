@echo off
rem Apaga la plataforma. NO borra los datos de ejemplo ni lo que usted haya creado.
setlocal
cd /d "%~dp0"
title Plataforma TI - Apagando

echo Apagando la plataforma...
docker compose down
if errorlevel 1 (
  echo.
  echo [X] No se pudo apagar. Revise que Docker Desktop este abierto.
  pause
  exit /b 1
)
echo.
echo [OK] Plataforma apagada. Sus datos siguen guardados.
echo      Para volver a encenderla, haga doble clic en iniciar.bat.
echo.
pause
exit /b 0
