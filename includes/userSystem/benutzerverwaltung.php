<?php

require_once("../generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("./functions/permission-functions.php");
require_once("./functions/generalFunctions.php");
require_once("../getSettings.php");

$database = new Dbh();
$conn = $database->connect();

require_once("./global.php");

if (!isLoggedIn()) {
    echo "Du bist nicht eingeloggt.";
    die();
}

$userID = $_SESSION["userID"];

if(isset($_POST["benutzerverwaltungGetUsers"])) {
    
}