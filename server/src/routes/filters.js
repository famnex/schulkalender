const express = require('express');
const router = express.Router();
const { SavedFilter } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

// All routes here should require auth (logged in users)
router.use(authenticateToken);

// List User's Saved Filters
router.get('/', async (req, res) => {
    try {
        const filters = await SavedFilter.findAll({
            where: { userId: req.user.id }
        });
        res.json(filters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create New Saved Filter
router.post('/', async (req, res) => {
    try {
        const { name, config } = req.body;
        // config = { categoryIds: "1,2", tags: "A,B", stufe: "Q1" }
        // Generate random ID (10 chars, safe for URL)
        const id = crypto.randomBytes(5).toString('hex');
        const filter = await SavedFilter.create({
            id,
            userId: req.user.id,
            name: name || 'Unbenannt',
            config
        });
        res.json(filter);
    } catch (err) {
        console.error('Error creating filter:', err);
        res.status(400).json({ error: err.message });
    }
});

// Update Saved Filter
router.put('/:id', async (req, res) => {
    try {
        const filter = await SavedFilter.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!filter) return res.status(404).json({ error: 'Filter not found or access denied' });

        if (req.body.name) filter.name = req.body.name;
        if (req.body.config) filter.config = req.body.config;
        await filter.save();
        res.json(filter);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Saved Filter
router.delete('/:id', async (req, res) => {
    try {
        const filter = await SavedFilter.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (filter) {
            await filter.destroy();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Filter not found or access denied' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
