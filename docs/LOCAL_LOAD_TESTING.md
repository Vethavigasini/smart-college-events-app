# macOS Local k6 Load Testing Guide

This guide details how to install k6, configure target environment URLs, execute performance load profiles (baseline, stress, spike, endurance), and compile reports on macOS.

---

## 1. Installation

Install **k6** load testing engine using Homebrew:
```bash
brew install k6
```

Verify installation:
```bash
k6 version
```

---

## 2. Environment Variable Configuration

The test scripts do not hardcode the backend URL. Configure `LOAD_BASE_URL` to target your local server or staging API environment:

```bash
# Target local Express server (default fallback if unset)
export LOAD_BASE_URL=http://localhost:5005

# Or target deployed API environment
export LOAD_BASE_URL=https://smart-college-events-backend.onrender.com
```

---

## 3. Running Load Test Profiles

### 1. Baseline Test (100 VUs, 1 Minute)
Runs a continuous read-heavy load targeting safe API endpoints (`GET /api/events`).
```bash
npm run load:baseline
```

### 2. Stress Test (200 -> 500 -> 1000 VUs Ramping)
Evaluates system limits and concurrency handling under heavy traffic:
```bash
npm run load:stress
```

### 3. Spike Test (50 -> 500 VUs Sudden Surge)
Tests system resiliency during sudden traffic spikes:
```bash
npm run load:spike
```

### 4. Endurance Test (100 VUs, 30 Minutes)
Evaluates memory stability and leak behavior over sustained time:
```bash
npm run load:endurance
```

---

## 4. Report Compilation

Generate Excel workbooks, HTML dashboards, JSON result data, and Markdown summaries:
```bash
npm run load:reports
```

All output files will be written to:
*   **Test Results/JSON/k6-summary.json**
*   **Test Results/HTML/performance-report.html**
*   **Test Results/Excel/Performance_Report.xlsx**
*   **Test Results/Summary/performance-summary.md**
