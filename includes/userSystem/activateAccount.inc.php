<?php

function getValidator($conn, $selector)
{
    $result = false;
    try {
        $stmt = $conn->prepare("SELECT validator FROM confirmAccount WHERE selector = ?;");
        if ($stmt->execute([$selector])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data["validator"];
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return $result;
}

function confirmAccountExpired($conn, $userID, $type)
{
    try {
        $stmt = $conn->prepare("SELECT expires AS dbTime FROM confirmAccount WHERE $type = ?; ");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $fetch = $stmt->fetch(PDO::FETCH_ASSOC);
                $dbTime = $fetch["dbTime"];
                $now = DateTime::createFromFormat('U.u', microtime(true));
                $timeNow = $now->format("d-m-Y H:i:s.u e");
                $timeNow = new DateTime($timeNow);

                $dateTo = new DateTime($dbTime);
                $difference = ($dateTo->getTimestamp() - $timeNow->getTimestamp());

                if ($difference < 0) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }


    //deleteOldConfirmEntry($conn, $userID, "userID");
    return true;
}

function activateAccountAndSetEmail($conn, $userID, $email)
{
    $result = false;

    $activate = "1";

    try {
        $stmt = $conn->prepare("UPDATE users SET email = ?, authenticated = ? WHERE userID = ?;");
        if ($stmt->execute([$email, $activate, $userID])) {
            if ($stmt->rowCount()) {
                $result = true;
                deleteOldConfirmEntry($conn, $userID, "userID");
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return $result;
}

function deleteOldConfirmEntry($conn, $userID, $type)
{
    $result = false;
    try {
        $stmt = $conn->prepare("DELETE FROM confirmAccount WHERE $type = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $result = true;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return $result;
}
