<?php
/** Veraltet **


$verbindung = mysql_connect ($server,$dbuser,$dbpass) or die ("Keine Verbindung möglich. Benutzername oder Passwort sind falsch");
mysql_query("SET NAMES 'utf8'");  
mysql_select_db($database) or die ("Die Datenbank existiert nicht."); 

**/

include('settingsold.php' );
$mysqli = new mysqli($server,$dbuser,$dbpass, $database);
if ($mysqli->connect_errno) {
    die("Verbindung fehlgeschlagen: " . $mysqli->connect_error);
}
//printf("Initial character set: %s\n", $mysqli->character_set_name());

/* change character set to utf8 */
if (!$mysqli->set_charset("utf8")) {
  //  printf("Error loading character set utf8: %s\n", $mysqli->error);
    exit();
} else {
 //   printf("Current character set: %s\n", $mysqli->character_set_name());
}

?>
