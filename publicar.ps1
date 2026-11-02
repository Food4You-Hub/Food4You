Set-Location -Path $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Food4You · Publicador a GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Comprobar Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git no esta instalado o no se encuentra en el PATH." -ForegroundColor Red
    Write-Host "Por favor, instala Git desde https://git-scm.com/ e intentalo de nuevo."
    Read-Host "Presiona Enter para salir..."
    exit 1
}

# 2. Comprobar repositorio remoto
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "No hay ningun repositorio de GitHub vinculado todavia." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Si aun no lo has creado:"
    Write-Host "1. Entra a: https://github.com/new"
    Write-Host "2. Asigna un nombre (ej. food4you-store) y marcalo como Publico."
    Write-Host "3. Copia la URL que te ofrece GitHub (terminada en .git)."
    Write-Host ""
    $repoUrl = Read-Host "Pega la URL de tu repositorio de GitHub"
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[ERROR] No se ha introducido ninguna URL." -ForegroundColor Red
        Read-Host "Presiona Enter para salir..."
        exit 1
    }
    git remote add origin $repoUrl.Trim()
    Write-Host "Repositorio vinculado a: $repoUrl" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Repositorio remoto detectado: $remote" -ForegroundColor Green
    Write-Host ""
}

# 3. Subir a GitHub
Write-Host "Subiendo archivos a la rama main de GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Actualizacion de la tienda Food4You" 2>$null
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  [EXITO] Archivos subidos correctamente a GitHub!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ultimo paso para activar GitHub Pages:"
    Write-Host "1. Abre tu repositorio en GitHub."
    Write-Host "2. Ve a Settings > Pages."
    Write-Host "3. En 'Branch', selecciona 'main' y '/ (root)', pulsa Save."
    Write-Host ""
    Write-Host "En 1 o 2 minutos tu tienda estara visible para todo el mundo."
} else {
    Write-Host ""
    Write-Host "[AVISO] Si es la primera vez que subes a GitHub desde este equipo," -ForegroundColor Yellow
    Write-Host "se abrira una ventana para que inicies sesion en tu cuenta de GitHub." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Presiona Enter para cerrar esta ventana..."
