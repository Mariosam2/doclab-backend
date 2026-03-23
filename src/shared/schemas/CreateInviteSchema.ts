import { z } from 'zod';

export const CreateInviteSchema = z.object({
  permission: z.enum(['VIEW', 'EDIT'], 'Invalid permission'),
});
