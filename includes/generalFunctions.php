<?php

function invalidEmail($email)
{
    $result = true;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}

function isLoggedIn()
{
    $result = false;

    if (isset($_SESSION["loggedin"])) {
        $result = true;
    } else {
        $result = false;
    }
    if (isset($_SESSION["userID"])) {
        $result = true;
    } else {
        $result = false;
    }


    return $result;
}

if (isset($_POST["HOLDCONTACT"])) {
    session_start();
    require_once("./dbh.incPDO.php");
    require_once("./userSystem/functions/generalFunctions.php");
    require_once("./userSystem/functions/login-functions.php");
    require_once("./getSettings.php");
    require_once("./Browser.inc.php");
    $database = new Dbh();
    $conn = $database->connect();

    if (isLoggedIn()) {
        $userID = $_SESSION["userID"];
        shouldLogOut($conn, $userID);
        checkAccount($conn, $userID);
        checkExpired($conn);
        setLastActivity($conn, $userID);
    }

    setLastActivityOnlineClient($conn, session_id());
    updateOnlineStatus($conn);
    connectedClientsUpdateOnlineStatus($conn);
    returnMessage("success", false);
}

if (isset($_POST["SESSION_MESSAGE"])) {
    session_start();
    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }


    if ($operation == "get") {
        if (isset($_SESSION["data"]) && $_SESSION["data"] != false) {
            returnMessage($_SESSION["data"]["status"], $_SESSION["data"]["message"],  $_SESSION["data"]["redirect"]);
            $_SESSION["data"] = false;
        } else {
            if (isset($_SESSION["message"])) {
                if ($_SESSION["message"] != "") {
                    returnMessage("success", $_SESSION["message"]);
                }
            } else {
                returnMessage("success", false);
            }
        }
    } else if ($operation == "delete") {
        $_SESSION["message"] = "";
    }

    die();
}

if (isset($_POST["COMEBACK_MESSAGE"])) {
    require_once("./userSystem/functions/generalFunctions.php");
    require_once("./dbh.incPDO.php");
    $database = new dbh();
    $conn = $database->connect();

    session_start();
    if (!isLoggedIn()) {
        echo "";
        die();
    }
    $userID = $_SESSION["userID"];
    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }


    if ($operation == "get") {
        if (userHasComeBackMessage($conn, $userID)) {
            $message = getNextComeBackMessage($conn, $userID);
            returnMessage("success", $message);
            die();
        } else {
            returnMessage("success", false);
            die();
        }
    } else if ($operation == "delete") {
        if (userHasComeBackMessage($conn, $userID)) {
            removeComebackMessage($conn, $userID, "");
        }
    }
}

if (isset($_POST["CHECK_LOGIN"])) {
    session_start();
    require_once("./dbh.incPDO.php");
    require_once("./userSystem/functions/generalFunctions.php");
    require_once("./userSystem/functions/login-functions.php");
    require_once("./getSettings.php");
    require_once("./Browser.inc.php");
    $database = new Dbh();
    $conn = $database->connect();

    returnMessage("success", false, false, array("loginStatus" => isLoggedIn()));
    die();
}

if (isset($_POST["GETsettingVal"])) {
    require_once("./dbh.incPDO.php");
    require_once("./userSystem/functions/generalFunctions.php");
    require_once("./userSystem/functions/login-functions.php");
    require_once("./getSettings.php");
    $database = new Dbh();
    $conn = $database->connect();

    $setting = $_POST["setting"];
    echo getSettingVal($conn, $setting);
    die();
}

if (isset($_POST["klassenstufenBoxesStartseite"])) {
    require_once("./dbh.incPDO.php");
    require_once("./userSystem/functions/generalFunctions.php");
    require_once("./userSystem/functions/login-functions.php");
    require_once("./getSettings.php");
    require_once("./choosequiz.inc.php");

    $database = new Dbh();
    $conn = $database->connect();
    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation == "getKlassenstufenAvailableForQuizzes") {
        $klassenstufen = getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "showQuizauswahl", 1, 0, true, true);
        echo json_encode($klassenstufen);
        die();
    } else if ($operation == "getFaecherForKlassenstufe") {
        $klassenstufe = $_POST["klassenstufe"];
        //echo json_encode(getFaecher($conn, $klassenstufe));
        die();
    }
}


function dbValidJSON($conn, $table, $column, $conditionKey, $conditionVal, $value)
{
    try {
        $stmt = $conn->prepare("SELECT JSON_VALID(" . $column . ") AS valid FROM $table WHERE $conditionKey = ?");
        if ($stmt->execute([$conditionVal])) {
            if ($stmt->rowCount()) {
                $fetch = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $fetch["valid"];
                if ($result == 1) {
                    return true;
                } else {
                    makeValidJSON($conn, $table, $column, $value, $conditionKey, $conditionVal);
                    return false;
                }
            }
            return false;
        } else {
            echo "Error in executing Statement getting settings";
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function makeValidJSON($conn, $table, $column, $value, $conditionKey, $conditionVal)
{
    try {
        $stmt = $conn->prepare("UPDATE $table SET $column = '$value' WHERE $conditionKey = ?;");
        if ($stmt->execute([$conditionVal])) {
            return true;
        } else {
            echo "Error in executing Statement getting settings";
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function json_validate($string, $conn = false)
{
    // decode the JSON data
    $result = json_encode($string);
    try {
        while (gettype($result) == gettype("dgdg")) {
            $result = json_decode($result);
        }
    } catch (Exception $e) {
        return false;
    }

    // switch and check possible JSON errors
    switch (json_last_error()) {
        case JSON_ERROR_NONE:
            $error = ''; // JSON is valid // No error has occurred
            break;
        case JSON_ERROR_DEPTH:
            $error = 'The maximum stack depth has been exceeded.';
            break;
        case JSON_ERROR_STATE_MISMATCH:
            $error = 'Invalid or malformed JSON.';
            break;
        case JSON_ERROR_CTRL_CHAR:
            $error = 'Control character error, possibly incorrectly encoded.';
            break;
        case JSON_ERROR_SYNTAX:
            $error = 'Syntax error, malformed JSON.';
            break;
            // PHP >= 5.3.3
        case JSON_ERROR_UTF8:
            $error = 'Malformed UTF-8 characters, possibly incorrectly encoded.';
            break;
            // PHP >= 5.5.0
        case JSON_ERROR_RECURSION:
            $error = 'One or more recursive references in the value to be encoded.';
            break;
            // PHP >= 5.5.0
        case JSON_ERROR_INF_OR_NAN:
            $error = 'One or more NAN or INF values in the value to be encoded.';
            break;
        case JSON_ERROR_UNSUPPORTED_TYPE:
            $error = 'A value of a type that cannot be encoded was given.';
            break;
        default:
            $error = 'Unknown JSON error occured.';
            break;
    }

    if ($error !== '') {
        // throw the Exception or exit // or whatever :)
        logWrite(false, "JSONDecodeErrors", "Passed IN: $string | OUT: $error");
        return false;
    }

    // everything is OK
    return $result;
}

// function arrayCopy(array $array)
// {
//     $result = array();
//     foreach ($array as $key => $val) {
//         if (is_array($val)) {
//             $result[$key] = arrayCopy($val);
//         } elseif (is_object($val)) {
//             $result[$key] = clone $val;
//         } else {
//             $result[$key] = $val;
//         }
//     }
//     return $result;
// }

function formatEmail($email)
{
    $email = preg_replace('/\s+/', '', $email);
    $email = strtolower($email);

    return $email;
}

function checkAccount($conn, $userID)
{
    if (!userExists($conn, $userID)) {
        deleteAllStayLoggedInTokens($conn, $userID, "userID"); //Prevents too many redirects
        session_unset();
        session_destroy();

        #Create new Session (for example for messages)
        session_start();
        $_SESSION["Der Account mit der userID $userID existiert nicht"];
        header("Location: /index.php");
        die();
    } else {
        return true;
    }
}

function logWrite($conn, $fileName, $log, $includeTime = true, $error = true, $formatPrint = "white", $fileType = ".log", $lineBrak = true, $colourTime = false)
{
    if (!$conn) {
        require_once("/var/www/webseite/includes/dbh.incPDO.php");
        $database = new dbh();
        $conn = $database->connect();
    }

    $now = date("d.m.Y");
    $path = getSettingVal($conn, "logFolder");
    $cli = new CLI();
    if (!$path) {
        error_log("Can't log custom, because path is missing.");
        error_log($log);
        return false;
    }
    //Customize log with color
    if ($error) {
        $log = $cli->cout_color($log, "red");
    } else if ($formatPrint) {
        //color via class color id
        $log = $cli->cout_color($log, $formatPrint);
    }
    if ($includeTime) {
        $time = getCurrentDateAndTime(1);
        if ($colourTime) {
            $time = $cli->cout_color($time, $colourTime);
            $log = "[" . $time . "]: " . $log;
        } else {
            $log = "[" . $time . "]: " . $log;
        }
    }
    if ($lineBrak) {
        $log = $log . PHP_EOL;
    }

    //Create Folder if not exists
    if (!file_exists("$path/" . $now)) {
        $oldmask = umask(0);
        mkdir("$path/" . $now, 0777, true);
        umask($oldmask);
    }


    //Write to file and create if not exists
    $file = $path . "/" . $now . "/" . $fileName . $fileType;
    writeFileContent($file, $log);


    //Write to today Folder
    //Create Folder if not exists
    if (!file_exists("$path/live")) {
        $oldmask = umask(0);
        mkdir("$path/" . "live", 0777, true);
        umask($oldmask);
    }


    //Write to file and create if not exists
    $file = $path . "/" . "live" . "/" . $fileName . $fileType;
    writeFileContent($file, $log);

    return true;
}

function writeFileContent($file, $content)
{
    $fp = fopen($file, 'a');
    fwrite($fp, $content);
    fclose($fp);
    chmod($file, 0777);  //changed to add the zero


    return true;
}


class CLI
{

    // this method requires one variable. the second, color, is optional
    function cout_color($content, $color = null)
    {

        // if a color is set use the color set.
        if (!empty($color)) {
            // if our color string is not a numeric value
            if (!is_numeric($color)) {
                if ($color === "random") {
                    $c = rand(1, 14);
                } else {
                    $c = strtolower($color);
                }
                //lowercase our string value.
            } else {
                // check if our color value is not empty.
                if (!empty($color)) {
                    $c = $color;
                } else {
                    // no color was set so lets pick a random one...
                    $c = rand(1, 14);
                }
            }
        } else    // no color argument was passed, so lets pick a random one w00t
        {

            $c = rand(1, 14);
        }

        $cheader = '';
        $cfooter = "\033[0m";

        // let check which color code was used so we can then wrap our content.
        switch ($c) {

            case 1:
            case 'red':

                // color code header.
                $cheader .= "\033[31m";

                break;

            case 2:
            case 'green':

                // color code header.
                $cheader .= "\033[32m";

                break;

            case 3:
            case 'yellow':

                // color code header.
                $cheader .= "\033[33m";

                break;

            case 4:
            case 'blue':

                // color code header.
                $cheader .= "\033[34m";

                break;

            case 5:
            case 'magenta':

                // color code header.
                $cheader .= "\033[35m";

                break;

            case 6:
            case 'cyan':

                // color code header.
                $cheader .= "\033[36m";

                break;

            case 7:
            case 'light grey':

                // color code header.
                $cheader .= "\033[37m";

                break;

            case 8:
            case 'dark grey':

                // color code header.
                $cheader .= "\033[90m";

                break;

            case 9:
            case 'light red':

                // color code header.
                $cheader .= "\033[91m";

                break;

            case 10:
            case 'light green':

                // color code header.
                $cheader .= "\033[92m";

                break;

            case 11:
            case 'light yellow':

                // color code header.
                $cheader .= "\033[93m";

                break;

            case 12:
            case 'light blue':

                // color code header.
                $cheader .= "\033[94m";

                break;

            case 13:
            case 'light magenta':

                // color code header.
                $cheader .= "\033[95m";

                break;

            case 14:
            case 'light cyan':

                // color code header.
                $cheader .= "\033[92m";

                break;
        }

        // wrap our content.
        $content = $cheader . $content . $cfooter;

        //return our new content.
        return $content;
    }
}

function remove_files_from_dir_older_than_x_seconds($conn, $dir, $seconds = 3600)
{
    $sum = 0;
    $files = glob(rtrim($dir, '/') . "/*");
    $now   = time();
    foreach ($files as $file) {
        if (is_file($file)) {
            if ($now - filemtime($file) >= $seconds) {
                logWrite($conn, "logDelete", "Removed File $file", true, true);
                $sum++;
                unlink($file);
            }
        } else {
            remove_files_from_dir_older_than_x_seconds($file, $seconds);
        }
    }
}

function RemoveEmptySubFolders($starting_from_path)
{

    // Returns true if the folder contains no files
    function IsEmptyFolder($folder)
    {
        return (count(array_diff(glob($folder . DIRECTORY_SEPARATOR . "*"), array(".", ".."))) == 0);
    }

    // Cycles thorugh the subfolders of $from_path and
    // returns true if at least one empty folder has been removed
    function DoRemoveEmptyFolders($from_path)
    {
        if (IsEmptyFolder($from_path)) {
            rmdir($from_path);
            return true;
        } else {
            $Dirs = glob($from_path . DIRECTORY_SEPARATOR . "*", GLOB_ONLYDIR);
            $ret = false;
            foreach ($Dirs as $path) {
                $res = DoRemoveEmptyFolders($path);
                $ret = $ret ? $ret : $res;
            }
            return $ret;
        }
    }

    while (DoRemoveEmptyFolders($starting_from_path)) {
    }
}

function removeFromArray($array, $toRemove, $keyOrValue = "value", $removeAll = true, $reindexArray = true)
{
    if ($keyOrValue == "value") {
        if ($removeAll) {
            foreach (array_keys($array, $toRemove, true) as $key) {
                unset($array[$key]);
            }
        } else {
            $keys  = array_keys($array, $toRemove, true);
            if (!empty($keys)) {
                unset($array[$keys[0]]);
            }
        }
    } else if ($keyOrValue == "key") {
        if ($removeAll) {
            foreach (array_keys($array) as $key) {
                if ($key == $toRemove) {
                    unset($array[$key]);
                }
            }
        } else {
            $keys = array_keys($array);
            if (in_array($toRemove, $keys)) {
                // debug_to_console($keys);
                unset($array[$toRemove]);
            }
        }
    }
    if ($reindexArray) {
        return array_values($array);
    } else {
        return $array;
    }
}

function removeFromObject($object, $toRemove, $keyOrValue = "value", $removeAll = true)
{
    if ($keyOrValue == "value") {
        if ($removeAll) {
            foreach ($object as $key => $value) {
                if ($value === $toRemove) {
                    unset($object->$key);
                }
            }
        } else {
            foreach ($object as $key => $value) {
                if ($value === $toRemove) {
                    unset($object->$key);
                    return $object;
                }
            }
        }
    } else if ($keyOrValue == "key") {

        if ($removeAll) {
            foreach ($object as $key => $value) {
                if ($key === $toRemove) {
                    unset($object->$key);
                }
            }
        } else {
            foreach ($object as $key => $value) {
                if ($key === $toRemove) {
                    unset($object->$key);
                    return $object;
                }
            }
        }
    }
    return $object;
}



function removeEmptyValuesFromArray($array)
{
    foreach (array_keys($array, "", true) as $key => $val) {
        if ($array[$key] == "") {
            unset($array[$key]);
        }
    }
    return array_values($array); //Change index and keep order
}

function GoToNow($url)
{
    echo '<script language="javascript">window.location.href ="' . $url . '"</script>';
    echo '<META HTTP-EQUIV="refresh" content="0;URL=' . $url . '">';
}

function getNewestVersion()
{
    return date("d-m-Y");
}


function secureConnection()
{
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $isSecure = true;
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
        $isSecure = true;
    }
    return $isSecure;
}

function mustBeLoggedIn()
{
    if (!isLoggedIn()) {
        $_SESSION["message"] = "Dafür musst du angemeldet sein";
        $_SESSION["redirect"] = "/login.php";
        die();
    }
}

function getAvailableKlassenstufen($conn)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT klassenstufe FROM klassenstufenVerwaltung;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $array = array();
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $array[] = $row["klassenstufe"];
                }
                return $array;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function array_copy($arr)
{
    $newArray = array();
    foreach ($arr as $key => $value) {
        if (is_array($value)) $newArray[$key] = array_copy($value);
        else if (is_object($value)) $newArray[$key] = clone $value;
        else $newArray[$key] = $value;
    }
    return $newArray;
}

function debug_to_console($data)
{
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);

    echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
}

function returnMessage($status = "success", $message, $redirectTo = false, $data = false)
{
    $returnArray = array();
    $returnArray["status"] = $status;
    $returnArray["message"] = $message;
    $returnArray["redirect"] = $redirectTo;
    $returnArray["data"] = $data;

    echo json_encode($returnArray);
}

function getKlassenstufenWhere($conn, $type, $eaqualTo)
{
    if (!$type || empty($type)) return false;
    if ($type == "showQuizauswahl") {
        try {
            $stmt = $conn->prepare("SELECT klassenstufe FROM klassenstufenVerwaltung WHERE showQuizauswahl = ?");
            if ($stmt->execute([$eaqualTo])) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $results = array();

                    foreach ($data as $result) {
                        $results[] = $result["klassenstufe"];
                    }
                    return $results;
                }
            }
        } catch (Exception $e) {
            echo $e;
            die();
        }
        return false;
    } else if ($type == "userCanBe") {
        try {
            $stmt = $conn->prepare("SELECT klassenstufe FROM klassenstufenVerwaltung WHERE userCanBe = ?");
            if ($stmt->execute([$eaqualTo])) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $results = array();

                    foreach ($data as $result) {
                        $results[] = $result["klassenstufe"];
                    }
                    return $results;
                }
            }
        } catch (Exception $e) {
            echo $e;
            die();
        }
        return false;
    } else if ($type == "quizCanBeCreated") {
        try {
            $stmt = $conn->prepare("SELECT klassenstufe FROM klassenstufenVerwaltung WHERE quizCanBeCreated = ?");
            if ($stmt->execute([$eaqualTo])) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $results = array();

                    foreach ($data as $result) {
                        $results[] = $result["klassenstufe"];
                    }
                    return $results;
                }
            }
        } catch (Exception $e) {
            echo $e;
            die();
        }
        return false;
    }
}

function checkKlassenstufe($conn, $type, $eaqualTo, $currentKlassenstufe)
{
    if (empty($currentKlassenstufe) || $currentKlassenstufe == "") return false;
    $getKlassenstufen = getKlassenstufenWhere($conn, $type, $eaqualTo);
    if (in_array($currentKlassenstufe, $getKlassenstufen)) {
        return true;
    }
    return false;
}

function getAllValuesFromDatabase($conn, $table, $column, $limit, $returnAsArray = true, $distinct = false)
{
    $limit = intval($limit);

    if ($limit > 0) {
        try {
            $stmt = $conn->prepare("SELECT $column as Data FROM $table LIMIT :limit;");
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if ($returnAsArray) {
                        $resultArray = array();
                        foreach ($data as $current) {
                            $resultArray[] = $current["Data"];
                        }
                        if ($distinct) {
                            return array_unique(array_values(array_unique($resultArray, SORT_REGULAR)));
                        }
                        return $resultArray;
                    } else {
                        foreach ($data as $current) {
                            return $current["Data"];
                        }
                    }
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
    } else {
        try {
            $stmt = $conn->prepare("SELECT $column as Data FROM $table;");
            if ($stmt->execute([])) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if ($returnAsArray) {
                        $resultArray = array();
                        foreach ($data as $current) {
                            $resultArray[] = $current["Data"];
                        }
                        if ($distinct) {
                            return array_unique(array_values(array_unique($resultArray, SORT_REGULAR)));
                        }
                        return $resultArray;
                    } else {
                        foreach ($data as $current) {
                            return $current["Data"];
                        }
                    }
                }
            }
        } catch (Exception $e) {
            return false;
        }
    }
    return false;
}


function getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, $limit, $returnAsArray = true, $distinct = false)
{
    $limit = intval($limit);

    if ($limit > 0) {
        try {
            $stmt = $conn->prepare("SELECT $column as Data FROM $table WHERE $where = :where LIMIT :limit;");
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindParam(":where", $whereEqualTo);
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if ($returnAsArray) {
                        $resultArray = array();
                        foreach ($data as $current) {
                            $resultArray[] = $current["Data"];
                        }
                        return $resultArray;
                    } else {
                        foreach ($data as $current) {
                            if ($distinct) {
                                return array_unique($current["Data"], SORT_REGULAR);
                            }
                            return $current["Data"];
                        }
                    }
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
    } else {
        try {
            $stmt = $conn->prepare("SELECT $column as Data FROM $table WHERE $where = ?;");
            if ($stmt->execute([$whereEqualTo])) {
                if ($stmt->rowCount()) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    if ($returnAsArray) {
                        $resultArray = array();
                        foreach ($data as $current) {
                            $resultArray[] = $current["Data"];
                        }
                        if ($distinct) {
                            return array_unique($resultArray, SORT_REGULAR);
                        }
                        return $resultArray;
                    } else {
                        foreach ($data as $current) {
                            return $current["Data"];
                        }
                    }
                }
            }
        } catch (Exception $e) {
            return false;
        }
    }
    return false;
}

function hasAllContidions($conn = false, $needle, $haystack, $searchMode = false)
{
    foreach ($needle as $currentWhereKey => $currentWhereValue) {
        if (isset($haystack->$currentWhereKey)) {
            if ($searchMode) {
                if (!str_contains(strtolower($haystack->$currentWhereKey), strtolower($currentWhereValue))) {
                    return false;
                }
            } else {
                //logWrite($conn, "general", json_encode($currentResult->$currentWhereKey)." == $currentWhereValue". "Calc =".json_encode($currentResult->$currentWhereKey == $currentWhereValue), true, false, []);
                if ($haystack->$currentWhereKey == $currentWhereValue) {
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }
    return true;
}

function array_contains_all_values($haystack, $needle, $olnlyValue = true, $notEmpty = false)
{
    if (!$needle) {
        return false;
    }
    if (!$haystack) {
        return false;
    }
    if ($notEmpty) {
        if (!count($needle) > 0) return false;
        if (!count($haystack) > 0) return false;
    }
    foreach ($needle as $checkKey => $checkValue) {
        if ($olnlyValue) {
            if (!in_array($checkValue, $haystack)) {
                return false;
            }
        } else {
            if ($haystack->$checkKey == $checkValue) {
            } else {
                return false;
            }
        }
    }
    return true;
}

function getValueFromDatabaseMultipleWhere($conn, $table, $column, $whereArray, $distinct = false, $searchMode = false)
{
    $resultArray = array();

    try {
        $stmt = $conn->prepare("SELECT * FROM $table;");
        if ($stmt->execute()) {
            if ($stmt->rowCount()) {

                $count = 0;
                //While because otherwhise there will be too much traffic (data) if there are more quizzes than 50
                while ($currentResult = json_validate($stmt->fetch(PDO::FETCH_ASSOC))) {
                    $count++;
                    if (hasAllContidions($conn, $whereArray, $currentResult, $searchMode)) {
                        //Add
                        $resultArray[] = $currentResult->$column;
                    }
                }
                if (!count($resultArray) > 0) {
                    return false;
                }
                if ($distinct) {
                    return array_unique($resultArray, SORT_REGULAR);
                }
                return $resultArray;
            }
        }
    } catch (Exception $e) {
        return $e;
    }

    return false;
}

function getColumsFromDatabaseMultipleWhere($conn, $table, $columns = array(), $whereArray, $limitResults = false, $distinct = false, $returnArray = false, $searchMode = false)
{
    $resultArray = array();

    try {
        $stmt = $conn->prepare("SELECT * FROM $table;");
        if ($stmt->execute()) {
            if ($stmt->rowCount()) {

                $count = 0;
                //While because otherwhise there will be too much traffic (data) if there are more quizzes than 50
                while ($currentResult = json_validate($stmt->fetch(PDO::FETCH_ASSOC))) {
                    if (hasAllContidions($conn, $whereArray, $currentResult, $searchMode)) {
                        //Add
                        $currentResultArray = array();
                        foreach ($columns as $column) {
                            if (isset($currentResult->$column)) {
                                $currentResultArray[$column] = $currentResult->$column;
                            }
                        }
                        if (!$returnArray) {
                            if (!count($currentResultArray) > 0) {
                                return false;
                            }
                            return $currentResultArray;
                        }
                        $resultArray[] = $currentResultArray;
                    }
                    $count++;
                }
                if (!count($resultArray) > 0) {
                    return 1;
                }
                if ($distinct) {
                    return limitArray(array_unique($resultArray, SORT_REGULAR), $limitResults);
                }
                return limitArray($resultArray, $limitResults);
            }
        }
    } catch (Exception $e) {
        return false;
    }

    return false;
}

function customDatabaseCall($conn, $SQL, $VALUEARRAY, $fetchResults = true)
{
    $resultArray = array();

    try {
        $stmt = $conn->prepare($SQL);
        if ($stmt->execute($VALUEARRAY)) {
            if ($stmt->rowCount()) {
                if (!$fetchResults) {
                    return true;
                }
                //While because otherwhise there will be too much traffic (data) if there are more quizzes than 50
                while ($currentResult = json_validate($stmt->fetch(PDO::FETCH_ASSOC))) {
                   $resultArray[] = $currentResult;
                }
               return $resultArray;
            }
        }
    } catch (Exception $e) {
        logWrite($conn, "general", $e, true, true);
        return false;
    }

    return false;
}


function setValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, $newValue, $insertIFNotExists = false)
{
    //checkifexists
    if (valueInDatabaseExists($conn, $table, $column, $where, $whereEqualTo)) {
        try {
            $stmt = $conn->prepare("UPDATE $table SET $column = ? WHERE $where = ?");
            if ($stmt->execute([$newValue, $whereEqualTo])) {
                if ($stmt->rowCount()) {
                    return true;
                }
            }
        } catch (Exception $e) {
            logWrite($conn, "general", $e);
            return false;
        }
    } else {
        if ($insertIFNotExists) {
            try {
                $stmt = $conn->prepare("INSERT INTO $table ($column) VALUES (?);");
                if ($stmt->execute([$newValue])) {
                    if ($stmt->rowCount()) {
                        return true;
                    }
                }
            } catch (Exception $e) {
                logWrite($conn, "general", $e);
                return false;
            }
        }
    }
    return false;
}

function deleteRowFromDatabase($conn, $table, $column, $where, $whereEqualTo)
{
    if (valueInDatabaseExists($conn, $table, $column, $where, $whereEqualTo)) {
        try {
            $stmt = $conn->prepare("DELETE FROM $table WHERE $where = ?");
            if ($stmt->execute([$whereEqualTo])) {
                if ($stmt->rowCount()) {
                    return true;
                }
            }
        } catch (Exception $e) {
            return false;
        }
        return false;
    }
    return false;
}


function valueInDatabaseExists($conn, $table, $column, $where, $whereEqualTo)
{
    try {
        $stmt = $conn->prepare("SELECT $column FROM $table WHERE $where = ?;");
        if ($stmt->execute([$whereEqualTo])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
        return false;
    }
    return false;
}

function repairObjectOrArrayInDatabase($conn, $table, $column, $where, $whereEqualTo, $newValue)
{
    $arrayORObjectFromDatabaseSTRING = getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, 1);
    if (json_validate($arrayORObjectFromDatabaseSTRING)) {
        return true;
    } else {
        if (setValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, $newValue, true)) {
            return true;
        }
    }
    return false;
}

function removeFromArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $toRemove, $removeAll = true, $reindexArray = true)
{
    //Get Array From database
    $arrayFromDatabaseSTRING = getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, 1, false);
    //Check if it is valid
    if ($arrayFromDatabaseSTRING == false) {
        //Insert
        $completeNewArray = array();
        if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewArray)) {
            return true;
        } else {
            return false;
        }
    } else {
        //Check if Valid Array
        if (json_validate($arrayFromDatabaseSTRING)) {
           
            $arrayFromDatabase = json_decode($arrayFromDatabaseSTRING);

            $arrayFromDatabase = removeFromArray($arrayFromDatabase, $toRemove, "value", $removeAll, $reindexArray);
            if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $arrayFromDatabase)) {
                return true;
            } else {
                return false;
            }
        } else {
            //Insert new
            $completeNewArray = array();
            if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewArray)) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function addToArray($array, $value, $containTwice = true)
{
    if ($containTwice) {
        $array[] = $value;
    } else {
        if (!in_array($value, $array)) {
            $array[] = $value;
        }
    }
    return $array;
}

function addToArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $newValue, $ContainTwice = true)
{
    //Get Array From database
    $arrayFromDatabaseSTRING = getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, 1, false);
    //Check if it is valid
    if ($arrayFromDatabaseSTRING == false) {
        //Insert
        $completeNewArray = array();
        $completeNewArray[] = $newValue;
        if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewArray)) {
            return true;
        } else {
            return false;
        }
    } else {
        //Check if Valid Array
        if ($arrayFromDatabase = json_validate($arrayFromDatabaseSTRING)) {

            if ($ContainTwice) {
                $arrayFromDatabase[] = $newValue;

                if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $arrayFromDatabase)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (!in_array($newValue, $arrayFromDatabase)) {
                    $arrayFromDatabase[] = $newValue;
                    if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $arrayFromDatabase)) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        } else {
            //Insert new
            $completeNewArray = array();
            $completeNewArray[] = $newValue;
            if (insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewArray)) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function insertArrayDatabase($conn, $table, $column, $where, $whereEqualTo, $newArray)
{
    if (setValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, json_encode($newArray), true)) {
        return true;
    }
    return false;
}

function removeFromObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $toRemove, $removeAll = true, $reindexArray = true, $keyOrValue = "key")
{
    //Get Array From database
    $objectFromDatabaseSTRING = getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, 1, false);
    //Check if it is valid
    if ($objectFromDatabaseSTRING == false) {
        //Insert
        $completeNewObject = json_decode("{}");
        if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewObject)) {
            return true;
        } else {
            return false;
        }
    } else {
        //Check if Valid Array
        if ($objectFromDatabase = json_validate($objectFromDatabaseSTRING)) {

            $objectFromDatabase = removeFromObject($objectFromDatabase, $toRemove, $keyOrValue, $removeAll, $reindexArray);
            if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $objectFromDatabase)) {
                return true;
            } else {
                return false;
            }
        } else {
            //Insert new
            $completeNewObject = json_decode("{}");
            if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewObject)) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function setObjectKeyAndValueDatabase($conn, $table, $column, $where, $whereEqualTo, $newValueKey, $newValue)
{
    //Get Array From database
    $objectFromDatabaseSTRING = getValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, 1, false);
    //Check if it is valid
    if ($objectFromDatabaseSTRING == false) {
        //Insert
        $completeNewObject = json_decode("{}");
        print_r($completeNewObject);
        $completeNewObject->$newValueKey = $newValue;
        if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewObject)) {
            return true;
        } else {
            return false;
        }
    } else {
        //Check if Valid Array
        if ($objectFromDatabase = json_validate($objectFromDatabaseSTRING)) {
            $objectFromDatabase->$newValueKey = $newValue;
            if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $objectFromDatabase)) {
                return true;
            } else {
                return false;
            }
        } else {
            //Insert new
            $completeNewObject = json_decode("{}");
            $completeNewObject->$newValueKey = $newValue;
            if (insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $completeNewObject)) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function insertObjectDatabase($conn, $table, $column, $where, $whereEqualTo, $newObject)
{
    if (setValueFromDatabase($conn, $table, $column, $where, $whereEqualTo, json_encode($newObject), true)) {
        return true;
    }
    return false;
}


function getCurrentDateAndTime($type = 1)
{
    if ($type === 1) {
        $now = date("d-m-Y H:i:s e");
        return $now;
    }
    return false;
}

function generateRandomString($length = 10)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function generateRandomUniqueName($randomStringLength = 10)
{
    $microtime = microtime();
    $randomString = generateRandomString($randomStringLength);
    return $microtime . $randomString;
}


function limitArray($array, $length = 10)
{
    if (!$length) {
        return $array;
    }
    return array_slice($array, 0, $length);
}

function generalLog($conn, $log)
{
    logWrite($conn, "general", $log);
}

function setSessionData($status, $message, $redirect)
{
    $_SESSION["data"] = array("status" => $status, "message" => $message, "redirect" => $redirect);
    return true;
}
