import 'dotenv/config';
import { Response } from 'express';
import { z } from 'zod/v4';
import jwt from 'jsonwebtoken';
import { prisma } from '@src/lib/prisma';

export const getEnvOrThrow = (variableName: string): string => {
  const envVariable = process.env[variableName];
  if (!envVariable) {
    throw new Error(`${variableName} is not defined`);
  }
  return envVariable;
};

export const messageFromPrismaError = (errorCode: string, model: string) => {
  switch (errorCode) {
    case 'P2002': // unique constraint
      return `${model} already exists`;

    case 'P2025': // record not found
      return `${model} not found`;

    case 'P2003': // foreign key constraint
      return 'related record not found';

    case 'P2014': // relation violation
      return 'relation constraint violated';

    default:
      return 'unknown error';
  }
};

export const returnValidationErrorsReponse = (result: z.ZodSafeParseResult<any>, res: Response) => {
  return res.status(400).json({
    success: false,
    validationErrors: result.error?.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  });
};

export const signTokensAndCookie = (res: Response, user: { userId: string; tokenVersion: number }) => {
  const { userId, tokenVersion } = user;
  const accessToken = jwt.sign({ userId, tokenVersion }, getEnvOrThrow('JWT_SECRET'), {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId, tokenVersion }, getEnvOrThrow('JWT_SECRET'), {
    expiresIn: '5d',
  });

  res.cookie('RefreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return accessToken;
};

export const invalidateTokens = async (userId: string) => {
  await prisma.user.update({
    where: { userId },
    data: { tokenVersion: { increment: 1 } },
  });
};
