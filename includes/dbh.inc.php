<?php

$servername = "localhost";
$dbUsername = "developer";
$dbPassword = "JonasNaumann270406";
$dBName = "quizapp";

$conn = mysqli_connect($servername, $dbUsername, $dbPassword, $dBName);

if (!$conn){
    die("Connection failed: ".mysqli_connect_error());
}