import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl, handleSummaryOutput } from './utils/helpers.js';
import { baselineThresholds } from './config/thresholds.js';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: baselineThresholds,
};

export default function () {
  const baseUrl = getBaseUrl();

  // 1. Safe read-heavy API endpoint: Get all events
  const res1 = http.get(`${baseUrl}/api/events`);
  check(res1, {
    'GET /api/events status is 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // 2. Safe read-heavy API endpoint: Get specific event details
  const res2 = http.get(`${baseUrl}/api/events/607d2c33-sample-id`);
  check(res2, {
    'GET /api/events/:id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return handleSummaryOutput(data);
}
