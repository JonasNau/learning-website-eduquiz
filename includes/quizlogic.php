<?php
require_once ("./dbh.incPDO.php");
require_once("./generalFunctions.php");
require_once("./getSettings.php");
require_once("./userSystem/functions/generalFunctions.php");
require_once("./organisationFunctions.inc.php");
require_once("./quizlogic.inc.php");


$database = new Dbh();
$conn = $database->connect();



if (isset($_POST["quiz"])) {
    $operation = false;
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "other") {
        $type = $_POST["type"];

        if ($type === "quizIsVisible") {
            $quizId = $_POST["quizId"];
            if (quizCanBeAccessed($conn, $quizId)) {
                echo json_encode(true);
            } else {
                echo json_encode(false);
            }
            die();
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        if ($type === "getQuizParameter") {
            $quizId = $_POST["quizId"];
            if (quizCanBeAccessed($conn, $quizID)) {
                returnMessage("failed", "Das Quiz ist nicht verfügbar.");
                die();
            }
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllQuizInformation") {
                echo json_encode(getColumsFromDatabaseMultipleWhere($conn , "selectquiz", ["uniqueID", "showQuizauswahl", "klassenstufe", "fach", "thema", "quizname", "quizId", "created", "createdBy", "changed", "changedBy", "quizData", "description"], ["quizId"=>$quizId], 1, false, false));
                die();
            }
        } else if ($type === "getMark") {
            
        }
    }
}

echo "Nope";