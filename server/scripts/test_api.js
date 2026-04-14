const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
const token = jwt.sign({ id: 1, username: 'admin', isAdmin: true }, JWT_SECRET, { expiresIn: '8h' });

const eventData = JSON.stringify({
    title: "API-Test", categoryId: 2, start: "2026-04-14T09:00", end: "2026-04-14T10:00",
    isAllDay: false, location: "Test", description: "hello"
});

const reqEvent = http.request({
    hostname: 'localhost', port: 3001, path: '/api/events', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
}, res2 => {
    let eBody = '';
    res2.on('data', d => eBody += d);
    res2.on('end', () => {
        console.log("STATUS:", res2.statusCode);
        console.log("RESP:", eBody);
    });
});
reqEvent.write(eventData);
reqEvent.end();
