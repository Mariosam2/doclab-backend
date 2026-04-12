import { z } from 'zod/v4';

export const ExportPdfSchema = z.object({
  htmlContent: z.string().min(1, 'HTML content cannot be empty'),
});
