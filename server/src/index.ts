import express from 'express';
import cors from 'cors';
import router from './routes';
import authRouter from './auth';
import adminRouter from './admin';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple request logging for observability in dev/proto environments
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${
        res.statusCode
      } ${duration}ms`,
    );
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(authRouter);
app.use(adminRouter);
app.use(router);

// Central error handler to avoid unstructured crashes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error', err);

  if (res.headersSent) {
    return;
  }

  const status =
    typeof err?.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : 500;
  const message =
    (typeof err?.message === 'string' && err.message) ||
    '서버에서 오류가 발생했습니다.';

  res.status(status).json({ message });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${port}`);
});
