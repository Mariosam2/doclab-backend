import { z } from 'zod/v4';

export const SaveInviteLinkSchema = z.object({
  documentId: z.guid('invalid GUID format'),
  linkId: z.uuid('invalid UUID format'),
  permission: z.enum(['VIEW', 'EDIT'], 'Invalid permission'),
});
