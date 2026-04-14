import { uploadDocumentImage } from '@src/controllers/imageController';
import { handleUpload } from '@src/shared/storage';
import { Router } from 'express';

const imageRouter = Router();

imageRouter.post('/upload', handleUpload('image'), uploadDocumentImage);

export default imageRouter;
