import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateUniqueMerchantSlug } from '../utils/slug';
import { signToken } from '../utils/jwt';
import type { RegisterInput, LoginInput } from '../dtos/auth.dto';
import { AppError } from '../utils/errors';
import { UserRole } from '@prisma/client';

export const registerMerchant = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  });
  if (existing) {
    throw AppError.conflict('Ya existe un usuario con ese email');
  }

  const passwordHash = await hashPassword(input.password);
  const slug = await generateUniqueMerchantSlug(input.name);

  const result = await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        role: UserRole.MERCHANT
      }
    });

    const merchantProfile = await tx.merchantProfile.create({
      data: {
        userId: user.id,
        businessName: input.name,
        slug,
        active: true
      }
    });

    return { user, merchantProfile };
  });

  const token = signToken({ sub: result.user.id, role: result.user.role });

  return {
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    },
    merchantProfile: {
      id: result.merchantProfile.id,
      businessName: result.merchantProfile.businessName,
      slug: result.merchantProfile.slug,
      active: result.merchantProfile.active
    }
  };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      merchantProfile: true
    }
  });

  if (!user) {
    throw AppError.unauthorized('Credenciales inválidas');
  }

  const isValid = await comparePassword(input.password, user.password);
  if (!isValid) {
    throw AppError.unauthorized('Credenciales inválidas');
  }

  const token = signToken({ sub: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    merchantProfile: user.merchantProfile
      ? {
          id: user.merchantProfile.id,
          businessName: user.merchantProfile.businessName,
          slug: user.merchantProfile.slug,
          active: user.merchantProfile.active
        }
      : null
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { merchantProfile: true }
  });

  if (!user) {
    throw AppError.notFound('Usuario no encontrado');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    merchantProfile: user.merchantProfile
      ? {
          id: user.merchantProfile.id,
          businessName: user.merchantProfile.businessName,
          slug: user.merchantProfile.slug,
          active: user.merchantProfile.active
        }
      : null
  };
};

