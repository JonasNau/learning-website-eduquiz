<?php

require_once("./dbh.incPDO.php");
require_once("./generalFunctions.php");
require_once("./userSystem/functions/generalFunctions.php");
require_once("./getSettings.php");

$database = new Dbh();
$conn = $database->connect();

    if (isset($_POST["getAttribute"])) {
        $type = $_POST["type"];

       if ($type == "quizverwaltung") {
        $secondOperation = $_POST["secondOperation"];

        if ($secondOperation === "GET_uniqueID_FROM_quizId") {
            $quizId = $_POST["quizId"];
            echo getValueFromDatabase($conn, "selectquiz", "uniqueID", "quizId", $quizId, 1, false);
            die();
        }

       }
    }
