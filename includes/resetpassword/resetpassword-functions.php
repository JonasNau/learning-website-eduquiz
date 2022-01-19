<?php

function emptyInputSignup($name, $email, $username, $pwd, $pwdRepeat) {
$result = null;
    if (empty($name) || empty($email) || empty($username) || empty($pwd) || empty($pwdRepeat)){
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}


function invalidUid($username) {
$result = null;
    if (!preg_match("/^[a-zA-Z0-9_]*$/", $username)){
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}

function invalidEmail($email) {
$result = null;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)){
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}

function pwdMatch($pwd, $pwdRepeat) {
$result = null;
    if ($pwd !== $pwdRepeat){
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}

function uidExists($conn, $username) {
$result = null;
    //Prepared Statement - Reason: Prevents SQL injection

    $sql = "SELECT * FROM users WHERE usersUid = ?;";
    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $sql)){
        header("location: ../signup.php?error=stmtfailed1");
        exit();
    }
    
    mysqli_stmt_bind_param($stmt, "s", $username); //with ss we insert two Strings
    mysqli_stmt_execute($stmt);

    $resultData = mysqli_stmt_get_result($stmt);


    if ($row = mysqli_fetch_assoc($resultData)){
        return $row;
    } else {
        $result = false;
        return $result;
    }
    
    mysqli_stmt_close($stmt);


}

function emailExists($conn, $email) {
$result = null;
    //Prepared Statement - Reason: Prevents SQL injection

    $sql = "SELECT * FROM users WHERE usersEmail = ?;";
    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $sql)){
        header("location: ../signup.php?error=stmtfailed1");
        exit();
    }
    
    mysqli_stmt_bind_param($stmt, "s", $email); //with ss we insert two Strings
    mysqli_stmt_execute($stmt);

    $resultData = mysqli_stmt_get_result($stmt);


    if ($row = mysqli_fetch_assoc($resultData)){
        return $row;
    } else {
        $result = false;
        return $result;
    }
    
    mysqli_stmt_close($stmt);


}

function createUser($conn, $name, $email, $username, $pwd) {
$result = null;
    //Prepared Statement - Reason: Prevents SQL injection

    $sql = "INSERT INTO users (usersName, usersEmail, usersUid, userspwd) VALUES (?, ?, ?, ?);";
    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $sql)){
        header("location: ../signup.php?error=stmtfailed2");
    }

    $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);
    
    mysqli_stmt_bind_param($stmt, "ssss", $name, $email, $username, $hashedPwd); //with ss we insert two Strings
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    header("location: ../signup.php?error=none");

}
