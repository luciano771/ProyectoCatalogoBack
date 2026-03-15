import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/errors';

export const registerMerchantHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos de registro inválidos', parseResult.error.flatten());
  }

  const data = await authService.registerMerchant(parseResult.data);
  res.status(201).json(data);
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw AppError.validation('Datos de login inválidos', parseResult.error.flatten());
  }

  const data = await authService.login(parseResult.data);
  res.status(200).json(data);
};

export const getMeHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) {
    throw AppError.unauthorized('No autenticado');
  }

  const user = await authService.getCurrentUser(req.auth.sub);
  res.status(200).json({ user });
};

