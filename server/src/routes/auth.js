const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, GlobalSettings } = require('../models');
const { authenticateLDAP } = require('../utils/ldap');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Helper to check settings
async function isRegistrationEnabled() {
    const setting = await GlobalSettings.findByPk('registration_enabled');
    return setting ? (setting.value === 'true') : false;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const enabled = await isRegistrationEnabled();
        if (!enabled) {
            return res.status(403).json({ error: 'Registrierung ist deaktiviert.' });
        }

        const { username, password, email } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Benutzername vergeben' });

        const user = await User.create({
            username,
            password,
            email,
            authMethod: 'local',
            isAdmin: false,
            isApproved: true // Or false if approval needed
        });

        res.json({ success: true, message: 'Registrierung erfolgreich' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ where: { username } });

        if (user && user.authMethod === 'local') {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
        } else {
            // LDAP Auth
            console.log(`Login: Attempting LDAP Auth for '${username}'...`);
            const ldapUser = await authenticateLDAP(username, password);

            if (ldapUser) {
                console.log(`Login: LDAP Auth Success for '${username}'`);

                if (!user) {
                    // Auto-provision new user
                    console.log(`Auto-Provisioning new LDAP user: ${username}`);
                    user = await User.create({
                        username: username,
                        email: ldapUser.mail || '',
                        authMethod: 'ldap',
                        isAdmin: false,
                        isApproved: true // Auto-approve LDAP users for now
                    });
                } else {
                    // Update existing user email if changed
                    if (ldapUser.mail && user.email !== ldapUser.mail) {
                        console.log(`Syncing email for ${username}: ${user.email} -> ${ldapUser.mail}`);
                        user.email = ldapUser.mail;
                        await user.save();
                    }

                    // If user was local, maybe switch to LDAP? 
                    // For now, if they log in via LDAP successfully, we accept it.
                    // But we keep authMethod as is or update it?
                    if (user.authMethod === 'local') {
                        // Optional: Migrate local user to LDAP if names match?
                        // activeDirectory auth succeeded, so we could update authMethod
                        // user.authMethod = 'ldap';
                        // await user.save();
                    }
                }
            } else {
                console.log(`Login Failed: LDAP Auth failed for '${username}'.`);
                return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
            }
        }

        if (!user.isApproved) {
            return res.status(403).json({ error: 'Account ist deaktiviert oder wartet auf Freigabe.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login fehlgeschlagen' });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'username', 'isAdmin', 'email'] });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
