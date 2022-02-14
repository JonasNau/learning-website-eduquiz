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
            if (!quizCanBeAccessed($conn, $quizId)) {
                returnMessage("failed", "Das Quiz ist nicht verfügbar.");
                die();
            }
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllQuizInformation") {
                $quizparams = getColumsFromDatabaseMultipleWhere($conn , "selectquiz", ["uniqueID", "showQuizauswahl", "klassenstufe", "fach", "thema", "quizname", "quizId", "created", "createdBy", "changed", "quizdata", "description"], ["quizId"=>$quizId], 1, false, false);
                $quizparams["changedBy"] = json_validate(getValueFromDatabase($conn, "selectquiz", "changedBy", "quizID", $quizId, 1, false, false));
                if (!$quizparams) {
                    returnMessage("failed", "Keine Quizparameter vorhanden");
                    die();
                }
                //Make json from everything that is just a string - FORMAT RESPONSE
                if (isset($quizparams["quizdata"])) {
                    $quizparams["quizdata"] = json_validate($quizparams["quizdata"]);
                    //if no quizCards just make it false
                    if ($quizparams["quizdata"]) {
                        if (isset($quizparams["quizdata"]->{"quizCards"}) && (count($quizparams["quizdata"]->{"quizCards"}) > 0) == false) {
                            $quizparams["quizdata"] = false;
                        }
                    }
                }
                echo json_encode($quizparams);
                die();
            }
        } else if ($type === "getMark") {
            
        }
    }
}

echo "Nope";