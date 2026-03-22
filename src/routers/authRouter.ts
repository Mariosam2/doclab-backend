import { checkAuth, login, logout, refreshToken, register } from '@src/controllers/authController';
import { authMiddleware } from '@src/middlewares/authMiddleware';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/refresh-token', refreshToken);
authRouter.get('/check-auth', authMiddleware, checkAuth);
authRouter.post('/logout', authMiddleware, logout);

export default authRouter;
