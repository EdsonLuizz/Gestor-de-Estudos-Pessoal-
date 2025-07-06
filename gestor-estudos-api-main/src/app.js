import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);

// Health-check
app.get('/', (_, res) => res.json({ status: 'OK' }));

// Inicializa BD
sequelize.sync();

export default app;
