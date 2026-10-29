# Espera a que la aplicacion responda en /api/salud. Sale con 0 si responde, 1 si se acaba el tiempo.
# Uso: powershell -File scripts\esperar-salud.ps1 [-Segundos 600]
param([int]$Segundos = 600)
$url = 'http://127.0.0.1:3000/api/salud'
$limite = (Get-Date).AddSeconds($Segundos)
while ((Get-Date) -lt $limite) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3
        if ($r.StatusCode -eq 200) { exit 0 }
    } catch { }
    Write-Host -NoNewline '.'
    Start-Sleep -Seconds 3
}
exit 1
