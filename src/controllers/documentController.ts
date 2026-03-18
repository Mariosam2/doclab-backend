import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/lib/prisma';
import { AddDocumentSchema } from '@src/shared/schemas/AddDocumentSchema';
import { returnValidationErrorsReponse } from '@src/shared/helpers';
import { AddEditorSchema } from '@src/shared/schemas/AddEditorSchema';
import { UpsertEditorPermissionSchema } from '@src/shared/schemas/UpsertPermissionSchema';

export const documents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await prisma.document.findMany();
    return res.status(200).json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
};

export const singleDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    if (typeof documentId !== 'string') {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }

    const document = await prisma.document.findFirst({ where: { documentId } });
    return res.status(200).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
};

export const addDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;

    const result = await AddDocumentSchema.safeParseAsync(req.body);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }
    const { title, content } = result.data;
    const document = await prisma.document.create({
      data: { title, documentContent: content, documentOwnerId: userId },
    });
    return res
      .status(200)
      .json({ success: true, idOut: document.documentId, message: 'document created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction) => {};

export const addEditor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AddEditorSchema.safeParseAsync(req.body);

    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { documentId, userId } = result.data;
    await prisma.usersDocuments.create({
      data: { documentId, userId, permission: 'EDIT' },
    });

    return res.status(200).json({ success: true, idOut: documentId, message: 'Editor added successfully' });
  } catch (err) {
    next(err);
  }
};

export const upsertEditorPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UpsertEditorPermissionSchema.safeParseAsync(req.body);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { documentId, userId, permission } = result.data;
    await prisma.usersDocuments.upsert({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      update: { permission },
      create: { userId, documentId, permission },
    });

    return res
      .status(200)
      .json({ success: true, idOut: documentId, message: 'Editor permission updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const removeEditor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, userId } = req.params;

    if (typeof documentId !== 'string' || typeof userId !== 'string') {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }

    await prisma.usersDocuments.delete({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });
    return res.status(200).json({ success: true, idOut: documentId, message: 'Editor removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    if (typeof documentId !== 'string') {
      return res.status(400).json({ success: false, message: 'Bad request' });
    }
    await prisma.document.delete({
      where: { documentId },
    });

    return res.status(200).json({ success: true, idOut: documentId, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
