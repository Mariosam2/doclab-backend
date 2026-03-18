import { z } from 'zod/v4';

export const AddEditorSchema = z.object({
  documentId: z.guid('invalid GUID format'),
  userId: z.guid('invalid GUID format'),
});
