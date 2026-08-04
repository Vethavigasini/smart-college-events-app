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

// Map the 10 automated smoke tests to specific Master IDs
const AUTOMATED_MAPPING: { [key: string]: string } = {
  'TC_SMOKE_001 - Launch app successfully': 'TC_AUTH_001',
  'TC_SMOKE_002 - Login with invalid credentials displays error': 'TC_AUTH_003',
  'TC_SMOKE_003 - Login with valid student credentials': 'TC_AUTH_002',
  'TC_SMOKE_004 - Search for an event': 'TC_SRCH_001',
  'TC_SMOKE_005 - View event details': 'TC_NAV_002',
  'TC_SMOKE_006 - Register for event': 'TC_CRUD_001',
  'TC_SMOKE_007 - Cancel event registration': 'TC_CRUD_002',
  'TC_SMOKE_008 - View profile details': 'TC_PROF_001',
  'TC_SMOKE_009 - Update profile phone details': 'TC_PROF_002',
  'TC_SMOKE_010 - Verify session persistence on restart': 'TC_SESS_001'
};

interface WdioTestResult {
  name: string;
  state: string;
  duration: number;
  error?: { message: string };
}

function parseWdioJsonResults(): WdioTestResult[] {
  const reportsDir = path.join(__dirname, '../reports');
  const results: WdioTestResult[] = [];

  try {
    if (!fs.existsSync(reportsDir)) return results;
    const files = fs.readdirSync(reportsDir).filter(f => f.startsWith('results-') && f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(reportsDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (content.suites) {
        for (const suite of content.suites) {
          if (suite.tests) {
            for (const test of suite.tests) {
              results.push({
                name: test.name,
                state: test.state || 'skipped',
                duration: test.duration || 0,
                error: test.error ? { message: test.error.message } : undefined
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing WDIO reports:', err);
  }
  return results;
}

async function main() {
  console.log('Merging test execution results with Test_Case_Master.xlsx...');
  
  const masterPath = path.join(process.cwd(), 'Test Results/Excel/Test_Case_Master.xlsx');
  if (!fs.existsSync(masterPath)) {
    console.error('Error: Test_Case_Master.xlsx not found at path:', masterPath);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(masterPath);
  const sheet = workbook.getWorksheet('Test Case Master');
  
  const rows: TestCaseRow[] = [];
  
  // Read existing master rows (skipping header)
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

  const wdioResults = parseWdioJsonResults();
  console.log(`Parsed ${wdioResults.length} WDIO automated execution results.`);

  // Map results back to rows
  let totalAutomated = 0;
  let totalExecuted = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let blockedCount = 0;
  let notApplicableCount = 0;

  for (const row of rows) {
    // 1. Check if the row matches an automated test case
    const automatedTestKey = Object.keys(AUTOMATED_MAPPING).find(key => AUTOMATED_MAPPING[key] === row.id);
    
    if (automatedTestKey) {
      const match = wdioResults.find(r => r.name === automatedTestKey);
      totalAutomated++;
      
      if (match) {
        totalExecuted++;
        row.status = match.state.toUpperCase(); // PASSED or FAILED
        row.execTime = `${(match.duration / 1000).toFixed(2)}s`;
        row.sourceFile = 'smoke.test.ts';
        row.runNumber = process.env.GITHUB_RUN_NUMBER || 'LOCAL';
        
        if (match.state === 'passed') {
          row.actualResult = 'Test passed successfully. All assertions completed.';
          passedCount++;
        } else {
          row.actualResult = 'Test failed during assertion / element search.';
          row.failureReason = match.error?.message || 'Unknown Failure';
          row.screenshotPath = `automation/appium/screenshots/${row.id}_failed.png`;
          row.logPath = 'appium-server.log';
          failedCount++;
        }
      }
    } else {
      // 2. Mark unavailable features appropriately
      if (row.module === 'Notifications') {
        row.status = 'NOT APPLICABLE';
        row.actualResult = 'Feature not implemented in v1.0 client UI.';
        row.failureReason = 'Notifications screen placeholder only';
        notApplicableCount++;
      } else if (row.module === 'File Upload') {
        row.status = 'BLOCKED';
        row.actualResult = 'No local file system upload endpoint available on mock backend.';
        row.failureReason = 'Blocked by missing backend service';
        blockedCount++;
      } else if (row.module === 'Offline Handling') {
        row.status = 'SKIPPED';
        row.actualResult = 'Offline mode control requires manual proxy toggling.';
        row.failureReason = 'Skipped in automated cloud flow';
        skippedCount++;
      }
    }
  }

  // Calculate stats
  const notRunCount = rows.filter(r => r.status === 'NOT RUN').length;
  const passPercentage = totalExecuted > 0 ? parseFloat(((passedCount / totalExecuted) * 100).toFixed(2)) : 0;

  console.log(`Summary Statistics:
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

  // Ensure output folders exist
  const excelDir = path.join(process.cwd(), 'Test Results/Excel');
  const htmlDir = path.join(process.cwd(), 'Test Results/HTML');
  const jsonDir = path.join(process.cwd(), 'Test Results/JSON');
  const summaryDir = path.join(process.cwd(), 'Test Results/Summary');

  [excelDir, htmlDir, jsonDir, summaryDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Write Excel outputs
  const writeExcelSheet = async (filename: string, filterFn: (r: TestCaseRow) => boolean, argbHeaderColor: string) => {
    const wb = new ExcelJS.Workbook();
    const s = wb.addWorksheet('Test Cases');
    
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
    
    // Status column cell styling helper
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

  // 1. Automation_Test_Report.xlsx (All rows)
  await writeExcelSheet('Automation_Test_Report.xlsx', () => true, '1F497D');

  // 2. Passed_Test_Cases.xlsx
  await writeExcelSheet('Passed_Test_Cases.xlsx', r => r.status === 'PASSED', '366092');

  // 3. Failed_Test_Cases.xlsx
  await writeExcelSheet('Failed_Test_Cases.xlsx', r => r.status === 'FAILED', 'C00000');

  // 4. Skipped_Blocked_Test_Cases.xlsx (skipped, blocked, not applicable)
  await writeExcelSheet('Skipped_Blocked_Test_Cases.xlsx', r => ['SKIPPED', 'BLOCKED', 'NOT APPLICABLE'].includes(r.status), '7F6000');

  // 5. Execution_Summary.xlsx
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
  await summaryWb.xlsx.writeFile(path.join(excelDir, 'Execution_Summary.xlsx'));

  // Generate HTML dashboard
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
      <title>Automation Master Execution Dashboard</title>
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
        <h1>Smart College Events - Automation Master Dashboard</h1>
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
        <h2>Detailed Test Execution Status</h2>
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
  fs.writeFileSync(path.join(htmlDir, 'execution-report.html'), html, 'utf-8');

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
  fs.writeFileSync(path.join(jsonDir, 'execution-results.json'), JSON.stringify(jsonReport, null, 2), 'utf-8');

  // Generate Markdown Summary
  const mdSummary = `
### 📊 Appium Master Quality Assurance Report

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
  fs.writeFileSync(path.join(summaryDir, 'summary.md'), mdSummary, 'utf-8');
  
  // Also write to project root folder for local workflow actions fallback
  fs.writeFileSync(path.join(process.cwd(), 'summary.md'), mdSummary, 'utf-8');

  console.log('Test compilation matching master sheet successfully completed!');
}

main().catch(err => {
  console.error('Failed to parse and generate final report summaries:', err);
  process.exit(1);
});
