# export-pdf.ps1 — Export PDF (MS Edge headless or pandoc fallback)
# Usage: .\scripts\export-pdf.ps1
# Usage: .\scripts\export-pdf.ps1 -Theme apple
# Usage: .\scripts\export-pdf.ps1 -Theme dark -Method pandoc

param(
    [ValidateSet("main", "apple", "dark", "purple")]
    [string]$Theme  = "main",

    [ValidateSet("auto", "edge", "pandoc")]
    [string]$Method = "auto",

    [int]$Port = 8000
)

Set-Location (Split-Path $PSScriptRoot -Parent)
$Root = (Get-Location).Path

# Theme display name & output filename
$ThemeName = @{ main="Traditional"; apple="Apple"; dark="Dark Brown"; purple="Light Blue" }[$Theme]
$OutName   = if ($Theme -eq "main") { "family-legacy" } else { "family-legacy-$Theme" }

Write-Host ""
Write-Host "=== Export PDF ===" -ForegroundColor Cyan
Write-Host "Theme: $ThemeName" -ForegroundColor White
Write-Host ""

# Create dist/
$DistDir = Join-Path $Root "dist"
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
}

$OutputPath = Join-Path $DistDir "$OutName.pdf"

# Source pages (based on theme)
$BaseDir = if ($Theme -eq "main") { $Root } else { Join-Path $Root $Theme }
$Pages = @("index","stories","people","timeline","values","gallery","about") |
         ForEach-Object { Join-Path $BaseDir "$_.html" }

# ── Detect available method ──────────────────────────────────────────────
function Find-EdgeExe {
    $Candidates = @(
        "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "${env:LocalAppData}\Microsoft\Edge\Application\msedge.exe"
    )
    return ($Candidates | Where-Object { Test-Path $_ } | Select-Object -First 1)
}

$EdgeExe    = Find-EdgeExe
$HasPandoc  = [bool](Get-Command pandoc -ErrorAction SilentlyContinue)

if ($Method -eq "auto") {
    $Method = if ($EdgeExe) { "edge" } elseif ($HasPandoc) { "pandoc" } else { "none" }
}

# ── Edge headless ─────────────────────────────────────────────
if ($Method -eq "edge") {
    if (-not $EdgeExe) {
        Write-Host "[ERROR] Microsoft Edge not found." -ForegroundColor Red
        exit 1
    }
    Write-Host "Method: MS Edge headless print-to-PDF" -ForegroundColor Gray
    Write-Host "Edge: $EdgeExe" -ForegroundColor Gray

    # Check if local server is running (Edge headless requires http://)
    $ServerRunning = $false
    try {
        Invoke-WebRequest -Uri "http://localhost:$Port/" -TimeoutSec 1 -ErrorAction Stop | Out-Null
        $ServerRunning = $true
    } catch {}

    if (-not $ServerRunning) {
        Write-Host "[INFO] Starting temporary server..." -ForegroundColor Yellow
        $ServerJob = Start-Job -ScriptBlock {
            param($root, $port)
            Set-Location $root
            python -m http.server $port
        } -ArgumentList $Root, $Port
        Start-Sleep -Seconds 2
    }

    # Export each page as temp PDF, then merge
    $TempPdfs = @()
    $PageNames = @("index","stories","people","timeline","values","gallery","about")

    Write-Host ""
    for ($i = 0; $i -lt $PageNames.Count; $i++) {
        $PageName  = $PageNames[$i]
        $UrlPath   = if ($Theme -eq "main") { "$PageName.html" } else { "$Theme/$PageName.html" }
        $PageUrl   = "http://localhost:$Port/$UrlPath"
        $TempPdf   = Join-Path $DistDir "tmp_${Theme}_${PageName}.pdf"
        $TempPdfs += $TempPdf

        Write-Host "  [$($i+1)/7] $PageName.html" -ForegroundColor Gray -NoNewline

        & $EdgeExe `
            --headless `
            --disable-gpu `
            --print-to-pdf="$TempPdf" `
            --print-to-pdf-no-header `
            --no-pdf-header-footer `
            "$PageUrl" 2>$null

        if (Test-Path $TempPdf) {
            $KB = [math]::Round((Get-Item $TempPdf).Length / 1KB, 1)
            Write-Host " → $KB KB" -ForegroundColor Green
        } else {
            Write-Host " → [FAIL]" -ForegroundColor Red
        }
    }

    # If only one page or cannot merge, copy first as output
    # Merging requires extra tools; output main index page and notify
    $ValidPdfs = $TempPdfs | Where-Object { Test-Path $_ }

    if ($ValidPdfs.Count -gt 0) {
        # Use index as main output, keep all temp files in dist/
        Copy-Item $TempPdfs[0] $OutputPath -Force

        Write-Host ""
        Write-Host "[OK] PDF export complete." -ForegroundColor Green
        Write-Host "  Main file: $OutputPath" -ForegroundColor Green
        Write-Host "  Per-page PDFs: dist\tmp_${Theme}_*.pdf" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[Tip] To merge into a single PDF, use Adobe Acrobat or an online tool." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "[ERROR] All pages failed to export. Ensure server is running and Edge supports headless." -ForegroundColor Red
        exit 1
    }

    # Clean up server
    if ($ServerJob) { Stop-Job $ServerJob; Remove-Job $ServerJob }

# ── pandoc fallback ───────────────────────────────────────────
} elseif ($Method -eq "pandoc") {
    if (-not $HasPandoc) {
        Write-Host "[ERROR] pandoc not found. Install: winget install pandoc" -ForegroundColor Red
        exit 1
    }
    Write-Host "Method: pandoc (requires wkhtmltopdf or weasyprint)" -ForegroundColor Gray
    Write-Host ""

    $ExistingPages = $Pages | Where-Object { Test-Path $_ }
    if ($ExistingPages.Count -eq 0) {
        Write-Host "[ERROR] Source HTML files not found." -ForegroundColor Red
        exit 1
    }

    Write-Host "Source pages:" -ForegroundColor White
    $ExistingPages | ForEach-Object { Write-Host "  + $(Split-Path $_ -Leaf)" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "Running pandoc..." -ForegroundColor Yellow

    Push-Location $Root
    & pandoc $ExistingPages `
        --from=html `
        --to=pdf `
        --output=$OutputPath `
        --metadata="title:Family Legacy ($ThemeName)" `
        --metadata="lang:zh-TW" `
        --pdf-engine=wkhtmltopdf 2>&1
    $ExitCode = $LASTEXITCODE
    Pop-Location

    if ($ExitCode -eq 0 -and (Test-Path $OutputPath)) {
        $KB = [math]::Round((Get-Item $OutputPath).Length / 1KB, 1)
        Write-Host ""
        Write-Host "[OK] PDF created: $OutputPath ($KB KB)" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] pandoc PDF export failed (exit $ExitCode)." -ForegroundColor Red
        Write-Host "  Ensure wkhtmltopdf is installed: https://wkhtmltopdf.org/downloads.html" -ForegroundColor Yellow
        exit 1
    }

} else {
    Write-Host "[ERROR] No PDF export tool found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  1. Microsoft Edge (usually pre-installed on Windows)" -ForegroundColor Yellow
    Write-Host "  2. pandoc + wkhtmltopdf: winget install pandoc" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
