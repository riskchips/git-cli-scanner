Write-Host "=========================================="
Write-Host "🗑️  git-cli-scanner Uninstaller for Windows"
Write-Host "=========================================="

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm is not installed. Cannot uninstall globally." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Uninstalling git-cli-scanner..."

npm uninstall -g git-cli-scanner
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Success! git-cli-scanner has been removed from your system." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Error: Failed to uninstall git-cli-scanner." -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator."
    exit 1
}
