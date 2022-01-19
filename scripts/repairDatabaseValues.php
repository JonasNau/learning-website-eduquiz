<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");
require_once("/var/www/webseite/includes/organisationFunctions.inc.php");

$database = new Dbh();
$conn = $database->connect();

logWrite($conn, "organisationLOG", "REPAIR_PROCESS: START BY SYSTEM", true);
if (repairDatabaseValues($conn)) {
    $name = "repairDatabaseValues";
    $now = getCurrentDateAndTime(1);
    lastUpdate($conn, $name, $timeNow);

    $onlineClients = getNumOnlineClients($conn);
    echo "Updated Online Clients. $onlineClients online.\n";
}

logWrite($conn, "organisationLOG", "REPAIR_PROCESS: END BY SYSTEM", true);
