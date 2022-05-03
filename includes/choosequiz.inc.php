<?php

require_once 'dbh.incPDO.php';
require_once("./generalFunctions.php");
require_once("./getSettings.php");

$database = new Dbh();
$conn = $database->connect();

//Get Klassen verfügbar
if (isset($_POST['getKlassen'])) {
    require_once("./generalFunctions.php");
    echo json_encode(getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "showQuizauswahl", 1, 0, true, true));
    die();
}

if (isset($_POST["getAmountOfQuizzes"])) {
    $operation = $_POST["operation"];

    if ($operation === "byKlassenstufe") {
        $klassenstufe = $_POST["klassenstufe"];
        $resultArray = array();

        if (getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false)) {
            $availableQuizzesForThatKlassenstufe = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["visibility" => 1, "showQuizauswahl" => 1, "klassenstufe" => $klassenstufe, "fach" => true, "thema" => true, "quizname" => true], true, false);
            if ($availableQuizzesForThatKlassenstufe && count($availableQuizzesForThatKlassenstufe) > 0)
                foreach ($availableQuizzesForThatKlassenstufe as $currentQuiz) {
                    $resultArray = addToArray($resultArray, $currentQuiz, false);
                }
        }


        echo count($resultArray);
    } else if ($operation === "general") {
        echo count(getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["visibility" => 1, "showQuizauswahl" => 1, "fach" => true, "thema" => true], true, false));
    } else if ($operation === "byKlassenstufeandFach") {
        $klassenstufe = $_POST["klassenstufe"];
        $fach = $_POST["fach"];

        $resultArray = array();

        if (getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false) && getValueFromDatabase($conn, "faecherVerwaltung", "showQuizauswahl", "fach", $fach, 1, false)) {
            $availableQuizzesForThatKlassenstufe = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["visibility" => 1, "showQuizauswahl" => 1, "klassenstufe" => $klassenstufe, "fach"=>$fach, "thema" => true, "quizname" => true], true, false);
            if ($availableQuizzesForThatKlassenstufe && count($availableQuizzesForThatKlassenstufe) > 0)
                foreach ($availableQuizzesForThatKlassenstufe as $currentQuiz) {
                    $resultArray = addToArray($resultArray, $currentQuiz, false);
                }
        }


        echo count($resultArray);
    } else if ($operation === "byKlassenstufeandFachandThema") {
        $klassenstufe = $_POST["klassenstufe"];
        $fach = $_POST["fach"];
        $thema = $_POST["thema"];

        $resultArray = array();

        if (getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false) && getValueFromDatabase($conn, "faecherVerwaltung", "showQuizauswahl", "fach", $fach, 1, false) && getValueFromDatabase($conn, "themenVerwaltung", "showQuizauswahl", "thema", $thema, 1, false)) {
            $availableQuizzesForThatKlassenstufe = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["visibility" => 1, "showQuizauswahl" => 1, "klassenstufe" => $klassenstufe, "fach"=>$fach, "thema"=>$thema, "quizname" => true], true, false);
            if ($availableQuizzesForThatKlassenstufe && count($availableQuizzesForThatKlassenstufe) > 0)
                foreach ($availableQuizzesForThatKlassenstufe as $currentQuiz) {
                    $resultArray = addToArray($resultArray, $currentQuiz, false);
                }
        }
        echo count($resultArray);
    }
}

//Get Fach
if (isset($_POST['getFaecher'])) {
    $klassenstufe = $_POST['klassenstufe'];
    //Check klassenstufe
    if (!boolval(getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false))) {
        echo "klassenstufe not visible or not given";
        die();
    }
    $faecher = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "fach", ["klassenstufe" => $klassenstufe, "visibility" => 1, "showQuizauswahl" => 1, "fach" => true, "thema" => true, "quizname" => true], true, false);
    if (!$faecher) {
        echo "no faecher";
        die();
    }
    $resultArray = array();
    $shownFaecher = getValueFromDatabase($conn, "faecherVerwaltung", "fach", "showQuizauswahl", 1, 0, true, false);
    if (!$shownFaecher) {
        echo "no shown faecher";
        die();
    }
    foreach ($shownFaecher as $shownfach) {
        if (in_array($shownfach, $faecher)) {
            $resultArray[] = $shownfach;
        }
    }
    echo json_encode($resultArray);
    die();
}

//Get Themen
if (isset($_POST['getThemen'])) {
    $klassenstufe = $_POST['klassenstufe'];
    $fach = $_POST["fach"];

    //Check Klassenstufe
    if (!boolval(getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false))) {
        echo "klassenstufe not visible or not given";
        die();
    }
    //Check Fach
    if (!boolval(getValueFromDatabase($conn, "faecherVerwaltung", "showQuizauswahl", "fach", $fach, 1, false))) {
        echo "fach not visible or not given";
        die();
    }
    $themen = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "thema", ["klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => true, "quizname" => true, "visibility" => 1, "showQuizauswahl" => 1], true, false);
    if (!$themen) {
        echo "no themen";
        die();
    }
    $resultArray = array();
    $shownThemen = getValueFromDatabase($conn, "themenVerwaltung", "thema", "showQuizauswahl", 1, 0, true, false);
    if (!$shownThemen) {
        echo "no shown themen";
        die();
    }
    foreach ($shownThemen as $shownthema) {
        if (in_array($shownthema, $themen)) {
            $resultArray[] = $shownthema;
        }
    }
    echo json_encode($resultArray);
    die();
}

//Get Quizname
if (isset($_POST['getQuizze'])) {
    //Get Subjects - Datenbankabfrage
    $klassenstufe = $_POST['klassenstufe'];
    $fach = $_POST['fach'];
    $thema = $_POST['thema'];

    //Check Klassenstufe
    if (!boolval(getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false))) {
        echo "klassenstufe not visible or not given";
        die();
    }
    //Check Fach
    if (!boolval(getValueFromDatabase($conn, "faecherVerwaltung", "showQuizauswahl", "fach", $fach, 1, false))) {
        echo "fach not visible or not given";
        die();
    }

    //Check Thema
    if (!boolval(getValueFromDatabase($conn, "themenVerwaltung", "showQuizauswahl", "thema", $thema, 1, false))) {
        echo "thema not visible or not given";
        die();
    }

    $uniqueQuizIDs = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "uniqueID", ["klassenstufe" => $klassenstufe, "fach" => $fach, "thema" => $thema, "quizname" => true, "visibility" => 1], true, false);
    if (!$uniqueQuizIDs) {
        echo "no quizze";
    }
    $quizzeArray = array();
    foreach ($uniqueQuizIDs as $quizuniqueID) {
        if (getValueFromDatabase($conn, "selectquiz", "showQuizauswahl", "uniqueID", $quizuniqueID, 1, false)) {
            $quizzeArray[] = $quizuniqueID;
        }
    }
    if (count($quizzeArray) > 0) {
        $resultArray = array();

        foreach ($quizzeArray as $current) {
            $quizID = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $current, 1, false);
            $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $current, 1, false);
            $resultArray[] = array("quizId" => $quizID, "quizname" => $quizname, "uniqueID" => $current);
        }
        echo json_encode($resultArray);
    } else {
        echo false;
    }
    die();
}

//Search for Subjets
if (isset($_POST['searchThemen'])) {
    $input = $_POST["input"];
    $quizze =  getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["showQuizauswahl" => 1, "visibility" => 1], true);
    if (!$quizze || !count($quizze)) {
        echo "no quizze found";
        die();
    }
    foreach ($quizze as $currentQuiz) {
        $thema = getValueFromDatabase($conn, "selectquiz", "thema", "quizId", $currentQuiz, 1, false);
        if (!str_contains(strtolower($thema), strtolower($input)) && !str_contains(strtoupper($thema), strtoupper($input))) {
            $quizze = removeFromArray($quizze, $currentQuiz, "value", true, true);
        }
    }
    if (!$quizze || !count($quizze)) {
        echo "no results";
        die();
    }
    $resultArray = array();
    foreach ($quizze as $currentQuiz) {
      $resultArray[] = getAllQuizParams($conn, $currentQuiz);
    }
    echo json_encode(limitArray($resultArray, intval(getSettingVal($conn, "Choosequiz.inc.php_maxResults_searchThemen"))));
    die();
}

//Search for Quizze
if (isset($_POST['searchQuizze'])) {
    $input = $_POST["input"];
    $quizze =  getValueFromDatabaseMultipleWhere($conn, "selectquiz", "quizId", ["showQuizauswahl" => 1, "visibility" => 1], true);
    if (!$quizze || !count($quizze)) {
        echo "no quizze found";
        die();
    }
    foreach ($quizze as $currentQuiz) {
        $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "quizId", $currentQuiz, 1, false);
        if (!str_contains(strtolower($quizname), strtolower($input)) && !str_contains(strtoupper($quizname), strtoupper($input))) {
            $quizze = removeFromArray($quizze, $currentQuiz, "value", true, true);
        }
    }
    if (!$quizze || !count($quizze)) {
        echo "no results";
        die();
    }
    $resultArray = array();
    foreach ($quizze as $currentQuiz) {
      $resultArray[] = getAllQuizParams($conn, $currentQuiz);
    }
    echo json_encode(limitArray($resultArray, intval(getSettingVal($conn, "Choosequiz.inc.php_maxResults_searchQuizze"))));
    die();
}


//Get all Quiz Parms
if (isset($_POST['getAllQuizParms'])) {
    $quizID = $_POST['quizID'];
    echo json_encode(getAllQuizParams($conn, $quizID));
    die();
}

function getAllQuizParams($conn, $quizID)
{
    if (!$quizID) {
        return false;
    }
    try {
        $stmt = $conn->prepare("SELECT klassenstufe, fach, thema, quizname, quizId FROM selectquiz WHERE quizId = ? LIMIT 1;
        ");
        if ($stmt->execute([$quizID])) {
            if ($stmt->rowCount()) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}
