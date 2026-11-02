@echo off
cd /d "%~dp0"
title Food4You - Publicar en GitHub Pages

echo ========================================================
echo   Food4You - Publicador automatico a GitHub Pages
echo ========================================================
echo.

where git >nul 2>nul
if errorlevel 1 goto no_git

git remote get-url origin >nul 2>nul
if errorlevel 1 goto configurar_remote

goto subir_archivos

:no_git
echo [ERROR] Git no esta instalado o no se encuentra en el PATH.
echo Instala Git desde https://git-scm.com/ e intentalo de nuevo.
echo.
pause
exit /b 1

:configurar_remote
echo No hay ningun repositorio remoto de GitHub vinculado.
echo.
echo Si aun no has creado tu repositorio en GitHub:
echo 1. Entra a: https://github.com/new
echo 2. Ponle nombre como: food4you-store y crealo Publico.
echo 3. Copia la URL que te da GitHub.
echo.
set /p REPO_URL="Pega la URL de tu repositorio de GitHub: "
if "%REPO_URL%"=="" goto no_url

git remote add origin %REPO_URL%
echo Repositorio vinculado correctamente.
echo.
goto subir_archivos

:no_url
echo [ERROR] No has introducido ninguna URL. Cancelando operacion.
pause
exit /b 1

:subir_archivos
echo Preparando archivos y subiendo a GitHub...
git add .
git commit -m "Actualizacion de la tienda Food4You" 2>nul
git branch -M main
git push -u origin main

if errorlevel 1 goto error_push

echo.
echo ========================================================
echo   [EXITO] Los archivos se han subido a GitHub!
echo ========================================================
echo.
echo Ahora activa GitHub Pages si aun no lo has hecho:
echo 1. Abre tu repositorio en GitHub en tu navegador.
echo 2. Entra en: Settings ^> Pages.
echo 3. En 'Branch', selecciona 'main' y '/ (root)', luego pulsa Save.
echo.
echo En 1 o 2 minutos tu web estara online en GitHub Pages.
echo ========================================================
echo.
pause
exit /b 0

:error_push
echo.
echo ========================================================
echo   [AVISO] No se pudo completar el push a GitHub.
echo ========================================================
echo Si es la primera vez que usas GitHub en este equipo:
echo 1. Asegurate de haber iniciado sesion con tu cuenta de GitHub.
echo 2. Comprueba que la URL del repositorio sea correcta.
echo ========================================================
echo.
pause
exit /b 1
