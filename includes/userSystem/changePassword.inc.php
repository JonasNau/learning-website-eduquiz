<?php
session_start();

require_once("../generalFunctions.php");
require_once("./functions/generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("./functions/email-functions.php");
require_once("./activateAccount.inc.php");
require_once("./functions/password-check-functions.php");
require_once("./functions/login-functions.php");


if (!isLoggedIn()) {
    $_SESSION["message"] = "Um dein Passwort zu ändern musst du dich anmelden.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
accountExists($conn, $userID);

if (isset($_POST["submitchangePassword"])) {
    $oldPassword = $_POST["oldPassword"];
    $newPassword = $_POST["newPassword"];
    $newPasswordRepeat = $_POST["newPasswordRepeat"];

    #Check if empty
    if (empty($oldPassword)) {
        $_SESSION["message"] = "Gebe dein altes Passwort ein.";
        header("Location: /changePassword.php");
        die();
    }
    if (empty($newPassword)) {
        $_SESSION["message"] = "Gebe ein neues Passwort ein.";
        header("Location: /changePassword.php");
        die();
    }
    if (empty($newPasswordRepeat)) {
        $_SESSION["message"] = "Wiederhole das neue Passwort.";
        header("Location: /changePassword.php");
        die();
    }

        #Check Users Input


    if (!checkPassword($newPassword)) {
        header("Location: /changePassword.php");
        die();
    }
    $passwordDB = getParameterFromUser($conn, $userID, "password", "userID");

    if (!password_verify($oldPassword, $passwordDB)) {
        $_SESSION["message"] = "Das eingegebene Password stimmt nicht. Versuche es erneut.";
        header("Location: /changePassword.php");
        die();
    }

    if ($newPassword !== $newPasswordRepeat) {
        $_SESSION["message"] = "Das neue Passwort und das neue wiederholte Passwort stimmen nicht überein.";
        header("Location: /changePassword.php");
        die();
    } else {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        if (setNewPassword($conn, $userID, $hashedPassword)) {
            $_SESSION["message"] = "Passwort erfolgreich geändert.";
            header("Location: /account.php");
            die();
        }
    }

    $_SESSION["message"] = "Ein Fehler ist aufgetreten. Das Passwort konnte nicht geändert werden.";
    header("Location: /index.php");
    die();
}
