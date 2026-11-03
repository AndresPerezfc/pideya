# Publica PideYa en internet con un túnel de Cloudflare (no necesita cuenta).
#
# La dirección https://....trycloudflare.com que aparece hay que pegarla en la consola
# del taller: Facilitador → Producción de PideYa. Cambia cada vez que se abre el túnel.
#
# Uso, en otra ventana de PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\produccion\tunel.ps1

param([int]$Puerto = 3000)

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Host "Falta cloudflared. Instálalo con: winget install --id Cloudflare.cloudflared" -ForegroundColor Red
  exit 1
}

Write-Host "Abriendo el túnel hacia http://localhost:$Puerto" -ForegroundColor Cyan
Write-Host "Busca abajo la línea con https://...trycloudflare.com y pégala en la consola del taller." -ForegroundColor Cyan
cloudflared tunnel --url "http://localhost:$Puerto"
