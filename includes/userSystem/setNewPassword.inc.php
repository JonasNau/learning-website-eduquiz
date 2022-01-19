<?php
require_once 'header-start.php';
session_start();

require_once("../generalFunctions.php");
require_once("./functions/generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("./setNewPassword.inc.php");
require_once("./resetPassword.inc.php");
require_once("./functions/login-functions.php");
require_once("./functions/password-check-functions.php");


// require_once("includes/userSystem/functions/email-functions.php");
// require_once("includes/userSystem/activateAccount.inc.php");
if (!isset($_POST["submitchangePassword"])) {
    header("Location: /index.php?buttonnotklicked");
    die();
}

$tokenBin = hex2bin($_GET["validator"]);
$token = bin2hex($tokenBin);
$selector = $_GET["selector"];

                                                                                                                
if (isset($_GET["selector"]) == false || isset($_GET["validator"]) == false) {
    $_SESSION["message"] = "Fehlende Parameter.";
    header("Location: /index.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();


#Check if exists
if (!getParameterPwdReset($conn, "userID", $selector, "selector")) {
    $_SESSION["message"] = "Ungültiger Aktivierungslink.";
    header("Location: /index.php");
    die();
}
$userID = getParameterPwdReset($conn, "userID", $selector, "selector");
$username = getParameterPwdReset($conn, "username", $userID, "userID");

if (pwdTokenExpired($conn, $selector, "selector")) {
    $_SESSION["message"] = "Link abgelaufen.";
    header("Location: resetpassword.php");
    die();
}


#get Validator hashed and verify
$validatorDB = "";
if (!$validatorDB = getParameterPwdReset($conn, "validator", $selector, "selector")) {
    $_SESSION["message"] = "Ungültiger Aktivierungslink (2)";
    header("Location: index.php");
    die();
}

if (!password_verify($tokenBin, $validatorDB)) {
    $_SESSION["message"] = "Ungültiger Aktivierungslink (3)";
    header("Location: index.php");
    die();
}

$newPassword = $_POST["newPassword"];
$newPasswordRepeat = $_POST["newPassword"];

if (!checkPassword($newPassword)) {
    $token = bin2hex($tokenBin);
    header("Location: /setNewPassword.php?selector=$selector&validator=$token");
    die();
}



if (empty($newPassword) || empty($newPasswordRepeat)) {
    $_SESSION["message"] = "Gebe dein neues Passwort ein.";
    header("Location: /setNewPassword.php?selector=$selector&validator=$token");
    die();
}


if ($newPassword != $newPasswordRepeat) {
    $_SESSION["message"] = "Die Passwörter stimmen nicht überein.";
    header("Location: /setNewPassword.php?selector=$selector&validator=$token");
    die();
}

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);


if (setNewPassword($conn, $userID, $hashedPassword)) {
    deleteOldPwdEntry($conn, $userID, "userID");
    session_unset();
    session_destroy();
    session_start();
    $_SESSION["message"] = "Passwort erfolgreich gesetzt. Du kannst dich jetzt anmelden.";
    header("Location: /login.php");
    die();
} else {
    $_SESSION["message"] = "Ein Fehler ist aufgetreten. Versuche es erneut.";
    header("Location: /resetpassword.php");
    die();
}