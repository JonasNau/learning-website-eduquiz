<?php

function createResetRequest($conn, $email, $username, $userID)
{
    $result = false;

    $servername = getSettingVal($conn, "servername");

    //Create URL and token
    $selector = bin2hex(random_bytes(8));
    $token = random_bytes(32);
    $hashedToken = password_hash($token, PASSWORD_DEFAULT);
    $url = "https://$servername/setNewPassword.php?selector=" . $selector . "&validator=" . bin2hex($token);
    //Set exipre Date

    $duration = 43200;
    $expires = date("d-m-Y H:i:s e", strtotime("+$duration sec"));
    $now =  date("d-m-Y H:i:s e");

    $duration = 300;
    $cooldown = date("d-m-Y H:i:s e", strtotime("+$duration sec"));

    try {
        $stmt = $conn->prepare("INSERT INTO resetPassword (email, userID, username, selector, validator, expires, lastSent, nextSend) VALUES (?, ?, ?, ? , ?, ?, ?, ?);");
        if ($stmt->execute([$email, $userID, $username, $selector, $hashedToken, $expires, $now, $cooldown])) {
            if ($stmt->rowCount()) {
                $subject = 'Passwort vergessen (Eduquiz)';
                $msgHTML = "<p><b>Hallo $username</b>,</p><p> du hast das Zurücksetzen des Passwortes angefordert. Um dein Passwort zurückzückzusetzen klicke hier -> <a href='$url'>Passwort zurücksetzen<a>. Gültig bis $expires</p>";
                $altBody = 'Setze dein Passwort zurück' . $url;
                if (sendEmail($email, $subject, $msgHTML, $altBody)) {
                    return true;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function pwdTokenExpired($conn, $username, $type)
{
    $now = date("d-m-Y H:i:s e");

    try {
        $stmt = $conn->prepare("SELECT expires FROM resetPassword WHERE $type = ?; ");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {
                $fetch = $stmt->fetch(PDO::FETCH_ASSOC);
                $dbTime = $fetch["expires"];
                $dateFrom = new DateTime($now);
                $dateTo = new DateTime($dbTime);
                $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());

                if ($difference < 0) {
                    deleteOldPwdEntry($conn, $username, $type);
                    return true;
                } else {
                    return false;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    echo "here";
    die();
}


function deleteOldPwdEntry($conn, $username, $type)
{
    try {
        $stmt = $conn->prepare("DELETE FROM resetPassword WHERE $type = ?");
        if ($stmt->execute([$username])) {
            return true;
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return false;
}


function getParameterPwdReset($conn, $parameter, $username, $type)
{
    $result = false;

    try {
        $stmt = $conn->prepare("SELECT $parameter FROM resetPassword WHERE $type = ?");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {

                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data[$parameter];
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return $result;
}

function pwdResetCooldown($conn, $username, $type)
{
    $now = date("d-m-Y H:i:s e");
    $cooldown = getParameterPwdReset($conn, "nextSend", $username, $type);

    $dateFrom = new DateTime($now);
    $dateTo = new DateTime($cooldown);
    $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());
    
    if ($difference < 0) {
        return false;
    } else {
       return true;
    }
}

function getCooldown($conn, $username, $type) {
    $now = date("d-m-Y H:i:s e");
    $cooldown = getParameterPwdReset($conn, "nextSend", $username, $type);

    $dateFrom = new DateTime($now);
    $dateTo = new DateTime($cooldown);
    $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());

    return $difference;
}