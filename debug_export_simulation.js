const { Event, Category, SavedFilter, Op } = require('./server/src/models');
const { parseISO, format } = require('date-fns');

async function run() {
    try {
        const token = '33cd50eca8';
        console.log(`[SIMULATION] Token: ${token}`);

        // 1. Resolve Config (Token)
        const saved = await SavedFilter.findByPk(token);
        if (!saved) {
            console.log('Token not found!');
            return;
        }

        let filterGroups = [];
        if (saved.config && saved.config.filters) {
            filterGroups = typeof saved.config.filters === 'string' ? JSON.parse(saved.config.filters) : saved.config.filters;
        } else {
            console.log('Token has legacy config or no filters.');
            return;
        }

        console.log('[SIMULATION] Filter Groups:', JSON.stringify(filterGroups, null, 2));

        // 2. Build Query (Logic Copied from export.js)
        const baseWhere = {
            // For testing, let's span a wide range to catch everything relevant
            start: { [Op.gte]: new Date('2025-01-01') },
            end: { [Op.lte]: new Date('2026-12-31') }
        };

        let where = {};

        if (filterGroups.length > 0) {
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

            where = {
                [Op.and]: [
                    baseWhere,
                    { [Op.or]: [...groups, { type: ['holiday', 'vacation'] }] }
                ]
            };
        } else {
            console.log('[SIMULATION] No Groups -> Legacy path');
            return;
        }

        // 3. Execute Query
        console.log('[SIMULATION] Executing Event.findAll(where)...');
        // console.log('Where Clause:', JSON.stringify(where, null, 2)); // Use util.inspect equivalent if complex

        const events = await Event.findAll({
            where,
            include: [{ model: Category, attributes: ['title'] }],
            order: [['start', 'ASC']]
        });

        console.log(`[SIMULATION] Found ${events.length} events.`);
        console.log('--------------------------------------------------');
        events.forEach(e => {
            const dateStr = format(new Date(e.start), 'yyyy-MM-dd');
            console.log(`[${dateStr}] [${e.Category?.title}] ${e.title}`);
            if (e.description) console.log(`   Desc: "${e.description.substring(0, 100)}"`); // Truncated
        });
        console.log('--------------------------------------------------');

    } catch (e) {
        console.error(e);
    }
}

run();
