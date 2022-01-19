<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");
require_once("/var/www/webseite/includes/organisationFunctions.inc.php");

$database = new Dbh();
$conn = $database->connect();

logWrite($conn, "logDelete", "START", true);


function deleteOldLogs($conn)
{
    $olderThan = intval(getSettingVal($conn, "logDeleteTime"));
    if (!$olderThan) {
        logWrite($conn, "logDelete", "No older than value found", true, true, ["red"]);
        return false;
    }
    $path = getSettingVal($conn, "logFolder");
    $sum = remove_files_from_dir_older_than_x_seconds($conn, $path, $olderThan);
    RemoveEmptySubFolders($path);
    return $sum;
}


if ($num = intval(deleteOldLogs($conn))) {
    logWrite($conn, "logDelete", "Old Logs deleted ($num)", true);
} else {
    logWrite($conn, "logDelete", "No logs deleted Num:($num)", true, true);
}


//Clear live Folder
$path = getSettingVal($conn, "logFolder");
array_map( 'unlink', array_filter((array) glob("$path/live/*") ) );



logWrite($conn, "logDelete", "END", true);
