import { Controller, Post, Body, UnauthorizedException, Logger, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    this.logger.log(`Login attempt for email=${body?.email}`);
    try {
      const result = await this.authService.login(body.email, body.password);
      this.logger.log(`Login success for email=${body?.email}`);
      return result;
    } catch (err) {
      this.logger.error(`Login failed for email=${body?.email}`, err?.stack || err?.message || err);
      // rethrow so Nest handles the response code, but include helpful message
      throw err instanceof UnauthorizedException ? err : new UnauthorizedException('Login failed. Check server logs for details.');
    }
  }

  // Force recompile
  @Post('firebase-login')
  @HttpCode(200)
  async firebaseLogin(@Body() body: { token: string }) {
    this.logger.log(`Firebase Login attempt`);
    try {
      const result = await this.authService.loginWithFirebase(body.token);
      this.logger.log(`Firebase Login success`);
      return result;
    } catch (err) {
      this.logger.error(`Firebase Login failed`, err);
      throw err;
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    this.logger.log(`Register attempt for email=${body?.email}`);
    try {
      const result = await this.authService.register(body);
      this.logger.log(`Register success for email=${body?.email}, id=${result?.id}`);
      return result;
    } catch (err) {
      this.logger.error(`Register failed for email=${body?.email}`, err?.stack || err?.message || err);
      throw err;
    }
  }
}