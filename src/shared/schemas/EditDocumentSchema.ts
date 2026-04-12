import { z } from 'zod/v4';
import { AddDocumentSchema } from './AddDocumentSchema';

export const EditDocumentSchema = AddDocumentSchema.extend({
  documentId: z.guid('invalid GUID format'),
});
