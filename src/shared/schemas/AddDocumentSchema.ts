import { z } from 'zod/v4';

export const AddDocumentSchema = z.object({
  title: z.string().min(4, "Title's too short").max(30, "Title's too long").optional(),
  content: z.any(),
});
