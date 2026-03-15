import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  role: 'MERCHANT' | 'ADMIN';
}

const JWT_SECRET: Secret = env.JWT_SECRET;
// mantenerlo como string y castear al construir las opciones
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn']
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

