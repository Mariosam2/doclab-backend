import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/lib/prisma';
import { LoginSchema } from '@src/shared/schemas/LoginSchema';
import {
  getEnvOrThrow,
  invalidateTokens,
  returnValidationErrorsReponse,
  signTokensAndCookie,
} from '@src/shared/helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterSchema } from '@src/shared/schemas/RegisterSchema';
import { ITokenPayload } from '@src/shared/interfaces/ITokenPayload';

const SALT_NUM = 10;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await LoginSchema.safeParseAsync(req.body);

    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { email, password } = result.data;

    const authUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const validPassword = await bcrypt.compare(password, authUser.password ?? '');

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Wrong credentials',
      });
    }

    const accessToken = signTokensAndCookie(res, authUser);
    const user = {
      username: authUser.username,
      email: authUser.email,
    };

    return res.status(200).json({ success: true, accessToken, user });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RegisterSchema.safeParseAsync(req.body);

    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { username, email, password } = result.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_NUM);
    const newUser = await prisma.user.create({
      data: { ...result.data, password: hashedPassword },
    });

    const accessToken = signTokensAndCookie(res, newUser);
    const user = {
      username: newUser.username,
      email: newUser.email,
    };

    return res.status(200).json({ success: true, accessToken, user });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies['RefreshToken'];
    //console.log(refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(refreshToken, getEnvOrThrow('JWT_SECRET')) as ITokenPayload;

    const authUser = await prisma.user.findFirst({ where: { userId: decoded.userId } });
    //console.log(authUser?.tokenVersion, decoded.tokenVersion);
    if (!authUser || authUser.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const accessToken = signTokensAndCookie(res, authUser);

    return res.status(200).json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies['RefreshToken'];

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(refreshToken, getEnvOrThrow('JWT_SECRET')) as ITokenPayload;
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const authUser = await prisma.user.findFirst({ where: { userId: decoded.userId } });
    if (!authUser || authUser.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({ success: true, message: 'Authorized' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;
    await invalidateTokens(userId);
    res.clearCookie('jwt');
    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};
