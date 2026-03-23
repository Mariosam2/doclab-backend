import { prisma } from '@src/lib/prisma';
import { NextFunction, Request, Response } from 'express';

export const singleProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;

    const profile = await prisma.user.findFirst({
      where: {
        userId,
      },
      omit: {
        tokenVersion: true,
        password: true,
        resetPasswordToken: true,
        googleId: true,
      },
    });

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
