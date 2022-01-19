<?php

session_start();

require_once("../generalFunctions.php");
require_once("functions/generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("functions/email-functions.php");

if (!isLoggedIn()) {
    $_SESSION["message"] = "Um diese Funktion zu nutzen melde dich an.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
userExists($conn, $userID);

if (getParameterFromUser($conn, $userID, "authenticated", "userID") != "1") {
    $_SESSION["message"] = "Bei deinem Account ist noch keine aktivierte E-Mail hinzugefügt, die du löschen könntest.";
    header("Location: /account.php");
    die();
}

if (!isset($_POST["submitremoveEmail"])){
    $_SESSION["message"] = "Um deine Email zu entfernen musst du auf den Button auf der E-Mail-entfernen-Seite klicken.";
    header("Location: /account.php");
    die();
}

if (unAuthorizeUser($conn, $userID) != false) {
    if (removeEmailFromAccount($conn, $userID)) {
        $_SESSION["message"] = "E-Mail erfolgreich entfernt.";
        header("Location: /account.php");
        die();
    }
    $_SESSION["message"] = "Ein Fehler beim Entfernen ist aufgetreten. Versuche es erneut.";
        header("Location: /account.php");
        die();
}

