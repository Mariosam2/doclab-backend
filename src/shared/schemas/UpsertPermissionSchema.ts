import { AddEditorSchema } from './AddEditorSchema';
import { z } from 'zod/v4';

export const UpsertEditorPermissionSchema = AddEditorSchema.extend({
  permission: z.enum(['VIEW', 'EDIT'], 'Invalid permission'),
});
