param(
  [string]$ProjectRoot = "",
  [Parameter(Mandatory=$false)][string]$Url = "",
  [string]$Output = "baseline\pages",
  [string]$ValidatePath = "",
  [switch]$Headless
)

$ErrorActionPreference = "Stop"
if (-not $ProjectRoot) {
  $ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\.."))
} else {
  $ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
}

& (Join-Path $PSScriptRoot "preflight.ps1") -ProjectRoot $ProjectRoot -Output $Output
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $ProjectRoot
try {
  if ($ValidatePath) {
    & npm.cmd run snapshot -- validate --path $ValidatePath
  } else {
    if (-not $Url) { throw "Url is required unless ValidatePath is provided." }
    $arguments = @("run", "snapshot", "--", "run", "--url", $Url, "--output", $Output)
    if ($Headless) { $arguments += "--headless" }
    & npm.cmd @arguments
  }
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
