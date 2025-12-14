"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    try {
        console.log('Starting database seeding...');
        const userRepository = dataSource.getRepository('User');
        const users = [
            {
                name: 'Deevan Kumar',
                email: 'deevankumar.gaddala@flame.edu.in',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                isActive: true,
                avatar: 'https://ui-avatars.com/api/?name=Deevan+Kumar&background=0D8ABC&color=fff'
            },
        ];
        for (const userData of users) {
            const existingUser = await userRepository.findOne({ where: { email: userData.email } });
            if (!existingUser) {
                await userRepository.save(userData);
                console.log(` Created user: ${userData.name} (${userData.email})`);
            }
            else {
                await userRepository.update({ email: userData.email }, userData);
                console.log(` Updated user: ${userData.name} (${userData.email})`);
            }
        }
        const desiredEmails = users.map(u => u.email);
        try {
            const deleteResult = await dataSource.createQueryBuilder()
                .delete()
                .from('users')
                .where('email NOT IN (:...emails)', { emails: desiredEmails })
                .execute();
            if (deleteResult.affected && deleteResult.affected > 0) {
                console.log(`Removed ${deleteResult.affected} user(s) not in seed list`);
            }
            else {
                console.log('No extra users found to remove');
            }
        }
        catch (err) {
            console.warn(' Skipping deletion of extra users due to error:', err?.message || err);
        }
        console.log('Database seeding completed successfully!');
        console.log('\n Login Credentials:');
        console.log('Manish Dhawan (admin): manish.dhawan@cdl.com / admin123');
        console.log('sourabh (admin): sourabh@cdl.com / admin123');
        console.log('Varsha Kumar (research_associate): varsha.kumar@cdl.com / user1234');
        console.log('Praharshini Kumar (research_associate): praharshini.kumar@cdl.com / user1234');
        console.log('Siddhant Salve (animator): siddhant.salve@cdl.com / user1234');
        console.log('Dipraj More (editor): dipraj.more@cdl.com / user1234');
        console.log('Shweta Kumari (assistant_administrator): shweta.kumari@cdl.com / user1234');
    }
    catch (error) {
        console.error(' Error seeding database:', error);
        throw error;
    }
    finally {
        await app.close();
    }
}
seed();
//# sourceMappingURL=seed.js.map