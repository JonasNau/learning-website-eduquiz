<?php

require_once("./generalFunctions.php");
require_once("./dbh.incPDO.php");
require_once("./userSystem/functions/generalFunctions.php");
require_once("./getSettings.php");
require_once("./userSystem/functions/permission-functions.php");
require_once("./userSystem/autologin.php");

require_once("../global.php");

mustBeLoggedIn();

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];

if (isset($_POST["getParameterFromUser"])) {

    if (!userHasPermissions($conn, $userID, ["getParameterFromUser"=>1])) {
        echo "permission denied";
        die();
    }
    $givenUserID = $_POST["userID"];
    $parameter = $_POST["parameter"];

    $userValue = getParameterFromUser($conn, $givenUserID, $parameter, "userID");
    echo $userValue;
}