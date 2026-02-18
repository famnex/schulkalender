const express = require('express');
const router = express.Router();
const { Event, Category, Tag, SavedFilter, Op } = require('../models');
const { parseISO, startOfMonth, endOfMonth, addMonths, format } = require('date-fns');

// GET /api/events
// Query params: start (YYYY-MM), end (YYYY-MM), categoryId, tags (comma separated), stufe
router.get('/', async (req, res) => {
    try {
        const { start, end, categoryId, tags, stufe } = req.query;

        // Date Range (default: 6 months from now)
        let startDate, endDate;
        if (start) {
            startDate = startOfMonth(parseISO(start));
        } else {
            startDate = startOfMonth(new Date());
        }

        if (end) {
            endDate = endOfMonth(parseISO(end));
        } else {
            endDate = endOfMonth(addMonths(startDate, 5));
        }

        // ... Date setup above ...

        let filterGroups = [];
        let useComplexLogic = false;

        // 1. Resolve Config (Token or Query)
        if (req.query.token) {
            try {
                const saved = await SavedFilter.findByPk(req.query.token);
                if (!saved) {
                    console.log(`Token ${req.query.token} not found`);
                    return res.status(404).json({ error: 'Kalender nicht gefunden' });
                }

                let config = saved.config;
                // Safe parse if config is string (SQLite quirk)
                if (typeof config === 'string') {
                    try { config = JSON.parse(config); } catch (e) { console.error('Config parse error', e); }
                }

                if (config) {
                    if (config.filters) {
                        console.log(`Token ${req.query.token}: Using complex filters.`);
                        filterGroups = typeof config.filters === 'string' ? JSON.parse(config.filters) : config.filters;
                        useComplexLogic = true;
                    } else {
                        console.log(`Token ${req.query.token}: Using legacy config.`);
                        // Legacy SavedFilter -> Override params and use legacy logic
                        if (config.categoryIds) categoryId = config.categoryIds;
                        if (config.tags) tags = config.tags;
                        if (config.stufe) stufe = config.stufe;
                    }
                }
            } catch (e) {
                console.error("Error loading token", e);
                return res.status(500).json({ error: 'Fehler beim Laden des Kalenders' });
            }
        } else if (req.query.filters) {
            try {
                filterGroups = JSON.parse(req.query.filters);
                useComplexLogic = true;
            } catch (e) {
                console.error(e);
                return res.status(400).json({ error: 'Ungültige Filterkonfiguration' });
            }
        }

        const baseWhere = {
            [Op.and]: [
                { start: { [Op.lte]: endDate } },
                { end: { [Op.gte]: startDate } }
            ]
        };

        const where = {};

        if (useComplexLogic && filterGroups.length > 0) {
            const groups = filterGroups.map(g => {
                const conditions = { categoryId: g.id };
                const extra = [];

                // Klausuren Stufe
                if (g.id == 5 && g.stufe) {
                    extra.push({
                        [Op.or]: [
                            { description: { [Op.like]: `%${g.stufe}%` } },
                            { description: { [Op.like]: 'KLA:Nac%' } }
                        ]
                    });
                }

                // Tags (Whitelist)
                if (g.tags && g.tags.length > 0) {
                    const tagConds = g.tags.map(t => ({ description: { [Op.like]: `%${t}%` } }));
                    extra.push({ [Op.or]: tagConds });
                }

                if (extra.length > 0) {
                    return { [Op.and]: [conditions, ...extra] };
                }
                return conditions;
            });

            where[Op.and] = [
                baseWhere,
                { [Op.or]: [...groups, { type: ['holiday', 'vacation'] }] }
            ];

        } else {
            // Legacy Logic
            const subFilters = [];

            if (categoryId && categoryId !== '0' && categoryId !== '-1') {
                subFilters.push({ categoryId: categoryId });

                if (categoryId === '5' && stufe && stufe !== '0') {
                    subFilters.push({
                        [Op.or]: [
                            { description: { [Op.like]: `%${stufe}%` } },
                            { description: { [Op.like]: 'KLA:Nac%' } }
                        ]
                    });
                }
            }

            if (tags && typeof tags === 'string') {
                const tagList = tags.split(',').filter(t => t.trim() !== '');
                if (tagList.length > 0) {
                    const tagConditions = tagList.map(t => ({ description: { [Op.like]: `%${t}%` } }));
                    subFilters.push({ [Op.or]: tagConditions });
                }
            }

            where[Op.and] = [baseWhere];

            if (subFilters.length > 0) {
                where[Op.and].push({
                    [Op.or]: [
                        { [Op.and]: subFilters },
                        { type: ['holiday', 'vacation'] }
                    ]
                });
            } else {
                // No filters -> Return all?
                // Usually yes.
            }
        }

        const events = await Event.findAll({
            where,
            order: [['start', 'ASC']],
            include: [{ model: Category, attributes: ['color', 'title'] }]
        });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

module.exports = router;
