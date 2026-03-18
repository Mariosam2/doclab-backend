import { uploadAvatar, uploadDocumentImage } from '@src/controllers/imageController';
import { handleUpload } from '@src/shared/storage';
import { Router } from 'express';

const imageRouter = Router();

imageRouter.post('/upload/avatar', handleUpload('avatar'), uploadAvatar);
imageRouter.post('/upload/document-image', handleUpload('documentImage'), uploadDocumentImage);

export default imageRouter;
