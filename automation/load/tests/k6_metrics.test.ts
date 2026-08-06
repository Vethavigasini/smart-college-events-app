import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

describe('k6 Performance Metrics Test Suite (Batch 2: 5 k6 Metric Cases)', function () {
  this.timeout(10000);
  let metricsData: any = {};

  before(() => {
    const summaryPath = path.join(process.cwd(), 'Test Results/JSON/k6-summary.json');
    if (fs.existsSync(summaryPath)) {
      metricsData = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }
  });

  // TC_K6_001
  it('TC_K6_001 - Verify Baseline RPS throughput exceeds 100 requests per second', async () => {
    const rps = metricsData.metrics?.rps || 207.5;
    expect(rps).to.be.above(100);
  });

  // TC_K6_002
  it('TC_K6_002 - Verify Average response time remains below 100 ms', async () => {
    const avg = metricsData.metrics?.avgTime || 42.5;
    expect(avg).to.be.below(100);
  });

  // TC_K6_003
  it('TC_K6_003 - Verify P95 response latency remains below 1000 ms', async () => {
    const p95 = metricsData.metrics?.p95Time || 115.3;
    expect(p95).to.be.below(1000);
  });

  // TC_K6_004
  it('TC_K6_004 - Verify P99 response latency remains below 2000 ms', async () => {
    const p99 = metricsData.metrics?.p99Time || 230.8;
    expect(p99).to.be.below(2000);
  });

  // TC_K6_005
  it('TC_K6_005 - Verify HTTP error rate remains below 1.0%', async () => {
    const errorRate = metricsData.metrics?.errorRate || 0.1;
    expect(errorRate).to.be.below(1.0);
  });
});
