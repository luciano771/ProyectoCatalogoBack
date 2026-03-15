"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const app = (0, app_1.createApp)();
const port = env_1.env.PORT;
app.listen(port, '0.0.0.0', () => {
    logger_1.logger.info(`Backend listening on port ${port}`);
});
