# Git CLI Scanner

A powerful, interactive CLI tool that scans your codebase for hardcoded secrets, API keys, passwords, private keys, and other vulnerabilities before they ever reach your Git history.

---

## Installation

```bash
npm install -g git-cli-scanner
```

## Quick Start

```bash
# Set up the pre-commit hook (one-time)
npx git-cli-scanner init

# Now every time you run `git commit`, the scanner will automatically
# scan your staged files and warn you if vulnerabilities are found.
# If issues are detected, you choose whether to continue or abort.
```

---

## Commands

### `init` — Enable automatic scanning

Installs a Husky pre-commit hook that triggers the scanner automatically before every commit. When you run `git commit`, the scanner will:
1. Automatically scan all staged files
2. Show any vulnerabilities found
3. Ask you if you want to continue or abort the commit

```bash
npx git-cli-scanner init
```

### `disable` — Disable automatic scanning

Removes the pre-commit hook so the scanner no longer runs automatically on `git commit`.

```bash
npx git-cli-scanner disable
```

### `scan` — Scan staged files

Scans only the files you have staged (`git add`) for vulnerabilities. This is what the pre-commit hook runs automatically. If issues are found, you get to choose whether to continue or abort.

```bash
npx git-cli-scanner scan
npx git-cli-scanner scan --show-sol   # Also show suggested fixes
```

### `scan-all` — Scan an entire directory

Recursively walks through a directory and scans every file for vulnerabilities. Skips `.git`, `node_modules`, `dist`, and `build` directories automatically.

```bash
npx git-cli-scanner scan-all .              # Scan current directory
npx git-cli-scanner scan-all ./src           # Scan only src/
npx git-cli-scanner scan-all tests --show-sol  # Scan tests/ with solutions
```

### `explore` — Interactive file explorer TUI

Launch a fully interactive Terminal UI to browse your project and scan files on the fly.

```bash
npx git-cli-scanner explore
```

**Controls:**
| Key | Action |
|-----|--------|
| `Up / Down` | Move cursor through files and folders |
| `Right / Enter` | Open a folder or scan a file |
| `Left` | Go back to parent directory |
| `Ctrl+C` | Exit the explorer |

---

## Flags

| Flag | Available On | Description |
|------|-------------|-------------|
| `--show-sol` | `scan`, `scan-all` | Show actionable fix suggestions for each vulnerability |

---

## What It Detects

### HIGH Severity (Red)
- AWS Access Keys & Secret Keys
- Google Cloud API Keys
- Slack Tokens & Webhooks
- GitHub Personal Access Tokens & OAuth Tokens
- Stripe API Keys
- SendGrid, Mailgun, and Twilio Tokens
- RSA, OpenSSH, and PGP Private Keys
- Generic API keys, passwords, and passphrases (any format like `api_key`, `api-key`, `API_KEY`, etc.)

### MEDIUM Severity (Yellow)
- `.env` files not listed in `.gitignore`
- Banned file types: `.pem`, `.key`, `.sqlite`, `.db`, `.log`, `.p12`, `.pfx`
- `node_modules/` committed to the repo

### Dummy Detection (Dimmed)
The scanner has a strict dummy detection engine that automatically identifies obvious test/example secrets (like `AKIAIOSFODNN7EXAMPLE` or values containing `test`, `dummy`, `sample`, etc.) and downgrades them so they don't block your workflow.

---

## Gitignore Awareness

The scanner checks if banned files (like `.env`, `.sqlite`, `.pem`) are listed in your `.gitignore` or `.npmignore`. If they are, the issue is downgraded to a safe "IGNORED" status. If they are NOT, you get a loud warning:

```
DANGER: .env is NOT in .gitignore or .npmignore!
```

---

## Severity Levels

| Indicator | Level | Color | Meaning |
|-----------|-------|-------|---------|
| `●` | HIGH | Red | Hardcoded secrets that must be removed |
| `●` | MEDIUM | Yellow | Risky files that should be in .gitignore |
| `○` | IGNORED (DUMMY) | Dim | Detected but identified as a test/example value |

---

## Running Tests

```bash
npm test
```

---

## License

ISC