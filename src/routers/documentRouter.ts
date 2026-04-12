import {
  addDocument,
  deleteDocument,
  documents,
  getPermissions,
  removeEditor,
  saveInviteLink,
  singleDocument,
  upsertPermission,
} from '@src/controllers/documentController';
import { Router } from 'express';

const documentRouter = Router();

documentRouter.get('/', documents);
documentRouter.post('/invite-link/:documentId', saveInviteLink);
documentRouter.post('/add-document', addDocument);
documentRouter.get('/permissions', getPermissions);
documentRouter.post('/upsert-permission', upsertPermission);
documentRouter.get('/:documentId', singleDocument);
documentRouter.delete('/remove-editor/:documentId/:userId', removeEditor);
documentRouter.delete('/delete-document/:documentId', deleteDocument);

export default documentRouter;
