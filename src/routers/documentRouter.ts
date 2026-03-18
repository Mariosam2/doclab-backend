import {
  addDocument,
  addEditor,
  deleteDocument,
  documents,
  removeEditor,
  singleDocument,
  updateContent,
  upsertEditorPermission,
} from '@src/controllers/documentController';
import { Router } from 'express';

const documentRouter = Router();

documentRouter.get('/', documents);
documentRouter.get('/:documentId', singleDocument);
documentRouter.post('/add-document', addDocument);
documentRouter.put('/update-content/:documentId', updateContent);
documentRouter.post('/add-editor', addEditor);
documentRouter.post('/update-editor-permission', upsertEditorPermission);
documentRouter.delete('/remove-editor/:documentId/:userId', removeEditor);
documentRouter.delete('/delete-document/:documentId', deleteDocument);

export default documentRouter;
