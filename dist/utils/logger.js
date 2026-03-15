"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (msg) => {
        // eslint-disable-next-line no-console
        console.log(`[INFO] ${msg}`);
    },
    error: (msg, err) => {
        // eslint-disable-next-line no-console
        console.error(`[ERROR] ${msg}`, err);
    }
};
