import { Controller, Post, Body, UnauthorizedException, Logger, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (err) {
      this.logger.error(`Login failed for email=${body?.email}`, err?.stack || err?.message || err);
      throw err instanceof UnauthorizedException ? err : new UnauthorizedException('Login failed.');
    }
  }

  @Post('firebase-login')
  @HttpCode(200)
  async firebaseLogin(@Body() body: { token: string }) {
    try {
      return await this.authService.loginWithFirebase(body.token);
    } catch (err) {
      this.logger.error(`Firebase Login failed`, err);
      throw err;
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      return await this.authService.register(body);
    } catch (err) {
      this.logger.error(`Register failed for email=${body?.email}`, err?.stack || err?.message || err);
      throw err;
    }
  }
}