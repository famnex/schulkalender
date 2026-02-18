const express = require('express');
const router = express.Router();
const { GlobalSettings, Category, Tag } = require('../models');

// GET /api/public/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await GlobalSettings.findAll();
        const config = {};
        settings.forEach(s => {
            // Exclude sensitive LDAP info
            if (!s.key.startsWith('ldap_bind') && !s.key.includes('password')) {
                config[s.key] = s.value;
            }
        });
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
});

// GET /api/public/categories
router.get('/categories', async (req, res) => {
    const cats = await Category.findAll();
    res.json(cats);
});

// GET /api/public/tags
router.get('/tags', async (req, res) => {
    const tags = await Tag.findAll();
    res.json(tags);
});

module.exports = router;
