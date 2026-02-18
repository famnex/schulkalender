<HTML>

<HEAD>
    
	<TITLE>Personalisierter Kalender MSO</TITLE>
	
    <meta charset="utf-8" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript">
        <?php
include('../functions/datenbank.php' );
$sql = "SELECT * FROM kalender";
  $statement = $mysqli->prepare($sql);
  $statement->execute();
  $result = $statement->get_result();
  while($row = $result->fetch_object()) {	
	?>

        function hide<?php echo $row->ID?> () {
            document.getElementById('div<?php echo $row->ID?>').style.display = 'none';
        }

        function show<?php echo $row->ID?> () {
            document.getElementById('div<?php echo $row->ID?>').style.display = 'block';
        }

        <?php } ?>
    </script>
    <link href="design.css?v=<?php echo time(); ?>" rel="stylesheet">
</HEAD>

<BODY>
     <FORM action='verarbeitung.php' method='post'>
	<div class="container">
		<IMG SRC="logo.png" align="right">
        <h1>
    <span>Ich möchte folgende Kalender abonnieren:</span><br>
  </h1>

       

            <?php
$sql = "SELECT * FROM kalender";
  $statement = $mysqli->prepare($sql);
  $statement->execute();
  $result = $statement->get_result();
  while($row = $result->fetch_object()) {
  	 echo "<label class=\"top-label\">".$row->Titel."</label>";
	?>
      
		
	<input class="radio-inline" id="<?php echo $row->ID ?>J" name="<?php echo $row->ID ?>" checked type="radio" value="1" onclick="hide<?php echo $row->ID ?>();">	
    <label for="<?php echo $row->ID ?>J" class="side-label">Ja</label>
		
		

                <?php if ($row->Zusatz==0) { ?>
<input class="radio-inline" id="<?php echo $row->ID ?>T" name="<?php echo $row->ID ?>" type="radio" value="T" onclick="show<?php echo $row->ID ?>();">
    <label for="<?php echo $row->ID ?>T" class="side-label">Teilweise</label>

                    <?php } ?>
		
<input class="radio-inline" id="<?php echo $row->ID ?>N" name="<?php echo $row->ID ?>" type="radio" value="0" onclick="hide<?php echo $row->ID ?>();">
    <label for="<?php echo $row->ID ?>N" class="side-label">Nein</label>

                        <?php
if ($row->Kurzel!="-") {
$sql2 = "SELECT * FROM Tags WHERE Kategorie=".$row->ID;
echo "<div id=\"div".$row->ID."\" class=\"hide\">";

  $statement2 = $mysqli2->prepare($sql2);
  $statement2->execute();
  $result2 = $statement2->get_result();
  while($row2 = $result2->fetch_object()) {

	  
	  
	echo "<input id=\"".$row->ID."_".$row2->Tag."\" name=\"".$row2->Tag."\" value=\"1\" type=\"checkbox\">";	
    echo "<label for=\"".$row->ID."_".$row2->Tag."\" class=\"side-label\">".$row2->Name."</label>";
	  


	}
	echo "</div>";
	}
	  
echo "<hr>";
	}

?>
    <label class="top-label">Kalender aktualisieren</label>
	<div style="font-size:15px">Sollten Sie einen schon genutzten Kalender aktualisieren wollen, dann Tragen Sie hier ihre Kalender-ID ein (das ist der 10stellige Code am Ende ihrer individuellen Kalenderadresse).
	Ansonsten können Sie das Feld leer lassen.<br></div>
	<input type="text" name="token"><br>
	<button type="submit">Link erstellen</button>
		 </div>
		 	
    </form>

</BODY>

</HTML>