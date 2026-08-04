# macOS Local Selenium Setup Guide

This guide details the steps required to set up and run the **Smart College Events** Selenium Web E2E automation framework locally on macOS.

---

## 1. Prerequisites

### Google Chrome
Ensure that **Google Chrome** is installed on your macOS machine.
1. Download from: [google.com/chrome](https://www.google.com/chrome/)
2. Verify that Chrome is installed in your `/Applications` directory.

### Node.js & npm
Ensure you have Node.js 18 or 20 installed:
```bash
node -v
npm -v
```

---

## 2. Install Project Dependencies

Run clean install to pull down the automated test dependencies (including `selenium-webdriver` and `exceljs`):
```bash
npm install
```

*Note: Selenium 4 uses **Selenium Manager** internally to dynamically manage, resolve, and configure Chromedriver binaries on the fly. You do not need to install `chromedriver` globally or manually download it.*

---

## 3. Run Automation Suite Locally

Follow these commands to configure environment targets and execute the test runner:

### 1. Configure the Target URL (Optional)
By default, the framework targets the live deployment:
`https://Vethavigasini.github.io/smart-college-events-app/`

To override the default URL, export the `BASE_URL` environment variable:
```bash
export BASE_URL=https://Vethavigasini.github.io/smart-college-events-app/
```

### 2. Run the Selenium Test Suite
Execute the headless Chrome test runner script:
```bash
npm run selenium:test
```
This command compiles and executes the web POM mocha specs and outputs the raw results to `automation/selenium/reports/results.json`.

### 3. Compile Reports
Process the execution results and generate Excel and HTML report files:
```bash
npm run selenium:reports
```

All generated files will be written directly under the `Test Results/` directory:
*   **Test Results/Excel/Selenium_Test_Case_Master.xlsx**
*   **Test Results/Excel/Selenium_Automation_Report.xlsx**
*   **Test Results/Excel/Selenium_Passed_Tests.xlsx**
*   **Test Results/Excel/Selenium_Failed_Tests.xlsx**
*   **Test Results/Excel/Selenium_Summary.xlsx**
*   **Test Results/HTML/selenium-execution-report.html**
*   **Test Results/JSON/selenium-results.json**
