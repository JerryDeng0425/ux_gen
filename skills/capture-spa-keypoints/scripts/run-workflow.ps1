param(
  [string]$ProjectRoot = "",
  [string]$Scenario = "scenarios\vuestic.json",
  [string]$Output = "artifacts",
  [string]$ValidateRunDir = "",
  [switch]$Headless,
  [switch]$Visual
)

$ErrorActionPreference = "Stop"
if (-not $ProjectRoot) {
  $ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
} else {
  $ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
}

& (Join-Path $PSScriptRoot "preflight.ps1") -ProjectRoot $ProjectRoot
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $ProjectRoot
try {
  if ($ValidateRunDir) {
    $arguments = @("run", "snapshot", "--", "validate", "--run-dir", $ValidateRunDir)
    if ($Visual) { $arguments += "--visual" }
    & npm.cmd @arguments
  } else {
    $arguments = @("run", "snapshot", "--", "run", "--scenario", $Scenario, "--output", $Output)
    if ($Headless) { $arguments += "--headless" }
    & npm.cmd @arguments
  }
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
