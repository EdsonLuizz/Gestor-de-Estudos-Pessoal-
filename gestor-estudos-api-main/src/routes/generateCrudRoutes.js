import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { makeCrud } from '../controllers/generic.controller.js';

export default function generateCrudRoutes(path, Model, roles = []) {
  const router = Router();
  const ctrl = makeCrud(Model);
  router.post('/', auth(roles), ctrl.create);
  router.get('/', auth(roles), ctrl.findAll);
  router.get('/:id', auth(roles), ctrl.findById);
  router.put('/:id', auth(roles), ctrl.update);
  router.delete('/:id', auth(roles), ctrl.remove);
  return { path, router };
}
