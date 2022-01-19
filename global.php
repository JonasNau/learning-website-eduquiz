<?php
session_start();
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit

function getUserID()
{
    if (isset($_SESSION["userID"])) {
        return $_SESSION["userID"];
    }
    return false;
}

$database = new Dbh();
$conn = $database->connect();
$userID = getUserID();
autoLogin();
if (isLoggedIn()) {
    $userID = $_SESSION["userID"];
    userExists($conn, $userID);
}
