import router from 'express';
import documentRouter from './documentRouter';
import profileRouter from './profileRouter';
import imageRouter from './imageRouter';

const apiRouter = router();
apiRouter.use('/documents', documentRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/image', imageRouter);

export default apiRouter;
