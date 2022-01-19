<?php

session_start();

require_once("../generalFunctions.php");
require_once("functions/generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("./functions/email-functions.php");
require_once("functions/deleteAccount-functions.php");
require_once("activateAccount.inc.php");

if (!isLoggedIn()) {
    $_SESSION["message"] = "Um diese Funktion zu nutzen melde dich an.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");
$email = getParameterFromUser($conn, $userID, "email", "userID");
checkAccount($conn, $userID);

if (!isset($_POST["submitdeleteAccount"])){
    $_SESSION["message"] = "Um deinen Account zu löschen musst du auf den Button dazu drücken.";
    header("Location: /account.php");
    die();
}

    if (deleteAccount($conn, $userID)) {
        session_unset();
        session_destroy();
        session_start();
        
        $_SESSION["message"] = "Erfolgreich gelöscht.";
        header("Location: /includes/userSystem/logout.inc.php");
        die();
    } else {
        session_unset();
        session_destroy();
        session_start();
        $_SESSION["message"] = "Ein Fehler ist aufgetreten";
        header("Location: /index.php");
        die();
    }

