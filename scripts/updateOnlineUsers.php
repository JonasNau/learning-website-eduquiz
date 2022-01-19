<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");

$database = new Dbh();
$conn = $database->connect();

if (updateOnlineStatus($conn)) {
    $name = "usersOnline";
    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");

    lastUpdate($conn, $name, $timeNow);

    $onlineUsers = getNumOnlineUsers($conn);
    echo "Updated Online Users. $onlineUsers online.\n";
} else {
    echo "error";
}