const { sequelize, GlobalSettings, User } = require('../src/models');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function runTest() {
    try {
        console.log('Seeding SSO settings into database...');
        await sequelize.sync();

        await GlobalSettings.upsert({ key: 'sso_enabled', value: 'true' });
        await GlobalSettings.upsert({ key: 'sso_jwt_secret', value: 'my_sso_test_secret_123' });
        await GlobalSettings.upsert({ key: 'sso_username_claim', value: 'username' });
        await GlobalSettings.upsert({ key: 'sso_email_claim', value: 'email' });
        await GlobalSettings.upsert({ key: 'sso_logout_redirect', value: 'https://external-sso-logout.com' });
        await GlobalSettings.upsert({ key: 'sso_logout_button_text', value: 'Custom Logout Label' });

        console.log('Generating SSO JWT token...');
        const ssoPayload = {
            username: 'sso_test_user',
            email: 'sso_test_user@example.com',
            isAdmin: false
        };
        const ssoToken = jwt.sign(ssoPayload, 'my_sso_test_secret_123');
        console.log('SSO JWT Token:', ssoToken);

        console.log('\n--- Manual Verification Guide ---');
        console.log('1. Start the server using: npm run server');
        console.log('2. Navigate in your browser to:');
        console.log(`   http://localhost:5173/kalender_new/login?token=${ssoToken}`);
        console.log('3. Verify that you are automatically logged in as sso_test_user.');
        console.log('4. Look at the logout button: verify it displays "Custom Logout Label".');
        console.log('5. Click logout: verify you are redirected to https://external-sso-logout.com.');
        
    } catch (err) {
        console.error('Error during test setup:', err);
    } finally {
        process.exit(0);
    }
}

runTest();
