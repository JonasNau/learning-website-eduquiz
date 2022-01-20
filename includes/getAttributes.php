<?php
session_start();
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
        } else if ($secondOperation === "getQuizinformationForNav") {
            $quizId = $_POST["quizId"];
            echo json_encode(getColumsFromDatabaseMultipleWhere($conn , "selectquiz", ["klassenstufe", "fach", "thema", "quizname"], ["quizId"=>$quizId], 1, false, false));
            die();
        }

       } else if ($type === "userSystem") {
           $secondOperation = $_POST["secondOperation"];

           if ($secondOperation === "userIsLoggedIn") {
            echo json_encode(isLoggedIn());
            die();
           }
       }
    }


    echo "Nope";