<?php
session_start();

require_once("./functions/login-functions.php");
require_once("../dbh.incPDO.php");
require_once("./functions/generalFunctions.php");
require_once("../getSettings.php");

if (!isset($_SESSION["loggedin"])) {
    $_SESSION["message"] = "Um dich von allen Geräten abzumelden musst du angemeldet sein.";
    header("Location: /index.php");
    die;
}

$database = new Dbh();
$conn = $database->connect();

$userID = $_SESSION["userID"];

logOutAllDevices($conn, $userID);

if (deleteAllStayLoggedInTokens($conn, $userID, "userID")) {
    #Delete login Cookies

    setcookie("stayLoggedInSelector", "", time() - 3600, "/");
    setcookie("stayLoggedInToken", "", time() + -3600, "/");

    #Destroy Session
    session_unset();
    session_destroy();

    #Create new Session (for example for messages)
    session_start();
    $_SESSION["message"] = "Du hast dich von allen Geräten abgemeldet.";

    header("Location: /index.php");
}
