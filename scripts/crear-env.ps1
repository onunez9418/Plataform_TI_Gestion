# Crea el archivo .env con contrasenas aleatorias, solo si no existe. (Solo ASCII a proposito: Windows PowerShell 5.)
# Lo llama iniciar.bat. Equivalente en Linux/Mac: node scripts/crear-env.mjs
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$ruta = Join-Path $raiz '.env'
if (Test-Path $ruta) { Write-Host '.env ya existe: no se toca.'; exit 0 }

function Nuevo-Secreto {
    $bytes = New-Object byte[] 24
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return (($bytes | ForEach-Object { $_.ToString('x2') }) -join '')
}

$claves = 'POSTGRES_PASSWORD','PG_PASS_MIGRACIONES','PG_PASS_APP_EMPRESA','PG_PASS_APP_PLATAFORMA','PG_PASS_LECTOR_AUDITORIA'
$lineas = @('# Creado automaticamente. Contiene contrasenas aleatorias SOLO de esta computadora.',
            '# No lo comparta ni lo suba a ningun sitio.')
foreach ($c in $claves) { $lineas += ($c + '=' + (Nuevo-Secreto)) }
# UTF-8 sin BOM y finales de linea LF: asi Docker Compose lo lee sin problemas.
$texto = ($lineas -join "`n") + "`n"
[System.IO.File]::WriteAllText($ruta, $texto, (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'Se creo .env con contrasenas nuevas.'
