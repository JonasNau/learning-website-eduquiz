<?php
session_start();
require_once("../generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("functions/generalFunctions.php");
require_once("functions/email-functions.php");
require_once("activateAccount.inc.php");
require_once("confirmAccount.php");
require_once("../getSettings.php");
require_once("activateAccount.inc.php");
require_once ("../sendmail.php");
require_once '../PHPmailer/PHPMailer.php';
require_once '../PHPmailer/Exception.php';
require_once '../PHPmailer/SMTP.php';


if (!isLoggedIn()) {
    $_SESSION["message"] = "Um die Funktion zu nutzen melde dich bitte an.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];

checkAccount($conn, $userID);


if (getParameterFromUser($conn, $userID, "authenticated", "userID") == "1") {
    $email = getParameterFromUsername($conn, $username, "email");
    $_SESSION["message"] = "Dein Account hat schon eine bestätigte E-Mail-Adresse: $email";
    header("Location: /account.php");
    die();
} else {
    if (hasAskedForActivation($conn, $userID, "userID")) {
        $email = getParameterFromConfirmAccount($conn, "email", $userID, "userID");
        if (confirmAccountExpired($conn, $email, "email")) {
            confirmAccount($conn, $email, $username);
            $_SESSION["message"] = "Dein alter Token ist abgelaufen, deshalb haben wir dir einen neuen Aktivierungstoken gesendet.";
            header("Location: /account.php");
            die();
        } else {
            $now = date("d-m-Y H:i:s e");
            $cooldown= getParameterFromConfirmAccount($conn, "nextSend", $userID, "userID");
            
            $dateFrom = new DateTime($now); 
            $dateTo = new DateTime($cooldown);
            $difference = ($dateTo->getTimestamp()-$dateFrom->getTimestamp());

            if ($difference < 0) {
                deleteOldConfirmEntry($conn, $userID, "userID");
                confirmAccount($conn, $email, $userID);
                $_SESSION["message"] = "Email gesendet. Klicke jetzt auf den Aktivierungslink in der E-Mail.";
                header("Location: /account.php");
                die();
            } else {
                $wait = $difference;
                $_SESSION["message"] = "Du musst noch $difference Sekunden warten, bis du einen neuen Token anfordern kannst.";
                header("Location: /addEmail.php");
            }
        }
    } else {
        $_SESSION["message"] = "Wohin soll die Email gehen?";
        header("Location: /addEmail.php");
        die();
    }
}