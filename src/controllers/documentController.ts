import { NextFunction, Request, Response } from 'express';
import { prisma } from '@src/lib/prisma';
import { AddDocumentSchema } from '@src/shared/schemas/AddDocumentSchema';
import { addDays, exportToPdf, getEnvOrThrow, returnValidationErrorsReponse } from '@src/shared/helpers';
import { cleanupDocumentRelations } from '@src/shared/storage';
import { SaveInviteLinkSchema } from '@src/shared/schemas/SaveInviteLinkSchema';
import { UpsertPermissionSchema } from '@src/shared/schemas/UpsertPermissionSchema';
import { EditDocumentSchema } from '@src/shared/schemas/EditDocumentSchema';
import { createOpenAI } from '@ai-sdk/openai';
import { GenerateSummarySchema } from '@src/shared/schemas/GenerateSummarySchema';
import { generateText } from 'ai';
import { ExportPdfSchema } from '@src/shared/schemas/ExportPdfSchema';

const openai = createOpenAI({
  apiKey: getEnvOrThrow('OPENAI_API_KEY'),
});

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
    const { title } = result.data;

    const count = await prisma.document.count({
      where: { documentOwnerId: userId },
    });

    if (count >= MAX_DOCUMENTS) {
      return res.status(400).json({ success: false, message: 'You have reached the maximum number of documents' });
    }

    const document = await prisma.document.create({
      data: { title, documentOwnerId: userId },
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

export const editDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.params;

    const body = {
      ...req.body,
      documentId: params.documentId,
    };

    const result = await EditDocumentSchema.safeParseAsync(body);
    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }
    const { title, documentId } = result.data;
    await prisma.document.update({
      where: { documentId },
      data: { title },
    });

    return res.status(200).json({ success: true, idOut: documentId, message: 'Document updated successfully' });
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

export const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await GenerateSummarySchema.safeParseAsync(req.body);

    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { documentId } = result.data;

    const { documentPreview } = await prisma.document.findFirstOrThrow({
      where: { documentId },
      select: { documentPreview: true },
    });

    const plainText =
      documentPreview
        ?.replace(/<img[^>]+>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() ?? '';

    const summary = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Summarize the following document: ${plainText}`,
    });

    return res.status(200).json({ success: true, data: summary.text });
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ExportPdfSchema.safeParseAsync(req.body);

    if (!result.success) {
      return returnValidationErrorsReponse(result, res);
    }

    const { htmlContent } = result.data;
    const pdf = await exportToPdf(htmlContent);
    const filename = `document-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};
