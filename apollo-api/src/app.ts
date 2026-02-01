import express from 'express';
import roomRoutes from './routes/rooms';
import playerRoutes from './routes/players';
import gameRoutes from './routes/game';
import { errorHandler } from './middleware/errorHandler';
import { API_BASE_PATH } from './constant/api';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors());

app.use(API_BASE_PATH, roomRoutes);
app.use(API_BASE_PATH, playerRoutes);
app.use(API_BASE_PATH, gameRoutes);

app.use(errorHandler);

export default app;