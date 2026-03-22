import router from 'express';
import documentRouter from './documentRouter';
import profileRouter from './profileRouter';

const apiRouter = router();
apiRouter.use('/documents', documentRouter);
apiRouter.use('/profile', profileRouter);

export default apiRouter;
