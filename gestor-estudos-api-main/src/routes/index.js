import { Router } from 'express';
import authRoutes from './auth.routes.js';
import generateCrudRoutes from './generateCrudRoutes.js';
import { User, Plan, Subject, Topic, Session, Goal, Reminder, Parameter } from '../models/index.js';

const api = Router();
api.use('/auth', authRoutes);

// CRUD endpoints protegidos
[
  generateCrudRoutes('/users', User, ['ADMIN']),
  generateCrudRoutes('/plans', Plan, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/subjects', Subject, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/topics', Topic, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/sessions', Session, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/goals', Goal, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/reminders', Reminder, ['STUDENT', 'ADMIN']),
  generateCrudRoutes('/parameters', Parameter, ['ADMIN'])
].forEach(({ path, router }) => api.use(path, router));

export default api;
