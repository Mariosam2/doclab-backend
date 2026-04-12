import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/lib/prisma';
import { AddDocumentSchema } from '@src/shared/schemas/AddDocumentSchema';
import { addDays, returnValidationErrorsReponse } from '@src/shared/helpers';
import { cleanupDocumentRelations } from '@src/shared/storage';
import { SaveInviteLinkSchema } from '@src/shared/schemas/SaveInviteLinkSchema';
import { UpsertPermissionSchema } from '@src/shared/schemas/UpsertPermissionSchema';

const MAX_DOCUMENTS = 5;

export const documents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;
    const userDocuments = await prisma.document.findMany({ where: { documentOwnerId: userId } });
    const editorDocuments = await prisma.document.findMany({
      where: { documentEditors: { some: { userId } }, documentOwnerId: { not: userId } },
    });
    return res.status(200).json({
      success: true,
      data: {
        userDocuments,
        editorDocuments,
      },
    });
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

    const count = await prisma.document.count({
      where: { documentOwnerId: userId },
    });

    if (count >= MAX_DOCUMENTS) {
      return res.status(400).json({ success: false, message: 'You have reached the maximum number of documents' });
    }

    const document = await prisma.document.create({
      data: { title, documentContent: content, documentOwnerId: userId },
    });

    await prisma.usersDocuments.create({
      data: { documentId: document.documentId, userId, permission: 'OWNER' },
    });

    return res
      .status(200)
      .json({ success: true, idOut: document.documentId, message: 'Document created successfully' });
  } catch (error) {
    next(error);
  }
};

export const saveInviteLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await SaveInviteLinkSchema.safeParseAsync(req.body);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { documentId, linkId, permission } = result.data;

    await prisma.shareLink.deleteMany({ where: { documentId, permission } });

    await prisma.shareLink.create({
      data: {
        linkId,
        documentId,
        permission,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return res.status(200).json({ success: true, idOut: linkId, message: 'Invite link saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;
    const permissions = await prisma.usersDocuments.findMany({ where: { userId }, omit: { userId: true } });
    return res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
};

export const upsertPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as Express.User;

    const result = await UpsertPermissionSchema.safeParseAsync(req.body);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { linkId } = result.data;
    const shareLink = await prisma.shareLink.findFirstOrThrow({ where: { linkId } });

    const { documentId, permission, expiresAt } = shareLink;
    const today = new Date();

    if (today.getTime() > expiresAt.getTime()) {
      await prisma.shareLink.delete({ where: { linkId } });
      return res.status(400).json({ success: false, message: 'Link expired' });
    }

    await prisma.usersDocuments.upsert({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      create: { documentId, userId, permission },
      update: { permission },
    });

    return res.status(200).json({ success: true, idOut: documentId, message: 'Permission upserted successfully!' });
  } catch (err) {
    next(err);
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

    await cleanupDocumentRelations(documentId);

    await prisma.document.delete({
      where: { documentId },
    });

    return res.status(200).json({ success: true, idOut: documentId, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
