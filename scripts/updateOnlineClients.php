<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");

// if(isLoggedIn()) {
//     echo "Permission Denied";
//     die();
// }

$database = new Dbh();
$conn = $database->connect();

if (connectedClientsUpdateOnlineStatus($conn)) {
    $name = "onlineClients";
    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");

    lastUpdate($conn, $name, $timeNow);

    $onlineClients = getNumOnlineClients($conn);
    echo "Updated Online Clients. $onlineClients online.\n";
}
