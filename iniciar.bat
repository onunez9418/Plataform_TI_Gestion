@echo off
rem Plataforma TI - Version local de prueba (solo datos inventados).
rem Este archivo usa solo letras sin tilde a proposito, para que Windows lo muestre bien.
setlocal
cd /d "%~dp0"
title Plataforma TI - Iniciando

echo.
echo ================================================================
echo   Plataforma de Gestion de Areas de TI - VERSION LOCAL DE PRUEBA
echo   Solo datos inventados. No use datos reales.
echo ================================================================
echo.

rem --- 1. Docker instalado? ---
docker --version >nul 2>&1
if errorlevel 1 (
  echo [X] No se encontro Docker en esta computadora.
  echo     Falta el PASO 1 de la guia LEEME-PROBAR.md: instalar Docker Desktop.
  echo     Cuando lo haya instalado y reiniciado la computadora, vuelva a hacer doble clic aqui.
  echo.
  pause
  exit /b 1
)

rem --- 2. Docker abierto y listo? (espera hasta 5 minutos) ---
set /a intentos=0
:esperar_docker
docker info >nul 2>&1
if not errorlevel 1 goto docker_listo
set /a intentos+=1
if %intentos% GEQ 60 (
  echo.
  echo [X] Docker Desktop no esta listo despues de 5 minutos.
  echo     Falta el PASO 2 de la guia: abra Docker Desktop y espere a que diga
  echo     "Docker Desktop is running" ^(o "Engine running"^). Luego vuelva a hacer doble clic aqui.
  echo.
  pause
  exit /b 1
)
echo Esperando a que Docker Desktop este abierto y listo... ^(%intentos%/60^)
echo   Si no lo ha abierto, abralo ahora desde el menu Inicio.
timeout /t 5 /nobreak >nul
goto esperar_docker

:docker_listo
echo [OK] Docker esta listo.

rem --- 3. Contrasenas (solo la primera vez) ---
if not exist ".env" (
  echo Creando las contrasenas de esta computadora ^(solo la primera vez^)...
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\crear-env.ps1"
  if errorlevel 1 (
    echo [X] No se pudieron crear las contrasenas. Avise a la Jefatura de Proyecto.
    pause
    exit /b 1
  )
)

rem --- 4. Construir y encender ---
echo.
echo Preparando la plataforma. LA PRIMERA VEZ DESCARGA E INSTALA Y PUEDE TARDAR VARIOS MINUTOS.
echo No cierre esta ventana.
echo.
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo [X] No se pudo preparar la plataforma. Revise que Docker Desktop siga abierto y que haya
  echo     conexion a internet ^(la primera vez descarga componentes^). Si sigue igual, tome una
  echo     foto de esta ventana y enviela a la Jefatura de Proyecto.
  echo.
  pause
  exit /b 1
)

rem --- 5. Esperar a que responda ---
echo.
echo Esperando a que la plataforma responda ^(hasta 10 minutos la primera vez^)...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\esperar-salud.ps1" -Segundos 600
if errorlevel 1 (
  echo.
  echo [X] La plataforma no respondio a tiempo. Ultimos mensajes:
  echo ----------------------------------------------------------------
  docker compose logs --tail 25 app
  echo ----------------------------------------------------------------
  echo     Tome una foto de esta ventana y enviela a la Jefatura de Proyecto.
  echo     Si el mensaje habla del puerto 3000, cierre el programa que lo usa y reintente.
  echo.
  pause
  exit /b 1
)

echo.
echo [OK] La plataforma esta lista. Abriendo el navegador en http://localhost:3000
start "" "http://localhost:3000"
echo.
echo Puede cerrar esta ventana. Para apagar la plataforma use detener.bat.
echo.
pause
exit /b 0
