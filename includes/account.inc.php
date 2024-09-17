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

        function returnResults($conn, $results, $limitResults = 0)
        {
            if (!$results) return false;
            $resultArray = array();

            $results = limitArray($results, $limitResults);
            foreach ($results as $current) {
                $quizID = false;
                $id = false;

                if (gettype($current) == "object") {
                    $id = $current->id ?? false;
                } else if (gettype($current) == "array") {
                    $id = $current["id"] ?? false;
                } else {
                    $id = intval($current);
                }
                if (!$current || !$id) continue;
                $quizID = getValueFromDatabase($conn, "scores", "quizID", "id", $id, 1, false);
                $exists = boolval(valueInDatabaseExists($conn, "selectquiz", "uniqueID", "quizID", $quizID));
                $date = getValueFromDatabase($conn, "scores", "date", "id", $id, 1, false);
                $usersResults = custom_json_validate(getValueFromDatabase($conn, "scores", "results", "id", $id, 1, false));
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $quizID, 1, false);
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $quizID, 1, false);
                $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizID", $quizID, 1, false);
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $quizID, 1, false);

                $resultArray[] = array("quizID" => $quizID, "date" => $date, "results" => $usersResults, "exists" => $exists, "klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "quizname" => $quizname, "id" => $id);
            }
            echo json_encode($resultArray);
        }

        function getFullData($conn, $results)
        {
            if (!$results) return false;
            $resultArray = array();

            foreach ($results as $current) {
                $quizID = false;
                $id = false;
                if (gettype($current) == "object") {
                    $id = $current->id ?? false;
                } else if (gettype($current) == "array") {
                    $id = $current["id"] ?? false;
                } else {
                    $id = intval($current);
                }
                if (!$current || !$id) continue;
                $quizID = getValueFromDatabase($conn, "scores", "quizID", "id", $id, 1, false);
                $exists = boolval(valueInDatabaseExists($conn, "selectquiz", "uniqueID", "quizID", $quizID));
                $date = getValueFromDatabase($conn, "scores", "date", "id", $id, 1, false);
                $usersResults = custom_json_validate(getValueFromDatabase($conn, "scores", "results", "id", $id, 1, false));
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $quizID, 1, false);
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $quizID, 1, false);
                $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizID", $quizID, 1, false);
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $quizID, 1, false);

                $resultArray[] = array("quizID" => $quizID, "date" => $date, "results" => $usersResults, "exists" => $exists, "klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "quizname" => $quizname, "id" => $id);
            }
            return $resultArray;
        }

        if ($type === "result") {
            $filterBy = $_POST["filterBy"];

            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            if ($filterBy === "bestFirst") {
                usort($allScores, function ($a, $b) {
                    return $a["results"]->{"mark"} > $b["results"]->{"mark"};
                });
            } else if ($filterBy === "worstFirst") {
                usort($allScores, function ($a, $b) {
                    return $a["results"]->{"mark"} < $b["results"]->{"mark"};
                });
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "date") {
            $startDate = getUnixTimestampFromStartOfTheDay($_POST["startDate"]);
            $endDate = getUnixTimestampFromStartOfTheDay($_POST["endDate"]);
            $allScores = customDatabaseCall($conn, "SELECT id, userID, quizID, date, results FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            foreach ($allScores as $currentScore) {
                if (custom_json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = custom_json_validate($currentScore->{"results"});
                }

                $unixTimestampScore = getUnixTimestampFromStartOfTheDay(getUnixTimestampFromDate($currentScore->{"date"}));
                //Remove all what is smaller than start date
                if ($startDate) {
                    if ($unixTimestampScore < $startDate) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }

                //Remove all what is bigger than end date
                if ($endDate && $startDate <= $endDate) {
                    if ($unixTimestampScore > $endDate) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "klassenstufe") {
            $filterKlassenstufen = custom_json_validate($_POST["klassenstufen"]);
            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            foreach ($allScores as $currentScore) {
                $quizID = $currentScore["quizID"] ?? false;
                $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $quizID, 1, false);
                if (!in_array($klassenstufe, $filterKlassenstufen)) {
                    $allScores = removeFromArray($allScores, $currentScore, "value", false);
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "fach") {
            $filterFaecher = custom_json_validate($_POST["faecher"]);
            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            foreach ($allScores as $currentScore) {
                $quizID = $currentScore["quizID"] ?? false;
                $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $quizID, 1, false);
                if (!in_array($fach, $filterFaecher)) {
                    $allScores = removeFromArray($allScores, $currentScore, "value", false);
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "thema") {
            $filterThemen = custom_json_validate($_POST["themen"]);
            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            foreach ($allScores as $currentScore) {
                $quizID = $currentScore["quizID"] ?? false;
                $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizID", $quizID, 1, false);
                if (!in_array($thema, $filterThemen)) {
                    $allScores = removeFromArray($allScores, $currentScore, "value", false);
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "quizname") {
            $input = custom_json_validate($_POST["input"])?->input;
            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            foreach ($allScores as $currentScore) {
                $quizID = $currentScore["quizID"] ?? false;
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $quizID, 1, false);
                if (!str_contains(strtolower($quizname), strtolower($input) && !str_contains(strtoupper($quizname), strtoupper($input)))) {
                    $allScores = removeFromArray($allScores, $currentScore, "value", false);
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "quizID") {
            $input = custom_json_validate($_POST["input"])?->input;
            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));
            foreach ($allScores as $currentScore) {
                $quizID = $currentScore["quizID"] ?? false;
                if (!$quizID == $input) {
                    $allScores = removeFromArray($allScores, $currentScore, "value", false);
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "timeNeeded") {
            $minTime = intval($_POST["minTime"]);
            $maxTime = intval($_POST["maxTime"]);

            $allScores = customDatabaseCall($conn, "SELECT id, userID, quizID, date, results FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            foreach ($allScores as $currentScore) {
                if (custom_json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = custom_json_validate($currentScore->{"results"});
                }

                $timeNeeded = intval($currentScore->{"results"}->timeNeeded);
                //Remove all what is smaller than the number
                if ($minTime) {
                    if ($timeNeeded < $minTime) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
                //Remove all what is bigger than the number
                if ($maxTime && $minTime <= $maxTime) {
                    if ($timeNeeded > $maxTime) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "multiple") {
            $result = $_POST["result"];
            $startDate = $_POST["startDate"];
            $endDate = $_POST["endDate"];
            $klassenstufen = custom_json_validate($_POST["klassenstufen"]);
            $faecher = custom_json_validate($_POST["faecher"]);
            $themen = custom_json_validate($_POST["themen"]);
            $quizname = custom_json_validate($_POST["quizname"])?->quizname;
            $quizID = custom_json_validate($_POST["quizID"])?->quizID;
            $minTime = $_POST["minTime"];
            $maxTime = $_POST["maxTime"];

            $allScores = getFullData($conn, customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]));

            //Results
            if ($result !== false && count($allScores) > 0 && $result != "false") {
                if ($result === "bestFirst") {
                    usort($allScores, function ($a, $b) {
                        return $a["results"]->{"mark"} > $b["results"]->{"mark"};
                    });
                } else if ($result === "worstFirst") {
                    usort($allScores, function ($a, $b) {
                        return $a["results"]->{"mark"} < $b["results"]->{"mark"};
                    });
                }
            }
            // startDate + endDate
            if (($startDate !== false || $endDate !== false) && count($allScores) > 0 && ($startDate != "false" || $endDate != "false")) {
                $startDate = getUnixTimestampFromStartOfTheDay($startDate);
                $endDate = getUnixTimestampFromStartOfTheDay($endDate);
                foreach ($allScores as $currentScore) {
                    if (custom_json_validate($currentScore->{"results"})) {
                        $currentScore->{"results"} = custom_json_validate($currentScore->{"results"});
                    }
                    $unixTimestampScore = getUnixTimestampFromStartOfTheDay(getUnixTimestampFromDate($currentScore["date"]));
                    //Remove all what is smaller than start date
                    if ($startDate) {
                        if ($unixTimestampScore < $startDate) {
                            $allScores = removeFromArray($allScores, $currentScore, "value", false);
                        }
                    }
                    //Remove all what is bigger than end date
                    if ($endDate && $startDate <= $endDate) {
                        if ($unixTimestampScore > $endDate) {
                            $allScores = removeFromArray($allScores, $currentScore, "value", false);
                        }
                    }
                }
            }

            //klassenstufen
            if ($klassenstufen !== false && count($klassenstufen) > 0 && count($allScores) > 0 && $klassenstufen != "false") {
                foreach ($allScores as $currentScore) {
                    $quizID = $currentScore["quizID"] ?? false;
                    $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "quizID", $quizID, 1, false);
                    if (!in_array($klassenstufe, $klassenstufen)) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            //faecher
            if ($faecher !== false && count($faecher) > 0 && count($allScores) > 0 && $faecher != "false") {
                foreach ($allScores as $currentScore) {
                    $quizID = $currentScore["quizID"] ?? false;
                    $fach = getValueFromDatabase($conn, "selectquiz", "fach", "quizID", $quizID, 1, false);
                    if (!in_array($fach, $faecher)) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            //themen
            if ($themen !== false && count($themen) > 0 && count($allScores) > 0 && $themen != "false") {
                foreach ($allScores as $currentScore) {
                    $quizID = $currentScore["quizID"] ?? false;
                    $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizID", $quizID, 1, false);
                    if (!in_array($thema, $themen)) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            //quizname
            if ($quizname !== false > 0 && count($allScores) > 0 && $quizname != "false") {
                foreach ($allScores as $currentScore) {
                    $quizID = $currentScore["quizID"] ?? false;
                    $quiznameCurrent = getValueFromDatabase($conn, "selectquiz", "quizname", "quizID", $quizID, 1, false);
                    if (!str_contains(strtolower($quiznameCurrent), strtolower($quizname) && !str_contains(strtoupper($quiznameCurrent), strtoupper($quizname)))) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            //quizID
            if ($quizID !== false > 0 && count($allScores) > 0 && $quizID != "false") {
                foreach ($allScores as $currentScore) {
                    $quizIDCurrent = $currentScore["quizID"] ?? false;
                    if (!$quizIDCurrent == $quizID) {
                        $allScores = removeFromArray($allScores, $currentScore, "value", false);
                    }
                }
            }
            if (($minTime !== false || $maxTime !== false) && count($allScores) > 0 && ($minTime != "false" || $maxTime != "false")) {
                $minTime = intval($minTime);
                $maxTime = intval($maxTime);
                foreach ($allScores as $currentScore) {
                    $timeNeeded = intval($currentScore["results"]->timeNeeded);
                    //Remove all what is smaller than the number
                    if ($minTime) {
                        if ($timeNeeded < $minTime) {
                            $allScores = removeFromArray($allScores, $currentScore, "value", false);
                        }
                    }
                    //Remove all what is bigger than the number
                    if ($maxTime && $minTime <= $maxTime) {
                        if ($timeNeeded > $maxTime) {
                            $allScores = removeFromArray($allScores, $currentScore, "value", false);
                        }
                    }
                }
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "all") {
            $allScores = customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            returnResults($conn, $allScores, $limitResults);
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
    }
}
