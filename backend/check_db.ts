
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ProjectsService } from './src/modules/projects/projects/projects.service';
import { UsersService } from './src/modules/users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const projectsService = app.get(ProjectsService);
    const usersService = app.get(UsersService);

    const user = await usersService.findByEmail('varsha.kumar@cdl.com');
    if (!user) {
        console.log('User varsha.kumar@cdl.com NOT FOUND');
        await app.close();
        return;
    }
    console.log(`User Found: ${user.name} (${user.id})`);

    const allProjects = await projectsService.findAll();
    console.log(`Total Projects in DB: ${allProjects.length}`);

    for (const p of allProjects) {
        console.log(`Project: ${p.name} | PM: ${p.projectManager?.email} | ID: ${p.id}`);

        // Check stages/tasks
        const fullProject = await projectsService.findOne(p.id);
        let assignedToUser = false;

        fullProject.stages.forEach(s => {
            if (s.assignedTeamMembers.some(m => m.id === user.id)) {
                console.log(`  - Assigned to Stage: ${s.name}`);
                assignedToUser = true;
            }
            s.tasks.forEach(t => {
                if (t.assignedTeamMembers.some(m => m.id === user.id)) {
                    console.log(`  - Assigned to Task: ${t.name}`);
                    assignedToUser = true;
                }
            });
        });

        if (p.projectManager?.id === user.id) {
            console.log(`  - IS PROJECT MANAGER`);
        } else if (assignedToUser) {
            console.log(`  - IS TEAM MEMBER`);
        } else {
            console.log(`  - NOT ASSIGNED`);
        }
    }

    await app.close();
}
bootstrap();
