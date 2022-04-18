<?php
require_once("./functions/login-functions.php");
require_once("./functions/generalFunctions.php");
require_once("../generalFunctions.php");
require_once("../getSettings.php");
require_once("../dbh.incPDO.php");

$database = new Dbh();
$conn = $database->connect();
session_start();

if (!isLoggedIn()) {
    $_SESSION["message"] = "Du bist nicht angemeldet.";
    GoToNow("/");
    die();
}
$userID = $_SESSION["userID"];
$username = getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);
$lastLogin = getValueFromDatabase($conn, "users", "lastLogin", "userID", $userID, 1, false) ?? getCurrentDateAndTime(1);
$loginTime = differenceOfTime(new DateTime($lastLogin), new DateTime(getCurrentDateAndTime(1)));

#Delete login Cookies

setcookie("stayLoggedInSelector", "", time() - 3600, "/");
setcookie("stayLoggedInToken", "", time() + -3600, "/");

if (isset($_COOKIE["stayLoggedInSelector"]) && isset($_COOKIE["stayLoggedInToken"])) {
    $selector = $_COOKIE["stayLoggedInSelector"];
    $token = $_COOKIE["stayLoggedInToken"];
    deleteOldStayLoggedInToken($conn, $selector);
}

logWrite($conn, "login", "$userID erfolgreich abgemeldet ($username = Benutzername, Angemeldete Zeit: ". secondsToArrayOrString($loginTime, "String") . ")", true, false, "red");
#Destroy Session
session_unset();
session_destroy();

#Create new Session (for example for messages)
session_start();

header("Location: /index.php");
