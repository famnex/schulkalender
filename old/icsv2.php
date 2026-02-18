<?php 
if (isset($_GET['cal'])) $cal = $_GET['cal']; //OK
if (isset($_GET['part'])) $part = $_GET['part']; else $part=NULL;//OK
if (isset($_GET['tag'])) $tag = $_GET['tag']; else $tag=NULL;//OK

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename=MSO.ics');
include('functions/datenbank.php' );

$ics_contents = "BEGIN:VCALENDAR\n"; 
$ics_contents .= "VERSION:2.0\n"; 
$ics_contents .= "PRODID:PHP\n"; 
$ics_contents .= "METHOD:PUBLISH\n"; 
$ics_contents .= "X-WR-CALNAME:MSO Termine\n"; 
$ics_contents .= "X-WR-TIMEZONE:Europe/Berlin\n"; 
//$ics_contents .= "BEGIN:VTIMEZONE\n"; 
//$ics_contents .= "TZID:W. Europe Standard Time\n"; 
//$ics_contents .= "BEGIN:DAYLIGHT\n"; 
//$ics_contents .= "TZOFFSETFROM:+0100\n"; 
//$ics_contents .= "TZOFFSETTO:+0200\n"; 
//$ics_contents .= "DTSTART:16010101T030000\n"; 
//$ics_contents .= "RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=10\n"; 
//$ics_contents .= "TZNAME:EDT\n"; 
//$ics_contents .= "END:DAYLIGHT\n"; 
//$ics_contents .= "BEGIN:STANDARD\n"; 
//$ics_contents .= "TZOFFSETFROM:+0100\n"; 
//$ics_contents .= "TZOFFSETTO:+0200\n"; 
//$ics_contents .= "DTSTART:16010101T020000\n"; 
//$ics_contents .= "RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=10\n"; 
//$ics_contents .= "TZNAME:EST\n"; 
//$ics_contents .= "END:STANDARD\n"; 
//$ics_contents .= "END:VTIMEZONE\n"; 


//******************************************** TERMINKALENDER KOMPLETT

$first=true;
$sqlganz = "";
if (isset($_GET['cal'])){
$sqlganz = "SELECT * FROM termine WHERE ";
$Reihe = "(";
foreach ($cal as $item) {
$Reihe .= $item.",";
}
$Reihe = rtrim($Reihe,",");
$Reihe .= ")";

$sqlganz .="Kategorie IN ".$Reihe;
$first=false;
}
//echo $sqlganz."<br>";
//******************************************** TERMINKALENDER MIT TAGS
$sqltag = "";
$first=true;
foreach ($tag as $item) {
	if ($first) $first=false; else $sqltag .= " UNION ";
$sqltag .= "SELECT * FROM termine WHERE Beschreibung LIKE \"%".$item."%\"";	
}
//echo $sqltag."<br>";
//******************************************** TERMINKALENDER OHNE TAGS

$sqlpart = "";
$first=true;
foreach ($part as $item) {
	if ($first) $first=false; else $sqlpart .= " UNION ";
$sqla = "SELECT * FROM Tags WHERE Kategorie=".$item;
$statement = $mysqli->prepare($sqla);
$statement->execute();
$result = $statement->get_result();

$sqlpart .="SELECT t.ID,t.Titel,t.Start,t.Ende,t.Beschreibung,t.Ort,t.Kategorie,t.Ganztag FROM termine t LEFT JOIN (select * from termine WHERE ";
$erstes=true;
while($row = $result->fetch_object()) {  
	if($erstes==false) $sqlpart .=" OR";
	$sqlpart .=" beschreibung like \"%".$row->Tag."%\"";
	$erstes=false;	
}
$sqlpart .=") x ON t.id=x.id WHERE x.id IS NULL AND t.kategorie=".$item;
}	

//echo $sqlpart;

if ($sqlganz!="") {
  $sql=$sqlganz; 
  if ($sqltag!="") $sql .= " UNION ".$sqltag;
  if ($sqlpart!="") $sql .= " UNION ".$sqlpart;  
  } else if ($sqltag!="") {
	  $sql = $sqltag; 
      if ($sqlpart!="") $sql .= " UNION ".$sqlpart;  
      }else if ($sqlpart!="")  
	     $sql = $sqlpart;

	





	

//echo $sql; //For testing Purposes

$statement = $mysqli->prepare($sql);
$statement->execute();
 
$result = $statement->get_result();

 
while($row = $result->fetch_object()) {
  

  $id            = $row->ID;
  $name          = $row->Titel;
  $start         = $row->Start;
  //$start_date = strtotime($start);
  //$start_date = date('Ymd',$start_date);
  //$start_time = strtotime($start);
  //$start_time = date('his',$start_time);
  $end           = $row->Ende;
  //$end_date = strtotime($start);
  //$end_date = date('Ymd',$end_date);
  //$end_time = strtotime($start);
  //$end_time = date('his',$end_time);
  $ganztag       = $row->Ganztag;
  $description   = $row->Beschreibung;
  $location      = $row->Ort;
  $category      = $row->Kategorie;
  
  
  
 
  # Remove '-' in $start_date and $end_date
  //$estart_date   = str_replace("-", "", $start_date);
  //$eend_date     = str_replace("-", "", $end_date);
  
  
 
  # Remove ':' in $start_time and $end_time
  //$estart_time   = str_replace(":", "", $start_time);
  //$eend_time     = str_replace(":", "", $end_time);
 
  # Replace some HTML tags
  $name          = str_replace("&lt;br&gt;", "\\n",   $name);
  $name          = str_replace("&amp;amp;", "&amp;",    $name);
  $name          = str_replace("&amp;rarr;", "--&gt;", $name);
  $name          = str_replace("&amp;larr;", "&lt;--", $name);
  $name          = str_replace(",", "\\,",      $name);
  $name          = str_replace(";", "\\;",      $name);
 
  $location      = str_replace("&lt;br&gt;", "\\n",   $location);
  $location      = str_replace("&amp;amp;", "&amp;",    $location);
  $location      = str_replace("&amp;rarr;", "--&gt;", $location);
  $location      = str_replace("&amp;larr;", "&lt;--", $location);
  $location      = str_replace(",", "\\,",      $location);
  $location      = str_replace(";", "\\;",      $location);
 
  $description   = str_replace("&lt;br&gt;", "\\n",   $description);
  $description   = str_replace("&amp;amp;", "&amp;",    $description);
  $description   = str_replace("&amp;rarr;", "--&gt;", $description);
  $description   = str_replace("&amp;larr;", "&lt;--", $description);
  $description   = str_replace("&lt;em&gt;", "",      $description);
  $description   = str_replace("&lt;/em&gt;", "",     $description);
 
  # Change TZID if need be
  $ics_contents .= "BEGIN:VEVENT\n";
  
  if($ganztag=="1") $ics_contents .= "DTSTART;VALUE=DATE:"     . $start . "\n"; else $ics_contents .= "DTSTART:"     . $start . "\n";
	
  if($ganztag=="1") $ics_contents .= "DTEND;VALUE=DATE:"     . $end . "\n"; else $ics_contents .= "DTEND:"       . $end . "\n";

  $ics_contents .= "DTSTAMP:"     . date('Ymd') . "T". date('His') . "Z\n";
  $ics_contents .= "LOCATION:"    . $location . "\n";
  $ics_contents .= "DESCRIPTION:" . $description . "\n";
  $ics_contents .= "SUMMARY:"     . $name . "\n";
  $ics_contents .= "UID:"         . $id . "\n";
  $ics_contents .= "SEQUENCE:0\n";
  $ics_contents .= "END:VEVENT\n";
}
  $ics_contents .= "END:VCALENDAR\n";
  
  str_replace(["\r\n", "\r", "\n"], "\r\n", $ics_contents); //fix linebreaks
  
echo $ics_contents;

  

?>