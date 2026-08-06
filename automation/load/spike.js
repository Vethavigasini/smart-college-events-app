import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl, handleSummaryOutput } from './utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Normal load 50 VUs
    { duration: '10s', target: 500 },  // Sudden spike to 500 VUs
    { duration: '1m', target: 500 },   // Maintain spike
    { duration: '10s', target: 50 },   // Drop back to 50 VUs
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const baseUrl = getBaseUrl();
  const res = http.get(`${baseUrl}/api/events`);
  check(res, {
    'GET /api/events status is 200': (r) => r.status === 200,
  });
  sleep(0.5);
}

export function handleSummary(data) {
  return handleSummaryOutput(data);
}
