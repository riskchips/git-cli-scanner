#!/usr/bin/env bash

# git-cli-scanner Uninstall Script

set -e

echo "=========================================="
echo "🗑️  git-cli-scanner Uninstaller"
echo "=========================================="

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm is not installed. Cannot uninstall globally."
    exit 1
fi

echo "📦 Uninstalling git-cli-scanner..."

if npm uninstall -g git-cli-scanner; then
    echo ""
    echo "✅ Success! git-cli-scanner has been removed from your system."
    echo ""
else
    echo "❌ Error: Failed to uninstall git-cli-scanner."
    echo "You may need to run this command with 'sudo'."
    exit 1
fi
