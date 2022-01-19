<?php

session_start();

require_once("../generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("functions/generalFunctions.php");
require_once("functions/email-functions.php");
require_once("../getSettings.php");
require_once("./resetPassword.inc.php");

require_once("../sendmail.php");

require_once '../PHPmailer/PHPMailer.php';
require_once '../PHPmailer/Exception.php';
require_once '../PHPmailer/SMTP.php';


$database = new Dbh();
$conn = $database->connect();

if (!isset($_POST["submitResetPassword"])) {
    header("Location: /resetpassword.php");
    die();
}

$postedInput = $_POST["email"];
$isEmail = true;

if (isEmail($postedInput)) {
    $isEmail = true;
    #email richtig formatieren
    $postedInput = formatEmail($postedInput);

    if (getParameterFromUser($conn, $postedInput, "userID", "email") == false) {
        $_SESSION["message"] = "Die E-Mail-Adresse ist mit keinem Nutzer verknüpft. Sorry!";
        header("Location: /resetpassword.php");
        die();
    }
} else {
    $isEmail = false;
    if (getParameterFromUser($conn, $postedInput, "email", "username") == false) {
        $_SESSION["message"] = "Es gibt keinen Benutzer mit dem namen $postedInput.";
        header("Location: /resetpassword.php");
        die();
    }
}


#User exists
$email = "";
$username = "";
$userID = "";

if (isEmail($postedInput)) {
    $userID = getParameterFromUser($conn, $postedInput, "userID", "email");
    $email = getParameterFromUser($conn, $userID, "email", "userID");
    $username = getParameterFromUser($conn, $userID, "username", "userID");
} else {
    $userID = getParameterFromUser($conn, $postedInput, "userID", "username");
    $email = getParameterFromUser($conn, $userID, "email", "userID");
    $username = getParameterFromUser($conn, $userID, "username", "userID");
}



#Do everything for E-Mail
if (getParameterPwdReset($conn, "userID", $userID, "userID")) {
    if (pwdResetCooldown($conn, $userID, "userID")) {
        $cooldown = getCooldown($conn, $userID, "userID");
        $_SESSION["message"] = "Du musst noch $cooldown Sekunden warten, bis du eine neue Anfrage senden kannst";
        header("location: /resetpassword.php");
        die();
    } else {
        deleteOldPwdEntry($conn, $userID, "userID");
        if (createResetRequest($conn, $email, $username, $userID)) {
            $_SESSION["message"] = "Email an gesendet! Überprüfe dein Postfach.";
            header("location: /index.php");
            die();
        }
    }
} else {
    #Has not asked
    if (createResetRequest($conn, $email, $username, $userID)) {
        $_SESSION["message"] = "Email an $email gesendet!";
        header("location: /index.php");
        die();
    }
}
