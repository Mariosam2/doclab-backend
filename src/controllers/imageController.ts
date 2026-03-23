import { prisma } from '@src/lib/prisma';
import { getEnvOrThrow } from '@src/shared/helpers';
import { NextFunction, Request, Response } from 'express';

export const uploadDocumentImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { documentId } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    const url = getEnvOrThrow('BASE_URL') + `/uploads/${file.filename}`;
    const image = {
      filename: file.filename,
      url,
      documentId,
    };
    const newImage = await prisma.documentImage.create({ data: image });

    return res
      .status(200)
      .json({ success: true, data: { url }, idOut: newImage.imageId, message: 'Image uploaded successfully' });
  } catch (error) {
    next(error);
  }
};
