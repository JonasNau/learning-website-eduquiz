<?php

function hasAskedForActivation($conn, $username, $type) {
    $result = false;
    try {
        $stmt = $conn->prepare("SELECT username, email FROM confirmAccount WHERE $type = ?;");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {
                $result = true;
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();    
    }

    return $result;
}

function getEmailForActivationToken($conn, $username) {
    $result = false;
    try {
        $stmt = $conn->prepare("SELECT username, email FROM confirmAccount WHERE username = ?;");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data["email"];
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();    
    }

    return $result;
}

function getParameterFromConfirmAccount($conn, $parameter, $username, $type) {
    $result = false;
    
    try {
        $stmt = $conn->prepare("SELECT $parameter FROM confirmAccount WHERE $type = ?");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {
                
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data[$parameter];
            }
        }
    } catch(Exception $e) {
        echo $e;
        die();
    }
    return $result;
}

