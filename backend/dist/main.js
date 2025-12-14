"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        logger.log('Starting CDL Project Management Backend...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        logger.log('NestFactory application created successfully');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        app.enableCors({
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        const port = process.env.PORT || 3000;
        await app.listen(port, '0.0.0.0');
        logger.log(`CDL Project Management Backend is running on port ${port}`);
    }
    catch (err) {
        logger.error('Failed to start application', err);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map