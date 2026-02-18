const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const exportRoutes = require('./routes/export');
const publicRoutes = require('./routes/public');
const { syncAllCalendars } = require('./services/icsSync');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/filters', require('./routes/filters'));
app.use('/api/public', publicRoutes);

// --- Static Frontend (Production) ---
const clientPath = path.join(__dirname, '../../client/dist');
app.use('/kalender_new', express.static(clientPath)); // Subfolder support
app.use(express.static(clientPath)); // Root fallback

// Sync Job (Every 5 minutes)
cron.schedule('*/5 * * * *', () => {
    console.log('Running scheduled sync...');
    syncAllCalendars();
});

// Catch-all for SPA Routing (MUST BE LAST)
app.use((req, res, next) => {
    // If it's an API request that wasn't matched, return 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Otherwise serve index.html for React routing
    res.sendFile(path.join(clientPath, 'index.html'), (err) => {
        if (err) {
            res.status(500).send('Frontend build missing. Please run "npm run build" in the client folder.');
        }
    });
});

// Database Sync & Server Start
sequelize.sync({ alter: false }).then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
