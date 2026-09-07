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

### Commands Overview

| Command | Description | Arguments & Flags | Example Usage |
|---------|-------------|-------------------|---------------|
| `init` | Installs the pre-commit hook to automatically scan files on `git commit`. | None | `npx git-cli-scanner init` |
| `disable` | Removes the pre-commit hook to stop automatic scanning. | None | `npx git-cli-scanner disable` |
| `scan` | Manually scans the currently staged files (files added via `git add`). | `--show-sol` (Shows suggested solutions) | `npx git-cli-scanner scan`<br>`npx git-cli-scanner scan --show-sol` |
| `scan-all` | Recursively scans an entire directory for secrets. | `<dir>` (The directory to scan)<br>`--show-sol` (Shows solutions) | `npx git-cli-scanner scan-all .`<br>`npx git-cli-scanner scan-all ./src --show-sol` |
| `scan-history`| Scans Git commit history for leaked secrets (Time Travel). | `--id <hash>` (Scan a specific commit)<br>`--since="<time>"` (Scan from a time)<br>`--all` (Scan entire history)<br>`--show-sol` (Shows solutions) | `npx git-cli-scanner scan-history`<br>`npx git-cli-scanner scan-history --id 3a4b5c6`<br>`npx git-cli-scanner scan-history --since="30 days ago"`<br>`npx git-cli-scanner scan-history --all` |
| `explore` | Launches an interactive Terminal User Interface (TUI) to navigate and scan files. | None | `npx git-cli-scanner explore` |

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