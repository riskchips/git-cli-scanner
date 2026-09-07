Write-Host "=========================================="
Write-Host "🛡️  git-cli-scanner Installer for Windows"
Write-Host "=========================================="

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js is required but not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
}

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: npm is required but not installed." -ForegroundColor Red
    Write-Host "Please install npm and try again."
    exit 1
}

$NodeVersion = node -v
Write-Host "✅ Found Node.js: $NodeVersion" -ForegroundColor Green

Write-Host "📦 Installing git-cli-scanner globally via npm..."

# Attempt to install globally
npm install -g git-cli-scanner
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Success! git-cli-scanner has been installed." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Navigate to your git repository"
    Write-Host "  2. Run 'git-cli-scanner init' to setup pre-commit hooks"
    Write-Host "  3. Or run 'git-cli-scanner explore' to start scanning instantly"
    Write-Host ""
} else {
    Write-Host "❌ Error: Failed to install git-cli-scanner." -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator."
    exit 1
}
