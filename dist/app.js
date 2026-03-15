"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = require("./routes");
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'none'"],
                frameAncestors: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN,
        credentials: true
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)('dev'));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.use(`/${env_1.env.UPLOAD_DIR}`, express_1.default.static(path_1.default.join(process.cwd(), env_1.env.UPLOAD_DIR)));
    app.use('/api', rateLimit_middleware_1.apiRateLimiter, routes_1.router);
    app.use(error_middleware_1.errorMiddleware);
    return app;
};
exports.createApp = createApp;
