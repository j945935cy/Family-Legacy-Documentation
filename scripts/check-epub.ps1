# check-epub.ps1 — Validate EPUB format
# Usage: .\scripts\check-epub.ps1
# Usage (custom path): .\scripts\check-epub.ps1 -EpubPath "dist\my-book.epub"
# Usage (custom jar): .\scripts\check-epub.ps1 -EpubCheckJar "C:\tools\epubcheck.jar"

param(
    [string]$EpubPath    = "dist\family-legacy.epub",
    [string]$EpubCheckJar = "",   # If empty, auto-detect or fall back to basic check
    [string]$Root        = ""
)

if ($Root) { Set-Location $Root } else { Set-Location (Split-Path $PSScriptRoot -Parent) }
$Root = (Get-Location).Path

Write-Host ""
Write-Host "=== Check EPUB ===" -ForegroundColor Cyan
Write-Host ""

$FullEpubPath = Join-Path $Root $EpubPath

# Verify EPUB exists
if (-not (Test-Path $FullEpubPath)) {
    Write-Host "[ERROR] EPUB file not found: $FullEpubPath" -ForegroundColor Red
    Write-Host "  Please run first: .\scripts\build-epub.ps1" -ForegroundColor Yellow
    exit 1
}

$Size = (Get-Item $FullEpubPath).Length
$SizeKB = [math]::Round($Size / 1KB, 1)
Write-Host "File: $FullEpubPath" -ForegroundColor White
Write-Host "Size: $SizeKB KB" -ForegroundColor Gray
Write-Host ""

# ── Try epubcheck ──────────────────────────────────────
$UseEpubCheck = $false

# Auto-search for epubcheck.jar
if (-not $EpubCheckJar) {
    $SearchPaths = @(
        "$env:USERPROFILE\tools\epubcheck.jar",
        "$env:USERPROFILE\epubcheck\epubcheck.jar",
        "C:\tools\epubcheck.jar",
        "C:\epubcheck\epubcheck.jar"
    )
    foreach ($p in $SearchPaths) {
        if (Test-Path $p) { $EpubCheckJar = $p; break }
    }
}

if ($EpubCheckJar -and (Test-Path $EpubCheckJar)) {
    # Verify Java exists
    if (Get-Command java -ErrorAction SilentlyContinue) {
        $UseEpubCheck = $true
    } else {
        Write-Host "[WARN] Found epubcheck.jar but Java not installed, falling back to basic check." -ForegroundColor Yellow
    }
}

if ($UseEpubCheck) {
    Write-Host "Validating with epubcheck..." -ForegroundColor Yellow
    Write-Host "Jar: $EpubCheckJar" -ForegroundColor Gray
    Write-Host ""

    $Output = & java -jar $EpubCheckJar $FullEpubPath 2>&1
    $ExitCode = $LASTEXITCODE

    # Count errors and warnings
    $Errors   = $Output | Where-Object { $_ -match "^ERROR" }
    $Warnings = $Output | Where-Object { $_ -match "^WARNING" }

    $Output | ForEach-Object {
        if ($_ -match "^ERROR")   { Write-Host $_ -ForegroundColor Red }
        elseif ($_ -match "^WARNING") { Write-Host $_ -ForegroundColor Yellow }
        else { Write-Host $_ -ForegroundColor Gray }
    }

    Write-Host ""
    if ($ExitCode -eq 0) {
        Write-Host "[OK] EPUB validation passed, no errors." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Validation failed: $($Errors.Count) errors, $($Warnings.Count) warnings." -ForegroundColor Red
        exit 1
    }

} else {
    # ── Fallback: basic ZIP structure check ──────────────────────────
    Write-Host "[INFO] epubcheck not found, running basic structure check..." -ForegroundColor Yellow
    Write-Host "  (Install epubcheck for full EPUB 3 validation)" -ForegroundColor Gray
    Write-Host "  Download: https://github.com/w3c/epubcheck/releases" -ForegroundColor Gray
    Write-Host ""

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $PassCount = 0
    $FailCount = 0

    function Test-EpubEntry {
        param($Zip, [string]$EntryName, [string]$Label)
        $Entry = $Zip.Entries | Where-Object { $_.FullName -eq $EntryName }
        if ($Entry) {
            Write-Host "  [OK] $Label ($EntryName)" -ForegroundColor Green
            $script:PassCount++
        } else {
            Write-Host "  [MISS] $Label ($EntryName)" -ForegroundColor Red
            $script:FailCount++
        }
    }

    try {
        $Zip = [System.IO.Compression.ZipFile]::OpenRead($FullEpubPath)

        Write-Host "ZIP structure check:" -ForegroundColor White
        Test-EpubEntry $Zip "mimetype"                  "mimetype file"
        Test-EpubEntry $Zip "META-INF/container.xml"    "META-INF/container.xml"

        # List all entries
        Write-Host ""
        Write-Host "EPUB contents (first 20):" -ForegroundColor White
        $Zip.Entries | Select-Object -First 20 | ForEach-Object {
            $SizeB = $_.Length
            Write-Host ("  {0,-50} {1,8} bytes" -f $_.FullName, $SizeB) -ForegroundColor Gray
        }
        if ($Zip.Entries.Count -gt 20) {
            Write-Host "  ... total $($Zip.Entries.Count) files" -ForegroundColor Gray
        }

        $Zip.Dispose()

        Write-Host ""
        if ($FailCount -eq 0) {
            Write-Host "[OK] Basic structure check passed ($PassCount items)." -ForegroundColor Green
            Write-Host "  Recommend installing epubcheck for full validation." -ForegroundColor Gray
        } else {
            Write-Host "[FAIL] $FailCount required files missing." -ForegroundColor Red
            exit 1
        }

    } catch {
        Write-Host "[ERROR] Cannot open EPUB (may not be valid ZIP format): $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
