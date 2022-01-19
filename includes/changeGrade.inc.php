<?php
session_start();

require_once("generalFunctions.php");
require_once("userSystem/functions/generalFunctions.php");
require_once("dbh.incPDO.php");
require_once("userSystem/functions/email-functions.php");
require_once("userSystem/activateAccount.inc.php");

if (!isLoggedIn()) {
    header("Location: /login.php");
    die();
}

$userID = $_SESSION["userID"];

$database = new Dbh();
$conn = $database->connect();


if (isset($_POST["setKlassenstufeToUserInDatabase"])) {
    $choice = $_POST["grade"];
    if (!empty($choice)) {
        if (!checkKlassenstufe($conn, "userCanBe", 1, $choice)) {
            echo "Der Benutzer kann die Klassenstufe $choice nicht annehmen. Siehe Klassenstufenverwaltung";
            die();
        }
    } else {
        $choice = null;
    }
    setParameterFromUser($conn, $userID, "klassenstufe", $choice, "userID");
    $stmt = null;
    die();
}

if (isset($_POST["getKlassenstufenUsersCanTake"])) {
    $getKlassenstufenUsersCanchoose = getKlassenstufenWhere($conn, "userCanBe", 1);
    echo json_encode($getKlassenstufenUsersCanchoose);

    $stmt = null;
    die();
}

if (isset($_POST["getSelectedKlassenstufeFromUser"])) {
    echo getParameterFromUser($conn, $userID, "klassenstufe", "userID");
    $stmt = null;
    die();
}
