const { sequelize, User } = require('../src/models');
const bcrypt = require('bcrypt');

async function resetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find existing admin or create if missing
        let admin = await User.findOne({ where: { username: 'admin' } });

        if (!admin) {
            console.log('Admin user not found. Creating...');
            admin = await User.create({
                username: 'admin',
                password: 'password123', // hooks will hash
                email: 'admin@example.com',
                authMethod: 'local',
                isAdmin: true,
                isApproved: true
            });
            console.log('Admin created.');
        } else {
            console.log('Admin user found. Updating...');
            admin.username = 'admin';
            admin.password = 'password123'; // hooks will hash if changed
            admin.email = 'admin@example.com';
            admin.authMethod = 'local'; // IMPORTANT: Force local auth
            admin.isAdmin = true;
            admin.isApproved = true;
            await admin.save();
            console.log('Admin updated.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

resetAdmin();
