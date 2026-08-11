param(
  [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"
if (-not $ProjectRoot) {
  $ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
} else {
  $ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
}

$checks = [ordered]@{
  projectRoot = $ProjectRoot
  packageJson = Test-Path -LiteralPath (Join-Path $ProjectRoot "package.json")
  scenario = Test-Path -LiteralPath (Join-Path $ProjectRoot "scenarios\vuestic.json")
  node = $false
  nodeVersion = $null
  dependencies = Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\playwright")
  browserAvailable = $false
  browserSource = $null
  outputWritable = $false
}

try {
  $checks.nodeVersion = (& node --version 2>$null)
  $major = [int](($checks.nodeVersion -replace '^v', '').Split('.')[0])
  $checks.node = $major -ge 20
} catch {
  $checks.node = $false
}

if ($checks.dependencies -and $checks.node) {
  try {
    $bundledBrowser = (& node -e "const {chromium}=require('playwright'); console.log(chromium.executablePath())" 2>$null)
    if ($bundledBrowser -and (Test-Path -LiteralPath $bundledBrowser)) {
      $checks.browserAvailable = $true
      $checks.browserSource = "playwright"
    }
  } catch {}
}
if (-not $checks.browserAvailable) {
  $systemBrowsers = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
  )
  if ($systemBrowsers | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1) {
    $checks.browserAvailable = $true
    $checks.browserSource = "system-chrome-fallback"
  }
}

try {
  $artifactRoot = Join-Path $ProjectRoot "artifacts"
  New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
  $probe = Join-Path $artifactRoot (".preflight-" + [guid]::NewGuid().ToString("N") + ".tmp")
  New-Item -ItemType File -Path $probe | Out-Null
  Remove-Item -LiteralPath $probe -Force
  $checks.outputWritable = $true
} catch {
  $checks.outputWritable = $false
}

$passed = $checks.packageJson -and $checks.scenario -and $checks.node -and $checks.dependencies -and $checks.browserAvailable -and $checks.outputWritable
$result = [ordered]@{ passed = $passed; checks = $checks }
$result | ConvertTo-Json -Depth 5

if (-not $passed) {
  Write-Error "Preflight failed. Install Node 20+, run npm install, install Playwright Chromium or system Chrome, verify scenarios/vuestic.json, and grant write access to artifacts/."
  exit 2
}
