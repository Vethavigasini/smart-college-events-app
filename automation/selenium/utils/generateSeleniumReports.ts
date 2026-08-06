import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

interface TestCaseRow {
  id: string;
  module: string;
  name: string;
  objective: string;
  priority: string;
  preconditions: string;
  steps: string;
  testData: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  execTime: string;
  failureReason: string;
  screenshotPath: string;
  logPath: string;
  sourceFile: string;
  runNumber: string;
}

const AUTOMATED_MAPPING: { [key: string]: string } = {
  'TC_WEB_001 - Launch application and verify homepage loads': 'TC_WEB_AUTH_001',
  'TC_WEB_002 - Login with invalid credentials displays error': 'TC_WEB_AUTH_002',
  'TC_WEB_003 - Login with valid student credentials': 'TC_WEB_AUTH_003',
  'TC_WEB_004 - Search for an event on Dashboard': 'TC_WEB_CRUD_001',
  'TC_WEB_005 - View event details modal': 'TC_WEB_NAV_001',
  'TC_WEB_006 - Register for event': 'TC_WEB_CRUD_002',
  'TC_WEB_007 - Cancel event registration': 'TC_WEB_CRUD_003',
  'TC_WEB_008 - View profile screen': 'TC_WEB_NAV_002',
  'TC_WEB_009 - Update profile phone number': 'TC_WEB_FORM_001',
  'TC_WEB_010 - Verify session persistence on page refresh': 'TC_WEB_SESS_001'
};

interface MochaTestResult {
  title: string;
  duration?: number;
  err?: { message?: string };
}

function parseMochaJsonResult(): MochaTestResult[] {
  const resultFile = path.join(__dirname, '../reports/results.json');
  const results: MochaTestResult[] = [];

  try {
    if (!fs.existsSync(resultFile)) {
      console.log('No results.json found. Generating empty placeholder list.');
      return results;
    }
    const raw = fs.readFileSync(resultFile, 'utf-8');
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return results;
    const content = JSON.parse(raw.substring(jsonStart));
    if (content.tests) {
      for (const t of content.tests) {
        results.push({
          title: t.title,
          duration: t.duration || 0,
          err: t.err && Object.keys(t.err).length > 0 ? { message: t.err.message } : undefined
        });
      }
    }
  } catch (err) {
    console.error('Error parsing Mocha JSON report:', err);
  }
  return results;
}

async function main() {
  console.log('Merging Selenium execution results with Selenium_Test_Case_Master.xlsx...');
  
  const masterPath = path.join(process.cwd(), 'Test Results/Excel/Selenium_Test_Case_Master.xlsx');
  if (!fs.existsSync(masterPath)) {
    console.error('Error: Selenium_Test_Case_Master.xlsx not found at path:', masterPath);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(masterPath);
  const sheet = workbook.getWorksheet('Selenium Test Case Master');
  
  const rows: TestCaseRow[] = [];
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push({
        id: row.getCell(1).value?.toString() || '',
        module: row.getCell(2).value?.toString() || '',
        name: row.getCell(3).value?.toString() || '',
        objective: row.getCell(4).value?.toString() || '',
        priority: row.getCell(5).value?.toString() || '',
        preconditions: row.getCell(6).value?.toString() || '',
        steps: row.getCell(7).value?.toString() || '',
        testData: row.getCell(8).value?.toString() || '',
        expectedResult: row.getCell(9).value?.toString() || '',
        actualResult: row.getCell(10).value?.toString() || 'N/A',
        status: row.getCell(11).value?.toString() || 'NOT RUN',
        execTime: row.getCell(12).value?.toString() || 'N/A',
        failureReason: row.getCell(13).value?.toString() || 'N/A',
        screenshotPath: row.getCell(14).value?.toString() || 'N/A',
        logPath: row.getCell(15).value?.toString() || 'N/A',
        sourceFile: row.getCell(16).value?.toString() || 'N/A',
        runNumber: row.getCell(17).value?.toString() || 'N/A'
      });
    }
  });

  const mochaResults = parseMochaJsonResult();
  console.log(`Parsed ${mochaResults.length} Selenium automated execution results.`);

  let totalAutomated = 0;
  let totalExecuted = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let blockedCount = 0;
  let notApplicableCount = 0;

  for (const row of rows) {
    const automatedTestKey = Object.keys(AUTOMATED_MAPPING).find(key => AUTOMATED_MAPPING[key] === row.id);
    
    if (automatedTestKey) {
      const match = mochaResults.find(r => r.title === automatedTestKey);
      totalAutomated++;
      
      if (match) {
        totalExecuted++;
        const state = match.err ? 'failed' : 'passed';
        row.status = state.toUpperCase(); // PASSED or FAILED
        row.execTime = `${((match.duration || 0) / 1000).toFixed(2)}s`;
        row.sourceFile = 'smoke.web.test.ts';
        row.runNumber = process.env.GITHUB_RUN_NUMBER || 'LOCAL';
        
        if (state === 'passed') {
          row.actualResult = 'Web elements located and assertions completed successfully.';
          passedCount++;
        } else {
          row.actualResult = 'Web element selection failure / validation assertion failed.';
          row.failureReason = match.err?.message || 'Unknown Failure';
          row.screenshotPath = `automation/selenium/screenshots/${row.id}_failed.png`;
          row.logPath = 'automation/selenium/logs/browser-console.log';
          failedCount++;
        }
      }
    } else {
      // Mark mock features
      if (row.module === 'File Upload') {
        row.status = 'BLOCKED';
        row.actualResult = 'No local file system upload endpoint available on mock backend.';
        row.failureReason = 'Blocked by missing backend service';
        blockedCount++;
      } else if (row.module === 'Accessibility') {
        row.status = 'NOT APPLICABLE';
        row.actualResult = 'Aria-label specifications verified in code blocks only.';
        row.failureReason = 'Skipped automated check';
        notApplicableCount++;
      } else if (row.module === 'Responsive Design') {
        row.status = 'SKIPPED';
        row.actualResult = 'Responsive dimensions checks handled in manual tests.';
        row.failureReason = 'Skipped in automated cloud pipeline';
        skippedCount++;
      }
    }
  }

  const notRunCount = rows.filter(r => r.status === 'NOT RUN').length;
  const passPercentage = totalExecuted > 0 ? parseFloat(((passedCount / totalExecuted) * 100).toFixed(2)) : 0;

  console.log(`Summary Statistics (Selenium):
  Total Defined: ${rows.length}
  Total Automated: ${totalAutomated}
  Total Executed: ${totalExecuted}
  Passed: ${passedCount}
  Failed: ${failedCount}
  Skipped: ${skippedCount}
  Blocked: ${blockedCount}
  Not Applicable: ${notApplicableCount}
  Not Run: ${notRunCount}
  Pass Percentage: ${passPercentage}%`);

  const excelDir = path.join(process.cwd(), 'Test Results/Excel');
  const htmlDir = path.join(process.cwd(), 'Test Results/HTML');
  const jsonDir = path.join(process.cwd(), 'Test Results/JSON');
  const summaryDir = path.join(process.cwd(), 'Test Results/Summary');

  // Write Excel outputs
  const writeExcelSheet = async (filename: string, filterFn: (r: TestCaseRow) => boolean, argbHeaderColor: string) => {
    const wb = new ExcelJS.Workbook();
    const s = wb.addWorksheet('Selenium Test Cases');
    
    s.columns = [
      { header: 'Test Case ID', key: 'id', width: 15 },
      { header: 'Module', key: 'module', width: 25 },
      { header: 'Test Name', key: 'name', width: 45 },
      { header: 'Objective', key: 'objective', width: 55 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Preconditions', key: 'preconditions', width: 35 },
      { header: 'Test Steps', key: 'steps', width: 50 },
      { header: 'Test Data', key: 'testData', width: 35 },
      { header: 'Expected Result', key: 'expectedResult', width: 55 },
      { header: 'Actual Result', key: 'actualResult', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Execution Time', key: 'execTime', width: 15 },
      { header: 'Failure Reason', key: 'failureReason', width: 35 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 30 },
      { header: 'Log Path', key: 'logPath', width: 30 },
      { header: 'Source Test File', key: 'sourceFile', width: 30 },
      { header: 'GitHub Run Number', key: 'runNumber', width: 20 }
    ];

    s.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    s.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argbHeaderColor } };

    rows.filter(filterFn).forEach(r => s.addRow(r));
    
    s.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const c = row.getCell('status');
        const val = c.value?.toString().toUpperCase();
        if (val === 'PASSED') {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
          c.font = { color: { argb: '375623' }, bold: true };
        } else if (val === 'FAILED') {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } };
          c.font = { color: { argb: 'C65911' }, bold: true };
        } else if (['SKIPPED', 'BLOCKED', 'NOT APPLICABLE'].includes(val || '')) {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
          c.font = { color: { argb: '7F6000' }, bold: true };
        }
      }
    });

    await wb.xlsx.writeFile(path.join(excelDir, filename));
  };

  // Outputs
  await writeExcelSheet('Selenium_Automation_Report.xlsx', () => true, '1F497D');
  await writeExcelSheet('Selenium_Passed_Tests.xlsx', r => r.status === 'PASSED', '366092');
  await writeExcelSheet('Selenium_Failed_Tests.xlsx', r => r.status === 'FAILED', 'C00000');

  // Selenium Summary Metrics
  const summaryWb = new ExcelJS.Workbook();
  const summarySheet = summaryWb.addWorksheet('Summary Metrics');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '595959' } };
  
  summarySheet.addRow({ metric: 'Total Defined', value: rows.length });
  summarySheet.addRow({ metric: 'Total Automated', value: totalAutomated });
  summarySheet.addRow({ metric: 'Total Executed', value: totalExecuted });
  summarySheet.addRow({ metric: 'Passed', value: passedCount });
  summarySheet.addRow({ metric: 'Failed', value: failedCount });
  summarySheet.addRow({ metric: 'Skipped', value: skippedCount });
  summarySheet.addRow({ metric: 'Blocked', value: blockedCount });
  summarySheet.addRow({ metric: 'Not Applicable', value: notApplicableCount });
  summarySheet.addRow({ metric: 'Pass Percentage (%)', value: `${passPercentage}%` });
  await summaryWb.xlsx.writeFile(path.join(excelDir, 'Selenium_Summary.xlsx'));

  // Generate HTML Dashboard
  const tableRows = rows.map(r => {
    const statusClass = r.status.toLowerCase().replace(/\s+/g, '-');
    return `
      <tr class="${statusClass}">
        <td><strong>${r.id}</strong></td>
        <td>${r.module}</td>
        <td>${r.name}</td>
        <td><span class="badge ${statusClass}">${r.status}</span></td>
        <td>${r.execTime}</td>
        <td>${r.failureReason !== 'N/A' ? `<code>${r.failureReason}</code>` : r.actualResult}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Selenium Web Automation Dashboard</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { background: linear-gradient(135deg, #38bdf8, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: center; }
        .card-val { font-size: 2.2rem; font-weight: 800; margin-top: 5px; }
        .card-lbl { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
        .badge { padding: 4px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
        .badge.passed { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .badge.failed { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .badge.skipped { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }
        .badge.blocked { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .badge.not-applicable { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        .badge.not-run { background: rgba(203, 213, 225, 0.1); color: #94a3b8; }
        table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; margin-top: 20px; }
        th, td { padding: 12px 15px; border-bottom: 1px solid #334155; text-align: left; font-size: 0.9rem; }
        th { background: #0f172a; color: #94a3b8; font-weight: 600; }
        code { color: #f87171; background: rgba(15, 23, 42, 0.5); padding: 2px 4px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Smart College Events - Selenium Web Automation Dashboard</h1>
        <div class="stats-grid">
          <div class="card"><div class="card-lbl">Total Defined</div><div class="card-val" style="color:#f8fafc">${rows.length}</div></div>
          <div class="card"><div class="card-lbl">Automated</div><div class="card-val" style="color:#60a5fa">${totalAutomated}</div></div>
          <div class="card"><div class="card-lbl">Executed</div><div class="card-val" style="color:#818cf8">${totalExecuted}</div></div>
          <div class="card"><div class="card-lbl">Passed</div><div class="card-val" style="color:#34d399">${passedCount}</div></div>
          <div class="card"><div class="card-lbl">Failed</div><div class="card-val" style="color:#f87171">${failedCount}</div></div>
          <div class="card"><div class="card-lbl">Skipped</div><div class="card-val" style="color:#cbd5e1">${skippedCount}</div></div>
          <div class="card"><div class="card-lbl">Blocked</div><div class="card-val" style="color:#fbbf24">${blockedCount}</div></div>
          <div class="card"><div class="card-lbl">N/A</div><div class="card-val" style="color:#818cf8">${notApplicableCount}</div></div>
          <div class="card"><div class="card-lbl">Pass Rate</div><div class="card-val" style="color:#34d399">${passPercentage}%</div></div>
        </div>
        <h2>Detailed Web Test Execution Status</h2>
        <table>
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Module</th>
              <th>Test Name</th>
              <th>Status</th>
              <th>Time</th>
              <th>Result Details / Failure Reason</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(path.join(htmlDir, 'selenium-execution-report.html'), html, 'utf-8');

  // Generate JSON report
  const jsonReport = {
    totalDefined: rows.length,
    totalAutomated,
    totalExecuted,
    passed: passedCount,
    failed: failedCount,
    skipped: skippedCount,
    blocked: blockedCount,
    notApplicable: notApplicableCount,
    passPercentage,
    runNumber: process.env.GITHUB_RUN_NUMBER || 'LOCAL',
    timestamp: new Date().toISOString(),
    results: rows.map(r => ({ id: r.id, module: r.module, name: r.name, status: r.status, execTime: r.execTime }))
  };
  fs.writeFileSync(path.join(jsonDir, 'selenium-results.json'), JSON.stringify(jsonReport, null, 2), 'utf-8');

  // Generate Markdown Summary
  const mdSummary = `
### 🌐 Selenium Web E2E Test Execution Summary

| Metric | Value |
| :--- | :--- |
| **Total Defined** | **${rows.length}** |
| **Total Automated** | **${totalAutomated}** |
| **Total Executed** | **${totalExecuted}** |
| **Passed** | ${passedCount} |
| **Failed** | ${failedCount} |
| **Skipped** | ${skippedCount} |
| **Blocked** | ${blockedCount} |
| **Not Applicable** | ${notApplicableCount} |
| **Overall Pass Percentage** | **${passPercentage}%** |

---
*Generated: ${new Date().toLocaleString()}*
`;
  // Write to report summary folder
  fs.writeFileSync(path.join(summaryDir, 'summary.md'), mdSummary, 'utf-8');

  console.log('Selenium reports compiling successfully finished!');
}

main().catch(err => {
  console.error('Failed to parse and generate Selenium reports:', err);
  process.exit(1);
});
