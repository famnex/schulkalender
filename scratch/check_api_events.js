async function check() {
    try {
        console.log("Rufe öffentliche API-Endpunkte für Termine ab...");
        let url = 'http://localhost:3002/kalender_new/api/events?start=2026-04-01';
        let res = await fetch(url);
        if (!res.ok) {
            url = 'http://localhost:3000/api/events?start=2026-04-01';
            res = await fetch(url);
        }

        const events = await res.json();
        console.log(`API liefert ${events.length} Termine zurück.`);
        
        const manual = events.filter(e => e.isManual);
        console.log(`Davon sind ${manual.length} manually erstellt.`);
        
        manual.forEach(e => {
            console.log(`- API Rückgabe: "${e.title}" | ID: ${e.id} | isManual: ${e.isManual} | date: ${e.start}`);
        });

    } catch (err) {
        console.error("Fetch Fehler:", err.message);
    }
}

check();
