<?php
/* Dies wird einen Fehler provozieren. Beachten Sie die vorangehende Ausgabe,
 * die vor dem Aufruf von header() erzeugt wird */
$id="a";
if (isset($_GET["id"])) $id=$_GET["id"]; else echo "Fehler: Keine ID angegeben.";
 
if ($id!="a") {
	
include("functions/settings.php");
include("functions/datenbank.php");

$sql = "SELECT * FROM link WHERE id=\"".$id."\"";
$statement = $mysqli->prepare($sql);
$statement->execute();
  $result = $statement->get_result();
  $vorhanden=false;
  while($row = $result->fetch_object()) {
	  $vorhanden=true;
	  $link=$row->link;
  }
  
if ($vorhanden) header('Location: '.$link); else echo "Fehler: ID nicht gefunden.";
}

exit;
?>