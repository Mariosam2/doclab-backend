import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/lib/prisma';

import { getEnvOrThrow } from './helpers';
import fs from 'fs';

const getUploadDir = () => getEnvOrThrow('UPLOADS_DIR');

if (!fs.existsSync(getUploadDir())) {
  fs.mkdirSync(getUploadDir(), { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP are allowed'));
    }
  },
});

export const handleUpload = (field: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

export const deletDocumentImageFiles = async (documentId: string) => {
  const images = await prisma.documentImage.findMany({
    where: { documentId },
    select: { filename: true },
  });
  await Promise.all(
    images.map((img) => {
      if (img.filename) {
        fs.promises.unlink(path.join('uploads', img.filename)).catch(() => {});
      }
    }),
  );
};

export const cleanupDocumentRelations = async (documentId: string) => {
  await prisma.shareLink.deleteMany({
    where: { documentId },
  });

  await prisma.usersDocuments.deleteMany({
    where: { documentId },
  });

  await deletDocumentImageFiles(documentId);

  await prisma.documentImage.deleteMany({
    where: { documentId },
  });
};
