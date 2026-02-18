# Datenbankdokumentation (Schulkalender)

Dieses Dokument beschreibt die Struktur der SQLite-Datenbank.

## Tabellen

### `Users`
Benutzerkonten für Administratoren und Lehrer.
- `id`: INTEGER, Primary Key, Auto-increment
- `username`: STRING, Unique, Not Null
- `email`: STRING
- `password`: STRING (Hashed)
- `authMethod`: ENUM('local', 'ldap'), Default: 'local'
- `isAdmin`: BOOLEAN, Default: false
- `isApproved`: BOOLEAN, Default: true

### `Categories`
Hauptkategorien für Kalender (z.B. Klassen, Fachbereiche).
- `id`: INTEGER, Primary Key, Auto-increment
- `title`: STRING, Not Null
- `icsUrl`: STRING, Not Null (Office 365 ICS Link)
- `color`: STRING (Hex-Code für die Anzeige)
- `shortName`: STRING (Kürzel)

### `Events`
Importierte Termine aus den ICS-Quellen.
- `id`: STRING, Primary Key (UID aus ICS)
- `title`: STRING, Not Null
- `start`: DATE, Not Null
- `end`: DATE, Not Null
- `description`: TEXT
- `location`: STRING
- `categoryId`: INTEGER (Fremdschlüssel zu `Categories.id`)
- `isAllDay`: BOOLEAN, Default: false
- `type`: STRING, Default: 'default' (z.B. 'holiday', 'vacation')

### `Tags`
Erlaubte Steuerbefehle in der Terminbeschreibung.
- `tag`: STRING, Primary Key
- `name`: STRING, Not Null
- `categoryId`: INTEGER (Optional, zur Zuordnung)

### `GlobalSettings`
Konfigurationseinstellungen für die gesamte Anwendung.
- `key`: STRING, Primary Key
- `value`: TEXT

**Bekannte Keys:**
- `primary_color`: Primärfarbe des Designs
- `vacation_color`/`vacation_text_color`: Farben für Ferien
- `holiday_color`/`holiday_text_color`: Farben für Feiertage
- `weekend_color`/`weekend_text_color`: Farben für Wochenenden
- `today_color`/`today_text_color`: Farben für den aktuellen Tag
- `registration_enabled`: Ob öffentliche Registrierung erlaubt ist ('true'/'false')
- `vacation_ics_url`: Globale Ferien ICS
- `holiday_ics_url`: Globale Feiertage ICS
- `school_name`: [NEU] Anzeigename der Schule
- `school_logo`: [NEU] Pfad zum hochgeladenen Schullogo (`/uploads/...`)

### `SavedFilters`
Gespeicherte Filter-Setups für Schnellzugriffs-URLs.
- `id`: STRING(10), Primary Key (Zufälliger Code)
- `userId`: INTEGER (Optional)
- `name`: STRING (Optional)
- `config`: JSON (Ausgewählte Kategorien und Tags)
