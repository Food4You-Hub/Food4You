@echo off
chcp 65001 > nul
title Food4You - Publicar en GitHub Pages

echo ========================================================
echo   Food4You · Publicador automatico a GitHub Pages
echo ========================================================
echo.

:: Comprobar si git esta instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta instalado o no se encuentra en el PATH.
    echo Por favor, instala Git desde https://git-scm.com/ e intentalo de nuevo.
    echo.
    pause
    exit /b 1
)

:: Comprobar si ya existe un remote configurado
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo No hay ningun repositorio remoto de GitHub vinculado.
    echo.
    echo Si todavia no has creado tu repositorio en GitHub:
    echo 1. Entra a: https://github.com/new
    echo 2. Ponle nombre (por ejemplo: food4you-store) y hazlo Publico.
    echo 3. Copia la URL HTTPS que te da GitHub.
    echo.
    set /p REPO_URL="Pega la URL de tu repositorio de GitHub: "
    if "%REPO_URL%"=="" (
        echo [ERROR] No has introducido ninguna URL. Cancelando operacion.
        pause
        exit /b 1
    )
    git remote add origin %REPO_URL%
    echo Repositorio vinculado correctamente a %REPO_URL%.
    echo.
) else (
    for /f "tokens=*" %%a in ('git remote get-url origin') do set CURRENT_REMOTE=%%a
    echo Repositorio remoto detectado: %CURRENT_REMOTE%
    echo.
)

echo Preparando archivos y subiendo a GitHub...
git add .
git commit -m "Actualizacion de la tienda Food4You" 2>nul
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   [EXITO] Los archivos se han subido a GitHub!
    echo ========================================================
    echo.
    echo Ahora solo falta activar GitHub Pages (si aun no lo has hecho):
    echo 1. Abre tu repositorio en GitHub en el navegador.
    echo 2. Entra en: Settings (pestana superior) ^> Pages (menu izquierdo).
    echo 3. En 'Source', selecciona 'Deploy from a branch'.
    echo 4. En 'Branch', selecciona 'main' y '/ (root)', luego pulsa Save.
    echo.
    echo En 1-2 minutos tu web estara disponible online.
    echo ========================================================
) else (
    echo.
    echo [AVISO] Si es la primera vez que haces push, GitHub te pedira
    echo iniciar sesion en el navegador o introducir tus credenciales.
)

echo.
pause
