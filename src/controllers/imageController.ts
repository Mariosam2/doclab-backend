import { prisma } from '@src/lib/prisma';
import { getEnvOrThrow, returnValidationErrorsReponse } from '@src/shared/helpers';
import { UploadImageSchema } from '@src/shared/schemas/UploadImageSchema';
import { NextFunction, Request, Response } from 'express';
import { unlink } from 'fs/promises';
import path from 'path';

export const uploadDocumentImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { documentId, userId } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    const url = getEnvOrThrow('BASE_URL') + `/uploads/${file.filename}`;
    const image = {
      filename: file.filename,
      url,
      documentId,
      userId,
    };

    if (userId) {
      const profileImage = await prisma.image.findFirst({
        where: {
          userId,
        },
      });
      if (profileImage && profileImage.filename) {
        const filePath = path.resolve('uploads', profileImage.filename);
        await unlink(filePath).catch((error) => {
          console.error(error);
        });
        await prisma.image.delete({ where: { imageId: profileImage.imageId } });
      }
    }

    const result = await UploadImageSchema.safeParseAsync(image);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const newImage = await prisma.image.create({ data: image });

    return res
      .status(200)
      .json({ success: true, data: { url }, idOut: newImage.imageId, message: 'Image uploaded successfully' });
  } catch (error) {
    next(error);
  }
};
