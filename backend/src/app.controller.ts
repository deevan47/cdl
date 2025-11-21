import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      message: '✅ CDL Project Management API is running',
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
    };
  }
}
