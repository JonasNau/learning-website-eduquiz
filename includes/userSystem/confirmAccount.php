<?php

// require_once ("../sendmail.php");

// require_once '../PHPmailer/PHPMailer.php';
// require_once '../PHPmailer/Exception.php';
// require_once '../PHPmailer/SMTP.php';

#require_once ("generalFunctions.php in userSystem/..);
#require_once ("getSettings.php in includes/..")

function confirmAccount($conn, $email, $userID)
{
    $username = getParameterFromUser($conn, $userID, "username", "userID");
    if (getParameterFromUser($conn, $email, "authenticated", "email") == "1") {
        deleteOldConfirmEntry($conn, $email, "email");
        $_SESSION["message"] = "Die E-Mail ist schon vergeben.";
        header("location: /addEmail.php");
        die();
    }
    #check if account is already confirmed
    if (getParameterFromUser($conn, $userID, "authenticated	", "userID") == 1) {
        $_SESSION["message"] = "Account ist schon bestätigt.";
        header("Location: /index.php");
        die();
    }

    $servername = getSettingVal($conn, "servername");

    //Create URL and token
    $selector = bin2hex(random_bytes(8));
    $token = random_bytes(32);
    $hashedToken = password_hash($token, PASSWORD_DEFAULT);
    $url = "https://$servername/activateAccount.php?selector=" . $selector . "&validator=" . bin2hex($token);
    //Set exipre Date

    $duration = 43200;
    $expires = date("d-m-Y H:i:s e", strtotime("+$duration sec"));
    $now = DateTime::createFromFormat('U.u', microtime(true));
    $now = $now->format("d-m-Y H:i:s.u e");

    $duration = 300;
    $cooldown = date("d-m-Y H:i:s e", strtotime("+$duration sec"));

    try {
        $stmt = $conn->prepare("INSERT INTO confirmAccount (email, userID, username, selector, validator, expires, lastSent, nextSend) VALUES (?, ?, ? , ?, ?, ?, ?, ?);");
        if ($stmt->execute([$email, $userID, $username, $selector, $hashedToken, $expires, $now, $cooldown])) {
            if ($stmt->rowCount()) {
                $subject = 'Aktiviere deinen Account bei Eduquiz!';
                $msgHTML = "<b><p>Hallo $username,</b></p><p>willkommen bei Eduquiz. Um deinen Account zu bestätigen klicke auf folgenden Link -> <a href='" . $url . "'> Gültig bis $expires Aktiviere deinen Account bei Eduquiz.</a></p><p>Mit der Bestätigung deines Accounts kannst du dich dann auch mit deiner E-Mail-Adresse anmelden.</p>";
                $altBody = 'Aktiviere deinen Account:' . $url;
                sendEmail($email, $subject, $msgHTML, $altBody);
                return true;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }

    return false;
}
