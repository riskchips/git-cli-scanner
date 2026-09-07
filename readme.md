# Git CLI Scanner

A powerful CLI tool that scans your codebase for hardcoded secrets, API keys, passwords, private keys, database credentials, and Docker infrastructure tokens before they reach your Git history.

---

## What Does It Scan For?

Git CLI Scanner uses regex heuristics and pattern matching to detect:

- **Cloud Provider Keys**: AWS Access/Secret Keys, Google Cloud API Keys.
- **Infrastructure & Databases**: Database Connection Strings (MongoDB, PostgreSQL, MySQL, Redis), Docker Hub Personal Access Tokens.
- **Collaboration Tools**: Slack Tokens, Slack Webhooks, GitHub PATs, OAuth Tokens, Discord Webhooks.
- **Private Keys**: RSA, DSA, EC, OpenSSH, PGP Private Keys.
- **Banned Files**: Accidental commits of `.env`, `.pem`, `.sqlite`, `.log` files (unless they are explicitly added to `.gitignore`).

It features an intelligent **Ignore System** (Dummy Detection) that automatically downgrades the severity of fake, dummy, or test secrets commonly used in unit tests (e.g., `1234567890abcdef`, `dummy_token`).

---

## Installation

```bash
# Install globally via NPM
npm install -g git-cli-scanner

# Or use directly with npx (no install needed)
npx git-cli-scanner <command>
```

---

## 🚀 Usage & Commands

### 1. Enable Automatic Scanning (Pre-commit Hook)

The best way to use the scanner is to set it up as a Git pre-commit hook so it automatically scans your code every time you try to commit.

```bash
# Navigate to your project
cd your-project

# Initialize the pre-commit hook
git-cli-scanner init
```

After running `init`, every time you run `git commit`, the scanner will automatically scan your staged files. If vulnerabilities are found, you will be prompted to either abort the commit or proceed.

### 2. Disable Automatic Scanning

If you no longer want the scanner to run automatically on `git commit`, you can disable it:

```bash
git-cli-scanner disable
```

### 3. Scan Staged Files Manually

You can manually trigger a scan of only the files that are currently staged in Git (the files you have `git add`ed).

```bash
# Scan staged files
git-cli-scanner scan

# Scan staged files and display detailed remediation/solutions for the vulnerabilities
git-cli-scanner scan --show-sol
```

### 4. Scan an Entire Directory

You can scan an entire directory recursively. This is useful for auditing an existing codebase that hasn't been scanned before.

```bash
# Scan the current directory
git-cli-scanner scan-all .

# Scan a specific directory (e.g., ./src)
git-cli-scanner scan-all ./src

# Scan a directory and show suggested solutions
git-cli-scanner scan-all ./tests --show-sol
```

### 5. Scan Git History (Time Travel)

The history scanner rewinds your Git commits to find secrets that were leaked in the past. It parses the diffs of each commit to find the exact moment a secret was introduced.

```bash
# Scan the very last commit (default behavior)
git-cli-scanner scan-history

# Scan a specific commit by its hash
git-cli-scanner scan-history --id <commit-hash>

# Scan all commits in the last 30 days
git-cli-scanner scan-history --since="30 days ago"

# Scan the entire Git history across all branches! (Use with caution on large repos)
git-cli-scanner scan-history --all

# Scan history and show solutions
git-cli-scanner scan-history --all --show-sol
```

### 6. Interactive File Explorer (TUI)

Launch an interactive Terminal User Interface (TUI) to navigate your project directory and manually select files to scan.

```bash
git-cli-scanner explore
```

| Key | Action |
|-----|--------|
| `Up / Down` | Move through files and folders |
| `Right / Enter` | Open folder or scan file |
| `Left` | Go back to parent directory |
| `Ctrl+C` | Exit |

---

## Severity Levels

The scanner categorizes findings into different severity levels:

| Indicator | Level | Color | Meaning |
|-----------|-------|-------|---------|
| `●` | HIGH | Red | Hardcoded secrets that pose a critical risk and must be removed. |
| `●` | MEDIUM | Yellow | Risky files or configurations not safely ignored in `.gitignore`. |
| `○` | IGNORED | Dim | Test/example values (auto-detected dummy values that pose no risk). |

---

## Example Output

```
✖ Found 2 vulnerabilities! (2 blockers)

Scan Results:

  ● HIGH · aws-secret-key
    File:  src/config/aws.ts:12
    Match: aws_secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEX...
    Risk:  Compromised AWS Secret Keys grant direct access to your entire cloud infrastructure.

  ● HIGH · database-connection-string
    File:  src/db/connection.ts:5
    Match: mongodb+srv://admin:supersecret123@cluster0.mongo...
    Risk:  An attacker can directly connect to your database instance, allowing them to steal user data.
```

---

## Running Tests Locally

If you are contributing to the project, you can run the test suite using Vitest:

```bash
npm test
```

---

## License

ISC