<?php
require_once("./functions/login-functions.php");
require_once("../dbh.incPDO.php");

$database = new Dbh();
$conn = $database->connect();
session_start();

#Delete login Cookies

setcookie("stayLoggedInSelector", "", time() - 3600, "/");
setcookie("stayLoggedInToken", "", time() + -3600, "/");

if (isset($_COOKIE["stayLoggedInSelector"]) && isset($_COOKIE["stayLoggedInToken"])) {
    $selector = $_COOKIE["stayLoggedInSelector"];
    $token = $_COOKIE["stayLoggedInToken"];
    deleteOldStayLoggedInToken($conn, $selector);
}

#Destroy Session
session_unset();
session_destroy();

#Create new Session (for example for messages)
session_start();

header("Location: /index.php");
