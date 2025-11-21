import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './modules/projects/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { DebugController } from './modules/debug/debug.controller';

@Module({
  controllers: [AppController, DebugController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'cdl_management',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // For local development enable synchronize and detailed logging so missing tables/columns show up
      synchronize: true,
      logging: true,
    }),
    ProjectsModule,
    UsersModule,
    TasksModule,
    AuthModule,
  ],
})
export class AppModule { }
