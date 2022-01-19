<?php

function returnToSignupInvalidInput() {
    header("Location: /signup.php");
    die();
}
    

function invalidUid($username) {
    $result = true;
    if (!preg_match("/^[a-zA-Z0-9_äü]*$/", $username)){
        $result = true;
    } else {
        $result = false;
    }
        return $result;
}

function pwdMatch($pwd, $pwdRepeat) {
    $result = false;
        if ($pwd !== $pwdRepeat){
            $result = false;
        } else {
            $result = true;
        }
        return $result;
}

function createUserWithEmail($conn, $username, $email, $klassenstufe, $password) {
    $email = $email." (nicht aktiviert)";

    $password = password_hash($password, PASSWORD_DEFAULT);

    $now = DateTime::createFromFormat('U.u', microtime(true));
    $created = $now->format("d-m-Y H:i:s.u e");
    $authenticated = 0;

    $stmt = $conn->prepare("INSERT INTO users (username, klassenstufe, password, created, authenticated, email) VALUES (?, ?, ?, ?, ?, ?);");
    
    if ($stmt->execute([$username, $klassenstufe, $password, $created, $authenticated, $email])) {
        if ($stmt->rowCount()){
            return true;
        }
    } else {
        echo "Statment execute error";
        $_SESSION["messageServer"] = "Statement preperation failed! Nr1";
        #header("Location: ../../signup.php");
    }
    $stmt = null;
    
    return false;
}

function createUserWithoutEmail($conn, $username, $klassenstufe, $password) {

    $password = password_hash($password, PASSWORD_DEFAULT);

    $now = DateTime::createFromFormat('U.u', microtime(true));
    $created = $now->format("d-m-Y H:i:s.u e");
    $authenticated = 0;

    $stmt = $conn->prepare("INSERT INTO users (username, klassenstufe, password, created, authenticated) VALUES (?, ?, ?, ?, ?);");
    
    if ($stmt->execute([$username, $klassenstufe, $password, $created, $authenticated])) {
        if ($stmt->rowCount()){
            return true;
        }
    } else {
        echo "Statment execute error";
        $_SESSION["messageServer"] = "Statement preperation failed! Nr1";
        #header("Location: ../../signup.php");
    }

    return false;
}