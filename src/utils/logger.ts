export const logger = {
  info: (msg: string): void => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${msg}`);
  },
  error: (msg: string, err?: unknown): void => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${msg}`, err);
  }
};

