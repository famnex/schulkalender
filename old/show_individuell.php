<html>
<head>
<meta charset="utf-8">
</head>
<body>

<?php 
if (isset($_GET['cal'])) $cal = $_GET['cal']; //OK
if (isset($_GET['part'])) $part = $_GET['part']; //OK
if (isset($_GET['tag'])) $tag = $_GET['tag']; //OK

include('functions/datenbank.php' );


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

	

echo "SELECT * FROM (".$sql.") AS A WHERE A.Start=\"%20200506%\"";



	

//echo $sql; //For testing Purposes

$statement = $mysqli->prepare($sql);
$statement->execute();
 
$result = $statement->get_result();

 
while($row = $result->fetch_object()) {
  

}

?>
</body>
</html>