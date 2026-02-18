<HTML>
<HEAD>
	<link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">

</HEAD>

<BODY>
<h1>Terminprüfung</h1>
Kalender welche mit Steuerbefehlen gesteuert werden sollten nur Termine beinhalten, welche Steuerbefehle nutzen. Hier werden Termine angezeigt die, obwohl sie in einem solchen Kalender sind, keine oder einen fehlerhaften Steuerbefehl haben.
	<br><A HREF="pruefung.php?all=1">Auch vergangene Termine anzeigen</A> | <A HREF="pruefung.php?all=0">Nur aktuelle Termine anzeigen</A>

<?php 
	error_reporting(-1);
include("functions/settings.php");
include("functions/datenbank.php");
if (isset($_GET["all"])) if($_GET["all"]==1) $all=true; else $all=false;
?>

<!----------------------------------------------------------->
	
<?php 

	
$sql = "SELECT * FROM kalender where kurzel<>\"-\" ORDER BY Titel";  //fertig
$statement = $mysqli->prepare($sql);
$statement->execute();
$result1 = $statement->get_result();
//echo "SQL-Befehl: ".$sql;
while($row1 = $result1->fetch_object()) { 
echo "<h2>".$row1->Titel."</h2>";
$aktueller_kalender = $row1->ID;
$sql = "SELECT * FROM Tags WHERE Kategorie=".$row1->ID;
$statement = $mysqli->prepare($sql);
$statement->execute();
$result = $statement->get_result();	
$sqlex="SELECT t.ID,t.Titel,t.Start,t.Ende,t.Beschreibung,t.Ort,t.Kategorie,t.Ganztag FROM termine t LEFT JOIN (select * from termine";
$erstes=true;
while($row = $result->fetch_object()) {  
	if($erstes==false) $sqlex .=" OR"; else $sqlex .=" WHERE ";
	$sqlex .=" beschreibung like \"%".$row->Tag."%\"";
	$erstes=false;
	
}
if ($all) $sqlex .=") x ON t.id=x.id WHERE x.id IS NULL AND t.kategorie=".$aktueller_kalender." ORDER BY Start"; 
	else $sqlex .=") x ON t.id=x.id WHERE x.id IS NULL AND t.kategorie=".$aktueller_kalender." AND CAST(left(t.start,8) AS datetime)>=CURRENT_DATE() ORDER BY Start";
	//echo "<br>SQL-Befehl: ".$sqlex;
$first=true;
	  $statement = $mysqli->prepare($sqlex);
$statement->execute();
$result = $statement->get_result();
  
while($row = $result->fetch_object()) {  
	if ($first) {
	$first=false;
			?>
<table cellpadding="0" cellspacing="0" class="minimalistBlack" width="100%">
  <thead>
    <tr>
      <th>Titel</th>
      <th>Start</th>
	  <th>Ende</th>
	  <th>Beschreibung</th>
	  <th>Ort</th>
	  <th>Ganztag</th>
    </tr>
  </thead>
  <tbody>
	  <?php
	}
  ?>
	 
    <tr>
        <td><?php echo $row->Titel; ?></td>
		<td><?php if (strlen($row->Start)==9) echo date("d.m.Y", strtotime($row->Start)); else echo date("d.m.Y H:i:s", strtotime($row->Start)); ?></td>
		<td><?php if (strlen($row->Ende)==9) echo date("d.m.Y", strtotime($row->Ende)); else echo date("d.m.Y H:i:s", strtotime($row->Ende)); ?></td>
		<td><b><?php echo $row->Beschreibung; ?></b></td>   
		<td><?php echo $row->Ort; ?></td>
		<td><?php echo $row->Ganztag; ?></td>
    </tr>					 
  <?php
}

  
if ($first) echo "Keine Beanstandungen"; else {
?>
 </tbody>
        </table>
<?php
}
}
	
?>



</BODY>
<?php mysqli_close($mysqli); ?>
</HTML>