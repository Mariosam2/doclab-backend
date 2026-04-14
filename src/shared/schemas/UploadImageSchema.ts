import { z } from 'zod/v4';

export const UploadImageSchema = z
  .object({
    url: z.url(),
    filename: z.string().optional(),
    userId: z.string().uuid().optional(),
    documentId: z.string().uuid().optional(),
  })
  .refine((data) => data.userId || data.documentId, { message: 'userId or documentId is required' })
  .refine((data) => !(data.userId && data.documentId), { message: 'Cannot set both userId and documentId' });
