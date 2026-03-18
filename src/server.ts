import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnvOrThrow } from '@src/shared/helpers';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './routers/authRouter';

const port = getEnvOrThrow('PORT');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);


app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
