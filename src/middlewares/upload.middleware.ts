import multer from 'multer';
import * as uploadService from '../services/upload.service';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (uploadService.isAllowedMime(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: uploadService.getMaxSize() },
  fileFilter
}).single('file');
