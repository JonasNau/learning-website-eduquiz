<?php
session_start();

if (isset($_POST["submit"])) {
    $_SESSION["permission"] = $_POST["input"];
}

header("Location: index.php");