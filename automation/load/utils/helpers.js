export function getBaseUrl() {
  return __ENV.LOAD_BASE_URL || 'http://localhost:5005';
}

export function handleSummaryOutput(data) {
  return {
    'Test Results/JSON/k6-summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return `\n=== k6 Execution Complete ===\nTotal Requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0}\n`;
}
