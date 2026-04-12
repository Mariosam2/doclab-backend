import { z } from 'zod/v4';

export const GenerateSummarySchema = z.object({
  documentId: z.guid('invalid GUID format'),
});
