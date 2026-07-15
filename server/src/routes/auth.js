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

                const displayNameAttr = ldapUser.displayName || ldapUser.cn || '';

                if (!user) {
                    // Auto-provision new user
                    console.log(`Auto-Provisioning new LDAP user: ${username}`);
                    user = await User.create({
                        username: username,
                        email: ldapUser.mail || '',
                        displayName: displayNameAttr,
                        authMethod: 'ldap',
                        isAdmin: false,
                        isApproved: true // Auto-approve LDAP users for now
                    });
                } else {
                    // Update existing user email if changed
                    let changed = false;
                    if (ldapUser.mail && user.email !== ldapUser.mail) {
                        console.log(`Syncing email for ${username}: ${user.email} -> ${ldapUser.mail}`);
                        user.email = ldapUser.mail;
                        changed = true;
                    }
                    if (displayNameAttr && user.displayName !== displayNameAttr) {
                        console.log(`Syncing displayName for ${username}: ${user.displayName} -> ${displayNameAttr}`);
                        user.displayName = displayNameAttr;
                        changed = true;
                    }
                    if (changed) {
                        await user.save();
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

        res.json({ token, user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin } });

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
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'username', 'displayName', 'isAdmin', 'email'] });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const userJson = user.toJSON();
        userJson.isSSO = !!decoded.isSSO;
        res.json(userJson);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/sso-login
router.post('/sso-login', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'SSO-Token fehlt.' });
        }

        const ssoEnabledSetting = await GlobalSettings.findByPk('sso_enabled');
        const ssoEnabled = ssoEnabledSetting ? (ssoEnabledSetting.value === 'true') : false;
        if (!ssoEnabled) {
            return res.status(403).json({ error: 'SSO-Anmeldung ist deaktiviert.' });
        }

        const ssoSecretSetting = await GlobalSettings.findByPk('sso_jwt_secret');
        const ssoSecret = ssoSecretSetting ? ssoSecretSetting.value : null;
        if (!ssoSecret) {
            return res.status(500).json({ error: 'SSO ist nicht konfiguriert (Secret fehlt).' });
        }

        // Verify SSO token
        let decoded;
        try {
            decoded = jwt.verify(token, ssoSecret);
        } catch (err) {
            console.error('SSO JWT Verification failed:', err.message);
            return res.status(401).json({ error: 'Ungültiges SSO-Token.' });
        }

        const usernameClaimSetting = await GlobalSettings.findByPk('sso_username_claim');
        const usernameClaim = usernameClaimSetting ? usernameClaimSetting.value : 'username';
        const emailClaimSetting = await GlobalSettings.findByPk('sso_email_claim');
        const emailClaim = emailClaimSetting ? emailClaimSetting.value : 'email';
        const displayNameClaimSetting = await GlobalSettings.findByPk('sso_display_name_claim');
        const displayNameClaim = displayNameClaimSetting ? displayNameClaimSetting.value : 'display_name';

        const username = decoded[usernameClaim] || decoded['sub'];
        const email = decoded[emailClaim];
        const displayName = decoded[displayNameClaim] || decoded['displayName'];

        if (!username) {
            return res.status(400).json({ error: `Benutzername-Claim '${usernameClaim}' nicht im Token gefunden.` });
        }

        let user = await User.findOne({ where: { username } });

        const isAdmin = decoded.role === 'admin' || decoded.isAdmin === true || decoded.isAdmin === 'true';

        if (!user) {
            console.log(`Auto-Provisioning new SSO user: ${username}`);
            user = await User.create({
                username,
                email: email || '',
                displayName: displayName || '',
                authMethod: 'sso',
                isAdmin: isAdmin,
                isApproved: true
            });
        } else {
            let changed = false;
            // Update email if changed and provided
            if (email && user.email !== email) {
                console.log(`Syncing email for SSO user ${username}: ${user.email} -> ${email}`);
                user.email = email;
                changed = true;
            }
            // Update displayName if changed and provided
            if (displayName && user.displayName !== displayName) {
                console.log(`Syncing displayName for SSO user ${username}: ${user.displayName} -> ${displayName}`);
                user.displayName = displayName;
                changed = true;
            }
            // Update authMethod if not sso
            if (user.authMethod !== 'sso') {
                console.log(`Updating authMethod for user ${username}: ${user.authMethod} -> sso`);
                user.authMethod = 'sso';
                changed = true;
            }
            // Update admin status if changed
            if (user.isAdmin !== isAdmin) {
                console.log(`Syncing isAdmin for SSO user ${username}: ${user.isAdmin} -> ${isAdmin}`);
                user.isAdmin = isAdmin;
                changed = true;
            }
            if (changed) {
                await user.save();
            }
        }

        if (!user.isApproved) {
            return res.status(403).json({ error: 'Account ist deaktiviert oder wartet auf Freigabe.' });
        }

        const localToken = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin, isSSO: true },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token: localToken,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                isAdmin: user.isAdmin,
                isSSO: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'SSO Login fehlgeschlagen' });
    }
});

module.exports = router;
