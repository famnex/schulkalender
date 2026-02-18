const { SavedFilter, Tag } = require('./server/src/models');

async function run() {
    try {
        console.log('--- Fixing Saved Filters (Mapping Tag Names to IDs) ---');

        // 1. Fetch all tags for mapping
        const allTags = await Tag.findAll();
        const nameToId = {};
        allTags.forEach(t => {
            const name = t.name || t.title;
            if (name) {
                // Store both name and title just in case
                nameToId[name] = t.id;
            }
        });

        // 2. Fetch all filters
        const filters = await SavedFilter.findAll();
        let updateCount = 0;

        for (const f of filters) {
            if (!f.config || !f.config.filters) continue;

            let config = f.config;
            if (typeof config === 'string') {
                try {
                    config = JSON.parse(config);
                } catch (e) {
                    console.error(`Error parsing config for filter ${f.id}`, e);
                    continue;
                }
            }

            let changed = false;
            const newFilterGroups = config.filters.map(group => {
                if (!group.tags || group.tags.length === 0) return group;

                const newTags = group.tags.map(tagOrId => {
                    // Check if tagOrId is an existing ID (e.g., contains ':')
                    // Most IDs in this system seem to be 'PREFIX:VALUE'
                    if (tagOrId.includes(':')) return tagOrId;

                    // Try to map from name to ID
                    if (nameToId[tagOrId]) {
                        console.log(`Filter ${f.id}: Mapping "${tagOrId}" -> "${nameToId[tagOrId]}"`);
                        changed = true;
                        return nameToId[tagOrId];
                    }

                    return tagOrId; // Keep as is if no match
                });

                return { ...group, tags: newTags };
            });

            if (changed) {
                f.config = { ...config, filters: newFilterGroups };
                await f.save();
                updateCount++;
            }
        }

        console.log(`Successfully updated ${updateCount} filters.`);
    } catch (e) {
        console.error(e);
    }
}
run();
