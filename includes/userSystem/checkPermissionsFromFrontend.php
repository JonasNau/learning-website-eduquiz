<?php

require_once("../generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("functions/generalFunctions.php");
require_once("../getSettings.php");
require_once("./functions/permission-functions.php");
require_once("./autologin.php");

require_once("../../global.php");

mustBeLoggedIn();

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];

setPermissionGroup($conn, "PA-Gruppe", "accessOverview", 1);
// setPermissionGroup($conn, "PA-Gruppe", "accessThemenverwaltung", 1);
//setPermissionGroup($conn, "PA-Gruppe", "faecherverwaltungADDandREMOVE", 1);

// setParameterFromPermissions($conn, "accessSettings", "ranking", 4);
// setParameterFromPermissions($conn, "doEverything", "ranking", 4);
// setParameterFromPermissions($conn, "loginEverytime", "ranking", 0);
// setParameterFromPermissions($conn, "editChoosenUsers", "ranking", 3);
// setParameterFromPermissions($conn, "accessUserdata", "ranking", 1);
// setParameterFromPermissions($conn, "benutzerverwaltungChangeUsername", "ranking", 3);
// setParameterFromPermissions($conn, "getParameterFromUser", "ranking", 1);
// setParameterFromPermissions($conn, "benutzerverwaltungChangeEmail", "ranking", 3);
// setParameterFromPermissions($conn, "benutzerverwaltungChangeKlassenstufe", "ranking", 3);
// setParameterFromPermissions($conn, "benutzerverwaltungChangeAuthenticated", "ranking", 3);

if (isset($_POST["checkPermissions"])) {
    $data = json_decode($_POST["permissions"]);
    if (!$data) {echo "permission denied"; die();}

    foreach ($data as $currentPermission) {
        $value = gnVP($conn, $currentPermission);
        if (!userHasPermissions($conn, $userID, [$currentPermission=>$value])) {
            $returnArray = array();
            $returnArray["permissionStatus"] = "permission denied";
            echo json_encode($returnArray);
            die();
        } 
    }
    echo 1;
    die();
}