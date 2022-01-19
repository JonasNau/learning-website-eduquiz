<?php
session_start();

if (isset($_POST["submitaddEmail"]))
require_once("../sendmail.php");
require_once '../PHPmailer/PHPMailer.php';
require_once '../PHPmailer/Exception.php';
require_once '../PHPmailer/SMTP.php';
require_once("../generalFunctions.php");
require_once("../dbh.incPDO.php");
require_once("functions/generalFunctions.php");
require_once("functions/email-functions.php");
require_once("activateAccount.inc.php");
require_once("confirmAccount.php");
require_once("../getSettings.php");
require_once("activateAccount.inc.php");
require_once("./functions/email-functions.php");
require_once("./functions/permission-functions.php");


if (!isLoggedIn()) {
    $_SESSION["message"] = "Um eine E-Mail hinzuzufügen melde dich bitte an.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();

$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

$postedEmail = formatEmail($_POST["email"]);
accountExists($conn, $userID);

if (getParameterFromUser($conn, $userID, 'authenticated', "userID") == "1") {

    $email = getParameterFromUser($conn, $userID, "email", "userID");
    $_SESSION["message"] = "Dein Account hat schon eine bestätigte E-Mail-Adresse: $email";
    header("Location: /account.php");
    die();
} else {
    if (hasAskedForActivation($conn, $userID, "userID")) {
        $email = getParameterFromConfirmAccount($conn, "email", $userID, "userID");

        if ($email != $postedEmail) {
            deleteOldConfirmEntry($conn, $userID, "userID");
            if (hasAskedForActivation($conn, $postedEmail, "email")) {
                if (confirmAccountExpired($conn, $postedEmail, "email")) {
                    if (confirmAccount($conn, $postedEmail, $userID)) {
                        $_SESSION["message"] = "Deine E-Mail-Adresse zum aktivieren wurde von <b>$email</b> auf <b>$postedEmail</b> geändert.";
                        header("Location: /addEmail.php");
                        die();
                    }
                }
            } else {
                if (getParameterFromUser($conn, $postedEmail, 'authenticated', "email") != "1") {
                    if (confirmAccount($conn, $postedEmail, $userID)) {
                        $_SESSION["message"] = "Deine E-Mail-Adresse zum aktivieren wurde von <b>$email</b> auf <b>$postedEmail</b> geändert.";
                        header("Location: /addEmail.php");
                        die();
                    }
                } else {
                    $_SESSION["message"] = "Es existiert schon ein aktivierter Account mit der E-Mail-Adresse $postedEmail";
                    header("Location: /addEmail.php");
                    die();
                }
            }
        } else {
            if (confirmAccountExpired($conn, $userID, "userID")) {
                deleteOldConfirmEntry($conn, $userID, "userID");
                $_SESSION["message"] = "Dein alter angeforderter Token an <b>$email</b> ist abgelaufen. Frage erneut einen an.";
                header("Location: /addEmail.php");
                die();
            }
            $now = date("d-m-Y H:i:s");

            $cooldown = getParameterFromConfirmAccount($conn, "nextSend", $userID, "userID");

            $dateFrom = new DateTime($now);
            $dateTo = new DateTime($cooldown);
            $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());


            if ($difference < 0) {
                $_SESSION["message"] = "Du hast noch einen gültigen Token an die E-Mail-Adresse: <b>$email</b> gesendet. <a href='/includes/userSystem/sendNewToken.php'>erneute senden?</a>";
                header("Location: /account.php");
                die();
            } else {
                $_SESSION["message"] = "Du hast noch einen gültigen Token an die E-Mail-Adresse: <b>$email</b> gesendet. In $difference Sekunden erneut senden <a href='/includes/userSystem/sendNewToken.php'>erneute senden?</a>";
                header("Location: /account.php");
                die();
            }
        }
    }
}



if (!isEmail($postedEmail)) {
    $_SESSION["message"] = "Kein gülitges Format für eine Email-Adresse. Sorry!";
    header("Location: addEmail.php");
    die();
}
#email richtig formatieren
$postedEmail = formatEmail($postedEmail);
#überprüfen, ob email schon vorhanden ist oder schon einen Token besitzt
if (hasAskedForActivation($conn, $postedEmail, "email")) {
    $_SESSION["message"] = "Ein Token für $postedEmail wude schon angefragt.";
    header("Location: /account.php");
    die();
} else {
    confirmAccount($conn, $postedEmail, $userID);
    $_SESSION["message"] = "Die Email wurde gesendet. Der Aktivierungslink ist 12h gültig. Wenn du ihn nicht anklickst, dann verfällt der Link und die Anfrage wird automatisch gelöscht.";
    header("Location: /account.php");
    die();
}
