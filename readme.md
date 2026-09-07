# Git CLI Scanner

A powerful CLI tool that scans your codebase for hardcoded secrets, API keys, passwords, and private keys before they reach your Git history.

---

## Installation

```bash
# Install globally
npm install -g git-cli-scanner

# Or use directly with npx (no install needed)
npx git-cli-scanner <command>
```

---

## Setup

```bash
# Navigate to your project
cd your-project

# Initialize the pre-commit hook
npx git-cli-scanner init
```

After running `init`, every time you run `git commit`, the scanner will automatically scan your staged files and warn you if any vulnerabilities are found.

---

## Commands

| Command | Description |
|---------|-------------|
| `init` | Install the pre-commit hook for automatic scanning |
| `disable` | Remove the pre-commit hook and stop automatic scanning |
| `scan` | Manually scan staged files |
| `scan --show-sol` | Scan staged files and show suggested fixes |
| `scan-all [dir]` | Scan an entire directory recursively |
| `scan-history` | Scan Git commit history for leaked secrets |
| `explore` | Launch interactive file explorer TUI |

### Enable automatic scanning

```bash
npx git-cli-scanner init
```

Installs a pre-commit hook. After this, every `git commit` will automatically scan your staged files. If vulnerabilities are found, you choose to continue or abort.

### Disable automatic scanning

```bash
npx git-cli-scanner disable
```

Removes the pre-commit hook. The scanner will no longer run automatically on `git commit`.

### Scan staged files

```bash
npx git-cli-scanner scan
npx git-cli-scanner scan --show-sol
```

### Scan an entire directory

```bash
npx git-cli-scanner scan-all .
npx git-cli-scanner scan-all ./src
npx git-cli-scanner scan-all tests --show-sol
```

### Scan Git history (Time Travel)

```bash
# Scan the very last commit (default)
npx git-cli-scanner scan-history

# Scan a specific commit by hash
npx git-cli-scanner scan-history --id <hash>

# Scan all commits in the last 30 days
npx git-cli-scanner scan-history --since="30 days ago"

# Scan the entire Git history across all branches!
npx git-cli-scanner scan-history --all
```

### Interactive file explorer

```bash
npx git-cli-scanner explore
```

| Key | Action |
|-----|--------|
| `Up / Down` | Move through files and folders |
| `Right / Enter` | Open folder or scan file |
| `Left` | Go back to parent directory |
| `Ctrl+C` | Exit |

---

## Severity Levels

| Indicator | Level | Color | Meaning |
|-----------|-------|-------|---------|
| `●` | HIGH | Red | Hardcoded secrets that must be removed |
| `●` | MEDIUM | Yellow | Risky files not in .gitignore |
| `○` | IGNORED | Dim | Test/example values (auto-detected) |

---

## Running Tests

```bash
npm test
```

---

## License

ISC