import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './modules/projects/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AppController } from './app.controller';
import { DebugController } from './modules/debug/debug.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Added ConfigModule
    TypeOrmModule.forRootAsync({ // Changed to forRootAsync
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Auto-create tables (dev only)
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
  ],
  controllers: [AppController], // Removed DebugController
  providers: [], // AppService was not in original, so keeping it empty or adding it would be an unrelated edit. Keeping it empty.
})
export class AppModule { }
