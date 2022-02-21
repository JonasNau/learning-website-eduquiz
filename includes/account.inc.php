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
                $usersResults = json_validate(getValueFromDatabase($conn, "scores", "results", "id", $id, 1, false));
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
                $usersResults = json_validate(getValueFromDatabase($conn, "scores", "results", "id", $id, 1, false));
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
                if (json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = json_validate($currentScore->{"results"});
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
            $filterKlassenstufen = json_validate($_POST["klassenstufen"]);
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
            $filterFaecher = json_validate($_POST["faecher"]);
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
            $filterThemen = json_validate($_POST["themen"]);
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
            $input = json_validate($_POST["input"])?->input;
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
            $input = json_validate($_POST["input"])?->input;
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
                if (json_validate($currentScore->{"results"})) {
                    $currentScore->{"results"} = json_validate($currentScore->{"results"});
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
            $klassenstufen = json_validate($_POST["klassenstufen"]);
            $faecher = json_validate($_POST["faecher"]);
            $themen = json_validate($_POST["themen"]);
            $quizname = json_validate($_POST["quizname"])?->quizname;
            $quizID = json_validate($_POST["quizID"])?->quizID;
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
            //startDate + endDate
            if ($startDate !== false || $endDate !== false && count($allScores) > 0 && $startDate != "false" || $endDate != "false") {
                $startDate = getUnixTimestampFromStartOfTheDay($startDate);
                $endDate = getUnixTimestampFromStartOfTheDay($endDate);
                foreach ($allScores as $currentScore) {
                    if (json_validate($currentScore->{"results"})) {
                        $currentScore->{"results"} = json_validate($currentScore->{"results"});
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
            if ($minTime !== false || $maxTime !== false && count($allScores) > 0 && $minTime != "false" || $maxTime != "false") {
                $minTime = intval($maxTime);
                $maxTime = intval($maxTime);
                foreach ($allScores as $currentScore) {
                    if (json_validate($currentScore->{"results"})) {
                        $currentScore->{"results"} = json_validate($currentScore->{"results"});
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
            }
            returnResults($conn, $allScores, $limitResults);
            die();
        } else if ($type === "all") {
            $allScores = customDatabaseCall($conn, "SELECT id FROM scores WHERE userID = ? ORDER BY id DESC", [$searchForUserID]);
            returnResults($conn, $allScores, $limitResults);
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
    }
}
