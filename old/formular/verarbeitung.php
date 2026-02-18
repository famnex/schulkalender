<HTML>

<HEAD>
    <TITLE>Personalisierter Kalender MSO</TITLE>
    <meta charset="utf-8" />
    <link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">


</HEAD>
	<BODY>
			<div class="container">
        <h1>
    <span>Ihr persönlicher Kalenderlink</span><br>
  </h1>
<?php

function charRand($a) {
 $randString = '';
 $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
 for ($i=0;$i<$a;$i++) {
 $randNum = mt_rand(0, strlen($chars)-1);
 $randString .= $chars[$randNum];
 }
 return $randString;
}



$pfad = 'http://cloud.mso-hef.de/kalender/icsv2.php?';

include('../functions/datenbank.php' );
$sql = "SELECT * FROM kalender";
  $statement = $mysqli->prepare($sql);
  $statement->execute();
  $result = $statement->get_result();
  $kalender = "";
  while($row = $result->fetch_object()) {	
	if (isset($_POST[$row->ID])) 
		if ($_POST[$row->ID]==1)
			$kalender .= "cal[]=".$row->ID."&";
  } 

$sql = "SELECT * FROM Tags";
  $statement = $mysqli->prepare($sql);
  $statement->execute();
  $result = $statement->get_result();
  $tags = "";
  while($row = $result->fetch_object()) {	
	if (isset($_POST[$row->Tag])) 
		if ($_POST[$row->Tag]==1)
			$tags .= "tag[]=".$row->Tag."&";
  }

$sql = "SELECT * FROM kalender";
  $statement = $mysqli->prepare($sql);
  $statement->execute();
  $result = $statement->get_result();
  $part = "";
  while($row = $result->fetch_object()) {	
	if (isset($_POST[$row->ID])) 
		if ($_POST[$row->ID]=="T")
			$part .= "part[]=".$row->ID."&";
  } 

$pfad .= $kalender.$tags.$part;
$pfad = substr($pfad, 0, -1); 

//Gab es den Link schonmal?
if (isset($_POST["token"])) $token=$_POST["token"]; else $token = charRand(10);
$weiter=false;

do {
$sql = "SELECT * FROM link WHERE id=\"$token\"";
$statement = $mysqli->prepare($sql);
$statement->execute();
  $result = $statement->get_result();
  $vorhanden=false;
  while($row = $result->fetch_object()) {
	  $vorhanden=true;
  }
  
  if ($_POST["token"]!="") {
	  if ($vorhanden) {
		 $weiter=true;
		 echo "Die eingegebene Kalender-ID wurde gefunden! Die Kalenderdaten wurden überschrieben!<br>";
		 echo "Sie müssen die Adresse des Kalenders nicht in Ihrem Onlinekalender aktualisieren!<br><br>";
		 $sql = "UPDATE link SET link='".$pfad."' WHERE id='".$token."'";
		 
	  } else {
		 $weiter=false;
		 $token = charRand(10);
		 unset($_POST["token"]);
		 echo "Die eingegebene Kalender-ID wurde nicht gefunden. Es wurde eine neue Kalender-ID angelegt.<br>Fügen Sie den neuen Link zu ihrem Kalender hinzu oder versuchen Sie es erneut.<br><br>";
		 $sql = "INSERT INTO link (id,link) VALUES ('".$token."','".$pfad."')";
	  }
  } else {
	  if ($vorhanden) {
		 $weiter=false;
		 $token = charRand(10);
		 //Nochmal wiederholen mit anderem token!
	  } else {
		 $weiter=true;
		 echo "Eine neue Kalender-ID wurde für Sie erstellt.<br>";
		 echo "Bitte kopieren Sie den folgenden Link und tragen Sie diesen in ihrem Kalender ein.<br><br>";
		 $sql = "INSERT INTO link (id,link) VALUES ('".$token."','".$pfad."')";
	  } 
	  
  }
} while ($weiter==false);	  
  

//
  

	//  $sql = "INSERT INTO link (id,link) VALUES ('".$token."','".$pfad."')";
//echo $sql."<br>";
 if ($mysqli->query($sql) === TRUE) {
	 
	echo "<b>http://cloud.mso-hef.de/kalender/link.php?id=".$token."</b>";
} else {
    echo "Fehler: " . $sql . "<br>" . $conn->error;
}
  
	  

//echo wordwrap($pfad, 50, "<br>\n", TRUE);
?>
		<br><br>
		
				Nutzen Sie bitte den vollständigen Link.
		</div>
	</BODY>
	</html>