const fs = require('fs');
const path = require('path');
const { sequelize, Tag } = require('../src/models');

async function restoreTags() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const sqlPath = path.join(__dirname, '../../old/kalender.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('kalender.sql not found at:', sqlPath);
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Regex to find the INSERT INTO Tags block
        // Looking for: INSERT INTO `Tags` ... VALUES ...
        const insertBlockMatch = sqlContent.match(/INSERT INTO `Tags`.*VALUES\s*([\s\S]*?);/);

        if (!insertBlockMatch) {
            console.error('Could not find INSERT INTO `Tags` block in SQL file.');
            process.exit(1);
        }

        const valuesBlock = insertBlockMatch[1];

        // Regex to match individual value sets: ('Name', 'Tag', Kategorie)
        // Note: The SQL uses ' for strings.
        // Format: ('10B', 'ABW:10B', 2)
        const regex = /\('([^']*)', '([^']*)', (\d+)\)/g;

        let match;
        let count = 0;
        let total = 0;

        while ((match = regex.exec(valuesBlock)) !== null) {
            total++;
            const name = match[1];
            const id = match[2]; // Tag (ID)
            const categoryId = parseInt(match[3], 10);

            try {
                await Tag.upsert({
                    id: id,
                    name: name,
                    categoryId: categoryId
                });
                count++;
            } catch (err) {
                console.error(`Failed to insert tag ${id}:`, err.message);
            }
        }

        console.log(`Restoration complete. Processed ${total} tags. Successfully upserted ${count}.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

restoreTags();
