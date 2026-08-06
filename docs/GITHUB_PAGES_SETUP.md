# GitHub Pages Automated QA Report Deployment Guide

This guide details how to enable, configure, and troubleshoot **GitHub Pages** automated report publishing for the **Smart College Events** repository.

---

## 1. Enabling GitHub Pages in Repository Settings

1. Open your repository on GitHub: `https://github.com/Vethavigasini/smart-college-events-app`.
2. Go to **Settings** > **Pages** (under the Code and automation section).
3. Under **Build and deployment**:
   *   **Source**: Select **Deploy from a branch**.
   *   **Branch**: Select `gh-pages` branch and root `/` folder.
4. Click **Save**.

---

## 2. Required Repository Permissions

To allow GitHub Actions to build, push, and deploy static artifacts to `gh-pages` automatically, ensure workflow permissions are enabled:

1. In GitHub settings, go to **Settings** > **Actions** > **General**.
2. Scroll to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Check **Allow GitHub Actions to create and approve pull requests**.
5. Click **Save**.

---

## 3. Workflow Permissions Configuration

The GitHub Actions workflow [.github/workflows/deploy-reports.yml](file:///Users/vethavigasini/Desktop/Clg%20event/Clg%20event/.github/workflows/deploy-reports.yml) enforces the following permissions:

```yaml
permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true
```

---

## 4. Live Report URLs & Structure

Once deployed, the reports are publicly accessible at the following URLs:

*   **Latest Master Executive Dashboard**:
    `https://Vethavigasini.github.io/smart-college-events-app/reports/latest/dashboard.html`
*   **Execution Breakdown Report**:
    `https://Vethavigasini.github.io/smart-college-events-app/reports/latest/execution-report.html`
*   **Historical Trends Analysis**:
    `https://Vethavigasini.github.io/smart-college-events-app/reports/latest/trends.html`
*   **Performance Load Dashboard**:
    `https://Vethavigasini.github.io/smart-college-events-app/reports/latest/performance-report.html`
*   **Historical Run Archive**:
    `https://Vethavigasini.github.io/smart-college-events-app/reports/history/run-<github-run-number>/`

---

## 5. Troubleshooting GitHub Pages Deployments

### Issue 1: HTTP 404 Not Found on Live URL
*   **Cause**: The `gh-pages` branch hasn't finished initial building, or Pages is set to GitHub Actions source instead of `gh-pages` branch.
*   **Fix**: Go to **Settings** > **Pages**, switch Source to **Deploy from a branch**, select `gh-pages` `/root`, and click Save.

### Issue 2: Workflow Fails with "Permission to repository denied"
*   **Cause**: GITHUB_TOKEN has read-only access.
*   **Fix**: Go to **Settings** > **Actions** > **General** > **Workflow permissions**, and change to **Read and write permissions**.
