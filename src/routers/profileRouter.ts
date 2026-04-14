import { deleteProfile, editProfile, singleProfile } from '@src/controllers/profileController';
import { Router } from 'express';

const profileRouter = Router();

profileRouter.get('/', singleProfile);
profileRouter.put('/edit-profile', editProfile);
profileRouter.delete('/delete-profile', deleteProfile);

export default profileRouter;
