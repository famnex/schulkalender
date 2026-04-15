const nodemailer = require('nodemailer');
const { GlobalSettings, Event, Category } = require('../models');

// Load config from DB
const getConfig = async (manualConfig = null) => {
    let config = manualConfig;
    if (!config) {
        const settings = await GlobalSettings.findAll();
        config = {};
        settings.forEach(s => config[s.key] = s.value);
    }
    return config;
};

// Create Transporter
const createTransporter = (config) => {
    const port = parseInt(config.mail_port) || 587;
    // Nodemailer: 'secure' is true for 465 (SMTPS). For 587, 'secure' MUST be false, and 'requireTLS' handles STARTTLS.
    const isSecure = port === 465;
    const requireTLS = config.mail_tls === 'true';

    return nodemailer.createTransport({
        host: config.mail_host,
        port: port,
        secure: isSecure,
        requireTLS: requireTLS,
        auth: {
            user: config.mail_user,
            pass: config.mail_pass
        }
    });
};

// Send Test Email
const sendTestEmail = async (manualConfig) => {
    const config = await getConfig(manualConfig);
    if (!config.mail_host || !config.mail_user) {
        throw new Error('E-Mail Server Konfiguration unvollständig.');
    }

    const transporter = createTransporter(config);
    let recipients = [];
    try {
        recipients = config.mail_recipients ? JSON.parse(config.mail_recipients) : [];
    } catch(e) {}
    
    if (recipients.length === 0) {
        throw new Error('Keine Empfänger konfiguriert.');
    }

    let infos = [];
    for (const email of recipients) {
        const info = await transporter.sendMail({
            from: `"${config.mail_from_name || 'Kalender Admin'}" <${config.mail_from}>`,
            to: email, // Einzelsendungen sind zuverlässiger bei strengen SMTP Servern
            subject: 'Test-E-Mail: Schulkalender Konfiguration',
            text: 'Dies ist eine Test-E-Mail aus dem Schulkalender System. Wenn Sie diese lesen, funktioniert die SMTP Konfiguration.',
            html: '<p>Dies ist eine <b>Test-E-Mail</b> aus dem Schulkalender System.</p><p>Wenn Sie diese lesen, funktioniert die SMTP Konfiguration.</p>'
        });
        infos.push(info);
    }
    return infos;
};

// Send Reminder
const sendReminderEmail = async () => {
    const config = await getConfig();
    if (config.mail_enabled !== 'true') return null;

    const pendingEvents = await Event.findAll({
        where: { status: 'pending' },
        include: [{ model: Category, attributes: ['title'] }],
        order: [['start', 'ASC']]
    });

    if (pendingEvents.length === 0) return null; // Nothing to remind about

    let recipients = [];
    try {
        recipients = config.mail_recipients ? JSON.parse(config.mail_recipients) : [];
    } catch(e) {}
    if (recipients.length === 0) return null;

    const transporter = createTransporter(config);
    const baseUrl = config.mail_base_url || 'http://localhost:5173/kalender_new/';
    const finalUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    const eventListHtml = pendingEvents.map(e => `
        <li style="margin-bottom: 10px;">
            <strong>${e.title}</strong> (${new Date(e.start).toLocaleDateString('de-DE')})
            <br />
            Kategorie: ${e.Category ? e.Category.title : 'Keine'}
        </li>
    `).join('');

    let infos = [];
    for (const email of recipients) {
        const info = await transporter.sendMail({
            from: `"${config.mail_from_name || 'Kalender Admin'}" <${config.mail_from}>`,
            to: email,
            subject: `Erinnerung: ${pendingEvents.length} anstehende Terminfreigabe(n)`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Offene Terminfreigaben</h2>
                    <p>Es gibt aktuell <b>${pendingEvents.length}</b> Termin(e), die auf Freigabe warten.</p>
                    <ul>${eventListHtml}</ul>
                    <p>Bitte loggen Sie sich in den Kalender ein, um die Termine zu prüfen und freizugeben:</p>
                    <p><a href="${finalUrl}" style="display:inline-block; padding:10px 15px; background-color:#1d4ed8; color:#ffffff; text-decoration:none; border-radius:5px; margin-top:10px;">Kalender öffnen</a></p>
                    <br />
                    <p style="font-size:12px; color:#888;">Diese E-Mail wurde maschinell generiert.</p>
                </div>
            `
        });
        infos.push(info);
    }
    return { sent: true, count: pendingEvents.length, infos };
};

module.exports = {
    sendTestEmail,
    sendReminderEmail
};
