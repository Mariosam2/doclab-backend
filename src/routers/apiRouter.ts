import router from 'express';
import documentRouter from './documentRouter';

const apiRouter = router();
apiRouter.use('/documents', documentRouter);

export default apiRouter;
