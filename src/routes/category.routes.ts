import { Router } from 'express';
import {
  listCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from '../controllers/category.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export const categoryRouter = Router();

categoryRouter.get('/', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(listCategoriesHandler));
categoryRouter.post('/', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(createCategoryHandler));
categoryRouter.put('/:id', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(updateCategoryHandler));
categoryRouter.delete('/:id', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(deleteCategoryHandler));
