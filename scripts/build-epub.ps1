# build-epub.ps1 — Package website content as EPUB
# Usage: .\scripts\build-epub.ps1
# Usage (custom title): .\scripts\build-epub.ps1 -Title "Family Legacy Story"

param(
    [string]$Title  = "Family Legacy Story",
    [string]$Author = "Lin Family",
    [string]$Output = "dist\family-legacy.epub"
)

Set-Location (Split-Path $PSScriptRoot -Parent)
$Root = (Get-Location).Path

Write-Host ""
Write-Host "=== Build EPUB ===" -ForegroundColor Cyan
Write-Host ""

# Check pandoc
if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] pandoc not found." -ForegroundColor Red
    Write-Host "  Install: winget install pandoc" -ForegroundColor Yellow
    Write-Host "  Or visit: https://pandoc.org/installing.html" -ForegroundColor Yellow
    exit 1
}

$PandocVersion = pandoc --version | Select-Object -First 1
Write-Host "pandoc: $PandocVersion" -ForegroundColor Gray

# Create dist folder
$DistDir = Join-Path $Root "dist"
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
    Write-Host "Creating folder: dist/" -ForegroundColor Gray
}

# Source HTML (reading order)
$Pages = @(
    "index.html",
    "stories.html",
    "people.html",
    "timeline.html",
    "values.html",
    "gallery.html",
    "about.html"
)

# Verify all source files exist
$Missing = $Pages | Where-Object { -not (Test-Path (Join-Path $Root $_)) }
if ($Missing) {
    Write-Host "[ERROR] Missing source files:" -ForegroundColor Red
    $Missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

$OutputPath = Join-Path $Root $Output
$CssPath    = Join-Path $Root "css\style.css"

Write-Host ""
Write-Host "Source pages:" -ForegroundColor White
$Pages | ForEach-Object { Write-Host "  + $_" -ForegroundColor Gray }
Write-Host ""
Write-Host "Output: $OutputPath" -ForegroundColor White
Write-Host ""

# Build pandoc arguments
$PandocArgs = @(
    "--from=html"
    "--to=epub"
    "--output=$OutputPath"
    "--metadata=title:$Title"
    "--metadata=author:$Author"
    "--metadata=lang:zh-TW"
    "--toc"
    "--toc-depth=2"
)

if (Test-Path $CssPath) {
    $PandocArgs += "--css=$CssPath"
}

$PandocArgs += $Pages

Write-Host "Running pandoc..." -ForegroundColor Yellow

Push-Location $Root
$ExitCode = 0
try {
    & pandoc @PandocArgs
    $ExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($ExitCode -eq 0 -and (Test-Path $OutputPath)) {
    $Size = (Get-Item $OutputPath).Length
    $SizeKB = [math]::Round($Size / 1KB, 1)
    Write-Host ""
    Write-Host "[OK] EPUB created successfully!" -ForegroundColor Green
    Write-Host "  Path: $OutputPath" -ForegroundColor Green
    Write-Host "  Size: $SizeKB KB" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tip: run .\scripts\check-epub.ps1 to validate" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[ERROR] EPUB build failed (exit code: $ExitCode)" -ForegroundColor Red
    exit 1
}
Write-Host ""
