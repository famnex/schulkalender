# Analyse: Schulkalender (Legacy)

Das bestehende System ist ein Aggregator für Office 365 Kalender, der Termine einliest, filtert und in einer strukturierten Halbjahresübersicht darstellt.

## Datenquelle & Synchronisation
- **Quellen:** Mehrere Office 365 ICS-Links (in Tabelle `kalender`).
- **Sync:** Erfolgt über `aktualisieren.php` (getriggert durch Cron/Manual).
- **Logik:** 
  - Termine werden in der Tabelle `termine` gespeichert. 
  - Die Zuordnung zu Klassen/Gruppen erfolgt über **Steuerbefehle (Tags)** im Beschreibungsfeld des Outlook-Termins (z.B. `ABW:10B`).

## Datenbankstruktur (Legacy)
- `kalender`: Hauptkategorien (ID, Titel, ICS-Link, Kürzel).
- `Tags`: Liste der erlaubten Steuerbefehle (Tag, Name, Kategorie-Zuordnung).
- `termine`: Alle importierten Termine (UID, Titel, Start, Ende, Beschreibung, Ort, Kategorie, Ganztag).
- `link`: Gespeicherte Filter-Setups (ID, Link-String).

## Benutzeroberfläche
- **Hauptansicht (`show.php`):**
  - Halbjahres-Gitter (Spalten = Monate, Zeilen = Tage).
  - Farbige Markierungen für Wochenenden/Feiertage.
  - Tooltips für vollständige Termininformationen.
  - Druckoptimierte Ansicht (Landscape).
  - Separate Mobil-Ansicht (Listenformat).
- **Personalisierung (`form.php`):**
  - Auswahlmaske für Kategorien und spezifische Klassen-Tags.
  - Generiert eine eindeutige URL/ID für den Schnellzugriff.

## Anforderungen für den Neubau (Node/React/Tailwind)
1. **Backend:**
   - Automatisierter ICS-Import (Cron).
   - Robuster ICS-Parser (Zeitzonen-Handling!).
   - API für Termine, Kategorien und gespeicherte Filter.
2. **Frontend:**
   - Dynamisches CSS-Grid für die Halbjahresansicht (Tailwind).
   - Responsives Design (ein Code für Desktop & Mobile).
   - Moderner Filter-Konfigurator.
   - Druckfunktion (CSS-Print-Styles).
