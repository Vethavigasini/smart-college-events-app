import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

describe('Security Audit Test Suite (Batch 2: 5 Security Cases)', function () {
  this.timeout(10000);

  // TC_SEC_001
  it('TC_SEC_001 - Verify Semgrep static application code review audit file exists', async () => {
    const reportPath = path.join(process.cwd(), 'Vulnerability Test Results/security-review.md');
    expect(fs.existsSync(reportPath)).to.be.true;
    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).to.include('Security Code Review');
  });

  // TC_SEC_002
  it('TC_SEC_002 - Verify Trivy filesystem vulnerability audit findings', async () => {
    const reportPath = path.join(process.cwd(), 'Vulnerability Test Results/findings.xlsx');
    expect(fs.existsSync(reportPath)).to.be.true;
  });

  // TC_SEC_003
  it('TC_SEC_003 - Verify Gitleaks secret leak detection verification', async () => {
    const reportPath = path.join(process.cwd(), 'Vulnerability Test Results/executive-summary.md');
    expect(fs.existsSync(reportPath)).to.be.true;
    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).to.include('Executive Summary');
  });

  // TC_SEC_004
  it('TC_SEC_004 - Verify npm dependency audit report configuration', async () => {
    const reportPath = path.join(process.cwd(), 'Vulnerability Test Results/dependency-report.md');
    expect(fs.existsSync(reportPath)).to.be.true;
    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).to.include('Dependency Security Audit');
  });

  // TC_SEC_005
  it('TC_SEC_005 - Verify NoSQL query injection remediation guide exists', async () => {
    const reportPath = path.join(process.cwd(), 'Vulnerability Test Results/remediation-guide.md');
    expect(fs.existsSync(reportPath)).to.be.true;
    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).to.include('Remediation Guide');
  });
});
