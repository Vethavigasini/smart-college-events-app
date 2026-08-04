import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

interface TestCase {
  name: string;
  status: string;
  duration: number;
  error?: string;
}

interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  successRate: number;
  startTime: string;
  endTime: string;
  tests: TestCase[];
}

function parseWdioJsonReports(): RunSummary {
  const reportsDir = path.join(__dirname, '../reports');
  const summary: RunSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    successRate: 0,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    tests: []
  };

  try {
    if (!fs.existsSync(reportsDir)) {
      console.log('No reports directory found. Generating empty placeholder summary.');
      return summary;
    }

    const files = fs.readdirSync(reportsDir).filter(f => f.startsWith('results-') && f.endsWith('.json'));
    if (files.length === 0) {
      console.log('No results JSON files found. Generating empty placeholder summary.');
      return summary;
    }

    let minStartTime = Infinity;
    let maxEndTime = 0;

    for (const file of files) {
      const filePath = path.join(reportsDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (content.start) {
        const startMs = new Date(content.start).getTime();
        if (startMs < minStartTime) minStartTime = startMs;
      }
      if (content.end) {
        const endMs = new Date(content.end).getTime();
        if (endMs > maxEndTime) maxEndTime = endMs;
      }

      if (content.suites) {
        for (const suite of content.suites) {
          if (suite.tests) {
            for (const test of suite.tests) {
              const testCase: TestCase = {
                name: test.name,
                status: test.state || 'skipped',
                duration: test.duration || 0,
                error: test.error ? test.error.message : undefined
              };

              summary.tests.push(testCase);
              summary.total++;

              if (testCase.status === 'passed') {
                summary.passed++;
              } else if (testCase.status === 'failed') {
                summary.failed++;
              } else {
                summary.skipped++;
              }
            }
          }
        }
      }
    }

    if (minStartTime !== Infinity) summary.startTime = new Date(minStartTime).toISOString();
    if (maxEndTime !== 0) summary.endTime = new Date(maxEndTime).toISOString();
    summary.duration = maxEndTime > minStartTime ? maxEndTime - minStartTime : 0;
    summary.successRate = summary.total > 0 ? parseFloat(((summary.passed / summary.total) * 100).toFixed(2)) : 0;

  } catch (error) {
    console.error('Error parsing WDIO reports:', error);
  }

  return summary;
}

async function generateExcelReports(summary: RunSummary) {
  // 1. Automation_Test_Report.xlsx
  const fullReport = new ExcelJS.Workbook();
  const fullSheet = fullReport.addWorksheet('All Test Cases');
  fullSheet.columns = [
    { header: 'Test Case / ID', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Details', key: 'error', width: 60 }
  ];
  
  // Format Header Row
  fullSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  fullSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F497D' } };

  // 2. Passed_Test_Cases.xlsx
  const passedReport = new ExcelJS.Workbook();
  const passedSheet = passedReport.addWorksheet('Passed Test Cases');
  passedSheet.columns = [
    { header: 'Test Case / ID', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 }
  ];
  passedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  passedSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } };

  // 3. Failed_Test_Cases.xlsx
  const failedReport = new ExcelJS.Workbook();
  const failedSheet = failedReport.addWorksheet('Failed Test Cases');
  failedSheet.columns = [
    { header: 'Test Case / ID', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Details', key: 'error', width: 60 }
  ];
  failedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  failedSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C00000' } };

  // Populate data
  summary.tests.forEach(test => {
    const rowData = {
      name: test.name,
      status: test.status.toUpperCase(),
      duration: test.duration,
      error: test.error || 'N/A'
    };

    fullSheet.addRow(rowData);

    if (test.status === 'passed') {
      passedSheet.addRow({
        name: test.name,
        status: 'PASSED',
        duration: test.duration
      });
    } else if (test.status === 'failed') {
      failedSheet.addRow(rowData);
    }
  });

  // Apply conditional coloring on status column
  fullSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const statusCell = row.getCell('status');
      if (statusCell.value === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Light Green
        statusCell.font = { color: { argb: '375623' }, bold: true };
      } else if (statusCell.value === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } }; // Light Red
        statusCell.font = { color: { argb: 'C65911' }, bold: true };
      }
    }
  });

  // 4. Execution_Summary.xlsx
  const summaryReport = new ExcelJS.Workbook();
  const summarySheet = summaryReport.addWorksheet('Execution Summary');
  summarySheet.columns = [
    { header: 'Metric Name', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '595959' } };

  summarySheet.addRow({ metric: 'Total Test Cases', value: summary.total });
  summarySheet.addRow({ metric: 'Passed Test Cases', value: summary.passed });
  summarySheet.addRow({ metric: 'Failed Test Cases', value: summary.failed });
  summarySheet.addRow({ metric: 'Skipped Test Cases', value: summary.skipped });
  summarySheet.addRow({ metric: 'Success Rate (%)', value: `${summary.successRate}%` });
  summarySheet.addRow({ metric: 'Total Duration (s)', value: (summary.duration / 1000).toFixed(2) });

  // Write all workbooks to root folder
  await fullReport.xlsx.writeFile(path.join(process.cwd(), 'Automation_Test_Report.xlsx'));
  await passedReport.xlsx.writeFile(path.join(process.cwd(), 'Passed_Test_Cases.xlsx'));
  await failedReport.xlsx.writeFile(path.join(process.cwd(), 'Failed_Test_Cases.xlsx'));
  await summaryReport.xlsx.writeFile(path.join(process.cwd(), 'Execution_Summary.xlsx'));

  console.log('Excel reports successfully compiled and saved to root folder.');
}

function generateHtmlReport(summary: RunSummary) {
  const fileList = fs.existsSync(path.join(__dirname, '../screenshots')) ? fs.readdirSync(path.join(__dirname, '../screenshots')) : [];
  const testsHtml = summary.tests.map(test => {
    const isFailed = test.status === 'failed';
    const screenshotFile = isFailed ? fileList.find(f => f.includes(test.name.replace(/\s+/g, '_'))) : null;
    const screenshotImg = screenshotFile ? `<div class="screenshot-preview"><a href="automation/appium/screenshots/${screenshotFile}" target="_blank">View Screenshot</a></div>` : '';
    
    return `
      <tr class="${test.status}">
        <td class="name-col">${test.name}</td>
        <td><span class="badge ${test.status}">${test.status.toUpperCase()}</span></td>
        <td>${(test.duration / 1000).toFixed(2)}s</td>
        <td class="error-col">${test.error ? `<code>${test.error}</code>${screenshotImg}` : 'N/A'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appium Test Automation Report</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #0f172a;
          color: #e2e8f0;
          margin: 0;
          padding: 2rem;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #334155;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        h1 {
          margin: 0;
          font-size: 2.2rem;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .timestamp {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .card-val {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0.5rem 0;
        }
        .card-lbl {
          color: #94a3b8;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .total { color: #f8fafc; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .success-rate { color: #3b82f6; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 2rem;
        }
        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #334155;
        }
        th {
          background-color: #0f172a;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        tr.failed {
          background-color: rgba(239, 68, 68, 0.05);
        }
        tr.passed:hover {
          background-color: rgba(16, 185, 129, 0.03);
        }
        .badge {
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge.passed {
          background-color: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        .badge.failed {
          background-color: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .badge.skipped {
          background-color: rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
        }
        .error-col {
          max-width: 400px;
          font-size: 0.85rem;
        }
        code {
          color: #f87171;
          background: rgba(15, 23, 42, 0.6);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          display: block;
          word-break: break-all;
        }
        .screenshot-preview {
          margin-top: 0.5rem;
        }
        .screenshot-preview a {
          color: #60a5fa;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .screenshot-preview a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>Quality Assurance Test Execution Report</h1>
            <div class="timestamp">Started: ${new Date(summary.startTime).toLocaleString()} | Finished: ${new Date(summary.endTime).toLocaleString()}</div>
          </div>
          <div>
            <span class="badge" style="background-color: #334155; font-size: 1rem; padding: 0.5rem 1rem;">Android App E2E</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-lbl">Total Tests</div>
            <div class="card-val total">${summary.total}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Passed</div>
            <div class="card-val passed">${summary.passed}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Failed</div>
            <div class="card-val failed">${summary.failed}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Success Rate</div>
            <div class="card-val success-rate">${summary.successRate}%</div>
          </div>
          <div class="card">
            <div class="card-lbl">Duration</div>
            <div class="card-val total">${(summary.duration / 1000).toFixed(1)}s</div>
          </div>
        </div>

        <h2>Test Case Details</h2>
        <table>
          <thead>
            <tr>
              <th>Test Case Title</th>
              <th>Status</th>
              <th>Execution Time</th>
              <th>Error Details / Screenshots</th>
            </tr>
          </thead>
          <tbody>
            ${testsHtml || '<tr><td colspan="4" style="text-align:center;">No tests were executed.</td></tr>'}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(path.join(process.cwd(), 'execution-report.html'), html, 'utf-8');
  console.log('HTML execution dashboard report generated.');
}

function generateJsonReport(summary: RunSummary) {
  fs.writeFileSync(path.join(process.cwd(), 'execution-results.json'), JSON.stringify(summary, null, 2), 'utf-8');
  console.log('JSON report summary generated.');
}

function generateMarkdownSummary(summary: RunSummary) {
  const testsMarkdown = summary.tests.map(test => {
    const icon = test.status === 'passed' ? '🟢 PASSED' : test.status === 'failed' ? '🔴 FAILED' : '⚪ SKIPPED';
    return `| ${test.name} | ${icon} | ${(test.duration / 1000).toFixed(2)}s | ${test.error ? `\`${test.error.slice(0, 80)}\`` : 'N/A'} |`;
  }).join('\n');

  const markdown = `
### 📊 Appium Android Test Execution Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Cases** | ${summary.total} |
| **Passed** | ${summary.passed} |
| **Failed** | ${summary.failed} |
| **Skipped** | ${summary.skipped} |
| **Success Rate (%)** | **${summary.successRate}%** |
| **Duration (s)** | ${(summary.duration / 1000).toFixed(2)}s |

#### 📝 Test Case Breakdown

| Test Case Title | Status | Duration | Details |
| :--- | :--- | :--- | :--- |
${testsMarkdown || '| No tests executed | - | - | - |'}
`;

  fs.writeFileSync(path.join(process.cwd(), 'summary.md'), markdown, 'utf-8');
  console.log('Markdown summary report generated.');
}

async function main() {
  console.log('Compiling Appium Test Automation Reports...');
  const summary = parseWdioJsonReports();
  await generateExcelReports(summary);
  generateHtmlReport(summary);
  generateJsonReport(summary);
  generateMarkdownSummary(summary);
  console.log('Reports Compilation completed successfully!');
}

main().catch(err => {
  console.error('Failed to compile reports:', err);
  process.exit(1);
});
