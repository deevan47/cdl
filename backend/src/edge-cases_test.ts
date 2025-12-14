
import { ProjectsService } from './modules/projects/projects/projects.service';
import { TasksService } from './modules/tasks/tasks.service';
import { ProjectPlatform } from './modules/projects/entities/project.entity';
import { StageName } from './modules/projects/entities/project-stage.entity';
import { UserRole } from './modules/users/entities/user.entity';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// --- Manual Mocks ---

class MockRepository {
    public data: any[] = [];
    public findOneResult: any = null;
    public managerResult: any = null;

    async find() { return []; }
    async findOne() { return this.findOneResult; }
    create(dto: any) { return dto; }
    async save(entity: any) { return { id: 'uuid-' + Math.random(), ...entity }; }
    async delete() { return { affected: 1 }; }

    // Mocking the 'manager' property for TasksService
    public manager = {
        findOne: async () => this.managerResult
    };
}

class MockNotificationsService {
    public createCalls: any[] = [];
    public sendEmailCalls: any[] = [];

    async create(...args: any[]) { this.createCalls.push(args); }
    async sendEmail(...args: any[]) { this.sendEmailCalls.push(args); }
}

async function runTests() {
    console.log('Starting Edge Case Tests (Standalone)...\n');

    // --- Setup Mocks ---
    const projectsRepo = new MockRepository();
    const stagesRepo = new MockRepository();
    const tasksRepo = new MockRepository();
    const usersRepo = new MockRepository();
    const notificationsService = new MockNotificationsService();

    // --- Instantiate Services ---
    const projectsService = new ProjectsService(
        projectsRepo as any,
        stagesRepo as any,
        tasksRepo as any,
        usersRepo as any
    );

    const tasksService = new TasksService(
        tasksRepo as any,
        usersRepo as any,
        notificationsService as any
    );

    // ==========================================
    // TEST CASE 1: Task Deadline exceeding Project Deadline
    // ==========================================
    console.log('Test Case 1: Task Deadline > Project Deadline');
    try {
        const projectDeadline = new Date('2025-12-31');
        const taskDeadline = new Date('2026-01-01'); // 1 day after

        // Mock the query to find the stage and its project
        tasksRepo.managerResult = {
            project: { deadline: projectDeadline }
        };

        await tasksService.create({
            name: 'Late Task',
            endDate: taskDeadline,
            stage: 'stage-uuid' as any
        });
        console.log('FAILED: Should have thrown BadRequestException');
    } catch (error) {
        if (error instanceof BadRequestException) {
            console.log('ASSED: Caught expected BadRequestException:', error.message);
        } else {
            console.log('FAILED: Caught unexpected error:', error);
        }
    }
    console.log('---------------------------------------------------');

    // ==========================================
    // TEST CASE 2: Non-Admin updating Project Deadline
    // ==========================================
    console.log('Test Case 2: Non-Admin trying to update Project Deadline');
    try {
        const project = { id: 'p1', deadline: new Date('2025-01-01') };
        projectsRepo.findOneResult = project;

        const nonAdminUser = { id: 'u1', role: UserRole.PROJECT_MANAGER }; // Not ADMIN

        await projectsService.update(
            'p1',
            { deadline: new Date('2025-02-01') } as any, // Changing deadline
            nonAdminUser
        );
        console.log('FAILED: Should have thrown ForbiddenException');
    } catch (error) {
        if (error instanceof ForbiddenException) {
            console.log('ASSED: Caught expected ForbiddenException:', error.message);
        } else {
            console.log('FAILED: Caught unexpected error:', error);
        }
    }
    console.log('---------------------------------------------------');

    // ==========================================
    // TEST CASE 3: Project Health Calculation (Weighted)
    // ==========================================
    console.log('Test Case 3: Project Health Calculation (FLAME Platform)');
    try {
        // Setup a FLAME project with 3 stages
        // Weights: Pre-Prod (30%), Prod (30%), Post-Prod (40%)
        const project = {
            id: 'p-flame',
            platform: ProjectPlatform.FLAME,
            stages: [
                {
                    name: StageName.PRE_PRODUCTION,
                    tasks: [{ isCompleted: true }, { isCompleted: true }], // 100%
                    progress: 100
                },
                {
                    name: StageName.PRODUCTION,
                    tasks: [{ isCompleted: true }, { isCompleted: false }], // 50%
                    progress: 50
                },
                {
                    name: StageName.POST_PRODUCTION,
                    tasks: [{ isCompleted: false }], // 0%
                    progress: 0
                }
            ]
        };
        projectsRepo.findOneResult = project;

        // Expected Calculation:
        // (100 * 0.3) + (50 * 0.3) + (0 * 0.4) = 30 + 15 + 0 = 45%

        const result = await projectsService.calculateProjectHealth('p-flame');

        if (result.progress === 45) {
            console.log(`ASSED: Calculated Progress is ${result.progress}% (Expected 45%)`);
        } else {
            console.log(`FAILED: Calculated Progress is ${result.progress}% (Expected 45%)`);
        }

    } catch (error) {
        console.log('FAILED: Unexpected error:', error);
    }
    console.log('---------------------------------------------------');

    // ==========================================
    // TEST CASE 4: Assigning User to Task (Notification Trigger)
    // ==========================================
    console.log('Test Case 4: Assigning User triggers Notification');
    try {
        const task = { id: 't1', name: 'Test Task', assignedTeamMembers: [] };
        const user = { id: 'u1', email: 'test@example.com' };

        tasksRepo.findOneResult = task;
        usersRepo.findOneResult = user;

        await tasksService.assignUserToTask('t1', 'u1', { name: 'Admin', role: 'ADMIN' });

        // Check if notification was called
        if (notificationsService.createCalls.length > 0) {
            console.log('ASSED: Notification service was called.');
        } else {
            console.log('FAILED: Notification service was NOT called.');
        }

    } catch (error) {
        console.log('FAILED: Unexpected error:', error);
    }
    console.log('---------------------------------------------------');

}

runTests();
