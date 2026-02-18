<!doctype html>
<?php setlocale(LC_ALL, 'de_DE'); ?>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Halbjahreskalender</title>

  <!-- libs (belassen, wie bei dir) -->
  <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="/resources/demos/style.css">
  <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

  <style>
:root{
  --bg:#f6f7fb;
  --ink:#1f2937;
  --muted:#6b7280;
  --brand:#004291;
  --brand-weak:#e8f1ff;
  --accent:#2563eb;
  --ok:#22c55e;
  --warn:#f59e0b;
  --err:#ef4444;
  --card:#ffffff;
  --line:#e5e7eb;
  --weekend:#f9fafb;
  --past:#f3f4f6;
  --today:#fff7cc;
}
*{box-sizing:border-box}
html,body{
  background:var(--bg);
  color:var(--ink);
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,"Noto Sans",sans-serif;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* Seite auf großen Displays nicht „zu breit“, aber flexibel */
@media (min-width: 400px){
  body{width:min(1200px, 92%); margin-inline:auto;}
}

/* Topnav modernisiert */
.topnav{
  overflow:hidden;
  background:#fff;
  position:sticky; top:0; z-index:10;
  border-bottom:1px solid var(--line);
  box-shadow:0 6px 12px rgba(0,0,0,.04);
}
.topnav #myLinks{ display:none; }
.topnav a{
  color:var(--ink);
  padding:12px 14px;
  text-decoration:none;
  font-size:16px;
  display:block;
}
.topnav a.icon{ background:transparent; position:absolute; right:0; top:0; }
.topnav a:hover{ background:var(--brand-weak); color:var(--brand); }
.active{ background:var(--brand); color:#fff; }

/* Karten-/Tabellencontainer */
.pc .table-wrap{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:12px;
  padding:8px;
  overflow:auto; /* falls breite Tabellen */
  box-shadow:0 10px 20px rgba(0,0,0,.06);
}

/* Tabelle */
table{ border-collapse:separate; border-spacing:0; width:100%; }
table, th{ border:0; }
th{
  background:linear-gradient(#ffffff, #f7fbff);
  color:var(--brand);
  border-bottom:2px solid var(--brand);
  position:sticky; top:0; z-index:2;   /* Monatsköpfe sticky */
  padding:.6rem .5rem;
  font-weight:700;
}
td{
  border-bottom:1px solid var(--line);
  padding:.35rem .4rem;
  vertical-align:top;
  background:#fff;
}

/* Spaltenbreiten & Spezialzellen */
td.tag{ width:3rem; text-align:center; font-variant-numeric:tabular-nums; }
td.min{ width:3.8rem; text-align:center; color:var(--muted); }
td.kw, td.kwgr{ width:3.5rem; text-align:right; font-size:.7rem; font-weight:700; color:var(--muted); background:#fff; }
td.kwgr{ background:var(--past); }
td.wota_mark{ background:var(--weekend); }
td.gray{ background:var(--past); }

/* Terminliste in der Zelle scrollbar halten */
td.termin, td.termingray{
  font-size:.75rem;
  line-height:1.25;
  max-height:3.8rem;        /* ~ 3-4 Zeilen sichtbar */
  overflow:auto;
  background:#fff;
}
td.termingray{ background:var(--past); }

/* Heute markieren (Tag + benachbarte Zellen leicht hinterlegen) */
td.today,
td.today + td,
td.today ~ td.termin,
td.today ~ td.kw,
td.today ~ td.kwgr{
  background:var(--today) !important;
}

/* Hover-Orientierung (Desktop) */
@media (hover:hover){
  tr:hover td{ background:#fcfcff; }
}

/* Tooltip verfeinert */
.tooltip{ position:relative; display:inline-block; }
.tooltip .tooltiptext{
  visibility:hidden; opacity:0; transition:.15s ease;
  min-width:220px; max-width:min(60vw,380px);
  background:#111; color:#fff; text-align:left;
  border-radius:8px; padding:.5rem .6rem;
  position:absolute; z-index:4; top:100%; left:0; transform:translateY(6px);
  box-shadow:0 10px 18px rgba(0,0,0,.25);
}
.tooltip:hover .tooltiptext,
.tooltip:focus-within .tooltiptext{ visibility:visible; opacity:1; }

/* Option: erste Spalte sticky für Orientierung beim Horizontal-Scroll */
.sticky-first td.tag, .sticky-first td.min{
  position:sticky; left:0; z-index:1; background:#fff;
  box-shadow:1px 0 0 var(--line);
}

/* Print */
@media print{
  body{ font-size:8pt; color:#000; background:#fff; width:100%; }
  th{ font-size:12pt; color:#000; background:#fff; border-bottom:2px solid #000; }
  h1{ font-size:18pt; line-height:1.1; }
  tr{ height:18px; }
  .no-print{ display:none !important; }
  .pc{ display:block; }
  .print_logo{ position:absolute; right:8px; top:0; }
  td.termin, td.termingray{ font-size:6pt; max-height:none; overflow:visible; background:#fff; }
  @page{ size:landscape; margin:10mm; }
}

/* Mobile */
@media (max-width: 399px){
  .pc{ display:none; }
  .phone table{ background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
  .topnav a{ padding:16px; font-size:18px; }
}
@media (min-width: 400px){
  .phone{ display:none; }
}
  </style>
</head>
<body>

<form class="no-print" action="show_neu.php" method="post">
  <div class="topnav">
    <a href="#home" class="active">
      <p>Halbjahreskalender |
      <?php
        include("functions/settings.php");
        include("functions/datenbank.php");
        // Datumsfeld
        $monthInput = isset($_POST['datum']) ? $_POST['datum'] : date("Y-m");
        echo '<input type="month" id="datepicker" name="datum" onchange="this.form.submit()" value="'.htmlspecialchars($monthInput).'">';

        // Kategorie-Dropdown
        echo '<select id="kategorie" name="kategorie" onchange="this.form.submit()">';
        if (isset($_POST["kategorie"])) {
          if($_POST["kategorie"]==-1) echo '<option selected value="-1">--Bitte auswählen--</option>';
        } else {
          echo '<option selected value="-1">--Bitte auswählen--</option>';
        }
        if (isset($_POST["kategorie"]) && $_POST["kategorie"]==0) {
          echo '<option selected value="0">Alle Termine</option>';
        } else {
          echo '<option value="0">Alle Termine</option>';
        }

        $sql2 ="SELECT * FROM kalender";
        $statement2 = $mysqli2->prepare($sql2);
        $statement2->execute();
        $result2 = $statement2->get_result();
        $ueberschrift="";
        while($row2 = $result2->fetch_object()) {
          if (isset($_POST["kategorie"]) && $_POST["kategorie"]==$row2->ID) $ueberschrift=$row2->Titel;
          $sel = (isset($_POST["kategorie"]) && $_POST["kategorie"]==$row2->ID) ? ' selected' : '';
          echo '<option'.$sel.' value="'.$row2->ID.'">'.htmlspecialchars($row2->Titel).'</option>';
        }
        echo '</select>';

        // Stufen-Dropdown (nur bei Kategorie 5)
        if (isset($_POST["kategorie"]) && $_POST["kategorie"]=="5") {
          $stufe = isset($_POST["stufe"]) ? $_POST["stufe"] : "0";
          echo '<select id="stufe" name="stufe" onchange="this.form.submit()">';
          echo '<option value="0"'.($stufe=="0"?' selected':'').'>Alle Stufen</option>';
          foreach (["E1","E2","Q1","Q2","Q3","Q4"] as $s) {
            $sel = ($stufe==$s) ? ' selected' : '';
            echo '<option value="'.$s.'"'.$sel.'>'.$s.'</option>';
          }
          echo '</select>';
        }
      ?>
      </p>
    </a>

    <div id="myLinks">
      <a href="https://cloud.mso-hef.de/kalender/formular/form.php">Pesonalisierter Kalender</a>
      <a href="https://cloud.mso-hef.de/kalender/kalender.php">Alle Kalenderlinks</a>
      <a href="https://cloud.mso-hef.de/osticket/">Termin einreichen</a>
      <a href="https://cloud.mso-hef.de/osticket/">UB einreichen</a>
      <a href="https://cloud.mso-hef.de/osticket/kb/index.php">Anleitungen</a>
      <a href="https://cloud.mso-hef.de/kalender/admin.php">Administration</a>
    </div>
    <a href="javascript:void(0);" class="icon" onclick="myFunction()">
      <i class="fa fa-bars"></i>
    </a>
  </div>
</form>

<?php if (isset($_POST['datum'])) { ?>
  <hr class="no-print">
  <h1 class="print pc">
    <?php
      echo htmlspecialchars($ueberschrift);
      if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") echo ", ".htmlspecialchars($_POST["stufe"]);
    ?>
  </h1>
  <p class="print pc">
    <?php
      if (isset($_POST["stufe"])) {
        if(($_POST["stufe"]=="E1")||($_POST["stufe"]=="E2")) echo "Außer den Sprachen schreiben alle Fächer nur an einem der beiden Termine (FS = Fremdsprachen).";
        if(($_POST["stufe"]=="Q1")||($_POST["stufe"]=="Q2")||($_POST["stufe"]=="Q3")||($_POST["stufe"]=="Q4")) echo "Die Profile legen ihre Klausuren selbst fest. (Vglkl. = Vergleichsklausur)";
      }
    ?>
  </p>
  <img class="print_logo pc" width="50" src="logo.png" alt="Logo">

  <?php
    if (isset($_POST["kategorie"])) $sqlbase="SELECT * FROM termine WHERE Kategorie=".$_POST["kategorie"]." AND";
    else $sqlbase="SELECT * FROM termine WHERE";
    if (isset($_POST["kategorie"]) && $_POST["kategorie"]==0) $sqlbase="SELECT * FROM termine WHERE";

    $monat = date("n",strtotime($_POST['datum']));
    $monata= date("n");
    $jahr  = date("Y",strtotime($_POST['datum']));
    $jahra = date("Y");
    $tag   = date("j",strtotime($_POST['datum']));
    $taga  = date("j");
    $wota = array("0","Mo", "Di", "Mi", "Do", "Fr", "Sa", "So");
    $mon  = array("0","Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
    error_reporting(-1);

    function shortText($string,$lenght) {
      $original = $string;
      if(strlen($string ?? '') > $lenght) {
          $string = substr($string ?? '',0,$lenght)."...";
          $string_ende = strrchr($string, " ");
          if ($string_ende !== false) $string = str_replace($string_ende," ... ", $string);
          $string = '<div class="tooltip"> '.$string.' <span class="tooltiptext">'.htmlspecialchars($original).'</span></div>';
      }
      return $string;
    }

    function isTodayClass($y,$m,$d){
      return (date("Ymd", mktime(0,0,0,$m,$d,$y)) === date("Ymd")) ? " today" : "";
    }
  ?>

  <!-- DESKTOP/DRUCK -->
  <div class="pc">
    <div class="table-wrap">
      <table class="sticky-first">
        <tr>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat,1,$jahr))].' '.date("y",mktime(0,0,0,$monat,1,$jahr)); ?></th>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat+1,1,$jahr))].' '.date("y",mktime(0,0,0,$monat+1,1,$jahr)); ?></th>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat+2,1,$jahr))].' '.date("y",mktime(0,0,0,$monat+2,1,$jahr)); ?></th>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat+3,1,$jahr))].' '.date("y",mktime(0,0,0,$monat+3,1,$jahr)); ?></th>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat+4,1,$jahr))].' '.date("y",mktime(0,0,0,$monat+4,1,$jahr)); ?></th>
          <th colspan="4"><?php echo $mon[date("n",mktime(0,0,0,$monat+5,1,$jahr))].' '.date("y",mktime(0,0,0,$monat+5,1,$jahr)); ?></th>
        </tr>

        <?php for($i=1;$i<32;$i++) {
          echo "<tr>";

          /* === Block für Monat +0 === */
          if ($i<=date("t",mktime(0,0,0,$monat,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat,$i);

            echo '<td class="tag'.$gray.$todayClass.'">';
            echo $i;
            echo '</td>';

            $isWeekend = (date("N",mktime(0,0,0,$monat,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
            echo $wota[date("N",mktime(0,0,0,$monat,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          /* === Block für Monat +1 === */
          if ($i<=date("t",mktime(0,0,0,$monat+1,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat+1,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat+1,$i);

            echo '<td class="tag'.$gray.$todayClass.'">'.$i.'</td>';
            $isWeekend = (date("N",mktime(0,0,0,$monat+1,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
              echo $wota[date("N",mktime(0,0,0,$monat+1,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat+1,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat+1,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat+1,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat+1,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat+1,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          /* === Block für Monat +2 === */
          if ($i<=date("t",mktime(0,0,0,$monat+2,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat+2,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat+2,$i);

            echo '<td class="tag'.$gray.$todayClass.'">'.$i.'</td>';
            $isWeekend = (date("N",mktime(0,0,0,$monat+2,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
              echo $wota[date("N",mktime(0,0,0,$monat+2,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat+2,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat+2,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat+2,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat+2,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat+2,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          /* === Block für Monat +3 === */
          if ($i<=date("t",mktime(0,0,0,$monat+3,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat+3,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat+3,$i);

            echo '<td class="tag'.$gray.$todayClass.'">'.$i.'</td>';
            $isWeekend = (date("N",mktime(0,0,0,$monat+3,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
              echo $wota[date("N",mktime(0,0,0,$monat+3,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat+3,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat+3,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat+3,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat+3,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat+3,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          /* === Block für Monat +4 === */
          if ($i<=date("t",mktime(0,0,0,$monat+4,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat+4,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat+4,$i);

            echo '<td class="tag'.$gray.$todayClass.'">'.$i.'</td>';
            $isWeekend = (date("N",mktime(0,0,0,$monat+4,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
              echo $wota[date("N",mktime(0,0,0,$monat+4,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat+4,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat+4,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat+4,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat+4,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat+4,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          /* === Block für Monat +5 === */
          if ($i<=date("t",mktime(0,0,0,$monat+5,1,$jahr))) {
            $gray = (mktime(0,0,0,$monat+5,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? "" : " gray";
            $todayClass = isTodayClass($jahr,$monat+5,$i);

            echo '<td class="tag'.$gray.$todayClass.'">'.$i.'</td>';
            $isWeekend = (date("N",mktime(0,0,0,$monat+5,$i,$jahr))>=6);
            echo $isWeekend ? '<td class="wota_mark'.$gray.$todayClass.'">' : '<td class="min'.$gray.$todayClass.'">';
              echo $wota[date("N",mktime(0,0,0,$monat+5,$i,$jahr))];
            echo '</td>';

            echo (mktime(0,0,0,$monat+5,$i,$jahr) >= mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="termin">' : '<td class="termingray">';
              $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$monat+5,$i,$jahr)).'%"';
              if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND (Beschreibung LIKE "KLA:Nac%" OR Beschreibung LIKE "%'.$_POST["stufe"].'%")';
              $statement = $mysqli->prepare($sql);
              $statement->execute();
              $result = $statement->get_result();
              $first=true; $counter=0; $tooltip="";
              while($row = $result->fetch_object()) {
                $Titel = (substr($row->Start ?? '',8,1)=="T")
                  ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                  : $row->Titel;
                if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                  $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                }
                if ($first) {
                  echo '<div class="no-print">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                  $first=false;
                } else {
                  $counter++;
                  $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                }
              }
              if ($counter>0) echo '<div class="tooltip"><div class="no-print">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
            echo '</td>';

            echo (mktime(0,0,0,$monat+5,$i,$jahr) < mktime(0,0,0,$monata,$taga,$jahra)) ? '<td class="kwgr">' : '<td class="kw">';
              if (date("N",mktime(0,0,0,$monat+5,$i,$jahr))==1) echo date("W",mktime(0,0,0,$monat+5,$i,$jahr));
            echo '</td>';
          } else {
            echo '<td class="tag"></td><td class="min"></td><td class="termin"></td><td class="kw"></td>';
          }

          echo "</tr>";
        } ?>
      </table>
    </div>
  </div>

  <!-- PHONE -->
  <?php if (isset($_POST["kategorie"])) { ?>
    <div class="phone">
      <table>
        <?php for($m=$monat;$m<$monat+6;$m++) { ?>
          <tr>
            <th colspan="4">
              <?php echo $mon[date("n",mktime(0,0,0,$m,1,$jahr))].' '.date("y",mktime(0,0,0,$m,1,$jahr)); ?>
            </th>
          </tr>
          <?php for($i=1;$i<32;$i++) {
            if ($i<=date("t",mktime(0,0,0,$m,1,$jahr))) {
              $todayClass = isTodayClass($jahr,$m,$i);
              echo "<tr>";
                echo '<td class="tag'.$todayClass.'">'.$i.'</td>';
                $isWeekend = (date("N",mktime(0,0,0,$m,$i,$jahr))>=6);
                echo $isWeekend ? '<td class="wota_mark'.$todayClass.'">' : '<td class="min'.$todayClass.'">';
                  echo $wota[date("N",mktime(0,0,0,$m,$i,$jahr))];
                echo "</td>";

                echo '<td class="termin">';
                  $sql =$sqlbase.' start LIKE "'.date("Ymd",mktime(0,0,0,$m,$i,$jahr)).'%"';
                  if (isset($_POST["stufe"]) && $_POST["stufe"]<>"0") $sql .= ' AND Beschreibung LIKE "%'.$_POST["stufe"].'%"';
                  $statement = $mysqli->prepare($sql);
                  $statement->execute();
                  $result = $statement->get_result();
                  $first=true; $counter=0; $tooltip="";
                  while($row = $result->fetch_object()) {
                    $Titel = (substr($row->Start ?? '',8,1)=="T")
                      ? $row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"
                      : $row->Titel;
                    if ((substr($row->Start ?? '',0,8) <> substr($row->Ende ?? '',0,8))) {
                      $Titel .= " bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
                    }
                    if ($first) {
                      echo '<div class="no-print pc">'.shortText(htmlspecialchars($Titel),30).'</div><div class="print">'.htmlspecialchars($Titel).'</div>';
                      $first=false;
                    } else {
                      $counter++;
                      $tooltip .= ($counter==1) ? htmlspecialchars($Titel) : "<br>".htmlspecialchars($Titel);
                    }
                  }
                  if ($counter>0) echo '<div class="tooltip"><div class="no-print pc">+'.intval($counter).'</div><span class="tooltiptext">'.$tooltip.'</span></div>';
                echo "</td>";

                echo '<td class="kw">';
                  if (date("N",mktime(0,0,0,$m,$i,$jahr))==1) echo date("W",mktime(0,0,0,$m,$i,$jahr));
                echo "</td>";
              echo "</tr>";
            }
          } ?>
        <?php } ?>
      </table>
    </div>
  <?php } ?>

  <div class="print pc">Dies ist ein automatisch generierter Ausdruck. Änderungen vorbehalten. Angaben ohne Gewähr.</div>
<?php } /* Ende isset datum */ ?>

<script>
function myFunction() {
  var x = document.getElementById("myLinks");
  x.style.display = (x.style.display === "block") ? "none" : "block";
}
</script>
</body>
</html>
