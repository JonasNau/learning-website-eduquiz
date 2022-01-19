<?php
session_start();
require_once("../getSettings.php");
require_once("functions/login-functions.php");
require_once("../generalFunctions.php");
require_once("functions/generalFunctions.php");
require_once("./functions/permission-functions.php");

require_once("../dbh.incPDO.php");
$database = new Dbh();
$conn = $database->connect();

if (isset($_SESSION["loggedin"])) {
    returnMessage("success", "Du bist schon angemeldet.", "account.php");
    die();
}

if (!isset($_POST["submitLogin"])) {
    returnMessage(false, "Um dich anzumelden musst du auf den 'Anmelden'-Knopf bei /login.php drücken.");
    die();
}

if (getSettingVal($conn, "")) {

}

$userInput = $_POST["username"];
$password = $_POST["password"];
$stayLoggedIn = false;
if (isset($_POST["stayloggedIn"])) {
    $stayLoggedIn = json_validate($_POST["stayloggedIn"]);
}

if (empty($userInput)) {
    returnMessage(false, "Du musst einen Benutzernamen oder eine E-Mail zum Anmelden angeben.");
    die();
}

if (empty($password)) {
    returnMessage(false, "Das Passwortfeld ist leer. Bitte gebe dein Passwort ein.");
    die();
}

$hash = false;
$userID = null;

if (isEmail($userInput)) {
    #format the email correctly -> Jonasnaumann06@gmail.com -> jonasnaumann06@gmail.com
    $email = formatEmail($userInput);
    $userID = getParameterFromUser($conn, $userInput, "userID", "email");
    $hash = getParameterFromUser($conn, $userID, "password", "userID");
} else {
    $userID = getParameterFromUser($conn, $userInput, "userID", "username");
    $hash = getParameterFromUser($conn, $userID, "password", "userID");
}





if ($hash === false) {
    logWrite($conn, "login", "Login failed (user does not exist)| username: $userInput-> " . $_SERVER['REMOTE_ADDR']);
    returnMessage(false, "Falscher Benutzername oder Passwort (oder E-Mail noch nicht aktiviert)", true, false, "yellow");
    die();
} else {
    // Überprüfe den gespeicherten Hash gegen das Klartextkennwort
    if (password_verify($password, $hash)) {
        // Prüfe ob ein neuerer Hash-Algorithmus verfügbar ist oder sich der Aufwand (cost) geändert hat
        pwdNeedsRehash($conn, $userID, $hash, $password);
        if (loginUser($conn, $userID)) {
            if ($stayLoggedIn === true) {
                stayLoggedIn($conn, $userID);
            }
            returnMessage("success", "Erfolgreich eingeloggt.", "account.php");
        }
        die();
    } else {
        logWrite($conn, "login", "Login failed (wrong password) | username: $userInput ->"  . $_SERVER['REMOTE_ADDR'], true, false, "red");
        returnMessage(false, "Falscher Benutzername oder Passwort. (oder E-Mail noch nicht aktiviert)");
        die();
    }
}

header("location: /index.php");