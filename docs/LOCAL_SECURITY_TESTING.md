# macOS Local Security Assessment Guide

This document details the exact commands and setup required to execute static code security analysis, vulnerability scans, secret leak detection, and report generation locally on macOS.

---

## 1. Tool Installation Commands (macOS via Homebrew)

### Semgrep (Static Application Security Testing - SAST)
```bash
brew install semgrep
```

### Trivy (Vulnerability & Misconfiguration Scanner)
```bash
brew install aquasecurity/trivy/trivy
```

### Gitleaks (Secret Detection Scanner)
```bash
brew install gitleaks
```

---

## 2. Local Execution Commands

### 1. Run Semgrep Code Audit
Execute static code analysis across backend and frontend JavaScript/TypeScript source files:
```bash
semgrep scan --config auto .
```

### 2. Run Trivy Filesystem Scan
Scan the codebase dependencies and configuration files for known CVEs:
```bash
trivy fs .
```

### 3. Run Gitleaks Secret Audit
Scan git history and repository files for exposed passwords, private keys, or API tokens:
```bash
gitleaks detect --verbose
```

### 4. Run Dependency Audit
Check for vulnerable Node.js packages:
```bash
# Audit root app dependencies
npm audit

# Audit backend dependencies
cd backend && npm audit && cd ..
```

### 5. Generate Security Test Master & Vulnerability Artifacts
Compile the security test cases database, endpoint inventory, and confirmed findings Excel sheets:
```bash
npx ts-node automation/selenium/utils/generateSecurityArtifacts.ts
```

All output spreadsheets and markdown audit files will be updated inside the directory:
`Vulnerability Test Results/`
