<!doctype html>
<?php setlocale (LC_ALL, 'de_DE'); ?>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Halbjahreskalender</title>
  <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="/resources/demos/style.css">
  <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
	<style>
	
	.mobile-container {
  max-width: 480px;
  margin: auto;
  background-color: #555;
  height: 500px;
  color: white;
  border-radius: 10px;
}

.topnav {
  overflow: hidden;
  background-color: #333;
  position: relative;
}

.topnav #myLinks {
  display: none;
}

.topnav a {
  color: white;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
  display: block;
}

.topnav a.icon {
  background: black;
  display: block;
  position: absolute;
  right: 0;
  top: 0;
}

.topnav a:hover {
  background-color: #ddd;
  color: black;
}

.active {
     background-color: #92d050;

  color: white;
}
	
	@media only print and (min-width: 1px) {
 body{font-size:8pt;}
 th{font-size:12pt;}
 h1{font-size:25pt;line-height:10pt;}
 tr{height:18px;}
.no-print {	display: none;}
.phone{display:none;}
.print_logo{
	position:absolute;
	right:8px;
	left:auto;
	top:0px;
}
td.termin{font-size: 5pt;}
td.termingray{font-size: 5pt;background-color:gray;}

@page { size: landscape }

}

@page { size: landscape }

@media only screen and (max-width: 399px) { 

.pc{display:none;}

} 

@media only screen and (min-width: 400px) {
    body{width: 80%; margin-left: 10%;}
	td {height: 22px; }	
	.print {display : none; }
	.print_logo{display : none; }
	
	td.termin{font-size: x-small;}
	td.termingray{font-size: x-small;background-color:gray;}
	.phone{display:none;}
	.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  
  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 105%;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
	
}
	
		body {
		
			font-family: Verdana,Geneva,sans-serif; 
			}
		table {
 			border-collapse: collapse;
			}

		table, th {
  			border: 2px solid black;
			}
		th {
			width: 13.33%;
			background-color: #004291;
			color: white;
		}
		td {
			border-bottom: 1px solid black;
			
		}
		td.tag{
		text-align: center;	
		border-left: 1px solid black;
		width: 1%;
		}
		td.min{
		text-align: center;	
		width: 1%;
		}
		td.kw{
		text-align: rigth;	
		vertical-align: bottom; 	
		width: 1%;
		font-size: xx-small;
		font-weight: bold;
		}
		td.kwgr{
		text-align: rigth;	
		vertical-align: bottom; 	
		width: 1%;
		font-size: xx-small;
		font-weight: bold;
		background-color:gray;
		}
		td.wota_mark{
		text-align: center;	
		width: 1%;
		background-color: #92d050;
		}	
		
		td.gray{
			background-color:gray;
		}
		
		


	</style>
</head>
<body>





 <form class="no-print" action="show.php" method="post">
 <div class="topnav">
  <a href="#home" class="active">
<?php 
include("functions/settings.php");
include("functions/datenbank.php");	
if (isset($_POST['datum'])) echo "<p> Halbjahreskalender | Startdatum: <input type=\"month\" id=\"datepicker\" name=\"datum\" onchange=\"this.form.submit()\" value=\"".$_POST['datum']."\">"; else

echo "<p> Halbjahreskalender | Startdatum: <input type=\"month\" id=\"datepicker\" name=\"datum\" onchange=\"this.form.submit()\" value=\"".date("Y-m")."\">"; 


echo "<select id=\"kategorie\" name=\"kategorie\" onchange=\"this.form.submit()\">";
if (isset($_POST["kategorie"])) if($_POST["kategorie"]==-1) echo "<option selected value=\"-1\">--Bitte auswählen--</option>"; else echo ""; else echo "<option selectedvalue=\"-1\">--Bitte auswählen--</option>";
if (isset($_POST["kategorie"])) if($_POST["kategorie"]==0) echo "<option selected value=\"0\">Alle Termine</option>"; else echo "<option value=\"0\">Alle Termine</option>"; else echo "<option  value=\"0\">Alle Termine</option>";

$sql2 ="SELECT * FROM kalender";
$statement2 = $mysqli2->prepare($sql2);
$statement2->execute();
$result2 = $statement2->get_result();
while($row2 = $result2->fetch_object()) { 
//$row2->Titel;
if ($_POST["kategorie"]==$row2->ID) $ueberschrift=$row2->Titel; else $ueberschrift="";
//row->ID; 




if (isset($_POST["kategorie"])) if($_POST["kategorie"]==$row2->ID) echo "<option selected value=\"".$row2->ID."\">".$row2->Titel."</option>"; else echo "<option value=\"".$row2->ID."\">".$row2->Titel."</option>"; else echo "<option  value=\"".$row2->ID."\">".$row2->Titel."</option>";



}

echo "</select>";

if (isset($_POST["kategorie"])) { if($_POST["kategorie"]=="5")
{
	echo "<select id=\"stufe\" name=\"stufe\" onchange=\"this.form.submit()\">";
	echo "<option value=\"0\">Alle Stufen</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="E1") echo "<option selected value=\"E1\">E1</option>"; else echo "<option value=\"E1\">E1</option>"; else echo "<option value=\"E1\">E1</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="E2") echo "<option selected value=\"E2\">E2</option>"; else echo "<option value=\"E2\">E2</option>"; else echo "<option value=\"E2\">E2</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="Q1") echo "<option selected value=\"Q1\">Q1</option>"; else echo "<option value=\"Q1\">Q1</option>"; else echo "<option value=\"Q1\">Q1</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="Q2") echo "<option selected value=\"Q2\">Q2</option>"; else echo "<option value=\"Q2\">Q2</option>"; else echo "<option value=\"Q2\">Q2</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="Q3") echo "<option selected value=\"Q3\">Q3</option>"; else echo "<option value=\"Q3\">Q3</option>"; else echo "<option value=\"Q3\">Q3</option>";
	if (isset($_POST["stufe"])) if($_POST["stufe"]=="Q4") echo "<option selected value=\"Q4\">Q4</option>"; else echo "<option value=\"Q4\">Q4</option>"; else echo "<option value=\"Q4\">Q4</option>";
	echo "</select>";
}
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
<h1 class="print pc"><?php echo $ueberschrift; if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") echo ", ".$_POST["stufe"] ?></h1>
	<p class="print pc"><?php if (isset($_POST["stufe"])) { if(($_POST["stufe"]=="E1")||($_POST["stufe"]=="E2")) echo "Außer den Sprachen schreiben alle Fächer nur an einem der beiden Termine (FS = Fremdsprachen)."; if(($_POST["stufe"]=="Q1")||($_POST["stufe"]=="Q2")||($_POST["stufe"]=="Q3")||($_POST["stufe"]=="Q4")) echo "Die Profile legen ihre Klausuren selbst fest. (Vglkl. = Vergleichsklausur)"; } ?></p>
<img class="print_logo pc" width="50px" src="logo.png"> 
<?php 

	if (isset($_POST["kategorie"])) $sqlbase="SELECT * FROM termine WHERE Kategorie=".$_POST["kategorie"]." AND"; else $sqlbase="SELECT * FROM termine WHERE";
	if (isset($_POST["kategorie"])) if ($_POST["kategorie"]==0) $sqlbase="SELECT * FROM termine WHERE";
	$monat=date("n",strtotime($_POST['datum'])); 
	$monata=date("n");
	$jahr=date("Y",strtotime($_POST['datum'])); 
	$jahra=date("Y"); 
	$tag=date("j",strtotime($_POST['datum'])); 
	$taga=date("j");
	$wota = array("0","Mo", "Di", "Mi", "Do", "Fr", "Sa", "So");
	$mon = array("0","Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
	error_reporting(-1);

	
	function shortText($string,$lenght) {
	$original = $string;
    if(strlen($string) > $lenght) {

        $string = substr($string ?? '',0,$lenght)."...";

        $string_ende = strrchr($string, " ");

        $string = str_replace($string_ende," ... ", $string); 
		
		$string = "<div class=\"tooltip\"> ".$string." <span class=\"tooltiptext\">".$original."</span></div>  ";
		
		

    }

    return $string;

}


	?>
	<div class="pc">
	<table>
		<tr>
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $monat, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat, 1, $jahr)); ?>
			</th>
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $monat+1, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat+1, 1, $jahr)); ?>
			</th>			
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $monat+2, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat+2, 1, $jahr)); ?>
			</th>
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $monat+3, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat+3, 1, $jahr)); ?>
			</th>
			<th colspan="4">
		<?php echo $mon[date("n",mktime(0, 0, 0, $monat+4, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat+4, 1, $jahr)); ?>
			</th>
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $monat+5, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $monat+5, 1, $jahr)); ?>
			</th>
		</tr>
		
			<?php for($i=1;$i<32;$i++) {
				echo "<tr>";
				if ($i<=date("t",mktime(0, 0, 0, $monat, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}				  				  
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------
				if ($i<=date("t",mktime(0, 0, 0, $monat+1, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat+1, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+1, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat+1, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat+1, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+1, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat+1, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat+1, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat+1, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat+1, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+1, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat+1, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat+1, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------
				if ($i<=date("t",mktime(0, 0, 0, $monat+2, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat+2, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+2, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat+2, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat+2, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+2, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat+2, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat+2, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat+2, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat+2, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+2, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat+2, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat+2, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------
				if ($i<=date("t",mktime(0, 0, 0, $monat+3, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat+3, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+3, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat+3, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat+3, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+3, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat+3, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat+3, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat+3, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat+3, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+3, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat+3, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat+3, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------
				if ($i<=date("t",mktime(0, 0, 0, $monat+4, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat+4, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+4, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat+4, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat+4, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+4, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat+4, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat+4, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat+4, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat+4, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+4, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat+4, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat+4, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------
				if ($i<=date("t",mktime(0, 0, 0, $monat+5, 1, $jahr))) {
				if (mktime(0, 0, 0, $monat+5, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) $gray=""; else $gray=" gray";
				echo "<td class=\"tag".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+5, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $monat+5, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $monat+5, $i, $jahr))==7)))	echo "<td class=\"wota_mark".$gray."\">"; else echo "<td class=\"min".$gray."\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+5, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $monat+5, $i, $jahr))];
				echo "</td>";
			    if (mktime(0, 0, 0, $monat+5, $i, $jahr)>=mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"termin\">"; else echo "<td class=\"termingray\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $monat+5, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND (Beschreibung LIKE \"KLA:Nac%\" OR Beschreibung LIKE \"%".$_POST["stufe"]."%\")";
				
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				   if ($first) { echo "<div class=\"no-print\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    if (mktime(0, 0, 0, $monat+5, $i, $jahr)<mktime(0, 0, 0, $monata, $taga, $jahra)) echo "<td class=\"kwgr\">"; else echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $monat+5, 1, $jahr))) if (date("N",mktime(0, 0, 0, $monat+5, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $monat+5, $i, $jahr)); 
				echo "</td>";
				} else echo "<td class=\"tag\"></td><td class=\"min\"></td><td class=\"termin\"></td><td class=\"kw\"></td>";
//---------------------------------	
				echo "</tr>";
             }
	} ?>
	

	</table>
	</div>
	
<?php if (isset($_POST["kategorie"])) { ?>
	<div class="phone">
	<table>
	
	<?php for($m=$monat;$m<$monat+6;$m++) { ?>
	
	    <tr>
			<th colspan="4">
			<?php echo $mon[date("n",mktime(0, 0, 0, $m, 1, $jahr))]; ?>
			<?php echo date("y",mktime(0, 0, 0, $m, 1, $jahr)); ?>
			</th>
		</tr>
	
	
		
		
			<?php for($i=1;$i<32;$i++) {
				if ($i<=date("t",mktime(0, 0, 0, $m, 1, $jahr))) {
				echo "<tr>";
				
				echo "<td class=\"tag\">";
				if ($i<=date("t",mktime(0, 0, 0, $m, 1, $jahr))) echo $i;
		    	echo "</td>";
			    if ((date("N",mktime(0, 0, 0, $m, $i, $jahr))==6)||((date("N",mktime(0, 0, 0, $m, $i, $jahr))==7)))	echo "<td class=\"wota_mark\">"; else echo "<td class=\"min\">";
				if ($i<=date("t",mktime(0, 0, 0, $m, 1, $jahr))) echo $wota[date("N",mktime(0, 0, 0, $m, $i, $jahr))];
				echo "</td>";
			    echo "<td class=\"termin\">";
				$sql =$sqlbase." start LIKE \"".date("Ymd",mktime(0, 0, 0, $m, $i, $jahr))."%\"";
				if (isset($_POST["stufe"])) if($_POST["stufe"]<>"0") $sql .= " AND Beschreibung LIKE \"%".$_POST["stufe"]."%\"";
				$statement = $mysqli->prepare($sql);
				$statement->execute();
				$result = $statement->get_result();
				$first=true;
				$counter=0;
				$tooltip="";
				while($row = $result->fetch_object()) {  
				   if (substr($row->Start ?? '',8,1)=="T") $Titel=$row->Titel." (".substr($row->Start,9,2).":".substr($row->Start,11,2).")"; else $Titel=$row->Titel;
				   if (substr($row->Start ?? '',0,8)<>substr($row->Ende,0,8)) $Titel = $Titel." bis ".substr($row->Ende,6,2).".".substr($row->Ende,4,2).".".substr($row->Ende,0,4);
				    if ($first) { echo "<div class=\"no-print pc\">".shortText($Titel,30)."</div>"; echo "<div class=\"print\">".$Titel."</div>";	$first=false; } else { $counter++; if($counter==1) $tooltip .=$Titel; else $tooltip .="<br>".$Titel;}
				}
				if ($counter>0) echo "<div class=\"tooltip\"><div class=\"no-print pc\">(+".$counter.")</div><span class=\"tooltiptext\">".$tooltip."</span></div>";
				echo "</td>";	
			    echo "<td class=\"kw\">";
				if ($i<=date("t",mktime(0, 0, 0, $m, 1, $jahr))) if (date("N",mktime(0, 0, 0, $m, $i, $jahr))==1) echo date("W",mktime(0, 0, 0, $m, $i, $jahr)); 
				echo "</td>";
			}
			}
	}
	?>
	</div>
<?php } ?>
	
<div class="print pc">Dies ist ein automatisch generierter Ausdruck. Änderungen vorbehalten. Angaben ohne Gewähr.</div>
<script>
function myFunction() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
</script>
</body>
</html>

