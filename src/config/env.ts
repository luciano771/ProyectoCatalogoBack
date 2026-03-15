import 'dotenv/config';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Falta la variable de entorno: ${key}. Definila en .env (ver .env.example).`);
  }
  return value;
};

export const env = {
  NODE_ENV: getEnv('NODE_ENV'),
  PORT: Number(getEnv('PORT')),
  DATABASE_URL: getEnv('DATABASE_URL'),
  CORS_ORIGIN: getEnv('CORS_ORIGIN'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN')
};
