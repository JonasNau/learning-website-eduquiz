<?php
require_once("dbh.incPDO.php");
require_once("getSettings.php");
require_once("userSystem/functions/permission-functions.php");
require_once("generalFunctions.php");
require_once("userSystem/functions/generalFunctions.php");
require_once("userSystem/autologin.php");
require_once("userSystem/functions/login-functions.php");
require_once("./date-functions.php");

require_once("../global.php");

mustBeLoggedIn();

$userID = $_SESSION['userID'];
$username = getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);

$database = new dbh();
$conn = $database->connect();

if (isset($_POST["scoreverwaltung"])) {
    if (!userHasPermissions($conn, $userID, ["accessScores" => gnVP($conn, "accessScores")])) {
        permissionDenied();
        die();
    }
    $operation = isset($_POST["operation"]) ? $_POST["operation"] : "";

    if ($operation === "search") {
        $searchForUserID = $userID;
        $type = $_POST["type"];

        $limitResults = $_POST["limitResults"];

        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo 0;
                die();
            }

            $results = limitArray($results, $limitResults);
            $resultArray = array();

            foreach ($results as $current) {
                logWrite($conn, "general", gettype($current));
                if (gettype($current) == "object") {
                    $current = $current->{"quizID"} ?? false;
                    if (!$current) continue;
                }
                $exists = boolval(valueInDatabaseExists($conn, "selectquiz", "uniqueID", "quizID", $current));
                $date = getValueFromDatabase($conn, "scores", "date", "quizID", $current, 1, false);
                $usersResults = json_validate(getValueFromDatabase($conn, "scores", "results", "quizID", $current, 1, false));
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $current, 1, false);
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $current, 1, false);
                $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizID", $current, 1, false);
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $current, 1, false);

                $resultArray[] = array("quizID" => $current, "date" => $date, "results" => $usersResults, "exists" => $exists, "klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "quizname" => $quizname);
            }
            echo json_encode($resultArray);
            return true;
        }

        function getFullData($conn, $results)
        {
            if (!$results) {
                echo 0;
                die();
            }
            $resultArray = array();

            foreach ($results as $current) {
                $exists = boolval(valueInDatabaseExists($conn, "selectquiz", "uniqueID", "quizID", $current));
                $date = getValueFromDatabase($conn, "scores", "date", "quizID", $current, 1, false);
                $usersResults = json_validate(getValueFromDatabase($conn, "scores", "results", "quizID", $current, 1, false));
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $current, 1, false);
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $current, 1, false);
                $thema = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $current, 1, false);
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $current, 1, false);

                $results[] = array("quizID" => $current, "date" => $date, "results" => $usersResults, "exists" => $exists, "klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "quizname" => $quizname);
            }
            return $resultArray;
        }

        if ($type === "result") {
            $filterBy = $_POST["filterBy"];

            $allScores = customDatabaseCall($conn, "SELECT id, userID, quizID, date, results FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            foreach ($allScores as $currentScore) {
                if (json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = json_validate($currentScore->{"results"});
                }
                if ($filterBy === "bestFirst") {
                    usort($allScores, function($a, $b) {return $a->{"results"}->{"mark"} > $b->{"results"}->{"mark"};});
                } else if ($filterBy === "worstFirst") {
                    usort($allScores, function($a, $b) {return $a->{"results"}->{"mark"} > $b->{"results"}->{"mark"};});
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "date") {
            $startDate = getUnixTimestampFromStartOfTheDay($_POST["startDate"]);
            $endDate = getUnixTimestampFromStartOfTheDay($_POST["endDate"]);

            $allScores = customDatabaseCall($conn, "SELECT id, userID, quizID, date, results FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            foreach ($allScores as $currentScore) {
                if (json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = json_validate($currentScore->{"results"});
                }
                
                $unixTimestampScore = getUnixTimestampFromStartOfTheDay(getUnixTimestampFromDate($currentScore->{"date"}));
                //Remove all what is smaller than start date
                if (!empty($startDate)) {
                    echo $unixTimestampScore . " | ";
                    echo $startDate . " | ";
                    if ($unixTimestampScore < $startDate)  {
                        $allScores = removeFromArray($allScores, $currentScore, "value", true);
                    }
                }

                //Remove all what is bigger than end date
                if (!empty($endDate)) {
                    if ($unixTimestampScore > $endDate)  {
                        $allScores = removeFromArray($allScores, $currentScore, "value", true);
                    }
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "klassenstufe") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($klassenstufe == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "fach") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($fach == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "thema") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $thema = getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($thema == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "name") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $name = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, 1, false);
                if (str_contains(strToLower($name), strToLower($input)) || str_contains(strToUpper($name), strToUpper($input))) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "description") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $description = getValueFromDatabase($conn, "selectquiz", "description", "uniqueID", $currentQuizUniqueID, 1, false);
                if (str_contains(strToLower($description), strToLower($input)) || str_contains(strToUpper($description), strToUpper($input))) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "quizId") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $quizId = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $currentQuizUniqueID, 1, false);
                if (str_contains(strToLower($quizId), strToLower($input)) || str_contains(strToUpper($quizId), strToUpper($input))) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "id") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                if ($currentQuizUniqueID == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else  if ($type === "requireKlassenstufe") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $requireKlassenstufe = getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($requireKlassenstufe == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else  if ($type === "requireFach") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $requireFach = getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($requireFach == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else  if ($type === "requireThema") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $requireThema = getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($requireThema == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else  if ($type === "requireName") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $requireName = getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($requireThema == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else  if ($type === "questions") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $allQuestions = searchQuestionsOneQuiz($conn, false, $currentQuizUniqueID);
                if ($allQuestions == false || !count($allQuestions) > 0) {
                    continue;
                }
                if (array_contains_all_values($allQuestions, $input, true)) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "numberOfQuizCards") {
            $input = intval($_POST["input"]);
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {

                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $numberOfQuizCards = count(searchQuestionsOneQuiz($conn, false, $currentQuizUniqueID));
                if ($numberOfQuizCards == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "created") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $created = getValueFromDatabase($conn, "selectquiz", "created", "uniqueID", $currentQuizUniqueID, 1, false);
                if (str_contains($created, $input)) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "createdBy") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $createdBy = getValueFromDatabase($conn, "selectquiz", "createdBy", "uniqueID", $currentQuizUniqueID, 1, false);
                if ($createdBy == $input) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "changed") {
            $input = $_POST["input"];
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $changed = getValueFromDatabase($conn, "selectquiz", "changed", "uniqueID", $currentQuizUniqueID, 1, false);
                if (str_contains($changed, $input)) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "changedBy") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }
            foreach ($allQuizzes as $currentQuizUniqueID) {
                $changedBy = json_validate(getValueFromDatabase($conn, "selectquiz", "changedBy", "uniqueID", $currentQuizUniqueID, 1, false));
                if (array_contains_all_values($changedBy, $input, true)) {
                    $resultArray[] = $currentQuizUniqueID;
                }
            }
            returnFoundQuizzes($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "multiple") {
            $showQuizAuswahl = $_POST["showQuizAuswahl"];
            $visibility = $_POST["visibility"];
            $klassenstufe = $_POST["klassenstufe"];
            $fach = $_POST["fach"];
            $thema = $_POST["thema"];
            $name = $_POST["name"];
            $description = $_POST["description"];
            $quizId = $_POST["quizId"];
            $uniqueID = $_POST["uniqueID"];
            $requireKlassenstufe = $_POST["requireKlassenstufe"];
            $requireFach = $_POST["requireFach"];
            $requireThema = $_POST["requireThema"];
            $requireName = $_POST["requireName"];
            $questions = json_validate($_POST["questions"]);
            $numberOfQuizCards = $_POST["numberOfQuizCards"];
            $created = $_POST["created"];
            $createdBy = $_POST["createdBy"];
            $changed = $_POST["changed"];
            $changedBy = json_validate($_POST["changedBy"]);

            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            if (!$allQuizzes || !count($allQuizzes) > 0) {
                returnFoundQuizzes($conn, false, $limitResults);
                die();
            }

            if ($showQuizAuswahl !== false && count($allQuizzes) > 0 && $showQuizAuswahl != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $showQuizAuswahlCurrent = getValueFromDatabase($conn, "selectquiz", "showQuizAuswahl", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($showQuizAuswahlCurrent != $showQuizAuswahl) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($visibility !== false && count($allQuizzes) > 0 && $visibility != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $visibilitylCurrent = getValueFromDatabase($conn, "selectquiz", "visibility", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($visibilitylCurrent != $visibility) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($klassenstufe !== false && count($allQuizzes) > 0 && $klassenstufe != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $klassenstufeCurrent = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($klassenstufeCurrent != $klassenstufe) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($fach !== false && count($allQuizzes) > 0 && $fach != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $fachCurrent = getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($fachCurrent != $fach) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($thema !== false && count($allQuizzes) > 0 && $thema != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $themaCurrent = getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($themaCurrent != $thema) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($name !== false && count($allQuizzes) > 0 && $name != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $nameCurrent = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (str_contains(strToLower($nameCurrent), strToLower($name)) == false && str_contains(strToUpper($nameCurrent), strToUpper($name)) == false) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($description !== false && count($allQuizzes) > 0 && $description != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $descriptionCurrent = getValueFromDatabase($conn, "selectquiz", "description", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (str_contains(strToLower($descriptionCurrent), strToLower($description)) == false && str_contains(strToUpper($descriptionCurrent), strToUpper($description)) == false) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($quizId !== false && count($allQuizzes) > 0 && $quizId != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $quizIdCurrent = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($quizIdCurrent != $quizId) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($uniqueID !== false && count($allQuizzes) > 0 && $uniqueID != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    if ($currentQuizUniqueID != $uniqueID) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($requireKlassenstufe !== false && count($allQuizzes) > 0 && $requireKlassenstufe != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $requireKlassenstufeCurrent = getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($requireKlassenstufeCurrent != $requireKlassenstufe) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($requireFach !== false && count($allQuizzes) > 0 && $requireFach != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $requireFachCurrent = getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($requireFachCurrent != $requireFach) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($requireThema !== false && count($allQuizzes) > 0 && $requireThema != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $requireThemaCurrent = getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($requireThemaCurrent != $requireFach) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($requireName !== false && count($allQuizzes) > 0 && $requireName != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $requireNameCurrent = getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($requireNameCurrent != $requireName) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($questions !== false && count($allQuizzes) > 0 && $questions != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $allQuestions = searchQuestionsOneQuiz($conn, false, $currentQuizUniqueID);
                    if ($allQuestions == false || !count($allQuestions) > 0) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                    if (!array_contains_all_values($allQuestions, $questions)) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($numberOfQuizCards !== false && count($allQuizzes) > 0 && $numberOfQuizCards != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $numberOfQuizCards = count(searchQuestionsOneQuiz($conn, false, $currentQuizUniqueID));
                    if ($numberOfQuizCards != $numberOfQuizCards) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($created !== false && count($allQuizzes) > 0 && $created != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $createdCurrent = getValueFromDatabase($conn, "selectquiz", "created", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (!str_contains($createdCurrent, $created)) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($createdBy !== false && count($allQuizzes) > 0 && $createdBy != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $createdByCurrent = getValueFromDatabase($conn, "selectquiz", "createdBy", "uniqueID", $currentQuizUniqueID, 1, false);
                    if ($createdByCurrent != $createdBy) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($changed !== false && count($allQuizzes) > 0 && $changed != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $changedCurrent = getValueFromDatabase($conn, "selectquiz", "changed", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (!str_contains($changedCurrent, $created)) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }
            if ($changedBy !== false && count($allQuizzes) > 0 && $changedBy != "false") {
                foreach ($allQuizzes as $currentQuizUniqueID) {
                    $changedByCurrent = json_validate(getValueFromDatabase($conn, "selectquiz", "changedBy", "uniqueID", $currentQuizUniqueID, 1, false));
                    if (!array_contains_all_values($changedByCurrent, $changedBy, true)) {
                        $allQuizzes = removeFromArray($allQuizzes, $currentQuizUniqueID, "value", true, true);
                    }
                }
            }

            returnFoundQuizzes($conn, $allQuizzes, $limitResults);
            die();
        } else if ($type === "all") {
            $allQuizzes = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true);
            returnFoundQuizzes($conn, $allQuizzes, $limitResults);
            die();
        }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["quizverwaltungEditQuizzes" => gnVP($conn, "quizverwaltungEditQuizzes")])) {
            permissionDenied();
            die();
        }

        $uniqueID = $_POST["uniqueID"];
        if (!valueInDatabaseExists($conn, "selectquiz", "uniqueID", "uniqueID", $uniqueID)) {
            returnMessage(404, "Kein Quiz mit der uniqueID '$uniqueID' gefunden.");
            die();
        }

        $type = $_POST["type"];

        if ($type === "name") {
            $input = $_POST["input"];

            //Check if name is not required
            $requireName = boolval(getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $uniqueID, 1, false));
            if ($requireName === false && !empty($input)) {
                returnMessage("failed", "Das Quiz darf keinen Namen haben. Wenn doch, setze den Wert 'Name wird benötigt' auf Ja.");
                die();
            }
            if (empty($input)) {
                $input = null;
            }
            //Check if name is required
            if ($requireName && empty($input)) {
                returnMessage("failed", "Das Quiz muss einen Namen haben. Wenn nicht, setze den Wert 'Name wird benötigt' auf Nein.");
                die();
            }
            $oldValue =  getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $uniqueID, 1, false);
            if (setValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "Der Name des Quizzes wurde <b>erfolgreich</b> von $oldValue zu $input geändert.");
            } else {
                returnMessage("success", "Der Name des Quizzes konnte <b>nicht<b/> von $oldValue zu $input geändert werden.");
            }
            die();
        } else  if ($type === "klassenstufe") {
            $input = $_POST["input"];

            //Check if Klassenstufe is not required
            $requireKlassenstufe = boolval(getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $uniqueID, 1, false));
            if ($requireKlassenstufe === false && !empty($input)) {
                returnMessage("failed", "Das Quiz darf keine Klassenstufe haben. Wenn doch, setze den Wert 'Klassenstufe wird benötigt' auf Ja.");
                die();
            }
            if (empty($input) || $input == "false") {
                $input = null;
            }
            //Check if Klassenstufe is required
            if ($requireKlassenstufe && empty($input)) {
                returnMessage("failed", "Das Quiz muss eine Klassenstufe haben. Wenn nicht, setze den Wert 'Klassenstufe wird benötigt' auf Nein.");
                die();
            }
            //Check if Klassenstufe exists
            if (valueInDatabaseExists($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $input) == false && valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $input) == false) {
                returnMessage("failed", "Diese Klassenstufe existiert nicht. ($input)");
                die();
            }
            //Check if quiz with this klassenstufe can be created
            if (!getValueFromDatabase($conn, "klassenstufenVerwaltung", "quizCanBeCreated", "klassenstufe", $input, 1, false)) {
                returnMessage("failed", "Diese Klassenstufe kann nicht zum erstellen von quizzen genutzt werden ($input). Siehe Organisation -> Klassenstufenverwaltung");
                die();
            }

            $oldValue =  getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $uniqueID, 1, false);
            if (setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "Die Klassenstufe des Quizzes wurde <b>erfolgreich</b> von $oldValue zu $input geändert.");
            } else {
                returnMessage("success", "Die Klassenstufe des Quizzes konnte <b>nicht<b/> von $oldValue zu $input geändert werden.");
            }
            die();
        } else  if ($type === "fach") {
            $input = $_POST["input"];

            //Check if Fach is not required
            $requireFach = boolval(getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $uniqueID, 1, false));
            if ($requireFach === false && !empty($input)) {
                returnMessage("failed", "Das Quiz darf kein Fach haben. Wenn doch, setze den Wert 'Fach wird benötigt' auf Ja.");
                die();
            }
            if (empty($input) || $input == "false") {
                $input = null;
            }
            //Check if Fach is required
            if ($requireFach && empty($input)) {
                returnMessage("failed", "Das Quiz muss ein Fach haben. Wenn nicht, setze den Wert 'Fach wird benötigt' auf Nein.");
                die();
            }
            //Check if Fach exists
            if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $input) == false && valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $input) == false) {
                returnMessage("failed", "Dieses Fach existiert nicht. ($input)");
                die();
            }

            $oldValue =  getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $uniqueID, 1, false);
            if (setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "Das Fach des Quizzes wurde <b>erfolgreich</b> von $oldValue zu $input geändert.");
            } else {
                returnMessage("success", "Das Fach des Quizzes konnte <b>nicht<b/> von $oldValue zu $input geändert werden.");
            }
            die();
        } else  if ($type === "thema") {
            $input = $_POST["input"];

            //Check if Thema is not required
            $requireThema = boolval(getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $uniqueID, 1, false));
            if ($requireThema === false && !empty($input)) {
                returnMessage("failed", "Das Quiz darf kein Thema haben. Wenn doch, setze den Wert 'Thema wird benötigt' auf Ja.");
                die();
            }
            if (empty($input) || $input == "false") {
                $input = null;
            }
            //Check if Fach is required
            if ($requireThema && empty($input)) {
                returnMessage("failed", "Das Quiz muss ein Thema haben. Wenn nicht, setze den Wert 'Thema wird benötigt' auf Nein.");
                die();
            }
            //Check if Fach exists
            if (valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $input) == false && valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $input) == false) {
                returnMessage("failed", "Dieses Thema existiert nicht. ($input)");
                die();
            }

            $oldValue =  getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $uniqueID, 1, false);
            if (setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "Das Thema des Quizzes wurde <b>erfolgreich</b> von $oldValue zu $input geändert.");
            } else {
                returnMessage("success", "Das Thema des Quizzes konnte <b>nicht<b/> von $oldValue zu $input geändert werden.");
            }
            die();
        } else if ($type === "description") {
            $input = $_POST["input"];
            if (empty($input) || $input == "false") {
                $input = null;
            }
            if (setValueFromDatabase($conn, "selectquiz", "description", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "Die Beschreibung wurde erfolgreich geändert.");
            } else {
                returnMessage("success", "Die Beschreibung konnte nicht geändet werden.");
            }
            die();
        } else if ($type === "quizId") {
            $input = $_POST["input"];
            if (empty($input) || $input == "false") {
                returnMessage("failed", "Eine 'quizId' wird zwingend erfordert und darf deshalb nicht leer sein");
                die();
            }
            if (valueInDatabaseExists($conn, "selectquiz", "quizId", "quizId", $input)) {
                returnMessage("failed", "Die 'quizId' '$input' existiert schon.");
                die();
            }
            if (setValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $uniqueID, $input, false)) {
                returnMessage("success", "'quizId' wurde erfolgreich geändert.");
            } else {
                returnMessage("success", "'quizId' konnte nicht geändet werden.");
            }
            die();
        } else if ($type === "randomQuizId") {
            $input = $_POST["input"];
            $randomQuizId = generateRandomUniqueName(3);
            while (valueInDatabaseExists($conn, "selectquiz", "quizId", "uniqueID", $randomQuizId)) {
                $randomQuizId = generateRandomUniqueName(3);
            }
            if (setValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $uniqueID, $randomQuizId, false)) {
                returnMessage("success", "'quizId' wurde erfolgreich geändert.");
            } else {
                returnMessage("success", "'quizId' konnte nicht geändet werden.");
            }
            die();
        } else if ($type === "showQuizAuswahl") {
            $input = $_POST["input"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "showQuizAuswahl", "uniqueID", $uniqueID, 1, false));
            if (setValueFromDatabase($conn, "selectquiz", "showQuizAuswahl", "uniqueID", $uniqueID, $input, false)) {
                if ($oldValue) {
                    returnMessage("success", "Das Quiz wird dem Nuzter jetzt <b>nicht mehr</b> bei der Quizauswahl <b>angezeigt</b>");
                } else {
                    returnMessage("success", "Das Quiz wird dem Nuzter jetzt bei der Quizauswahl angezeigt.");
                }
            } else {
                returnMessage("success", "Wert konnte nicht geändert werden.");
            }
            die();
        } else if ($type === "visibility") {
            $input = $_POST["input"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "visibility", "uniqueID", $uniqueID, 1, false));
            if (setValueFromDatabase($conn, "selectquiz", "visibility", "uniqueID", $uniqueID, $input, false)) {
                if ($oldValue) {
                    returnMessage("success", "Der Zugriff auf das Quiz wurde erfolgreich gesprerrt.");
                } else {
                    returnMessage("success", "Der Zugriff auf das Quiz wurde erfolgreich aktiviert.");
                }
            } else {
                returnMessage("success", "Wert konnte nicht geändert werden.");
            }
            die();
        } else if ($type === "requireKlassenstufe") {
            $input = $_POST["state"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $uniqueID, 1, false));

            if ($oldValue) {
                if (setValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $uniqueID, $input, false)) {
                    returnMessage("success", "Klassenstufe wird nun bei diesem Quiz nicht mehr benötigt.");
                    setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $uniqueID, null, false);
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden.");
                }
            } else {
                $klassenstufe = $_POST["klassenstufe"];
                if (valueInDatabaseExists($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $klassenstufe) || valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufe)) {
                    if (setValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $uniqueID, $input, false) && setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $uniqueID, $klassenstufe, false)) {
                        returnMessage("success", "Klassenstufe erfolgreich gesetzt.");
                    } else {
                        returnMessage("failed", "Ein Fehler ist beim Ändern der Werte aufgetreten.");
                    }
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden, da die Klassenstufe nicht existiert");
                }
            }

            die();
        } else if ($type === "requireFach") {
            $input = $_POST["state"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $uniqueID, 1, false));

            if ($oldValue) {
                if (setValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $uniqueID, $input, false)) {
                    returnMessage("success", "Ein Fach wird nun bei diesem Quiz nicht mehr benötigt.");
                    setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $uniqueID, null, false);
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden.");
                }
            } else {
                $fach = $_POST["fach"];
                if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fach) || valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $fach)) {
                    if (setValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $uniqueID, $input, false) && setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $uniqueID, $fach, false)) {
                        returnMessage("success", "Fach erfolgreich gesetzt.");
                    } else {
                        returnMessage("failed", "Ein Fehler ist beim Ändern der Werte aufgetreten.");
                    }
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden, da das Fach nicht existiert");
                }
            }
            die();
        } else if ($type === "requireThema") {
            $input = $_POST["state"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $uniqueID, 1, false));

            if ($oldValue) {
                if (setValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $uniqueID, $input, false)) {
                    returnMessage("success", "Ein Thema wird nun bei diesem Quiz nicht mehr benötigt.");
                    setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $uniqueID, null, false);
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden.");
                }
            } else {
                $thema = $_POST["thema"];
                if (valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $thema) || valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $thema)) {
                    if (setValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $uniqueID, $input, false) && setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $uniqueID, $thema, false)) {
                        returnMessage("success", "Thema erfolgreich gesetzt.");
                    } else {
                        returnMessage("failed", "Ein Fehler ist beim Ändern der Werte aufgetreten.");
                    }
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden, da das Thema nicht existiert");
                }
            }
            die();
        } else if ($type === "requireName") {
            $input = $_POST["state"];
            if ($input === false) {
                $input = 0;
            }
            $oldValue = boolval(getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $uniqueID, 1, false));

            if ($oldValue) {
                if (setValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $uniqueID, $input, false)) {
                    returnMessage("success", "Ein Name wird nun bei diesem Quiz nicht mehr benötigt.");
                    setValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $uniqueID, null, false);
                } else {
                    returnMessage("failed", "Wert konnte nicht geändert werden.");
                }
            } else {
                $name = $_POST["name"];
                if (empty($name)) {
                    returnMessage("failed", "Der Name des Quizes darf nicht leer sein.");
                    die();
                }
                if (setValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $uniqueID, $input, false) && setValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $uniqueID, $name, false)) {
                    returnMessage("success", "Name erfolgreich gesetzt.");
                } else {
                    returnMessage("failed", "Ein Fehler ist beim Ändern der Werte aufgetreten.");
                }
            }
            die();
        }
    } else if ($operation === "other") {
        $type = $_POST["type"];

        if ($type === "getKlassenstufen") {
            echo json_encode(getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "showQuizAuswahl", 1, 0, true, true));
            die();
        } else if ($type === "getFaecher") {
            echo json_encode(getValueFromDatabase($conn, "faecherVerwaltung", "fach", "showQuizAuswahl", 1, 0, true, true));
            die();
        } else if ($type === "searchThema") {
            $input = $_POST["input"];
            $themen = getAllValuesFromDatabase($conn, "themenVerwaltung", "thema", 0, true, true);
            foreach ($themen as $currentThema) {
                if (!str_contains(strtolower($currentThema), strtolower($input) && !str_contains(strtoupper($currentThema), strtoupper($input)))) {
                    $themen = removeFromArray($themen, $currentThema, "value", true, true);
                }
            }
            echo json_encode($themen);
            die();
        }
    } else if ($operation === "getFullInformation") {
        $id = $_POST['id'];

        if ($id == false || !valueInDatabaseExists($conn, "selectquiz", "uniqueID", "uniqueID", $id)) {
            returnMessage(404, "Das Quiz mit der id '$id' gibt es nicht.");
            die();
        }

        $name = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $id, 1, false);
        $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $id, 1, false);
        $fach = getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $id, 1, false);
        $thema = getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $id, 1, false);
        $description = getValueFromDatabase($conn, "selectquiz", "description", "uniqueID", $id, 1, false);
        $quizId = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $id, 1, false);
        $showQuizAuswahl = boolval(getValueFromDatabase($conn, "selectquiz", "showQuizAuswahl", "uniqueID", $id, 1, false));
        $visibility = boolval(getValueFromDatabase($conn, "selectquiz", "visibility", "uniqueID", $id, 1, false));
        $requireKlassenstufe = boolval(getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $id, 1, false));
        $requireFach = boolval(getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $id, 1, false));
        $requireThema = boolval(getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $id, 1, false));
        $requireName = boolval(getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $id, 1, false));
        $questions = searchQuestionsOneQuiz($conn, false, $id);
        $lastUsed = getValueFromDatabase($conn, "selectquiz", "lastUsed", "uniqueID", $id, 1, false);
        $created = getValueFromDatabase($conn, "selectquiz", "created", "uniqueID", $id, 1, false);
        $createdBy = getValueFromDatabase($conn, "selectquiz", "createdBy", "uniqueID", $id, 1, false);
        $changed = getValueFromDatabase($conn, "selectquiz", "changed", "uniqueID", $id, 1, false);
        $changedBy = json_validate(getValueFromDatabase($conn, "selectquiz", "changedBy", "uniqueID", $id, 1, false));

        echo json_encode(array("uniqueID" => $id, "name" => $name, "klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "description" => $description, "quizId" => $quizId, "showQuizAuswahl" => $showQuizAuswahl, "visibility" => $visibility, "requireKlassenstufe" => $requireKlassenstufe, "requireFach" => $requireFach, "requireThema" => $requireThema, "requireName" => $requireName, "questions" => $questions, "lastUsed" => $lastUsed, "created" => $created, "createdBy" => $createdBy, "changed" => $changed, "changedBy" => $changedBy));
        die();
    }
}
