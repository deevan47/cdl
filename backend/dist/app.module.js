"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_module_1 = require("./modules/users/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const projects_module_1 = require("./modules/projects/projects/projects.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const comments_module_1 = require("./modules/comments/comments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const user_entity_1 = require("./modules/users/entities/user.entity");
const project_entity_1 = require("./modules/projects/entities/project.entity");
const project_stage_entity_1 = require("./modules/projects/entities/project-stage.entity");
const task_entity_1 = require("./modules/tasks/entities/task.entity");
const comment_entity_1 = require("./modules/comments/entities/comment.entity");
const notification_entity_1 = require("./modules/notifications/entities/notification.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST') || 'localhost',
                    port: configService.get('DB_PORT') || 5432,
                    username: configService.get('DB_USERNAME') || 'postgres',
                    password: configService.get('DB_PASSWORD') || 'postgres',
                    database: configService.get('DB_NAME') || 'cdl_pms',
                    entities: [user_entity_1.User, project_entity_1.Project, project_stage_entity_1.ProjectStage, task_entity_1.Task, comment_entity_1.Comment, notification_entity_1.Notification],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            user_module_1.UsersModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            comments_module_1.CommentsModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map