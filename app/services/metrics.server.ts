import { register, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics collection
// We use a global variable to ensure we don't register metrics multiple times
// in development when the server reloads.
declare global {
  // eslint-disable-next-line
  var __metrics_registered: boolean | undefined;
}

if (!global.__metrics_registered) {
  collectDefaultMetrics({ prefix: 'hemodialysis_' });
  global.__metrics_registered = true;
}

export { register };
