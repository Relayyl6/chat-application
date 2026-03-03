import cron, { ScheduledTask } from 'node-cron';
import axios, { AxiosError } from 'axios';

let healthCheckJob: ScheduledTask | null = null;

export const startHealthCheckJob = () => {
  if (healthCheckJob) {
    console.log('Health check job already running, skipping...');
    return;
  }

  const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/api/health';

  healthCheckJob = cron.schedule('*/14 * * * *', async () => {
    try {
      const response = await axios.post(HEALTH_CHECK_URL, null, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Health-Check-Cron'
        }
      });

      if (response.status === 200) {
        console.log(`Health check passed [${new Date().toISOString()}]`);
      } else {
        console.warn(`Health check returned status ${response.status}`);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED') {
        console.error('❌ Health check failed: Server not available (ECONNREFUSED)');
      } else if (axiosError.code === 'ETIMEDOUT') {
        console.error('❌ Health check failed: Request timed out');
      } else if (axiosError.response) {
        console.error(`❌ Health check failed: HTTP ${axiosError.response.status}`);
      } else {
        console.error('❌ Health check failed:', axiosError.message);
      }
    }
  }, {
    timezone: "UTC"
  });

  console.log(`Health check job scheduled (pings ${HEALTH_CHECK_URL} every 14 minutes)`);
};