# Git CLI Scanner

A powerful CLI tool that scans your codebase for hardcoded secrets, API keys, passwords, private keys, database credentials, Docker tokens, CI/CD secrets, and infrastructure configs before they reach your Git history.

---

## Installation

```bash
# macOS / Linux (via curl)
curl -sL https://raw.githubusercontent.com/riskchips/git-cli-scanner/main/install.sh | bash

# Windows (via PowerShell)
iwr https://raw.githubusercontent.com/riskchips/git-cli-scanner/main/install.ps1 -useb | iex

# Install globally via NPM
npm install -g git-cli-scanner

# Or use directly with npx (no install needed)
npx git-cli-scanner <command>
```

## Uninstallation

If you need to remove the scanner from your system:

```bash
# If installed via npm
npm uninstall -g git-cli-scanner

# Or if you prefer the curl method (macOS/Linux)
curl -sL https://raw.githubusercontent.com/riskchips/git-cli-scanner/main/uninstall.sh | bash

# Or Windows PowerShell
iwr https://raw.githubusercontent.com/riskchips/git-cli-scanner/main/uninstall.ps1 -useb | iex
```

---

## Commands

| Command | Description | Arguments & Flags | Example Usage |
|---------|-------------|-------------------|---------------|
| `init` | Installs the pre-commit hook to automatically scan files on `git commit`. | None | `npx git-cli-scanner init` |
| `disable` | Removes the pre-commit hook to stop automatic scanning. | None | `npx git-cli-scanner disable` |
| `scan` | Manually scans the currently staged files (files added via `git add`). | `--show-sol` — Show suggested fixes for each finding | `npx git-cli-scanner scan`<br>`npx git-cli-scanner scan --show-sol` |
| `scan-all` | Recursively scans an entire directory for secrets. | `<dir>` — The directory to scan<br>`--show-sol` — Show suggested fixes | `npx git-cli-scanner scan-all .`<br>`npx git-cli-scanner scan-all ./src --show-sol` |
| `scan-history` | Scans Git commit history for leaked secrets. Defaults to the last commit. | `--id <hash>` — Scan a specific commit<br>`--since="<time>"` — Scan commits from a time range<br>`--all` — Scan entire history across all branches<br>`--show-sol` — Show fixes | `npx git-cli-scanner scan-history`<br>`npx git-cli-scanner scan-history --id 3a4b5c6`<br>`npx git-cli-scanner scan-history --since="30 days ago"`<br>`npx git-cli-scanner scan-history --all --show-sol` |
| `explore` | Launches the interactive file explorer TUI with per-file and per-directory scanning. | None | `npx git-cli-scanner explore` |

---

## Interactive Explorer

The `explore` command opens a terminal-based file browser that lets you navigate your project and scan individual files or entire directories on the spot.

**Features:**

- **Directory stats** — Shows file count, folder count, and total size for the current directory.
- **File metadata** — Displays file size, line count, and last modified time when scanning a file.
- **Risk indicators** — Files with risky extensions (`.env`, `.pem`, `.key`, etc.) are tagged with `[RISKY]`.
- **Scan entire directory** — Select `[Scan this directory]` to recursively scan all files in the current folder.
- **Per-file results** — Grouped by severity with full risk descriptions and remediation advice.
- **Rescan** — Option to rescan a file after making changes.

**Controls:**

| Key | Action |
|-----|--------|
| `Up / Down` | Navigate through files and folders |
| `Enter` | Open folder or scan the selected file |
| `Ctrl+C` | Exit the explorer |

---

## Detection Rules

### Cloud Providers

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `aws-access-key` | AWS Access Key IDs (`AKIA...`) | High |
| `aws-secret-key` | AWS Secret Access Keys (heuristic match) | High |
| `gcp-api-key` | Google Cloud API Keys (`AIza...`) | High |
| `digitalocean-token` | DigitalOcean Personal Access Tokens | High |
| `datadog-key` | Datadog API Keys | High |
| `firebase-secret` | Firebase API Keys / Secrets | High |
| `firebase-service-account` | Firebase Service Account JSON (`"type": "service_account"`) | Critical |

### Authentication

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `jwt-secret` | JWT Secret Keys (quoted or unquoted) | High |
| `oauth-client-secret` | OAuth Client Secrets | High |
| `session-secret` | Session Cookie Secrets | High |
| `supabase-key` | Supabase Anon/Service Role Keys | High |
| `clerk-secret-key` | Clerk Secret Keys | High |
| `auth0-client-secret` | Auth0 Client Secrets | High |

### API Keys & Tokens

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `generic-api-key` | Generic `api_key`, `api-key`, `API_KEY` patterns | High |
| `stripe-key` | Stripe API Keys (`sk_live_...`, `rk_live_...`) | High |
| `github-pat` | GitHub Personal Access Tokens | High |
| `slack-token` | Slack Bot/User Tokens (`xoxb-...`, `xoxp-...`) | High |
| `slack-webhook` | Slack Incoming Webhook URLs | High |
| `discord-webhook` | Discord Webhook URLs | High |
| `telegram-bot-token` | Telegram Bot Tokens | High |
| `shopify-token` | Shopify Access/Custom App Tokens | High |
| `square-secret` | Square Access Tokens / OAuth Secrets | High |

### Package Registries

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `npm-token` | NPM Access Tokens (`npm_...`) | High |
| `pypi-token` | PyPI Access Tokens (`pypi-...`) | High |
| `maven-gradle-password` | Maven / Gradle / Nexus / Artifactory Repository Passwords | High |

### CI/CD Platforms

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `gitlab-ci-token` | GitLab Personal Access Tokens (`glpat-...`) | Critical |
| `github-actions-token` | GitHub Actions Runner Tokens (`ghp_...`, `ghs_...`) | Critical |
| `jenkins-token` | Jenkins API Tokens / Secrets | High |

### Infrastructure & Databases

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `docker-hub-token` | Docker Hub Personal Access Tokens (`dckr_pat_...`) | High |
| `database-connection-string` | Database URLs with credentials (MongoDB, PostgreSQL, MySQL, Redis) | High |
| `smtp-credentials` | SMTP / SendGrid / Mailgun email passwords | High |
| `terraform-helm-secret` | Terraform (`tf_var_...`) and Helm (`helm_var_...`) variable secrets | High |
| `ngrok-token` | Ngrok Auth Tokens | High |
| `sentry-token` | Sentry Auth Tokens | High |

### Webhooks & Payments

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `stripe-secret` | Stripe Secret Keys and Webhook Secrets (`sk_live_`, `whsec_`) | High |
| `paypal-secret` | PayPal Client Secrets | High |
| `generic-webhook` | Webhook URLs (Slack, Discord, IFTTT) | High |

### Private Keys & Certificates

| Rule ID | What It Detects | Severity |
|---------|-----------------|----------|
| `rsa-private-key` | RSA Private Key blocks | High |
| `dsa-private-key` | DSA Private Key blocks | High |
| `ec-private-key` | EC Private Key blocks | High |
| `openssh-private-key` | OpenSSH Private Key blocks | High |
| `pgp-private-key` | PGP Private Key blocks | High |
| `banned-file-type` | Banned extensions: `.pem`, `.key`, `.p12`, `.pfx`, `.crt`, `.cer`, `.keystore`, `.sqlite`, `.db`, `.log`, `.env` | Medium |

---

## Intelligent Dummy Detection

The scanner features an intelligent ignore system that automatically downgrades the severity of fake, dummy, or test secrets commonly used in unit tests and example files. This prevents false positives from blocking your commits.

**Patterns recognized as dummy:**
- Sequential characters: `1234567890abcdef`, `abcdefghijklmnop`
- Common placeholders: `EXAMPLE`, `dummy`, `test`, `fake`, `placeholder`
- Repetitive patterns: `aaaa`, `0000`

When a dummy value is detected, the finding is downgraded from `HIGH` to `IGNORED (DUMMY)` and will not block your commit.

---

## Severity Levels

| Indicator | Level | Meaning |
|-----------|-------|---------|
| `●` | CRITICAL | CI/CD and service account secrets that grant admin-level access |
| `●` | HIGH | Hardcoded secrets that pose a critical risk and must be removed |
| `●` | MEDIUM | Risky files or configurations not safely ignored in `.gitignore` |
| `○` | IGNORED | Test/example values (auto-detected dummy values that pose no risk) |

---

## Example Output

```
✖ Found 3 potential vulnerabilities! (3 blockers)

Scan Results:

  ● HIGH · jwt-secret
    File:  src/config/auth.ts:5
    Match: JWT_SECRET=xJk9Lp2Rm5Qw8Yz1Xv4Bn7Cm...
    Risk:  An attacker can forge JWT tokens to impersonate any user.

  ● HIGH · database-connection-string
    File:  src/db/connection.ts:3
    Match: mongodb+srv://admin:supersecret@cluster0.mongo...
    Risk:  An attacker can directly connect to your database instance.

  ○ IGNORED (DUMMY) · aws-access-key
    File:  tests/mock.ts:10
    Match: AKIAIOSFODNN7EXAMPLE...
    Risk:  (auto-downgraded — recognized as a test/example value)
```

---

## Running Tests

```bash
npm test
```

---

## License

ISC