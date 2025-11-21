import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async listAllUsers() {
    // Only allow in non-production environments
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Debug endpoint not available in production');
    }
    return this.usersService.findAllRaw();
  }
}
