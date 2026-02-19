const express = require('express');
const router = express.Router();
const { User, Category, Tag, GlobalSettings, Event } = require('../models');
const { testLdapConnection } = require('../utils/ldap');
const { syncAllCalendars } = require('../services/icsSync');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// Middleware to check Admin
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user && user.isAdmin) {
            req.user = user;
            next();
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.use(isAdmin);

// --- Tags (Moved to top for debugging) ---
router.get('/tags', async (req, res) => {
    console.log('GET /admin/tags hit');
    try {
        const tags = await Tag.findAll();
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/tags', async (req, res) => {
    try {
        const tag = await Tag.create(req.body);
        res.json(tag);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/tags/:id', async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (tag) {
            await tag.update(req.body);
            res.json(tag);
        } else {
            res.status(404).json({ error: 'Tag not found' });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/tags/:id', async (req, res) => {
    const tag = await Tag.findByPk(req.params.id);
    if (tag) {
        await tag.destroy();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Tag not found' });
    }
});

// --- Users ---
router.get('/users', async (req, res) => {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
});

router.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            // Prevent self-demotion
            if (req.user.id === user.id && req.body.isAdmin === false) {
                return res.status(403).json({ error: 'Man kann sich nicht selbst die Admin-Rechte entziehen.' });
            }
            if (req.user.id === user.id && req.body.isApproved === false) {
                return res.status(403).json({ error: 'Man kann sich nicht selbst sperren.' });
            }

            await user.update(req.body);
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    // Prevent self-delete
    if (req.user.id == req.params.id) {
        return res.status(403).json({ error: 'Man kann sich nicht selbst löschen.' });
    }

    const user = await User.findByPk(req.params.id);
    if (user) {
        await user.destroy();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- Categories ---
router.get('/categories', async (req, res) => {
    const cats = await Category.findAll();
    res.json(cats);
});

router.post('/categories', async (req, res) => {
    try {
        const cat = await Category.create(req.body);
        res.json(cat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    const cat = await Category.findByPk(req.params.id);
    if (cat) {
        await cat.update(req.body);
        res.json(cat);
    } else {
        res.status(404).json({ error: 'Category not found' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    const cat = await Category.findByPk(req.params.id);
    if (cat) {
        await cat.destroy();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'not found' });
    }
});


// --- Settings ---
router.get('/settings', async (req, res) => {
    const settings = await GlobalSettings.findAll();
    const config = {};
    settings.forEach(s => config[s.key] = s.value);
    res.json(config);
});

router.post('/settings', async (req, res) => {
    // req.body is { key: value, key2: value2 }
    try {
        for (const [key, value] of Object.entries(req.body)) {
            await GlobalSettings.upsert({ key, value });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/settings/logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const logoUrl = `/kalender_new/uploads/${req.file.filename}`;
        await GlobalSettings.upsert({ key: 'school_logo', value: logoUrl });
        res.json({ success: true, url: logoUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Manual Sync ---
router.post('/sync', async (req, res) => {
    try {
        const logs = await syncAllCalendars();
        res.json({ success: true, logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sync failed', details: err.message });
    }
});

// --- LDAP Test ---
router.post('/ldap/test', async (req, res) => {
    try {
        await testLdapConnection(req.body.config, req.body.username, req.body.password);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Events Management ---
router.delete('/events/clear', async (req, res) => {
    try {
        await Event.destroy({ where: {}, truncate: false }); // Truncate might fail on some SQLite setups with FK, use where: {}
        res.json({ success: true, message: 'All events deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const categoryId = req.query.categoryId;
        const offset = (page - 1) * limit;

        const where = {};
        if (categoryId && categoryId !== 'all') {
            const catIdNum = parseInt(categoryId);
            if (!isNaN(catIdNum)) {
                where.categoryId = catIdNum;
                console.log('--- FILTER: Using categoryId =', catIdNum);
            }
        } else {
            console.log('--- FILTER: All categories');
        }

        const { count, rows } = await Event.findAndCountAll({
            where,
            limit,
            offset,
            order: [['start', 'DESC']],
            include: [{ model: Category, attributes: ['title'] }]
        });

        res.json({
            events: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// --- System Update ---
router.post('/update', async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '../../scripts/update.js');

        // Check if script exists
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: 'Update script not found' });
        }

        // Spawn detached process
        const child = require('child_process').spawn('node', [scriptPath], {
            detached: true,
            stdio: 'ignore', // The script writes to update.log itself
            cwd: path.join(__dirname, '../../') // Run from server root
        });
        child.unref();

        res.json({ success: true, message: 'Update started' });
    } catch (err) {
        console.error('Update trigger error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/update/check', async (req, res) => {
    try {
        const { execSync } = require('child_process');
        const cwd = path.join(__dirname, '../../');

        // Fetch latest info
        execSync('git fetch', { cwd });

        // Get local and remote hashes
        const localHash = execSync('git rev-parse HEAD', { cwd, encoding: 'utf8' }).trim();
        const remoteHash = execSync('git rev-parse origin/main', { cwd, encoding: 'utf8' }).trim();

        const isBehind = localHash !== remoteHash;

        // Get commit message
        let message = '';
        if (isBehind) {
            message = execSync('git log HEAD..origin/main --oneline', { cwd, encoding: 'utf8' }).trim();
        }

        res.json({
            updateAvailable: isBehind,
            localHash: localHash.substring(0, 7),
            remoteHash: remoteHash.substring(0, 7),
            message
        });
    } catch (err) {
        console.error('Git check error:', err);
        // If git fails (e.g. no repo), assume no update or manual handling needed
        res.json({ updateAvailable: false, error: err.message });
    }
});

router.get('/update/log', (req, res) => {
    try {
        const logPath = path.join(__dirname, '../../update.log');
        if (fs.existsSync(logPath)) {
            const content = fs.readFileSync(logPath, 'utf8');
            res.send(content);
        } else {
            res.send('');
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read log' });
    }
});

module.exports = router;
