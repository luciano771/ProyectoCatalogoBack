"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBannerHandler = exports.uploadLogoHandler = exports.getPublicMerchantProfileBySlugHandler = exports.updateMyMerchantProfileHandler = exports.getMyMerchantProfileHandler = void 0;
const merchant_dto_1 = require("../dtos/merchant.dto");
const merchantService = __importStar(require("../services/merchant.service"));
const uploadService = __importStar(require("../services/upload.service"));
const errors_1 = require("../utils/errors");
const getMyMerchantProfileHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
    res.status(200).json({ profile });
};
exports.getMyMerchantProfileHandler = getMyMerchantProfileHandler;
const updateMyMerchantProfileHandler = async (req, res) => {
    if (!req.auth) {
        throw errors_1.AppError.unauthorized('No autenticado');
    }
    const parseResult = merchant_dto_1.updateMerchantProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
        throw errors_1.AppError.validation('Datos de perfil inválidos', parseResult.error.flatten());
    }
    const profile = await merchantService.updateOwnMerchantProfile(req.auth.sub, parseResult.data);
    res.status(200).json({ profile });
};
exports.updateMyMerchantProfileHandler = updateMyMerchantProfileHandler;
const getPublicMerchantProfileBySlugHandler = async (req, res) => {
    const { slug } = req.params;
    if (!slug) {
        throw errors_1.AppError.validation('Slug requerido');
    }
    const profile = await merchantService.getPublicMerchantProfileBySlug(slug);
    res.status(200).json({ profile });
};
exports.getPublicMerchantProfileBySlugHandler = getPublicMerchantProfileBySlugHandler;
const uploadLogoHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const file = req.file;
    if (!file)
        throw errors_1.AppError.validation('Se requiere el archivo de imagen');
    if (!uploadService.isAllowedMime(file.mimetype)) {
        throw errors_1.AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }
    if (file.size > uploadService.getMaxSize()) {
        throw errors_1.AppError.validation('La imagen no puede superar 5 MB');
    }
    const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
    if (profile.logoUrl && uploadService.isLocalUploadUrl(profile.logoUrl)) {
        await uploadService.deleteByUrlIfLocal(profile.logoUrl);
    }
    const { url } = await uploadService.saveImage(req.auth.sub, uploadService.getLogoBasename(), file.buffer, file.mimetype);
    const updated = await merchantService.updateOwnMerchantProfile(req.auth.sub, { logoUrl: url });
    res.status(200).json({ profile: updated, url });
};
exports.uploadLogoHandler = uploadLogoHandler;
const uploadBannerHandler = async (req, res) => {
    if (!req.auth)
        throw errors_1.AppError.unauthorized('No autenticado');
    const file = req.file;
    if (!file)
        throw errors_1.AppError.validation('Se requiere el archivo de imagen');
    if (!uploadService.isAllowedMime(file.mimetype)) {
        throw errors_1.AppError.validation('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }
    if (file.size > uploadService.getMaxSize()) {
        throw errors_1.AppError.validation('La imagen no puede superar 5 MB');
    }
    const profile = await merchantService.getOwnMerchantProfile(req.auth.sub);
    if (profile.bannerUrl && uploadService.isLocalUploadUrl(profile.bannerUrl)) {
        await uploadService.deleteByUrlIfLocal(profile.bannerUrl);
    }
    const { url } = await uploadService.saveImage(req.auth.sub, uploadService.getBannerBasename(), file.buffer, file.mimetype);
    const updated = await merchantService.updateOwnMerchantProfile(req.auth.sub, { bannerUrl: url });
    res.status(200).json({ profile: updated, url });
};
exports.uploadBannerHandler = uploadBannerHandler;
