$ErrorActionPreference = "Stop"

$ContainerName = "prelegal-app"

docker rm -f $ContainerName 2>$null | Out-Null

Write-Host "Prelegal stopped"
