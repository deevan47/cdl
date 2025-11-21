import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Accept token from multiple common locations to be tolerant of client implementations:
    // 1) Authorization: Bearer <token>
    // 2) x-access-token header
    // 3) access_token query parameter
    // 4) body.accessToken or body.token (for non-GET requests)
    let token: string | undefined;

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
      throw new UnauthorizedException('Missing Authorization token');
    }
    try {
      const payload: any = jwt.verify(token, this.jwtSecret);
      // attach payload to request for downstream handlers (e.g., controllers/services)
      req.user = payload;
      return true;
    } catch (err) {
      this.logger.warn('JWT verification failed', err?.message || err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
