"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    constructor() {
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
        this.jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        let token;
        const authHeader = req.headers?.authorization || req.headers?.Authorization;
        if (authHeader) {
            const parts = (Array.isArray(authHeader) ? authHeader[0] : authHeader).split(' ');
            if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                token = parts[1];
            }
        }
        if (!token && req.headers && req.headers['x-access-token']) {
            token = Array.isArray(req.headers['x-access-token']) ? req.headers['x-access-token'][0] : req.headers['x-access-token'];
        }
        if (!token && req.query && req.query.access_token) {
            token = req.query.access_token;
        }
        if (!token && req.body) {
            token = req.body?.accessToken || req.body?.token;
        }
        if (!token) {
            this.logger.warn('No token provided in request (authorization header, x-access-token, query or body)');
            throw new common_1.UnauthorizedException('Missing Authorization token');
        }
        try {
            const payload = jwt.verify(token, this.jwtSecret);
            req.user = payload;
            return true;
        }
        catch (err) {
            this.logger.warn('JWT verification failed', err?.message || err);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=auth.guard.js.map