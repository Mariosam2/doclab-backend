import { Database } from '@hocuspocus/extension-database';
import { Hocuspocus } from '@hocuspocus/server';
import { prisma } from '@src/lib/prisma';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';
import { getEnvOrThrow } from './shared/helpers';
import { ITokenPayload } from './shared/interfaces/ITokenPayload';

const socketServer = new Hocuspocus({
  async onAuthenticate({ documentName, token }) {
    const decoded = jwt.verify(token, getEnvOrThrow('JWT_SECRET')) as ITokenPayload;

    const doc = await prisma.document.findUnique({
      where: { documentId: documentName },
      include: { documentEditors: true },
    });

    const isOwner = doc?.documentOwnerId === decoded.userId;
    const isCollaborator = doc?.documentEditors.some((c) => c.userId === decoded.userId);

    if (!isOwner && !isCollaborator) {
      throw new Error('Not authorized');
    }

    
  },
  extensions: [
    new Database({
      fetch: async ({ documentName: documentId }) => {
        console.log('[3] fetch:', documentId);
        const doc = await prisma.document.findUnique({
          where: { documentId },
        });

        if (!doc?.documentContent || doc.documentContent.length === 0) return null;

        try {
          return new Uint8Array(doc.documentContent);
        } catch {
          return null;
        }
      },
      store: async ({ documentName: documentId, document }) => {
        const state = Buffer.from(Y.encodeStateAsUpdate(document));

        await prisma.document.update({
          where: { documentId },
          data: { documentContent: state },
        });
      },
    }),
  ],
  debounce: 2000,
});

export default socketServer;
