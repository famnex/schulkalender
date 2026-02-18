const { User } = require('../models');
const { sequelize } = require('../models');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Verbindung zur Datenbank hergestellt.');

        const [user, created] = await User.findOrCreate({
            where: { username: 'admin' },
            defaults: {
                password: 'password123',
                isAdmin: true,
                isApproved: true,
                authMethod: 'local'
            }
        });

        if (created) {
            console.log('Admin-Benutzer wurde erfolgreich angelegt (admin / password123).');
        } else {
            console.log('Benutzer "admin" existiert bereits.');
            // Update password just in case user wants to reset it
            user.password = 'password123';
            user.isAdmin = true;
            await user.save();
            console.log('Passwort für "admin" wurde auf "password123" zurückgesetzt.');
        }
    } catch (error) {
        console.error('Fehler beim Anlegen des Admins:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
