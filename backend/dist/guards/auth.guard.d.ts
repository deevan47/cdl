import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtAuthGuard implements CanActivate {
    private readonly logger;
    private jwtSecret;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
