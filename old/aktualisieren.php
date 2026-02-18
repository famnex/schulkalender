<?php
// ------------------------------------------------------------
// ical_import.php — Import mit Start/Ende im Format für show.php
// ------------------------------------------------------------

/*
Voraussetzungen DB:
- include("functions/datenbank.php") setzt $mysqli (mysqli)
- Tabelle `kalender`: Spalten mind. ID (int), Titel (varchar), Link (varchar)
- Tabelle `termine`:  ID (PRIMARY KEY, varchar), Titel (varchar), Start (varchar), Ende (varchar),
                      Beschreibung (text), Ort (varchar), Kategorie (int), Ganztag (tinyint/bool)
*/

declare(strict_types=1);
mb_internal_encoding('UTF-8');
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>Kalender-Aktualisierung</title>
  <link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">
  <style>
:root{
  --bg:#f5f7fb; --card:#ffffff; --muted:#5c6c84; --ok:#2ecc71; --warn:#d98f00; --err:#d94343; --ink:#1b2433;
  --border:#d0d7e3; --accent:#2563eb;
}
*{box-sizing:border-box}
body{
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  margin:0; background:var(--bg); color:var(--ink);
}
header{
  position:sticky; top:0; z-index:10;
  backdrop-filter:saturate(1.3) blur(6px);
  background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.85));
  border-bottom:1px solid var(--border);
  padding:14px 18px;
  display:flex; align-items:center; gap:12px;
}
header h1{margin:0; font-size:18px; font-weight:700; letter-spacing:.3px}
.container{
  width:auto; max-width:100%; margin:20px auto; padding:0 16px;
}
.card{
  background:var(--card); border:1px solid var(--border);
  border-radius:14px; padding:16px 18px; margin-bottom:16px;
  box-shadow:0 4px 12px rgba(0,0,0,.08);
  overflow-x:auto;   /* ← Cards scrollbar bei zu breiten Tabellen */
}
.log, .mono{
  font-family:ui-monospace,Consolas,monospace; font-size:12px; white-space:pre-wrap;
  background:#f0f4fb; border:1px dashed var(--border); padding:8px; border-radius:10px; color:#27344d;
}
.row{display:flex; flex-wrap:wrap; gap:12px; align-items:center}
.chip{
  display:inline-flex; align-items:center; gap:6px; border:1px solid var(--border);
  background:#eef3fb; padding:6px 10px; border-radius:999px;
  font-size:12px; color:var(--muted)
}
.ok{color:var(--ok)} .warn{color:var(--warn)} .err{color:var(--err)}
table{border-collapse:collapse; width:100%; margin-top:12px; min-width:600px}
td,th{
  border:1px solid var(--border); padding:8px; font-size:13px; vertical-align:top;
  color:var(--ink);
}
th{
  background:#eef3fb; color:#1b2433; text-align:left; position:sticky; top:54px;
}
tr:hover td{background:#f7faff}
.muted{color:var(--muted)}

  </style>
</head>
<body>
<header>
  <h1>Kalender-Aktualisierung</h1>
  <span class="chip">Zeitstempel: <?php echo date('Y-m-d H:i'); ?></span>
</header>
<div class="container">
<div class="card">
<?php
include("functions/datenbank.php");

/* ===== DEBUG BOOTSTRAP (sicher & kompatibel) ===== */
@ini_set('display_errors','1');
@ini_set('display_startup_errors','1');
@ini_set('log_errors','1');
@ini_set('error_log', __DIR__ . '/php_error.log');

set_error_handler(function($severity, $message, $file, $line) {
  if (!(error_reporting() & $severity)) return false;
  throw new ErrorException($message, 0, $severity, $file, $line);
});
register_shutdown_function(function() {
  $e = error_get_last();
  if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
    if (!headers_sent()) header('HTTP/1.1 500 Internal Server Error');
    echo "<div class='err'><b>Fataler Fehler:</b> ".htmlspecialchars($e['message'])." <span class='muted'>("
        .htmlspecialchars($e['file']).":".$e['line'].")</span></div>";
  }
});
set_exception_handler(function($ex){
  if (!headers_sent()) header('HTTP/1.1 500 Internal Server Error');
  echo "<div class='err'><b>PHP/DB-Fehler:</b> ".htmlspecialchars($ex->getMessage()).
       " <span class='muted'>(".htmlspecialchars($ex->getFile()).":".$ex->getLine().")</span></div>";
  echo "<pre class='log'>".htmlspecialchars($ex->getTraceAsString())."</pre>";
});
if (function_exists('mysqli_report')) { mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); }

/* ===== Hilfsfunktionen ===== */

/** Windows-TZ → IANA */
function mapWindowsTzToIana(?string $winTz): string {
  $map = [
    'W. Europe Standard Time'      => 'Europe/Berlin',
    'Central Europe Standard Time' => 'Europe/Berlin',
    'Romance Standard Time'        => 'Europe/Paris',
    'UTC'                          => 'UTC',
    'GMT Standard Time'            => 'Europe/London',
  ];
  $winTz = $winTz ? trim($winTz) : '';
  if ($winTz === '') return 'Europe/Berlin';
  if (isset($map[$winTz])) return $map[$winTz];
  return (stripos($winTz, '/') !== false) ? $winTz : 'Europe/Berlin';
}

/** Zeilenenden normalisieren + ICS-Unfolding */
function normalizeAndUnfold(string $ics): string {
  $ics = str_replace("\r\n", "\n", $ics);
  return preg_replace("/\n[ \t]/", '', $ics);
}

/** TZID aus Key ziehen (DTSTART;TZID=...) */
function extractTzidFromKey(string $key): ?string {
  $parts = explode(':', $key, 2);
  $front = $parts[0];
  if (stripos($front, 'TZID=') === false) return null;
  foreach (explode(';', $front) as $p) {
    $p = trim($p);
    if (stripos($p, 'TZID=') === 0) return trim(substr($p, 5));
  }
  return null;
}

/** ersten Key/Wert mit Prefix (DTSTART/DTEND) finden */
function pickIcs(array $arr, string $prefix): array {
  foreach ($arr as $k => $v) if (stripos($k, $prefix) === 0) return [$k, trim((string)$v)];
  return ['', ''];
}

/**
 * ICS-Zeitwert in DateTime + Flags umwandeln
 * Rückgabe: ['allDay'=>bool,'dt'=>?DateTime,'tz'=>string]
 */
function parseIcsDate(string $key, string $val, string $defaultTz = 'Europe/Berlin'): array {
  // Ganztag (YYYYMMDD)
  if (preg_match('/^\d{8}$/', $val)) {
    $dt = DateTime::createFromFormat('Ymd', $val, new DateTimeZone($defaultTz));
    return ['allDay'=>true, 'dt'=>$dt, 'tz'=>$defaultTz];
  }
  $tzid = extractTzidFromKey($key);
  $iana = mapWindowsTzToIana($tzid ?: $defaultTz);

  // UTC mit Z
  if (preg_match('/^\d{8}T\d{6}Z$/', $val)) {
    $dt = DateTime::createFromFormat('Ymd\THis\Z', $val, new DateTimeZone('UTC'));
    if ($dt) $dt->setTimezone(new DateTimeZone($iana));
    return ['allDay'=>false,'dt'=>$dt,'tz'=>$iana];
  }
  // Lokal ohne Z
  if (preg_match('/^\d{8}T\d{6}$/', $val)) {
    $dt = DateTime::createFromFormat('Ymd\THis', $val, new DateTimeZone($iana));
    return ['allDay'=>false,'dt'=>$dt,'tz'=>$iana];
  }
  // Fallback
  try {
    $dt = new DateTime($val, new DateTimeZone($iana));
    return ['allDay'=>false,'dt'=>$dt,'tz'=>$iana];
  } catch (Throwable $e) {
    return ['allDay'=>false,'dt'=>null,'tz'=>$iana];
  }
}

/** ICS laden */
function fetchIcs(string $url, int $timeout = 12): array {
  $ch = curl_init();
  curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_CONNECTTIMEOUT => $timeout,
    CURLOPT_TIMEOUT => $timeout,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ics-importer/1.1)',
  ]);
  $body = curl_exec($ch);
  $err  = curl_error($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($body === false || $code !== 200) return [null, "HTTP $code — ".($err ?: 'Unbekannter Fehler')];
  return [$body, null];
}

/** VEVENT-Blöcke parsen */
function parseIcsToEvents(string $icsRaw): array {
  $ics = normalizeAndUnfold($icsRaw);
  $chunks = explode("BEGIN:", $ics);
  $events = [];
  foreach ($chunks as $chunk) {
    $chunk = trim($chunk);
    if ($chunk === '') continue;
    if (stripos($chunk, "VEVENT\n") !== 0 && stripos($chunk, "VEVENT\r\n") !== 0) continue;
    $lines = preg_split("/\n/", $chunk);
    $evt = [];
    foreach ($lines as $line) {
      $line = rtrim($line, "\r");
      if ($line === 'END:VEVENT') break;
      $parts = explode(':', $line, 2);
      if (count($parts) === 2) { $evt[trim($parts[0])] = trim($parts[1]); }
    }
    if (!empty($evt)) $events[] = $evt;
  }
  return $events;
}

/** Sichere UID (Fallback) */
function safeUid(array $evt, string $start, string $end): string {
  if (!empty($evt['UID'])) return trim($evt['UID']);
  $sum = $evt['SUMMARY'] ?? '';
  $loc = $evt['LOCATION'] ?? '';
  return md5($sum.'|'.$start.'|'.$end.'|'.$loc);
}

/* ===== Import ===== */

echo "<div class='row'><span class='chip'>Import läuft …</span></div>";

$stmt = $mysqli->prepare("SELECT ID, Titel, Link FROM kalender");
$stmt->execute();
$res = $stmt->get_result();

while ($row = $res->fetch_object()) {
  $kalenderId    = (int)$row->ID;
  $kalenderTitel = (string)$row->Titel;
  $url           = (string)$row->Link;

  echo "<div class='card'>";
  echo "<div class='row'><strong>".htmlspecialchars($kalenderTitel)."</strong>";
  echo "<span class='chip'>Quelle</span><span class='mono'>".htmlspecialchars($url)."</span></div>";

  [$icsBody, $fetchErr] = fetchIcs($url);
  if ($fetchErr !== null) {
    echo "<div class='err'>Fehler beim Laden: ".htmlspecialchars($fetchErr)."</div></div>";
    continue;
  }

  $events = parseIcsToEvents($icsBody);
  if (empty($events)) {
    echo "<div class='warn'>Keine VEVENT-Einträge gefunden.</div></div>";
    continue;
  }

  echo "<div class='ok'><b>".count($events)."</b> Ereignis(se) gefunden.</div>";

  // INSERT/UPSERT vorbereiten (Start/Ende werden als Strings gespeichert)
  $sql = "INSERT INTO `termine`
          (`ID`, `Titel`, `Start`, `Ende`, `Beschreibung`, `Ort`, `Kategorie`, `Ganztag`)
          VALUES (?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            `Titel`=?, `Start`=?, `Ende`=?, `Beschreibung`=?, `Ort`=?, `Kategorie`=?, `Ganztag`=?";

  $ins = $mysqli->prepare($sql);

  echo "<table><thead><tr>
        <th>UID</th><th>Termin</th><th>Start</th><th>Ende</th>
        <th>Beschreibung</th><th>Ort</th><th>Ganztag</th></tr></thead><tbody>";

  foreach ($events as $evt) {
    // DTSTART / DTEND
    [$startKey, $startRaw] = pickIcs($evt, 'DTSTART');
    [$endKey,   $endRaw]   = pickIcs($evt, 'DTEND');

    $parsedStart = $startRaw !== '' ? parseIcsDate($startKey, $startRaw, 'Europe/Berlin') : ['allDay'=>false,'dt'=>null,'tz'=>'Europe/Berlin'];
    $parsedEnd   = $endRaw   !== '' ? parseIcsDate($endKey,   $endRaw,   'Europe/Berlin') : ['allDay'=>false,'dt'=>null,'tz'=>'Europe/Berlin'];

    $isAllDay = ($parsedStart['allDay'] ?? false) && ($parsedEnd['allDay'] ?? false);

    // *** HIER: Format so erzeugen, wie show.php es braucht ***
    if ($isAllDay) {
      /** @var DateTime $startDt */
      $startDt = $parsedStart['dt'];
      /** @var DateTime $endDt */
      $endDt   = $parsedEnd['dt'];
      // ICS-Ganztag: Ende exklusiv -> für Anzeige inclusive -1 Tag
      if ($endDt) $endDt->modify('-1 day');

      $startStr = $startDt ? $startDt->format('Ymd') : '';
      $endStr   = $endDt   ? $endDt->format('Ymd')   : '';
      $ganztag  = 1;
    } else {
      // Zeiten nur auf Minuten genau speichern (YmdTHi)
      $startDt  = $parsedStart['dt'];
      $endDt    = $parsedEnd['dt'];
      $startStr = ($startDt instanceof DateTime) ? $startDt->format('Ymd\THi') : '';
      $endStr   = ($endDt   instanceof DateTime) ? $endDt->format('Ymd\THi')   : '';
      $ganztag  = 0;
    }

    $summary = isset($evt['SUMMARY'])     ? trim($evt['SUMMARY']) : '';
    $desc    = isset($evt['DESCRIPTION']) ? trim(preg_replace('/\s\s+/', ' ', $evt['DESCRIPTION'])) : '';
    $loc     = isset($evt['LOCATION'])    ? trim($evt['LOCATION']) : '';
    $uid     = safeUid($evt, $startStr, $endStr);

    // DB schreiben (6x s + 2x i | Update 5x s + 2x i)
    $ins->bind_param(
      'ssssssii' . 'sssssii',
      $uid, $summary, $startStr, $endStr, $desc, $loc, $kalenderId, $ganztag,
      $summary, $startStr, $endStr, $desc, $loc, $kalenderId, $ganztag
    );
    $ins->execute();

    echo '<tr>'.
         '<td>'.htmlspecialchars($uid).'</td>'.
         '<td>'.htmlspecialchars($summary).'</td>'.
         '<td class="mono">'.htmlspecialchars($startStr).'</td>'.
         '<td class="mono">'.htmlspecialchars($endStr).'</td>'.
         '<td>'.nl2br(htmlspecialchars($desc)).'</td>'.
         '<td>'.htmlspecialchars($loc).'</td>'.
         '<td>'.($ganztag ? '1' : '0').'</td>'.
         '</tr>';
  }

  echo "</tbody></table>";
  $ins->close();
  echo "</div>";
}

$mysqli->close();
?>
</div>
</body>
</html>
