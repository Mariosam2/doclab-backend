import 'dotenv/config';
import express from 'express';
import expressWebsockets from 'express-ws';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnvOrThrow } from '@src/shared/helpers';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './routers/authRouter';
import { authMiddleware } from './middlewares/authMiddleware';
import apiRouter from './routers/apiRouter';
import socketServer from './hocuspocus';

const port = getEnvOrThrow('PORT');
const app = express();
const { app: wsApp } = expressWebsockets(app);

app.use(cors({ origin: getEnvOrThrow('CLIENT_URL'), credentials: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cookieParser());

wsApp.ws('/collaborative-docs', (ws, req) => {
  socketServer.handleConnection(ws, req);
});

app.use('/auth', authRouter);

app.use(authMiddleware);
app.use('/api/v1', apiRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
