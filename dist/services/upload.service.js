"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImagenesDir = getImagenesDir;
exports.getProductImageBasename = getProductImageBasename;
exports.getLogoBasename = getLogoBasename;
exports.getBannerBasename = getBannerBasename;
exports.ensureUserImagenesDir = ensureUserImagenesDir;
exports.toUploadUrl = toUploadUrl;
exports.isLocalUploadUrl = isLocalUploadUrl;
exports.urlToLocalPath = urlToLocalPath;
exports.deleteFileIfExists = deleteFileIfExists;
exports.deleteFilesByBasename = deleteFilesByBasename;
exports.deleteProductImage = deleteProductImage;
exports.deleteLogo = deleteLogo;
exports.deleteBanner = deleteBanner;
exports.deleteByUrlIfLocal = deleteByUrlIfLocal;
exports.isAllowedMime = isAllowedMime;
exports.getMaxSize = getMaxSize;
exports.saveImage = saveImage;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const env_1 = require("../config/env");
const UPLOADS_ROOT = path_1.default.resolve(process.cwd(), env_1.env.UPLOAD_DIR);
const IMAGENES_DIR = 'imagenes';
const LOGO_BASENAME = 'fotoperfil';
const BANNER_BASENAME = 'fotoportada';
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
function getExt(mimetype) {
    const map = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
    };
    return map[mimetype] || '.jpg';
}
function getImagenesDir(userId) {
    return path_1.default.join(UPLOADS_ROOT, userId, IMAGENES_DIR);
}
function getProductImageBasename(productId) {
    return productId;
}
function getLogoBasename() {
    return LOGO_BASENAME;
}
function getBannerBasename() {
    return BANNER_BASENAME;
}
async function ensureUserImagenesDir(userId) {
    const dir = getImagenesDir(userId);
    await promises_1.default.mkdir(dir, { recursive: true });
    return dir;
}
/** URL path (relative) for stored file: /uploads/{userId}/imagenes/{filename} */
function toUploadUrl(userId, filename) {
    return `/${env_1.env.UPLOAD_DIR}/${userId}/${IMAGENES_DIR}/${filename}`;
}
/** True if url is a local upload path we manage */
function isLocalUploadUrl(url) {
    if (!url || typeof url !== 'string')
        return false;
    const normalized = url.startsWith('/') ? url : url.replace(/^https?:\/\/[^/]+/, '');
    return normalized.startsWith(`/${env_1.env.UPLOAD_DIR}/`);
}
/** Local filesystem path from URL path (e.g. /uploads/xxx/imagenes/yyy.jpg -> absolute path) */
function urlToLocalPath(url) {
    const normalized = url.startsWith('/') ? url : url.replace(/^https?:\/\/[^/]+/, '');
    const relative = normalized.replace(/^\//, '').replace(new RegExp(`^${env_1.env.UPLOAD_DIR}/`), '');
    return path_1.default.join(UPLOADS_ROOT, relative);
}
/** Delete one file by path; ignore if missing */
async function deleteFileIfExists(filePath) {
    try {
        await promises_1.default.unlink(filePath);
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            throw err;
    }
}
/** Delete any file in user imagenes dir whose basename (without ext) matches the given name */
async function deleteFilesByBasename(userId, basename) {
    const dir = getImagenesDir(userId);
    try {
        const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
        for (const e of entries) {
            if (!e.isFile())
                continue;
            const name = path_1.default.basename(e.name, path_1.default.extname(e.name));
            if (name === basename) {
                await deleteFileIfExists(path_1.default.join(dir, e.name));
            }
        }
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            return;
        throw err;
    }
}
async function deleteProductImage(userId, productId) {
    await deleteFilesByBasename(userId, getProductImageBasename(productId));
}
async function deleteLogo(userId) {
    await deleteFilesByBasename(userId, LOGO_BASENAME);
}
async function deleteBanner(userId) {
    await deleteFilesByBasename(userId, BANNER_BASENAME);
}
/** Delete file pointed by local upload URL if it's one of ours */
async function deleteByUrlIfLocal(url) {
    if (!url || !isLocalUploadUrl(url))
        return;
    const filePath = urlToLocalPath(url);
    await deleteFileIfExists(filePath);
}
function isAllowedMime(mimetype) {
    return ALLOWED_MIMES.includes(mimetype);
}
function getMaxSize() {
    return MAX_SIZE;
}
/**
 * Save uploaded file to user's imagenes dir with given basename (no extension).
 * Replaces any existing file with that basename.
 * Returns the public URL path and filename.
 */
async function saveImage(userId, basename, buffer, mimetype) {
    const dir = await ensureUserImagenesDir(userId);
    await deleteFilesByBasename(userId, basename);
    const ext = getExt(mimetype);
    const filename = `${basename}${ext}`;
    const filePath = path_1.default.join(dir, filename);
    await promises_1.default.writeFile(filePath, buffer);
    const url = toUploadUrl(userId, filename);
    return { url, filename };
}
