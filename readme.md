# Git CLI Scanner

A powerful CLI tool that scans your codebase for hardcoded secrets, API keys, passwords, private keys, database credentials, Docker tokens, CI/CD secrets, and infrastructure configs before they reach your Git history.

---

## Installation

```bash
# Install globally via NPM
npm install -g git-cli-scanner

# Or use directly with npx (no install needed)
npx git-cli-scanner <command>
```

---

## 🚀 Commands

| Command | Description | Arguments & Flags | Example Usage |
|---------|-------------|-------------------|---------------|
| `init` | Installs the pre-commit hook to automatically scan files on `git commit`. | None | `npx git-cli-scanner init` |
| `disable` | Removes the pre-commit hook to stop automatic scanning. | None | `npx git-cli-scanner disable` |
| `scan` | Manually scans the currently staged files (files added via `git add`). | `--show-sol` — Show suggested fixes for each finding | `npx git-cli-scanner scan`<br>`npx git-cli-scanner scan --show-sol` |
| `scan-all` | Recursively scans an entire directory for secrets. | `<dir>` — The directory to scan<br>`--show-sol` — Show suggested fixes | `npx git-cli-scanner scan-all .`<br>`npx git-cli-scanner scan-all ./src --show-sol` |
| `scan-history` | Scans Git commit history for leaked secrets (Time Travel). Defaults to the last commit. | `--id <hash>` — Scan a specific commit<br>`--since="<time>"` — Scan commits from a time range<br>`--all` — Scan entire history across all branches<br>`--show-sol` — Show fixes | `npx git-cli-scanner scan-history`<br>`npx git-cli-scanner scan-history --id 3a4b5c6`<br>`npx git-cli-scanner scan-history --since="30 days ago"`<br>`npx git-cli-scanner scan-history --all --show-sol` |
| `explore` | Launches an interactive Terminal User Interface (TUI) to browse and scan files. | None | `npx git-cli-scanner explore` |

### Interactive Explorer Keys

| Key | Action |
|-----|--------|
| `Up / Down` | Move through files and folders |
| `Right / Enter` | Open folder or scan file |
| `Left` | Go back to parent directory |
| `Ctrl+C` | Exit |

---

## 🔍 What Does It Scan For?

### Scanners & Detection Rules

| Category | Rule ID | What It Detects | Severity |
|----------|---------|-----------------|----------|
| ☁️ Cloud Providers | `aws-access-key` | AWS Access Key IDs (`AKIA...`) | High |
| ☁️ Cloud Providers | `aws-secret-key` | AWS Secret Access Keys (heuristics) | High |
| ☁️ Cloud Providers | `gcp-api-key` | Google Cloud API Keys (`AIza...`) | High |
| 🔥 Firebase | `firebase-secret` | Firebase API Keys / Secrets | High |
| 🔥 Firebase | `firebase-service-account` | Firebase Service Account JSON (`"type": "service_account"`) | Critical |
| 🪪 Authentication | `jwt-secret` | JWT Secret Keys (quoted or unquoted) | High |
| 🪪 Authentication | `oauth-client-secret` | OAuth Client Secrets | High |
| 🪪 Authentication | `session-secret` | Session Cookie Secrets | High |
| 🔑 API Keys & Tokens | `generic-api-key` | Generic `api_key`, `api-key`, `API_KEY` patterns | High |
| 🔑 API Keys & Tokens | `stripe-key` | Stripe API Keys (`sk_live_...`, `rk_live_...`) | High |
| 🔑 API Keys & Tokens | `github-pat` | GitHub Personal Access Tokens | High |
| 🔑 API Keys & Tokens | `slack-token` | Slack Bot/User Tokens (`xoxb-...`, `xoxp-...`) | High |
| 🔑 API Keys & Tokens | `slack-webhook` | Slack Incoming Webhook URLs | High |
| 🔑 API Keys & Tokens | `discord-webhook` | Discord Webhook URLs | High |
| 📦 Package Registries | `npm-token` | NPM Access Tokens (`npm_...`) | High |
| 📦 Package Registries | `pypi-token` | PyPI Access Tokens (`pypi-...`) | High |
| 📦 Package Registries | `maven-gradle-password` | Maven/Gradle/Nexus/Artifactory Repository Passwords | High |
| 🧰 CI/CD | `gitlab-ci-token` | GitLab Personal Access Tokens (`glpat-...`) | Critical |
| 🧰 CI/CD | `github-actions-token` | GitHub Actions Runner Tokens (`ghp_...`, `ghs_...`) | Critical |
| 🧰 CI/CD | `jenkins-token` | Jenkins API Tokens / Secrets | High |
| 🏠 Infrastructure | `docker-hub-token` | Docker Hub Personal Access Tokens (`dckr_pat_...`) | High |
| 🏠 Infrastructure | `database-connection-string` | Database Connection Strings (MongoDB, PostgreSQL, MySQL, Redis with credentials) | High |
| 🏠 Infrastructure | `smtp-credentials` | SMTP / SendGrid / Mailgun email passwords | High |
| 🏠 Infrastructure | `terraform-helm-secret` | Terraform (`tf_var_...`) and Helm (`helm_var_...`) variable secrets | High |
| 🔌 Webhooks | `stripe-secret` | Stripe Secret Keys and Webhook Secrets (`sk_live_`, `whsec_`) | High |
| 🔌 Webhooks | `paypal-secret` | PayPal Client Secrets | High |
| 🔌 Webhooks | `generic-webhook` | Generic Webhook URLs (Slack, Discord, IFTTT) | High |
| 🔒 Private Keys | `rsa-private-key` | RSA Private Key blocks (`-----BEGIN RSA PRIVATE KEY-----`) | High |
| 🔒 Private Keys | `dsa-private-key` | DSA Private Key blocks | High |
| 🔒 Private Keys | `ec-private-key` | EC Private Key blocks | High |
| 🔒 Private Keys | `openssh-private-key` | OpenSSH Private Key blocks | High |
| 🔒 Private Keys | `pgp-private-key` | PGP Private Key blocks | High |
| 🔒 Certificates | `banned-file-type` | Banned file extensions: `.pem`, `.key`, `.p12`, `.pfx`, `.crt`, `.cer`, `.keystore`, `.sqlite`, `.db`, `.log`, `.env` | Medium |

---

## 🛡️ Intelligent Dummy Detection

The scanner features an **Intelligent Ignore System** that automatically downgrades the severity of fake, dummy, or test secrets commonly used in unit tests and example files. This avoids blocking your commits with false positives.

**Patterns recognized as dummy:**
- Sequential characters: `1234567890abcdef`, `abcdefghijklmnop`
- Common placeholders: `EXAMPLE`, `dummy`, `test`, `fake`, `placeholder`
- Repetitive patterns: `aaaa`, `0000`

When a dummy value is detected, the finding is downgraded from `● HIGH` to `○ IGNORED (DUMMY)` and **will not block** your commit.

---

## Severity Levels

| Indicator | Level | Color | Meaning |
|-----------|-------|-------|---------|
| `●` | CRITICAL | Red | CI/CD and service account secrets that grant admin-level access |
| `●` | HIGH | Red | Hardcoded secrets that pose a critical risk and must be removed |
| `●` | MEDIUM | Yellow | Risky files or configurations not safely ignored in `.gitignore` |
| `○` | IGNORED | Dim | Test/example values (auto-detected dummy values that pose no risk) |

---

## Example Output

```
✖ Found 3 potential vulnerabilities! (3 blockers)

Scan Results:

  ● HIGH · jwt-secret
    File:  src/config/auth.ts:5
    Match: JWT_SECRET=xJk9Lp2Rm5Qw8Yz1Xv4Bn7Cm...
    Risk:  An attacker can forge JWT tokens to impersonate any user, including admins.

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