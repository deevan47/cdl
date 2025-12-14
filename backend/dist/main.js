"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        logger.log('Starting CDL Project Management Backend...');
        logger.debug('Creating NestFactory application...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        logger.log('NestFactory application created successfully');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        logger.debug('Global validation pipes configured');
        app.enableCors({
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        logger.debug(`CORS enabled for origin: ${process.env.FRONTEND_URL || '*'}`);
        app.use((req, res, next) => {
            logger.debug(`[${req.method}] ${req.url} incoming - body=${JSON.stringify(req.body) || '{}'}`);
            next();
        });
        await app.listen(3000, '0.0.0.0');
        logger.log(`CDL Project Management Backend is running on: ${process.env.BACKEND_URL || 'http://localhost:3000'}`);
    }
    catch (err) {
    }
}
bootstrap();
//# sourceMappingURL=main.js.map