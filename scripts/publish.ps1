# publish.ps1 — Commit and push to GitHub
# Usage: .\scripts\publish.ps1
# Usage (custom message): .\scripts\publish.ps1 -Message "update light blue theme"
# Usage (custom branch): .\scripts\publish.ps1 -Branch main -Message "fix: fix footer links"

param(
    [string]$Message = "",
    [string]$Branch  = "main",
    [switch]$DryRun,                   # Add -DryRun to preview only, without executing
    [string]$Root    = ""
)

if ($Root) { Set-Location $Root } else { Set-Location (Split-Path $PSScriptRoot -Parent) }
$Root = (Get-Location).Path

Write-Host ""
Write-Host "=== Publish to GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Verify git exists
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] git not found. Please install Git for Windows." -ForegroundColor Red
    exit 1
}

# Get current branch
$CurrentBranch = git rev-parse --abbrev-ref HEAD 2>&1
Write-Host "Current branch: $CurrentBranch" -ForegroundColor Gray

# Get remote URL
$RemoteUrl = git remote get-url origin 2>&1
Write-Host "Remote  : $RemoteUrl" -ForegroundColor Gray
Write-Host ""

# Check working directory for changes
$Status = git status --short 2>&1
if (-not $Status) {
    Write-Host "[INFO] No changes to commit." -ForegroundColor Yellow
    Write-Host ""

    # Still try push (may have unpushed commits)
    $Unpushed = git log origin/$Branch..HEAD --oneline 2>&1
    if ($Unpushed) {
        Write-Host "Unpushed commits:" -ForegroundColor White
        $Unpushed | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        Write-Host ""
    } else {
        Write-Host "Already in sync with remote, nothing to do." -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "Changes:" -ForegroundColor White
    $Status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""

    # Auto-generate commit message (if not specified)
    if (-not $Message) {
        $Timestamp  = Get-Date -Format "yyyy-MM-dd HH:mm"
        $AddedCount = ($Status | Where-Object { $_ -match "^\?\?" }).Count
        $ModCount   = ($Status | Where-Object { $_ -match "^ M|^M " }).Count
        $Parts      = @()
        if ($ModCount  -gt 0) { $Parts += "update $ModCount files" }
        if ($AddedCount -gt 0) { $Parts += "add $AddedCount files" }
        $Summary = if ($Parts) { $Parts -join ", " } else { "update content" }
        $Message = "chore: $Summary [$Timestamp]"
    }

    Write-Host "Commit message: $Message" -ForegroundColor White
    Write-Host ""

    if ($DryRun) {
        Write-Host "[DryRun] Would run: git add . && git commit -m `"$Message`" && git push origin $Branch" -ForegroundColor Yellow
        Write-Host "[DryRun] Dry run complete, no changes made." -ForegroundColor Yellow
        exit 0
    }

    # git add
    Write-Host "Running git add ..." -ForegroundColor Yellow
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] git add failed." -ForegroundColor Red
        exit 1
    }

    # git commit
    Write-Host "Running git commit ..." -ForegroundColor Yellow
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] git commit failed." -ForegroundColor Red
        exit 1
    }
}

# git push
if ($DryRun) {
    Write-Host "[DryRun] Would run: git push origin $Branch" -ForegroundColor Yellow
    exit 0
}

Write-Host "Running git push origin $Branch ..." -ForegroundColor Yellow
git push origin $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Push successful!" -ForegroundColor Green

    # Show GitHub URL
    $RepoUrl = $RemoteUrl -replace '\.git$', '' `
                          -replace 'git@github\.com:', 'https://github.com/'
    Write-Host ""
    Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
    Write-Host "Pages     : $RepoUrl/tree/$Branch" -ForegroundColor Cyan

    # GitHub Pages hint
    $GhPagesUrl = $RepoUrl -replace 'https://github\.com/([^/]+)/([^/]+)', 'https://$1.github.io/$2'
    Write-Host "GitHub Pages (if enabled): $GhPagesUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] git push failed (exit $LASTEXITCODE)." -ForegroundColor Red
    Write-Host "  Check remote settings and network connection." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
