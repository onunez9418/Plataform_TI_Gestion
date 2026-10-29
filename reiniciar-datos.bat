@echo off
rem BORRA todo lo que se hizo en la plataforma y vuelve a cargar los datos de ejemplo.
setlocal
cd /d "%~dp0"
title Plataforma TI - Reiniciar datos

echo.
echo ================================================================
echo   ATENCION: esto BORRA todo lo que usted creo en la plataforma
echo   ^(usuarios, categorias, equipos, etc.^) y vuelve a dejar solo
echo   los datos de ejemplo del principio.
echo ================================================================
echo.
set "RESP="
set /p RESP=Para continuar escriba la palabra BORRAR y pulse Enter. Para cancelar, cierre esta ventana: 
if /i not "%RESP%"=="BORRAR" (
  echo.
  echo No se borro nada. Cancelado.
  echo.
  pause
  exit /b 0
)

docker info >nul 2>&1
if errorlevel 1 (
  echo.
  echo [X] Docker Desktop no esta abierto. Abralo, espere a que diga "running" y reintente.
  pause
  exit /b 1
)

echo.
echo Borrando datos...
docker compose down -v
if errorlevel 1 (
  echo [X] No se pudo borrar. Avise a la Jefatura de Proyecto.
  pause
  exit /b 1
)
echo [OK] Datos borrados. Volviendo a preparar la plataforma con los datos de ejemplo...
echo.
call "%~dp0iniciar.bat"
exit /b %errorlevel%
