param(
    [ValidateSet("main","apple","dark","purple")][string]$Theme = "main",
    [ValidateSet("index","stories","people","timeline","values","gallery","about")][string]$Page = "index",
    [int]$Port = 8000
)
Set-Location (Split-Path $PSScriptRoot -Parent)
$map = @{ main="Traditional"; apple="Apple"; dark="Dark Brown"; purple="Light Blue" }
$base = if ($Theme -eq "main") { "" } else { "$Theme/" }
$url = "http://localhost:$Port/$base$Page.html"
Write-Host ""
Write-Host "Theme : $($map[$Theme])" -ForegroundColor Cyan
Write-Host "Page  : $Page.html"
Write-Host "URL   : $url" -ForegroundColor Green
Write-Host ""
$running = $false
try { Invoke-WebRequest $url -TimeoutSec 1 -ErrorAction Stop | Out-Null; $running = $true } catch {}
if (-not $running) {
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Write-Host "[ERROR] Python not found." -ForegroundColor Red; exit 1 }
    Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Minimized -Command python -m http.server $Port" -WorkingDirectory (Get-Location).Path
    Start-Sleep 1
}
Start-Process $url
Write-Host "Browser opened." -ForegroundColor Green
