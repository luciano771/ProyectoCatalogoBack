import path from 'path';
import fs from 'fs/promises';

const UPLOADS_ROOT = path.resolve(process.cwd(), '..', 'frontend', 'public', 'uploads');
const IMAGENES_DIR = 'imagenes';
const UPLOAD_URL_PREFIX = 'uploads';
const LOGO_BASENAME = 'fotoperfil';
const BANNER_BASENAME = 'fotoportada';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function getExt(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
  };
  return map[mimetype] || '.jpg';
}

export function getImagenesDir(userId: string): string {
  return path.join(UPLOADS_ROOT, userId, IMAGENES_DIR);
}

export function getProductImageBasename(productId: string): string {
  return productId;
}

export function getLogoBasename(): string {
  return LOGO_BASENAME;
}

export function getBannerBasename(): string {
  return BANNER_BASENAME;
}

export async function ensureUserImagenesDir(userId: string): Promise<string> {
  const dir = getImagenesDir(userId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** URL path (relative) for stored file: /uploads/{userId}/imagenes/{filename} — servida por el frontend (public/uploads) */
export function toUploadUrl(userId: string, filename: string): string {
  return `/${UPLOAD_URL_PREFIX}/${userId}/${IMAGENES_DIR}/${filename}`;
}

/** True if url is a local upload path we manage */
export function isLocalUploadUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const normalized = url.startsWith('/') ? url : url.replace(/^https?:\/\/[^/]+/, '');
  return normalized.startsWith(`/${UPLOAD_URL_PREFIX}/`);
}

/** Local filesystem path from URL path (e.g. /uploads/xxx/imagenes/yyy.jpg -> absolute path) */
export function urlToLocalPath(url: string): string {
  const normalized = url.startsWith('/') ? url : url.replace(/^https?:\/\/[^/]+/, '');
  const relative = normalized.replace(/^\//, '').replace(new RegExp(`^${UPLOAD_URL_PREFIX}/`), '');
  return path.join(UPLOADS_ROOT, relative);
}

/** Delete one file by path; ignore if missing */
export async function deleteFileIfExists(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

/** Delete any file in user imagenes dir whose basename (without ext) matches the given name */
export async function deleteFilesByBasename(userId: string, basename: string): Promise<void> {
  const dir = getImagenesDir(userId);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      const name = path.basename(e.name, path.extname(e.name));
      if (name === basename) {
        await deleteFileIfExists(path.join(dir, e.name));
      }
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') return;
    throw err;
  }
}

export async function deleteProductImage(userId: string, productId: string): Promise<void> {
  await deleteFilesByBasename(userId, getProductImageBasename(productId));
}

export async function deleteLogo(userId: string): Promise<void> {
  await deleteFilesByBasename(userId, LOGO_BASENAME);
}

export async function deleteBanner(userId: string): Promise<void> {
  await deleteFilesByBasename(userId, BANNER_BASENAME);
}

/** Delete file pointed by local upload URL if it's one of ours */
export async function deleteByUrlIfLocal(url: string | null | undefined): Promise<void> {
  if (!url || !isLocalUploadUrl(url)) return;
  const filePath = urlToLocalPath(url);
  await deleteFileIfExists(filePath);
}

export function isAllowedMime(mimetype: string): boolean {
  return ALLOWED_MIMES.includes(mimetype);
}

export function getMaxSize(): number {
  return MAX_SIZE;
}

export interface SaveResult {
  url: string;
  filename: string;
}

/**
 * Save uploaded file to user's imagenes dir with given basename (no extension).
 * Replaces any existing file with that basename.
 * Returns the public URL path and filename.
 */
export async function saveImage(
  userId: string,
  basename: string,
  buffer: Buffer,
  mimetype: string
): Promise<SaveResult> {
  const dir = await ensureUserImagenesDir(userId);
  await deleteFilesByBasename(userId, basename);
  const ext = getExt(mimetype);
  const filename = `${basename}${ext}`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  const url = toUploadUrl(userId, filename);
  return { url, filename };
}
