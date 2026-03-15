import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', apiRateLimiter, router);

  app.use(errorMiddleware);

  return app;
};

