import {
  addDocument,
  deleteDocument,
  documents,
  editDocument,
  exportPdf,
  generateSummary,
  getPermissions,
  removeEditor,
  saveInviteLink,
  singleDocument,
  upsertPermission,
} from '@src/controllers/documentController';
import { Router } from 'express';

const documentRouter = Router();

documentRouter.get('/', documents);
documentRouter.post('/invite-link', saveInviteLink);
documentRouter.post('/add-document', addDocument);
documentRouter.post('/generate-summary', generateSummary);
documentRouter.put('/edit-document/:documentId', editDocument);
documentRouter.get('/permissions', getPermissions);
documentRouter.post('/upsert-permission', upsertPermission);
documentRouter.get('/:documentId', singleDocument);
documentRouter.delete('/remove-editor/:documentId/:userId', removeEditor);
documentRouter.delete('/delete-document/:documentId', deleteDocument);
documentRouter.post('/export-pdf', exportPdf);

export default documentRouter;
