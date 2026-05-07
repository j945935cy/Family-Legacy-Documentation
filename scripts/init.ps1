# init.ps1 — Initialize this template for a new family project
# Usage: .\scripts\init.ps1
# Usage (skip prompts): .\scripts\init.ps1 -FamilyName "Wang Family" -SiteTitle "Our Family Story" -GitHubRepo "username/repo"

param(
    [string]$FamilyName  = "",
    [string]$SiteTitle   = "",
    [string]$Author      = "",
    [string]$GitHubRepo  = "",
    [switch]$ClearData,      # Also reset data.js to example/empty structure
    [switch]$DryRun,         # Preview replacements without writing files
    [string]$Root        = ""
)

if ($Root) { Set-Location $Root } else { Set-Location (Split-Path $PSScriptRoot -Parent) }
$ProjectRoot = (Get-Location).Path
$ConfigPath  = Join-Path $ProjectRoot "template.config.json"

Write-Host ""
Write-Host "=== Family Legacy — New Project Initializer ===" -ForegroundColor Cyan
Write-Host ""

# Read template.config.json
if (-not (Test-Path $ConfigPath)) {
    Write-Host "[ERROR] template.config.json not found at: $ConfigPath" -ForegroundColor Red
    exit 1
}
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

$OldFamilyName  = $Config.familyName
$OldSiteTitle   = $Config.siteTitle
$OldSiteFooter  = $Config.siteFooter
$OldAuthor      = $Config.author
$OldGitHubRepo  = $Config.githubRepo

Write-Host "Current values from template.config.json:" -ForegroundColor Gray
Write-Host "  Family Name : $OldFamilyName" -ForegroundColor Gray
Write-Host "  Site Title  : $OldSiteTitle" -ForegroundColor Gray
Write-Host "  Author      : $OldAuthor" -ForegroundColor Gray
Write-Host "  GitHub Repo : $OldGitHubRepo" -ForegroundColor Gray
Write-Host ""

# Prompt for missing values
if (-not $FamilyName) {
    $FamilyName = Read-Host "New family name (e.g. Wang Family / 王家)"
    if (-not $FamilyName) { Write-Host "[ERROR] Family name cannot be empty." -ForegroundColor Red; exit 1 }
}
if (-not $SiteTitle) {
    $SiteTitle = Read-Host "New site title (e.g. Our Family Story / 我們的故事) [press Enter to keep '$OldSiteTitle']"
    if (-not $SiteTitle) { $SiteTitle = $OldSiteTitle }
}
if (-not $Author) {
    $Author = Read-Host "Author / credit text [press Enter to use family name '$FamilyName']"
    if (-not $Author) { $Author = $FamilyName }
}
if (-not $GitHubRepo) {
    $GitHubRepo = Read-Host "GitHub repo (e.g. username/my-family) [press Enter to keep '$OldGitHubRepo']"
    if (-not $GitHubRepo) { $GitHubRepo = $OldGitHubRepo }
}

$NewSiteFooter = "${FamilyName}故事網站"

Write-Host ""
Write-Host "Replacements to apply:" -ForegroundColor White
Write-Host "  '$OldFamilyName'  ->  '$FamilyName'" -ForegroundColor Yellow
Write-Host "  '$OldSiteTitle'   ->  '$SiteTitle'" -ForegroundColor Yellow
Write-Host "  '$OldSiteFooter'  ->  '$NewSiteFooter'" -ForegroundColor Yellow
Write-Host "  '$OldAuthor'      ->  '$Author'" -ForegroundColor Yellow
Write-Host "  GitHub            ->  '$GitHubRepo'" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "[DryRun] No files will be modified." -ForegroundColor Yellow
    Write-Host "[DryRun] Run without -DryRun to apply changes." -ForegroundColor Yellow
    exit 0
}

$Confirm = Read-Host "Apply changes? (y/N)"
if ($Confirm -notmatch '^[Yy]') {
    Write-Host "Cancelled." -ForegroundColor Gray
    exit 0
}

# Collect all target files: .html (including subdirs), js/data.js
$HtmlFiles  = Get-ChildItem -Path $ProjectRoot -Include "*.html" -Recurse |
              Where-Object { $_.FullName -notmatch "\\node_modules\\" }
$DataJsPath = Join-Path $ProjectRoot "js\data.js"
$TargetFiles = @($HtmlFiles) + @(Get-Item $DataJsPath -ErrorAction SilentlyContinue)

Write-Host ""
Write-Host "Applying replacements across $($TargetFiles.Count) files..." -ForegroundColor Yellow

$ChangedCount = 0
foreach ($File in $TargetFiles) {
    if (-not $File -or -not (Test-Path $File.FullName)) { continue }

    $Original = Get-Content $File.FullName -Raw -Encoding UTF8
    $Updated  = $Original

    $Updated = $Updated -replace [regex]::Escape($OldSiteTitle),   $SiteTitle
    $Updated = $Updated -replace [regex]::Escape($OldSiteFooter),  $NewSiteFooter
    $Updated = $Updated -replace [regex]::Escape($OldFamilyName),  $FamilyName
    $Updated = $Updated -replace [regex]::Escape($OldAuthor),      $Author

    if ($Updated -ne $Original) {
        Set-Content $File.FullName -Value $Updated -Encoding UTF8 -NoNewline
        $Rel = $File.FullName.Replace($ProjectRoot + "\", "")
        Write-Host "  [OK] $Rel" -ForegroundColor Green
        $ChangedCount++
    }
}

Write-Host ""
Write-Host "$ChangedCount file(s) updated." -ForegroundColor Cyan

# Update template.config.json with new values
$Config.familyName  = $FamilyName
$Config.siteTitle   = $SiteTitle
$Config.siteFooter  = $NewSiteFooter
$Config.author      = $Author
$Config.githubRepo  = $GitHubRepo
$Config | ConvertTo-Json -Depth 5 | Set-Content $ConfigPath -Encoding UTF8
Write-Host "[OK] template.config.json updated." -ForegroundColor Green

# Optionally clear data.js
if ($ClearData) {
    Write-Host ""
    Write-Host "Resetting js/data.js to example structure..." -ForegroundColor Yellow

    $ExampleData = @"
// data.js — Replace with your own family data
// See README.md for the full data structure reference.

const familyPeople = [
  {
    id: 1,
    name: "Family Member Name",
    englishName: "Romanized Name",
    birthYear: "1940",
    role: "Role / generation",
    location: "City",
    image: "images/person-1.png",
    quote: "A memorable quote.",
    description: "A short biography of this person."
  }
];

const familyStories = [
  {
    id: 1,
    title: "Story Title",
    year: "1968",
    people: ["Family Member Name"],
    location: "Location",
    image: "images/story-1.png",
    summary: "One-sentence summary.",
    scene: "", characters: "", conflict: "", plot: "",
    sensory: "", dialogue: "", resolution: "", lesson: ""
  }
];

const familyTimeline = [
  { year: "1940", title: "Event Title", description: "Description.", location: "Location" }
];

const familyValues = [
  { title: "Value Name", icon: "🌱", description: "What this value means to your family." }
];

const familyGallery = [
  { title: "Photo Title", image: "images/photo-1.png", description: "Caption." }
];
"@
    Set-Content (Join-Path $ProjectRoot "js\data.js") -Value $ExampleData -Encoding UTF8
    Write-Host "[OK] js/data.js reset to example structure." -ForegroundColor Green
}

# Git remote update
if ($GitHubRepo -ne $OldGitHubRepo -and (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host ""
    $NewRemote = "https://github.com/$GitHubRepo.git"
    $UpdateRemote = Read-Host "Update git remote origin to '$NewRemote'? (y/N)"
    if ($UpdateRemote -match '^[Yy]') {
        git remote set-url origin $NewRemote
        Write-Host "[OK] git remote origin updated." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Next steps:" -ForegroundColor Cyan
Write-Host "  1. Add your family content to js/data.js" -ForegroundColor White
Write-Host "  2. Replace images in images/" -ForegroundColor White
Write-Host "  3. Preview: .\scripts\run.ps1" -ForegroundColor White
Write-Host "  4. Publish: .\scripts\publish.ps1 -Message `"init: new family project`"" -ForegroundColor White
Write-Host ""
