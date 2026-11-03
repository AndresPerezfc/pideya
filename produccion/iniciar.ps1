# Producción de PideYa en el PC 5.
#
# Cada 20 segundos revisa si main cambió en GitHub. Si cambió: descarga el código,
# instala dependencias si hace falta y reinicia la app. Si la app se cae, la vuelve a arrancar.
#
# Uso, en PowerShell, dentro de la carpeta del proyecto (copia de producción, nadie la edita a mano):
#   powershell -ExecutionPolicy Bypass -File .\produccion\iniciar.ps1

param(
  [int]$Intervalo = 20,
  [int]$Puerto = 3000
)

Set-Location (Split-Path $PSScriptRoot -Parent)

function Escribir([string]$Texto, [string]$Color = "Gray") {
  Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Texto) -ForegroundColor $Color
}

if (-not (Test-Path ".env")) {
  Escribir "Falta el archivo .env. Créalo con: copy .env.example .env" Red
  exit 1
}

$proceso = $null
$desplegado = ""

function Iniciar-App {
  if ($script:proceso -and -not $script:proceso.HasExited) {
    Stop-Process -Id $script:proceso.Id -Force
    $script:proceso.WaitForExit()
  }
  $env:PORT = "$Puerto"
  $script:proceso = Start-Process -FilePath "node" -ArgumentList "--disable-warning=ExperimentalWarning", "server.js" -NoNewWindow -PassThru
  Start-Sleep -Seconds 3
  try {
    $salud = Invoke-RestMethod -Uri "http://localhost:$Puerto/api/health" -TimeoutSec 5
    Escribir "Producción en línea (versión $($salud.version))" Green
  } catch {
    Escribir "¡Producción caída! La app no responde. Revisa el error de arriba." Red
  }
}

Escribir "Vigilando la rama main cada $Intervalo segundos. Ctrl + C para detener." Cyan

try {
  while ($true) {
    git fetch --quiet origin main
    if ($LASTEXITCODE -ne 0) {
      Escribir "No se pudo consultar GitHub (¿internet?). Reintento en $Intervalo segundos." Yellow
    } else {
      $remoto = (git rev-parse origin/main).Trim()
      if ($remoto -ne $desplegado) {
        $antes = $desplegado
        git reset --hard --quiet origin/main
        $cambios = if ($antes) { git diff --name-only $antes $remoto } else { @("package-lock.json") }
        if ($cambios -contains "package-lock.json" -or -not (Test-Path "node_modules")) {
          Escribir "Instalando dependencias..." Gray
          npm.cmd ci --no-audit --no-fund | Out-Null
        }
        $mensaje = (git log -1 --pretty=%s).Trim()
        Escribir "Desplegando $($remoto.Substring(0, 7)): $mensaje" Cyan
        Iniciar-App
        $desplegado = $remoto
      } elseif ($proceso -and $proceso.HasExited) {
        Escribir "La app no está corriendo (¿un error en el código?). La vuelvo a arrancar." Yellow
        Iniciar-App
      }
    }
    Start-Sleep -Seconds $Intervalo
  }
} finally {
  if ($proceso -and -not $proceso.HasExited) { Stop-Process -Id $proceso.Id -Force }
  Escribir "Producción detenida." Yellow
}
