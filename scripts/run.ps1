param([int]$Port = 8000, [string]$Root = "")
if ($Root) { Set-Location $Root } else { Set-Location (Split-Path $PSScriptRoot -Parent) }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Write-Host "[ERROR] Python not found." -ForegroundColor Red; exit 1 }
$occ = netstat -ano | Select-String (":$Port ")
if ($occ) { $Port++ }
Write-Host ""
Write-Host "=== Family Legacy Documentation ===" -ForegroundColor Cyan
Write-Host "  Traditional -> http://localhost:$Port/"
Write-Host "  Apple       -> http://localhost:$Port/apple/"
Write-Host "  Dark Brown  -> http://localhost:$Port/dark/"
Write-Host "  Light Blue  -> http://localhost:$Port/purple/"
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""
$u = "http://localhost:$Port/"
Start-Job -ScriptBlock { param($x); Start-Sleep 1; Start-Process $x } -ArgumentList $u | Out-Null
python -m http.server $Port
