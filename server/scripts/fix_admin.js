const { sequelize, User } = require('../src/models');

async function fixAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const admin = await User.findOne({ where: { username: 'admin' } });
        if (admin) {
            console.log('Found admin user.');
            admin.isAdmin = true;
            admin.isApproved = true;
            await admin.save();
            console.log('Admin rights forced to TRUE.');
        } else {
            console.log('Admin user not found!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixAdmin();
