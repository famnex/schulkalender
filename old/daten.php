<HTML>
<HEAD>
</HEAD>
<link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">
<BODY>
<h1>Hilfeseite</h1>
Um die richtige Ausgabe zu steuern, müssen Steuerbefehle mit den Terminen gespeichert werden. Diese sind im Feld 'Beschreibung' zu hinterlegen. Eine Trennung durch Komma, Semikolon oder Absatz ist möglich aber unnötig.<br>
Termine aus den Zusatzkalendern werden immer komplett übernommen.
Termine aus den restlichen Kalendern können vom Benutzer gefiltert werden.
<h2>Kalender</h2>
Zusatzkalender(1) werden dem Benutzer mit ja/nein Auswahl zur Verfügung gestellt.<br>
Zusatzkalender(0) werden dem Benutzer mit ja/teilweise/nein Auswahl zur Verfügung gestellt.<br><br>
<?php 
	error_reporting(-1);
include("functions/settings.php");
include("functions/datenbank.php");

$sql = "SELECT * FROM kalender";
$statement = $mysqli->prepare($sql);
$statement->execute();
$result = $statement->get_result();
?>
<table cellpadding="0" cellspacing="0" class="minimalistBlack" width="100%">
  <thead>
    <tr>
      <th>ID</th>
      <th>Titel</th>
      <th width="50%">Link</th>
	  <th>Zusatzkalender?</th>
	  <th>Optionen</th>
    </tr>
  </thead>
  <tbody>
<?php  
while($row = $result->fetch_object()) {  
  ?>
    <tr>
        <td><?php echo $row->ID; ?></td>
        <td><?php echo $row->Titel; ?></td>
        <td style="word-break:break-all;"><?php echo $row->Link; ?></td>
		<td><?php echo $row->Zusatz; ?></td>
        <td>&#10004;</td>
    </tr>					 
  <?php
}

  

?>
 </tbody>
        </table>
		
<!----------------------------------------------------------->
	
<?php	
$sql = "SELECT * FROM kalender WHERE Kurzel <>\"-\"";
$statement = $mysqli->prepare($sql);
$statement->execute();
$result1 = $statement->get_result();
while($row1 = $result1->fetch_object()) {  
	echo "<h2>".$row1->Titel."</h2>";
		$sql = "SELECT * FROM Tags WHERE Kategorie=".$row1->ID;
       $statement = $mysqli->prepare($sql);
       $statement->execute();
        $result2 = $statement->get_result();
?>
<table cellpadding="0" cellspacing="0" class="minimalistBlack" width="100%">
  <thead>
    <tr>

      <th>Name</th>

	  <th>Befehl in Beschreibung</th>
	  <th>Optionen</th>
    </tr>
  </thead>
  <tbody>
<?php  
while($row2 = $result2->fetch_object()) {  
  ?>
    <tr>

        <td><?php echo $row2->Name; ?></td>
        <td><?php echo $row2->Tag; ?></td>

        <td>&#10004;</td>
    </tr>	
	  
  <?php } ?>
	  
 </tbody>
        </table>
	<?php } 	?>

	
</BODY>
<?php mysqli_close($mysqli); ?>
</HTML>