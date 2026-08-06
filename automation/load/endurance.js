import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl, handleSummaryOutput } from './utils/helpers.js';

export const options = {
  vus: 100,
  duration: '30m', // Sustained 30 minute test
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
