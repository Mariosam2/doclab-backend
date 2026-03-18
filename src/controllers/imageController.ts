import { prisma } from '@src/lib/prisma';
import { getEnvOrThrow } from '@src/shared/helpers';
import { NextFunction, Request, Response } from 'express';

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { userId } = req.user as Express.User;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }

    const avatarUrl = getEnvOrThrow('BASE_URL') + `/uploads/${file.filename}`;
    const user = await prisma.user.update({
      where: { userId },
      data: { avatarUrl },
    });

    return res.status(200).json({ success: true, data: user, message: 'Avatar uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadDocumentImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { documentId } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }

    const image = {
      filename: file.filename,
      url: getEnvOrThrow('BASE_URL') + `/uploads/${file.filename}`,
      documentId,
    };
    const newImage = await prisma.documentImage.create({ data: image });

    return res.status(200).json({ success: true, idOut: newImage.imageId, message: 'Image uploaded successfully' });
  } catch (error) {
    next(error);
  }
};
