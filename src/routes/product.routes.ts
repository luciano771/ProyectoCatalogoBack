import { Router } from 'express';
import multer from 'multer';
import { getTemplateHandler, bulkImportHandler } from '../controllers/bulkImport.controller';
import {
  listProductsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  uploadProductImageHandler
} from '../controllers/product.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(file.mimetype) || /\.(xlsx|xls)$/i.test(file.originalname || '');
    if (ok) {
      (cb as (err: null, acceptFile: boolean) => void)(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  }
}).single('file');

export const productRouter = Router();

productRouter.get('/bulk-template', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(getTemplateHandler));
productRouter.post('/bulk-import', requireAuth, requireRole('MERCHANT', 'ADMIN'), upload, asyncHandler(bulkImportHandler));

productRouter.get('/', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(listProductsHandler));
productRouter.post('/', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(createProductHandler));
productRouter.put('/:id', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(updateProductHandler));
productRouter.post(
  '/:id/image',
  requireAuth,
  requireRole('MERCHANT', 'ADMIN'),
  uploadImage,
  asyncHandler(uploadProductImageHandler)
);
productRouter.delete('/:id', requireAuth, requireRole('MERCHANT', 'ADMIN'), asyncHandler(deleteProductHandler));
