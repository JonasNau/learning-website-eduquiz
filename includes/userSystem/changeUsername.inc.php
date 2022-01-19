<?php
session_start();
require_once("../dbh.incPDO.php");
require_once("../generalFunctions.php");
require_once("functions/generalFunctions.php");
require_once("../getSettings.php");
require_once("./activateAccount.inc.php");
require_once("./functions/permission-functions.php");
require_once("./resetPassword.inc.php");
require_once("./autologin.php");
require_once("../../global.php");
if (!isLoggedIn()) {
    $_SESSION["message"] = "Um deinen Nutzernamen zu ändern musst du dich anmelden.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

checkAccount($conn, $userID);

if (!isset($_POST["submitchangeUsername"])) {
    $_SESSION["message"] = "Um deinen Benutzernamen zu ändern musst du auf den Button klicken. Anders ist es nicht möglich. Wenn du hier bist kennst du dich auf jeden Fall mit Backend aus :)";
    header("Location: /changeUsername.php");
    die();
}

$newUsername = $_POST["newUsername"];

if (empty($newUsername)) {
    $_SESSION["message"] = "Gebe einen neuen Namen ein.";
    header("Location: /changeUsername.php");
    die();
}

if ($newUsername == $username) {
    $_SESSION["message"] = "Keine Veränderung vorgenommen. Das ist dein aktueller Nutzername.";
    header("Location: /changeUsername.php");
    die();
}

if (usernameExists($conn, $newUsername) == true) {
    $_SESSION["message"] = "Der Nutzername ist schon vergeben.";
    header("Location: /changeUsername.php");
    die();
}

if (setParameterFromUser($conn, $userID, "username", $newUsername, "userID")) {
    deleteOldConfirmEntry($conn, $userID, "userID");
    deleteOldPwdEntry($conn, $username, "username");
    $_SESSION["message"] = "Nutzername erfolgreich geändert.";
    $_SESSION["username"] = $newUsername;
    header("Location: /account.php");
    die(); 
} else {
    $_SESSION["message"] = "Ein Fehler ist aufgetreten. Nutzername nicht aktualisiert.";
    header("Location: /account.php");
    die(); 
}
