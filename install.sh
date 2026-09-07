#!/usr/bin/env bash

# git-cli-scanner Installation Script
# https://github.com/riskchips/git-cli-scanner

set -e

echo "=========================================="
echo "🛡️  git-cli-scanner Installer"
echo "=========================================="

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm is required but not installed."
    echo "Please install npm and try again."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Found Node.js: $NODE_VERSION"

echo "📦 Installing git-cli-scanner globally via npm..."

# Attempt to install globally
if npm install -g git-cli-scanner; then
    echo ""
    echo "🎉 Success! git-cli-scanner has been installed."
    echo ""
    echo "Next steps:"
    echo "  1. Navigate to your git repository"
    echo "  2. Run 'git-cli-scanner init' to setup pre-commit hooks"
    echo "  3. Or run 'git-cli-scanner explore' to start scanning instantly"
    echo ""
else
    echo "❌ Error: Failed to install git-cli-scanner."
    echo "You may need to run this command with 'sudo', or check your npm permissions."
    exit 1
fi
