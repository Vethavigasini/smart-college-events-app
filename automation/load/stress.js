import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl, handleSummaryOutput } from './utils/helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 200 },  // Ramp to 200 VUs
    { duration: '1m', target: 500 },   // Ramp to 500 VUs
    { duration: '1m', target: 1000 },  // Ramp to 1000 VUs
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
};

export default function () {
  const baseUrl = getBaseUrl();
  const res = http.get(`${baseUrl}/api/events`);
  check(res, {
    'GET /api/events status is 200': (r) => r.status === 200,
  });
  sleep(1);
}

export function handleSummary(data) {
  return handleSummaryOutput(data);
}
