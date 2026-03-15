import type { Request, Response } from 'express';
import * as bulkImportService from '../services/bulkImport.service';
import { AppError } from '../utils/errors';

export const getTemplateHandler = async (_req: Request, res: Response): Promise<void> => {
  const buffer = bulkImportService.generateTemplateBuffer();
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="plantilla-productos.xlsx"'
  );
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

export const bulkImportHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) throw AppError.unauthorized('No autenticado');
  const file = req.file;
  if (!file || !file.buffer) {
    throw AppError.validation('Debe adjuntar un archivo Excel');
  }
  const result = await bulkImportService.bulkImportProducts(req.auth.sub, {
    fileBuffer: file.buffer,
    fileName: file.originalname || 'import.xlsx',
    fileSize: file.size,
    storeFile: true
  });
  res.status(200).json(result);
};
