<HTML>
<HEAD>
<link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">
</HEAD>

<BODY>
<h1>Verfügbare Kalender</h1>

<h2>Kalender</h2>

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
      <th>Titel</th>
      <th width="50%">Link</th>
    </tr>
  </thead>
  <tbody>
<?php  
while($row = $result->fetch_object()) {  
  ?>
    <tr>
        <td><?php echo $row->Titel; ?></td>
        <td style="word-break:break-all;"><?php echo $row->Link; ?></td>
    </tr>					 
  <?php
}

  

?>
 </tbody>
        </table>
		
<!----------------------------------------------------------->

</BODY>
<?php mysqli_close($mysqli); ?>
</HTML>