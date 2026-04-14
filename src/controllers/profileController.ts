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

export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;
    const result = await prisma.user.update({
      where: {
        userId,
      },
      data: req.body,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;

    await prisma.usersDocuments.deleteMany({ where: { userId } });
    const userDocumentIds = await prisma.document.findMany({
      where: { documentOwnerId: userId },
      select: { documentId: true },
    });
    const ids = userDocumentIds.map((doc) => doc.documentId);

    await prisma.document.deleteMany({ where: { documentOwnerId: userId } });
    await prisma.shareLink.deleteMany({ where: { documentId: { in: ids } } });
    await prisma.image.deleteMany({ where: { userId } });

    const result = await prisma.user.delete({
      where: {
        userId,
      },
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
