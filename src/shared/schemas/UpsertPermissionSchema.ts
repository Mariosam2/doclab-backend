import { z } from 'zod/v4';

export const UpsertPermissionSchema = z.object({
  linkId: z.uuid('invalid UUID format'),
});
