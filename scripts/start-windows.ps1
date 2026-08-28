$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ImageName = "prelegal"
$ContainerName = "prelegal-app"

Set-Location $RepoRoot

docker rm -f $ContainerName 2>$null | Out-Null

docker build -t $ImageName .

$envFileArgs = @()
if (Test-Path (Join-Path $RepoRoot ".env")) {
    $envFileArgs = @("--env-file", (Join-Path $RepoRoot ".env"))
}

docker run -d --name $ContainerName -p 8000:8000 @envFileArgs $ImageName

Write-Host "Prelegal is starting at http://localhost:8000"
Start-Process "http://localhost:8000"
