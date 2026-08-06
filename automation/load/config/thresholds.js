export const baselineThresholds = {
  http_req_failed: ['rate<0.01'],  // Error rate below 1%
  http_req_duration: [
    'p(95)<1000', // P95 below 1000ms
    'p(99)<2000'  // P99 below 2000ms
  ],
};
