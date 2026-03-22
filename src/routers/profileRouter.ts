import { singleProfile } from '@src/controllers/profileController';
import { Router } from 'express';

const profileRouter = Router();

profileRouter.get('/', singleProfile);

export default profileRouter;
