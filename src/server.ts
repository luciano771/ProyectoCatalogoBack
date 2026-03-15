import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const port = env.PORT;

app.listen(port, '0.0.0.0', () => {
  logger.info(`Backend listening on port ${port}`);
});

