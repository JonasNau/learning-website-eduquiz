<?php

function checkValidMimeType($type, $allowedTypes)
{
    if (!$type) return false;
    if (!$allowedTypes || !count($allowedTypes) > 0) return false;
    if (in_array($type, $allowedTypes)) {
        return true;
    }
    return false;
}

function createEntryMedienverwaltung($conn)
{
    //Create mediaID
    $mediaID = generateNewMediaID($conn);
    try {
        $stmt = $conn->prepare("INSERT INTO medienVerwaltung (mediaID) VALUES (?);");
        if ($stmt->execute([$mediaID])) {
            if ($stmt->rowCount()) {
                return $mediaID;
            }
        }
    } catch (Exception $e) {
        logWrite($conn, "general", $e, true, true);
    }
    return false;
}

function generateNewMediaID($conn)
{
    $mediaID = generateRandomUniqueName(6);
    while (valueInDatabaseExists($conn, "medienVerwaltung", "mediaID", "mediaID", $mediaID)) {
        $mediaID = generateRandomUniqueName(6);
    }
    return $mediaID;
}


function generateFileName($conn, $pathToFolder, $filename, $extension)
{;
    $fileName = $filename . "." . $extension;
    $counter = 0;
    while (valueInDatabaseExists($conn, "medienVerwaltung", "filename", "filename", $fileName) || file_exists($pathToFolder . "/" . $fileName)) {
        $counter++;
        $fileName = $filename . "_" . $counter . "." . $extension;
        logWrite($conn, "general", "FileName created:" . $fileName);
    }
    logWrite($conn, "general", "FileName final:" . $fileName);
    return $fileName;
}

function generateFileNameBLOB($conn, $filename, $extension)
{;
    $fileName = $filename . "." . $extension;
    $counter = 0;
    while (valueInDatabaseExists($conn, "medienVerwaltung", "filename", "filename", $fileName)) {
        $counter++;
        $fileName = $filename . "_" . $counter . "." . $extension;
        logWrite($conn, "general", "FileName:" . $fileName);
    }
    logWrite($conn, "general", "FileName final:" . $fileName);
    return $fileName;
}

function getFullPath($conn, $isOnlineSource, $path, $inMediaFolder)
{
    if ($isOnlineSource) return $path;
    if ($inMediaFolder) {
        $mediaFolderPath = getSettingVal($conn, "mediaPATH");
        $serverPATH = getSettingVal($conn, "serverPATH");
        $fullPath = $serverPATH . $mediaFolderPath . $path;
        return $fullPath;
    }
    return $path;
}

function removeFileOrLinkToFile($conn, $id)
{
    if (!$id) return false;

    $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 1, false));
    $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 1, false));
    $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 1, false));
    $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, 1, false);

    if ($isOnlineSource) {
        //Remove URL and BLOB for data saving purposes
        setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
        logWrite($conn, "medienVerwaltung", "Link to file from id = '$id' has been successfully removed", true, false, "green");
        return true;
    }
    if ($isBlob) {
        setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
        logWrite($conn, "medienVerwaltung", "Link to file from id = '$id' has been successfully removed", true, false, "green");
        return true;
    }
    $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, 1, false);
    $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, 1, false);
    if (empty($filename)) {
        return false;
    }
    //On Filesystem
    $finalPath = null;
    if ($inMediaFolder) {
        $mediaFolderPath = getMediaFolderPath($conn);
        $finalPath = $mediaFolderPath . "/" . $type . "/" . $filename;
    } else {
        $finalPath = $path;
    }

    if (!file_exists($finalPath)) {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' existiert nicht.", true, true);
        return false;
    }
    if (unlink($finalPath)) {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' wurde erfolgreich gelöscht.", true, false, "yellow");
        setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
        logWrite($conn, "medienVerwaltung", "Link to file from id = '$id' has been successfully removed", true, false, "green");
        return true;
    } else {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' konnte nicht gelöscht werden.", true, true);
    }
    logWrite($conn, "medienVerwaltung", "Link to file from id = '$id' couldn't been removed", true, true);
    return false;
}

function removeFileOrLinkToFileThumbnail($conn, $id)
{
    if (!$id) return false;

    $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 1, false));
    $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 1, false));
    $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 1, false));
    $path = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, 1, false);

    if ($isOnlineSource) {
        //Remove URL and BLOB for data saving purposes
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobDataThumbnail", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
        return true;
    }
    if ($isBlob) {
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobDataThumbnail", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        return true;
    }
    $filename = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, 1, false);
    setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
    if (empty($filename)) {
        return false;
    }
    //On Filesystem
    $finalPath = null;
    if ($inMediaFolder) {
        $mediaFolderPath = getMediaFolderPath($conn);
        $finalPath = $mediaFolderPath . "/" . "thumbnails" . "/" . $filename;
    } else {
        $finalPath = $path;
    }

    if (!file_exists($finalPath)) {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' existiert nicht.", true, true);
        return false;
    }
    if (unlink($finalPath)) {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' wurde erfolgreich gelöscht.", true, false, "yellow");
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "blobDataThumbnail", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 0);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, null);
        setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
        setChangedAndChangedBy($conn, $id, $_SESSION["userID"]);
        return true;
    } else {
        logWrite($conn, "medienVerwaltung", "Die Datei '$finalPath' konnte nicht gelöscht werden.", true, true);
    }
    return false;
}

function getMediaFolderPath($conn)
{
    return getSettingVal($conn, "serverPATH") . getSettingVal($conn, "mediaPATH");
}

function setChangedAndChangedBy($conn, $id, $userID)
{
    setValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, getCurrentDateAndTime(1));
    removeFromArrayDatabase($conn, "medienVerwaltung", "changedBy", "id", $id, $userID, true, true);
    addToArrayDatabase($conn, "medienVerwaltung", "changedBy", "id", $id, $userID, false);
    logWrite($conn, "medienVerwaltung", "The parameters of the file has changed: id = '$id'", true, false, "light green");
    return true;
}


require_once("../../includes/dbh.incPDO.php");
require_once("../../includes/getSettings.php");
require_once("../../includes/userSystem/functions/permission-functions.php");
require_once("../../includes/generalFunctions.php");
require_once("../../includes/userSystem/functions/generalFunctions.php");
require_once("../../includes/userSystem/autologin.php");
require_once("../../includes/userSystem/functions/login-functions.php");
require_once("./lehrerpanel.inc.php");

require_once("../../global.php");

mustBeLoggedIn();

$userID = $_SESSION['userID'];

$database = new dbh();
$conn = $database->connect();

if (isset($_POST["medienverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    require_once("../includes/medienverwaltung-functions.php");
    if (!userHasPermissions($conn, $userID, ["accessMediaVerwaltung" => gnVP($conn, "accessMediaVerwaltung")])) {
        permissionDenied();
        die();
    }

    $operation = isset($_POST["operation"]) ? $_POST["operation"] : "";

    if ($operation === "search") {
        $filter = isset($_POST["filter"]) ? $_POST["filter"] : "";

        function returnResults($conn, $results, $limitResults)
        {
            if (!$results || !count($results)) {
                echo "no results";
                die();
            }
            $results = limitArray($results, $limitResults);
            $resultArray = array();

            foreach ($results as $result) {

                $mediaID = getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $result, 1, false);
                $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $result, 1, false));
                $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $result, 1, false));
                $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $result, 1, false));
                $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $result, 1, false);
                $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $result, 1, false);
                $mimeType = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $result, 1, false);
                $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $result, 1, false);
                $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $result, 1, false);
                $thumbnail = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $result, 1, false));
                $thumbnailIsBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $result, 1, false));
                $thumbnailIsOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $result, 1, false));
                $thumbnailFileName = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $result, 1, false);
                $thumbnailInMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $result, 1, false));
                $thumbnailMimeType = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $result, 1, false);
                $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $result, 1, false);
                $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "id", $result, 1, false);
                $keywords = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $result, 1, false));
                $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $result, 1, false);
                $changed = getValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $result, 1, false);
                $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $result, 1, false);
                $uploadedBy = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $result, 1, false);
                $changedBy = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $result, 1, false));

                $resultArray[] = array("id" => $result, "mediaID" => $mediaID, "uploadedBy" => $uploadedBy, "changedBy" => $changedBy, "uploaded" => $uploaded, "changed" => $changed, "thumbnailIsBlob" => $thumbnailIsBlob, "thumbnailIsOnlineSource" => $thumbnailIsOnlineSource, "thumbnail" => $thumbnail, "isBlob" => $isBlob, "isOnlineSource" => $isOnlineSource, "inMediaFolder" => $inMediaFolder, "uploaded" => $uploaded, "filename" => $filename, "mimeType" => $mimeType, "type" => $type, "path" => $path, "thumbnailFileName" => $thumbnailFileName, "thumbnailMimeType" => $thumbnailMimeType, "thumbnailPath" => $thumbnailPath, "description" => $description, "keywords" => $keywords, "fileSize" => $fileSize, "thumbnailInMediaFolder" => $thumbnailInMediaFolder);
            }
            echo json_encode($resultArray);
        }

        $limitResults = isset($_POST["limit"]) ? intval($_POST["limit"]) : 0;

        if ($filter === "filename") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $currentID, 1, false);
                if (str_contains(strtolower($filename), strtolower($input)) || str_contains(strToUpper($filename), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "description") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $filename = getValueFromDatabase($conn, "medienVerwaltung", "description", "id", $currentID, 1, false);
                if (str_contains(strtolower($filename), strtolower($input)) || str_contains(strToUpper($filename), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "mimeType") {
            $input = custom_json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $mimeType = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $currentID, 1, false);
                if (in_array($mimeType, $input)) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "type") {
            $input = custom_json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $currentID, 1, false);
                if (in_array($type, $input)) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "path") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $currentID, 1, false);
                if (str_contains(strtolower($path), strtolower($input)) || str_contains(strToUpper($path), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "id") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                if ($currentID == $input) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "mediaID") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $mediaID = getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $currentID, 1, false);
                if (str_contains(strtolower($mediaID), strtolower($input)) || str_contains(strToUpper($mediaID), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "keyWords") {
            $input = custom_json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $keywords = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keyWords", "id", $currentID, 1, false));
                if (array_contains_all_values($keywords, $input, true)) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "isOnlineSource") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $currentID, 1, false));
                if ($isOnlineSource == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "inMediaFolder") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $currentID, 1, false));
                if ($inMediaFolder == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "uploaded") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $currentID, 1, false);
                if (str_contains(strtolower($uploaded), strtolower($input)) || str_contains(strToUpper($uploaded), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "uploadedBy") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $uploadedBy = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $currentID, 1, false);
                if ($uploadedBy == $input) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "changed") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $changed = getValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $currentID, 1, false);
                if (str_contains(strtolower($changed), strtolower($input)) || str_contains(strToUpper($changed), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "changedBy") {
            $input = custom_json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $changedBy = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $currentID, 1, false));
                if (array_contains_all_values($changedBy, $input)) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "isBlob") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $isBlob = boolval(intval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $isBlob, 1, false)));
                if ($isBlob == boolval(intval($input))) {
                    $resultArray[] = $isBlob;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnail") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnail = getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $currentID, 1, false);
                if (boolval(intval($thumbnail)) == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailIsBlob") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailIsBlob = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $currentID, 1, false);
                if (boolval(intval($thumbnailIsBlob)) == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailFileName") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailFileName = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $currentID, 1, false);
                if (str_contains(strtolower($thumbnailFileName), strtolower($input)) || str_contains(strToUpper($thumbnailFileName), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailMimeType") {
            $input = custom_json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailMimeType = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $currentID, 1, false);
                if (in_array($thumbnailMimeType, $input)) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailIsOnlineSource") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailIsOnlineSource = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $currentID, 1, false);
                if (boolval(intval($thumbnailIsOnlineSource)) == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailPath") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $currentID, 1, false);
                if (str_contains(strtolower($thumbnailPath), strtolower($input)) || str_contains(strToUpper($thumbnailPath), strToUpper($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "thumbnailInMediaFolder") {
            $input = $_POST["input"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $thumbnailInMediaFolder = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $currentID, 1, false);
                if (boolval(intval($thumbnailInMediaFolder)) == boolval(intval($input))) {
                    $resultArray[] = $currentID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true), $limitResults);
            die();
        } else if ($filter === "multiple") {
            $filename = $_POST["filename"];
            $description = $_POST["description"];
            $type = custom_json_validate($_POST["type"]);
            $mimeType = custom_json_validate($_POST["mimeType"]);
            $path = $_POST["path"];
            $id = $_POST["id"];
            $mediaID = $_POST["mediaID"];
            $keyWords = custom_json_validate($_POST["keyWords"]);
            $isOnlineSource = $_POST["isOnlineSource"];
            $inMediaFolder = $_POST["inMediaFolder"];
            $uploaded = $_POST["uploaded"];
            $uploadedBy = $_POST["uploadedBy"];
            $changed = $_POST["changed"];
            $changedBy = custom_json_validate($_POST["changedBy"]);
            $isBlob = $_POST["isBlob"];
            $thumbnail = $_POST["thumbnail"];
            $thumbnailIsBlob = $_POST["thumbnailIsBlob"];
            $thumbnailFileName = $_POST["thumbnailFileName"];
            $thumbnailMimeType = $_POST["thumbnailMimeType"];
            $thumbnailIsOnlineSource = $_POST["thumbnailIsOnlineSource"];
            $thumbnailPath = $_POST["thumbnailPath"];
            $thumbnailInMediaFolder = $_POST["thumbnailInMediaFolder"];

            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);

            if ($filename !== false && count($allMediaIDs) > 0 && $filename != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $filenameCurrent = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($filenameCurrent), strtolower($filename)) && !str_contains(strToUpper($filenameCurrent), strToUpper($filename))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($description !== false && count($allMediaIDs) > 0 && $description != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $descriptionCurrent = getValueFromDatabase($conn, "medienVerwaltung", "description", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($descriptionCurrent), strtolower($description)) && !str_contains(strToUpper($descriptionCurrent), strToUpper($description))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($type !== false && count($type) && count($allMediaIDs) > 0 && $type != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $typeCurrent = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $currentID, 1, false);
                    if (!in_array($typeCurrent, $type)) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($mimeType !== false && count($mimeType) && count($allMediaIDs) > 0 && $description != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $mimeTypeCurrent = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $currentID, 1, false);
                    if (!in_array($mimeTypeCurrent, $mimeType)) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($path !== false && count($allMediaIDs) > 0 && $path != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $pathCurrent = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($pathCurrent), strtolower($path)) && !str_contains(strToUpper($pathCurrent), strToUpper($path))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($id !== false && count($allMediaIDs) > 0 && $id != "false") {
                foreach ($allMediaIDs as $currentID) {
                    if (!$currentID == $id) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($mediaID !== false && count($allMediaIDs) > 0 && $mediaID != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $mediaIDCurrent = getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($mediaIDCurrent), strtolower($mediaID)) && !str_contains(strToUpper($mediaIDCurrent), strToUpper($mediaID))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($keyWords !== false && count($keyWords) && count($allMediaIDs) > 0 && $keyWords != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $keywordsCurrent = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $currentID, 1, false));
                    if (!array_contains_all_values($keywordsCurrent, $keyWords, true, true)) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($isOnlineSource !== false && count($allMediaIDs) > 0 && $isOnlineSource != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $isOnlineSourceCurrent = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $currentID, 1, false));
                    if ($isOnlineSourceCurrent != boolval(intval($isOnlineSource))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($inMediaFolder !== false && count($allMediaIDs) > 0 && $inMediaFolder != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $inMediaFolderCurrent = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $currentID, 1, false));
                    if ($inMediaFolderCurrent != boolval(intval($inMediaFolder))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($uploaded !== false && count($allMediaIDs) > 0 && $uploaded != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $uploadedCurrent = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($uploadedCurrent), strtolower($uploaded)) && !str_contains(strToUpper($uploadedCurrent), strToUpper($uploaded))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($uploadedBy !== false && count($allMediaIDs) > 0 && $uploadedBy != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $uploadedByCurrent = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $currentID, 1, false);
                    if ($uploadedByCurrent != $uploadedBy) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($changed !== false && count($allMediaIDs) > 0 && $changed != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $changedCurrent = getValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($changedCurrent), strtolower($changed)) && !str_contains(strToUpper($changedCurrent), strToUpper($changed))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($changedBy !== false && count($uploadedBy) && count($allMediaIDs) > 0 && $changedBy != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $changedByCurrent = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $currentID, 1, false));
                    if (!array_contains_all_values($changedByCurrent, $changedBy, true, true)) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($isBlob !== false && count($allMediaIDs) > 0 && $isBlob != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $isBlobCurrent = getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $isBlob, 1, false);
                    if (boolval(intval($isBlobCurrent)) != boolval(intval($isBlob))) {
                        $resultArray[] = $isBlob;
                    }
                }
            }
            if ($thumbnail !== false && count($allMediaIDs) > 0 && $thumbnail != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $currentID, 1, false);
                    if (boolval(intval($thumbnailCurrent)) != boolval(intval($thumbnail))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailIsBlob !== false && count($allMediaIDs) > 0 && $thumbnailIsBlob != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailIsBlobCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $currentID, 1, false);
                    if (boolval(intval($thumbnailIsBlobCurrent)) != boolval(intval($thumbnailIsBlob))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailFileName !== false && count($allMediaIDs) > 0 && $thumbnailFileName != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailFileNameCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($thumbnailFileNameCurrent), strtolower($thumbnailFileName)) && !str_contains(strToUpper($thumbnailFileNameCurrent), strToUpper($thumbnailFileName))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailMimeType !== false && count($allMediaIDs) > 0 && $thumbnailMimeType != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailMimeTypeCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $currentID, 1, false);
                    if (!in_array($thumbnailMimeTypeCurrent, $thumbnailMimeType)) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailIsOnlineSource !== false && count($allMediaIDs) > 0 && $thumbnailIsOnlineSource != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailIsOnlineSourceCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $currentID, 1, false);
                    if (boolval(intval($thumbnailIsOnlineSourceCurrent)) != boolval(intval($thumbnailIsOnlineSource))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailPath !== false && count($allMediaIDs) > 0 && $thumbnailPath != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $currentID, 1, false);
                    if (!str_contains(strtolower($thumbnailPath), strtolower($input)) && !str_contains(strToUpper($thumbnailPath), strToUpper($input))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }
            if ($thumbnailPath !== false && count($allMediaIDs) > 0 && $thumbnailPath != "false") {
                foreach ($allMediaIDs as $currentID) {
                    $thumbnailInMediaFolderCurrent = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $currentID, 1, false);
                    if (boolval(intval($thumbnailInMediaFolderCurrent)) != boolval(intval($thumbnailPath))) {
                        $allMediaIDs = removeFromArray($allMediaIDs, $currentID);
                    }
                }
            }

            returnResults($conn, $allMediaIDs, $limitResults);
            die();
        }
    } else if ($operation === "other") {
        $type = $_POST["type"];
        if ($type === "getAllAvailableTypes") {
            echo json_encode(getAllValuesFromDatabase($conn, "medienVerwaltung", "type", 0, true, true));
            die();
        } else if ($type === "getAllAvailablMimeTypes") {
            echo json_encode(getAllValuesFromDatabase($conn, "medienVerwaltung", "mimeType", 0, true, true));
            die();
        } else if ($type === "getAllAvailablMimeTypesThumbnail") {
            echo json_encode(getAllValuesFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", 0, true, true));
            die();
        } else if ($type === "getKeywords") {
            $searchFor = $_POST['searchFor'];
            echo json_encode(searchForKeywords($conn, $searchFor));
            die();
        }
    } else if ($operation === "changeValue") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "medienVerwaltung", "id", "id", $id)) {
            returnMessage("failed", "Der Medieneintrag, den du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues" => gnVP($conn, "medienverwaltungChangeValues")])) {
            permissionDenied();
            die();
        }
        $type = $_POST["type"];



        if ($type === "changeData") {
            $secondOperation = $_POST["secondOperation"] ?? "";
            if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues" => gnVP($conn, "medienverwaltungChangeValues"), "medienverwaltungADDandREMOVE" => gnVP($conn, "medienverwaltungADDandREMOVE")])) {
                permissionDenied();
                die();
            }
            if ($secondOperation == "uploadToFileSystem") {
                if (isset($_FILES['file']["name"])) {
                    // print_r($_FILES);
                    $file = $_FILES['file'];
                    if ($file["error"]) {
                        returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                        die();
                    }
                    // MediaFolder PATH
                    $mediaFolderPath = getMediaFolderPath($conn);

                    $mimeType = $file["type"];
                    $filename = $file['name'];
                    $size = $file['size'];
                    $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                    if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                        returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                        die();
                    }

                    $type = explode("/", $mimeType, 2)[0];


                    $path_parts = pathinfo($mediaFolderPath . "/" . $filename);
                    $dirname = $path_parts['dirname'];
                    $basename = $path_parts['basename'];
                    $extension =  $path_parts['extension'];
                    $filenameFromPathParts =  $path_parts['filename'];

                    $pathToFolder = $mediaFolderPath . "/" . $type;
                    //Create Folder if not exists
                    if (!file_exists($pathToFolder)) {
                        $oldmask = umask(0);
                        mkdir($pathToFolder, 0777, true);
                        umask($oldmask);
                    }


                    $finalfilename = generateFileName($conn, $pathToFolder, $filenameFromPathParts, $extension);

                    $finalPath =  $pathToFolder . "/" . $finalfilename;
                    if (file_exists($finalPath)) {
                        returnMessage("failed", "Eine Datei mit diesem Namen in $finalPath existiert schon");
                        die();
                    }

                    //Delete Old file (onFilesystem, Blob, OnlineSource)
                    removeFileOrLinkToFile($conn, $id);

                    // Upload file
                    if (move_uploaded_file($tmpname, $finalPath)) {
                        //Add parameters to database
                        setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 1);
                        setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, getCurrentDateAndTime(1));
                        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $finalfilename);
                        setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, $mimeType);
                        setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, "/" . $type);
                        setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, $type);
                        setValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $id, $userID);
                        setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, $size);
                        logWrite($conn, "medienverwaltung", "A file has successfully been uploaded to filesystem: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID' " . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, false, "green");
                        returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id, "finalPath" => $finalPath));
                        die();
                    } else {
                        logWrite($conn, "medienverwaltung", "A file has has failed to upload to filesystem: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID'" . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, true);
                        returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                        die();
                    }
                } else {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                    die();
                }
            } else if ($secondOperation == "uploadAsBlob") {
                if (isset($_FILES['file']["name"])) {
                    // print_r($_FILES);
                    $file = $_FILES['file'];
                    if ($file["error"]) {
                        returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                        die();
                    }

                    $mimeType = $file["type"];
                    $filename = $file['name'];
                    $size = $file['size'];
                    $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                    if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                        returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                        die();
                    }

                    $type = explode("/", $mimeType, 2)[0];


                    $path_parts = pathinfo($filename);
                    $dirname = $path_parts['dirname'];
                    $basename = $path_parts['basename'];
                    $extension =  $path_parts['extension'];
                    $filenameFromPathParts =  $path_parts['filename'];


                    $finalfilename = generateFileNameBLOB($conn, $filenameFromPathParts, $extension);

                    //Delete Old file (onFilesystem, Blob, OnlineSource)
                    if (!removeFileOrLinkToFile($conn, $id)) {
                        returnMessage("failed", "Die alte Datei konnte nicht gelöscht werden.");
                        die();
                    }

                    $blob = file_get_contents($tmpname);
                    if (!$blob) {
                        returnMessage("failed", "Ein Fehler beim Erstellen des BLOBs ist aufgetreten.");
                        die();
                    }
                    // Upload file
                    if (setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, $blob)) {
                        //Add parameters to database
                        setValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 1);
                        setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, getCurrentDateAndTime(1));
                        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $finalfilename);
                        setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, $mimeType);
                        setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, $type);
                        setValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $id, $userID);
                        setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, $size);
                        logWrite($conn, "medienverwaltung", "A file has successfully been uploaded as BLOB: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID'" . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, false, "green");
                        returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id));
                        die();
                    } else {
                        logWrite($conn, "medienverwaltung", "A file has has failed to upload as BLOB: mediaID = '$mediaID' " . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, true);
                        returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                        die();
                    }
                } else {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                    die();
                }
            } else if ($secondOperation == "addOnlineSource") {
                $url = json_decode($_POST["url"]);
                $url = $url->{"url"};
               
                //Delete Old file (onFilesystem, Blob, OnlineSource)
                if (!removeFileOrLinkToFile($conn, $id)) {
                    returnMessage("failed", "Die alte Datei konnte nicht gelöscht werden.");
                    die();
                }

                setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 1);
                setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, $url);
                setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, "Onlinequelle");
                logWrite($conn, "medienVerwaltung", "A media entry has been created (onlineeSource): id = '$id' finalPath = '$finalPath'" . json_encode(array("url" => $url, "mediaID" => $mediaID)), true, false, "green");
                returnMessage("success", "Medieneintrag erfolgreich geändert..", false, array("id" => $id));
                die();
            } else if ($secondOperation == "remove") {
                if (removeFileOrLinkToFile($conn, $id)) {
                    logWrite($conn, "medienVerwaltung", "Media entry successfully deleted: id='$id'", true, false, "orange");
                    returnMessage("success", "Datei erfolgreich entfernt.");
                } else {
                    logWrite($conn, "medienVerwaltung", "Media entry can't be deleted: id='$id'", true, true);
                    returnMessage("failed", "Datei konnte nicht entfernt werden.");
                }
                die();
            }
        } else if ($type === "description") {
            $newValue = $_POST["newValue"];
            if (setValueFromDatabase($conn, "medienVerwaltung", "description", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Beschreibung erfolgreich geändert");
            } else {
                returnMessage("failed", "Beschreibung wurde nicht geändert");
            }
            die();
        } else if ($type === "keywords") {
            $newValue = custom_json_validate($_POST["newValue"]);
            if (setValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $id, json_encode($newValue))) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Schlüsselwörter erfolgreich geändert");
            } else {
                returnMessage("failed", "Schlüsselwörter wurde nicht geändert");
            }
            die();
        } else if ($type === "isOnlineSource") {
            $newValue = intval(custom_json_validate($_POST["newValue"]));
            if (setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Wert erfolgreich geändert");
            } else {
                returnMessage("failed", "Wert wurde nicht geändert");
            }
            die();
        } else if ($type === "path") {
            $newValue = custom_json_validate($_POST["newValue"])?->{"path"};
            if (setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Pfad / URL erfolgreich geändert");
            } else {
                returnMessage("failed", "Pfad / URL wurde nicht geändert");
            }
            die();
        } else if ($type === "inMediaFolder") {
            $newValue = intval(custom_json_validate($_POST["newValue"]));
            if (setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Wert erfolgreich geändert");
            } else {
                returnMessage("failed", "Wert wurde nicht geändert");
            }
            die();
        } else if ($type === "filename") {
            $newName = custom_json_validate($_POST["newValue"])?->{"newValue"};

            $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 1, false));
            $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 1, false));
            $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, 1, false);
            $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 1, false));
            $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, 1, false);

            if ($isBlob) {
                if (setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $newName)) {
                    setChangedAndChangedBy($conn, $id, $userID);
                    returnMessage("success", "Name erfolgreich geändert");
                } else {
                    returnMessage("failed", "Name wurde nicht geändert");
                }
            } else {
                if ($isOnlineSource) {
                    returnMessage("failed", "Der Dateiname von einer Onlinequelle kann nicht geändert werden.");
                    die();
                }
                //File is on fileSystem
                $fullPath = getFullPath($conn, $isOnlineSource, $path, $inMediaFolder);
                logWrite($conn, "general", "fullPath:" . $fullPath);
                $path = $fullPath . "/" . $filename;
                if (file_exists($fullPath . "/" . $newName)) {
                    returnMessage("failed", "Auf dem Dateisystem mit dem Pfad $fullPath existiert bereits eine Datei mit dem Namen $newName");
                    die();
                } else {
                    setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $newName); //Change even if the acual file can't be renamed
                    if (rename($fullPath . "/" . $filename, $fullPath . "/" . $newName, null)) {
                        returnMessage("success", "Datei erfolgreich von '$filename' zu '$newName' umbenannt");
                        setChangedAndChangedBy($conn, $id, $userID);
                        die();
                    } else {
                        setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $newName);
                        returnMessage("failed", "Ein Fehler beim Umbenennen ist aufgetreten. Versuche es erneut.");
                        die();
                    }
                }
            }
            die();
        } else if ($type === "mediaID") {
            $newValue = custom_json_validate($_POST["newValue"])?->{"newValue"};
            if (valueInDatabaseExists($conn, "medienVerwaltung", "mediaID", "mediaID", $newValue)) {
                returnMessage("failed", "Es existiert bereits ein Medienentrag mit der mediaID '$newValue'");
                die();
            }
            if (setValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "MediaID erfolgreich geändert");
            } else {
                returnMessage("failed", "MediaID wurde nicht geändert");
            }
            die();
        } else if ($type === "thumbnail") {
            $newValue = intval(custom_json_validate($_POST["newValue"]));
            if (!boolval($newValue)) {
                //Set to false -> remove thumbnail
                if (!removeFileOrLinkToFileThumbnail($conn, $id)) {
                    returnMessage("failed", "Die alte Thumbnail-Datei konnte nicht entfernt werden.");
                    die();
                }
            }
            if (setValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Wert erfolgreich geändert");
            } else {
                returnMessage("failed", "Wert wurde nicht geändert");
            }
            die();
        } else if ($type === "changeDataThumbnail") {
            $secondOperation = $_POST["secondOperation"] ?? "";
            if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues" => gnVP($conn, "medienverwaltungChangeValues"), "medienverwaltungADDandREMOVE" => gnVP($conn, "medienverwaltungADDandREMOVE")])) {
                permissionDenied();
                die();
            }
            if (!boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false))) {
                returnMessage("failed", "Aktiviere zuerst das Thumbail bei diesem Medieneintrag.");
                die();
            }
            if ($secondOperation == "uploadToFileSystem") {
                if (isset($_FILES['file']["name"])) {
                    // print_r($_FILES);
                    $file = $_FILES['file'];
                    if ($file["error"]) {
                        returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                        die();
                    }
                    // MediaFolder PATH
                    $mediaFolderPath = getMediaFolderPath($conn);

                    $mimeType = $file["type"];
                    $filename = $file['name'];
                    $size = $file['size'];
                    $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                    if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                        returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                        die();
                    }

                    $type = explode("/", $mimeType, 2)[0];
                    if ($type != "image") {
                        returnMessage("failed", "Als Miniaturansicht können nur Bilder verwendet werden.");
                        die();
                    }


                    $path_parts = pathinfo($mediaFolderPath . "/" . $filename);
                    $dirname = $path_parts['dirname'];
                    $basename = $path_parts['basename'];
                    $extension =  $path_parts['extension'];
                    $filenameFromPathParts =  $path_parts['filename'];

                    $pathToFolder = $mediaFolderPath . "/" . "thumbnails";

                    $finalfilename = generateFileName($conn, $pathToFolder, $filenameFromPathParts, $extension);

                    $finalPath =  $pathToFolder . "/" . $finalfilename;
                    if (file_exists($finalPath)) {
                        returnMessage("failed", "Eine Datei mit diesem Namen in $finalPath existiert schon");
                        die();
                    }

                    //Delete Old file (onFilesystem, Blob, OnlineSource)
                    removeFileOrLinkToFileThumbnail($conn, $id);

                    // Upload file
                    if (move_uploaded_file($tmpname, $finalPath)) {
                        //Add parameters to database
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 1);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, $finalfilename);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, $mimeType);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, "/" . "thumbnails");
                        setChangedAndChangedBy($conn, $id, $userID);
                        returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id, "finalPath" => $finalPath));
                        die();
                    } else {
                        returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                        die();
                    }
                } else {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                    die();
                }
            } else if ($secondOperation == "uploadAsBlob") {
                if (isset($_FILES['file']["name"])) {
                    // print_r($_FILES);
                    $file = $_FILES['file'];
                    if ($file["error"]) {
                        returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                        die();
                    }

                    $mimeType = $file["type"];
                    $filename = $file['name'];
                    $size = $file['size'];
                    $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                    if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                        returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                        die();
                    }

                    $type = explode("/", $mimeType, 2)[0];
                    if ($type != "image") {
                        returnMessage("failed", "Als Miniaturansicht können nur Bilder verwendet werden.");
                        die();
                    }

                    $path_parts = pathinfo($filename);
                    $dirname = $path_parts['dirname'];
                    $basename = $path_parts['basename'];
                    $extension =  $path_parts['extension'];
                    $filenameFromPathParts =  $path_parts['filename'];


                    $finalfilename = generateFileNameBLOB($conn, $filenameFromPathParts, $extension);

                    //Delete Old file (onFilesystem, Blob, OnlineSource)
                    removeFileOrLinkToFile($conn, $id);

                    $blob = file_get_contents($tmpname);
                    if (!$blob) {
                        returnMessage("failed", "Ein Fehler beim Erstellen des BLOBs ist aufgetreten.");
                        die();
                    }
                    // Upload file
                    if (setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, $blob)) {
                        //Add parameters to database
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 1);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 0);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, $finalfilename);
                        setValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, $mimeType);
                        setChangedAndChangedBy($conn, $id, $userID);
                        returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id));
                        die();
                    } else {
                        returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                        deleteRowFromDatabase($conn, "medienVerwaltung", "id", "id", $id);
                        die();
                    }
                } else {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                    die();
                }
            } else if ($secondOperation == "addOnlineSource") {
                $url = json_decode($_POST["url"]);
                $url = $url->{"url"};
               
                //Delete Old file (onFilesystem, Blob, OnlineSource)
                if (!removeFileOrLinkToFile($conn, $id)) {
                    returnMessage("failed", "Die alte Datei konnte nicht gelöscht werden.");
                    die();
                }

                setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 1);
                setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, $url);
                returnMessage("success", "Medieneintrag erfolgreich geändert..", false, array("id" => $id));
                die();
            } else if ($secondOperation == "remove") {
                if (removeFileOrLinkToFileThumbnail($conn, $id)) {
                    returnMessage("success", "Datei erfolgreich entfernt.");
                } else {
                    returnMessage("failed", "Datei konnte nicht entfernt werden.");
                }
                die();
            }
        } else if ($type === "thumbnailFileName") {
            $newName = custom_json_validate($_POST["newValue"])?->{"newValue"};

            $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 1, false));
            $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 1, false));
            $path = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, 1, false);
            $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 1, false));
            $filename = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, 1, false);
            if (!boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false))) {
                returnMessage("failed", "Aktiviere zuerst das Thumbail bei diesem Medieneintrag.");
                die();
            }

            if ($isBlob) {
                if (setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, $newName)) {
                    setChangedAndChangedBy($conn, $id, $userID);
                    returnMessage("success", "Name erfolgreich geändert");
                } else {
                    returnMessage("failed", "Name wurde nicht geändert");
                }
            } else {
                if ($isOnlineSource) {
                    returnMessage("failed", "Der Dateiname von einer Onlinequelle kann nicht geändert werden.");
                    die();
                }
                //File is on fileSystem
                $fullPath = getFullPath($conn, $isOnlineSource, $path, $inMediaFolder);
                logWrite($conn, "general", "fullPath:" . $fullPath);
                $path = $fullPath . "/" . $filename;
                if (file_exists($fullPath . "/" . $newName)) {
                    returnMessage("failed", "Auf dem Dateisystem mit dem Pfad $fullPath existiert bereits eine Datei mit dem Namen $newName");
                    die();
                } else {
                    setValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, $newName);
                    if (rename($fullPath . "/" . $filename, $fullPath . "/" . $newName, null)) {
                        returnMessage("success", "Datei erfolgreich von '$filename' zu '$newName' umbenannt");
                        setChangedAndChangedBy($conn, $id, $userID);
                        die();
                    } else {
                        returnMessage("failed", "Ein Fehler beim Umbenennen ist aufgetreten. Versuche es erneut.");
                        die();
                    }
                }
            }
            die();
        } else if ($type === "thumbnailIsOnlineSource") {
            if (!boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false))) {
                returnMessage("failed", "Aktiviere zuerst das Thumbail bei diesem Medieneintrag.");
                die();
            }
            $newValue = intval(custom_json_validate($_POST["newValue"]));
            if (setValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Wert erfolgreich geändert");
            } else {
                returnMessage("failed", "Wert wurde nicht geändert");
            }
            die();
        } else if ($type === "thumbnailPath") {
            if (!boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false))) {
                returnMessage("failed", "Aktiviere zuerst das Thumbail bei diesem Medieneintrag.");
                die();
            }
            $newValue = custom_json_validate($_POST["newValue"])?->{"path"};
            if (setValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Pfad / URL erfolgreich geändert");
            } else {
                returnMessage("failed", "Pfad / URL wurde nicht geändert");
            }
            die();
        } else if ($type === "thumbnailInMediaFolder") {
            if (!boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false))) {
                returnMessage("failed", "Aktiviere zuerst das Thumbail bei diesem Medieneintrag.");
                die();
            }
            $newValue = intval(custom_json_validate($_POST["newValue"]));
            if (setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, $newValue)) {
                setChangedAndChangedBy($conn, $id, $userID);
                returnMessage("success", "Wert erfolgreich geändert");
            } else {
                returnMessage("failed", "Wert wurde nicht geändert");
            }
            die();
        } 
    } else if ($operation === "getFullInfromation") {

        $id = $_POST['id'];
        if (!valueInDatabaseExists($conn, "medienVerwaltung", "id", "id", $id)) {
            returnMessage("success", "Es existiert kein Medieneintrag mit der id '$id'.");
            die();
        }

        $mediaID = getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $id, 1, false);
        $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 1, false));
        $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 1, false));
        $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 1, false));
        $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, 1, false);
        $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, 1, false);
        $mimeType = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, 1, false);
        $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, 1, false);
        $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, 1, false);
        $thumbnail = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "id", $id, 1, false));
        $thumbnailIsBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "id", $id, 1, false));
        $thumbnailIsOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "id", $id, 1, false));
        $thumbnailFileName = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "id", $id, 1, false);
        $thumbnailInMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "id", $id, 1, false));
        $thumbnailMimeType = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "id", $id, 1, false);
        $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "id", $id, 1, false);
        $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "id", $id, 1, false);
        $keywords = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $id, 1, false));
        $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, 1, false);
        $changed = getValueFromDatabase($conn, "medienVerwaltung", "changed", "id", $id, 1, false);
        $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, 1, false);
        $uploadedBy = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $id, 1, false);
        $changedBy = custom_json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $id, 1, false));

        echo json_encode(array("id" => $id, "mediaID" => $mediaID, "uploadedBy" => $uploadedBy, "changedBy" => $changedBy, "uploaded" => $uploaded, "changed" => $changed, "thumbnailIsBlob" => $thumbnailIsBlob, "thumbnailIsOnlineSource" => $thumbnailIsOnlineSource, "thumbnail" => $thumbnail, "isBlob" => $isBlob, "isOnlineSource" => $isOnlineSource, "inMediaFolder" => $inMediaFolder, "uploaded" => $uploaded, "filename" => $filename, "mimeType" => $mimeType, "type" => $type, "path" => $path, "thumbnailFileName" => $thumbnailFileName, "thumbnailMimeType" => $thumbnailMimeType, "thumbnailPath" => $thumbnailPath, "description" => $description, "keywords" => $keywords, "fileSize" => $fileSize, "thumbnailInMediaFolder" => $thumbnailInMediaFolder));
        die();
    } else if ($operation === "addMedia") {
        if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues" => gnVP($conn, "medienverwaltungChangeValues"), "medienverwaltungADDandREMOVE" => gnVP($conn, "medienverwaltungADDandREMOVE")])) {
            permissionDenied();
            die();
        }
        $type = $_POST["type"];
        if ($type == "uploadToFileSystem") {
            if (isset($_FILES['file']["name"])) {
                // print_r($_FILES);
                $file = $_FILES['file'];
                if ($file["error"]) {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                    die();
                }
                // MediaFolder PATH
                $mediaFolderPath = $mediaFolderPath = getMediaFolderPath($conn);

                $mimeType = $file["type"];
                $filename = $file['name'];
                $size = $file['size'];
                $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                    returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                    die();
                }

                $type = explode("/", $mimeType, 2)[0];


                $path_parts = pathinfo($mediaFolderPath . "/" . $filename);
                $dirname = $path_parts['dirname'];
                $basename = $path_parts['basename'];
                $extension =  $path_parts['extension'];
                $filenameFromPathParts =  $path_parts['filename'];

                $pathToFolder = $mediaFolderPath . "/" . $type;
                //Create Folder if not exists
                if (!file_exists($pathToFolder)) {
                    $oldmask = umask(0);
                    mkdir($pathToFolder, 0777, true);
                    umask($oldmask);
                }


                $finalfilename = generateFileName($conn, $pathToFolder, $filenameFromPathParts, $extension);

                $finalPath =  $pathToFolder . "/" . $finalfilename;
                if (file_exists($finalPath)) {
                    returnMessage("failed", "Eine Datei mit diesem Namen in $finalPath existiert schon");
                    die();
                }

                $mediaID = createEntryMedienverwaltung($conn);
                $id = getValueFromDatabase($conn, "medienVerwaltung", "id", "mediaID", $mediaID, 1, false);
                if (!$mediaID || !$id) {
                    returnMessage("failed", "Ein Fehler beim Erstellen des Medienentrages ist aufgetreten.");
                    die();
                }

                // Upload file
                if (move_uploaded_file($tmpname, $finalPath)) {
                    //Add parameters to database
                    setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
                    setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 1);
                    setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, getCurrentDateAndTime(1));
                    setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $finalfilename);
                    setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, $mimeType);
                    setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, "/" . $type);
                    setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, $type);
                    setValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $id, $userID);
                    setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, $size);
                    logWrite($conn, "medienVerwaltung", "A file has successfully been uploaded to filesystem: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID' " . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, false, "green");
                    returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id, "finalPath" => $finalPath));
                    die();
                } else {
                    logWrite($conn, "medienVerwaltung", "A file has has failed to upload to filesystem: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID'" . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, true);
                    returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                    deleteRowFromDatabase($conn, "medienVerwaltung", "id", "id", $id);
                    die();
                }
            } else {
                returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                die();
            }
        } else if ($type == "uploadAsBlob") {
            if (isset($_FILES['file']["name"])) {
                // print_r($_FILES);
                $file = $_FILES['file'];
                if ($file["error"]) {
                    returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten (file['error'] = 1).");
                    die();
                }

                $mimeType = $file["type"];
                $filename = $file['name'];
                $size = $file['size'];
                $tmpname = $file["tmp_name"]; //Where the file is cached on the server

                if (!checkValidMimeType($mimeType, custom_json_validate(getSettingVal($conn, "Medienverwaltung_validMimeTypes")))) {
                    returnMessage("failed", "Dieser Dateityp wird nicht unterstützt.  Eine Liste der unterstützten Dateitypen findest du Oben bei der Medienverwaltung.");
                    die();
                }

                $type = explode("/", $mimeType, 2)[0];


                $path_parts = pathinfo($filename);
                $dirname = $path_parts['dirname'];
                $basename = $path_parts['basename'];
                $extension =  $path_parts['extension'];
                $filenameFromPathParts =  $path_parts['filename'];


                $finalfilename = generateFileNameBLOB($conn, $filenameFromPathParts, $extension);

                $mediaID = createEntryMedienverwaltung($conn);
                $id = getValueFromDatabase($conn, "medienVerwaltung", "id", "mediaID", $mediaID, 1, false);
                if (!$mediaID || !$id) {
                    returnMessage("failed", "Ein Fehler beim Erstellen des Medienentrages ist aufgetreten.");
                    die();
                }

                $blob = file_get_contents($tmpname);
                if (!$blob) {
                    returnMessage("failed", "Ein Fehler beim Erstellen des BLOBs ist aufgetreten.");
                    die();
                }
                // Upload file
                if (setValueFromDatabase($conn, "medienVerwaltung", "blobData", "id", $id, $blob)) {
                    //Add parameters to database
                    setValueFromDatabase($conn, "medienVerwaltung", "isBlob", "id", $id, 1);
                    setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 0);
                    setValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "id", $id, 0);
                    setValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $id, getCurrentDateAndTime(1));
                    setValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $id, $finalfilename);
                    setValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $id, $mimeType);
                    setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, $type);
                    setValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "id", $id, $userID);
                    setValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $id, $size);
                    logWrite($conn, "medienVerwaltung", "A file has successfully been uploaded as BLOB: id = '$id' finalPath = '$finalPath' mediaID = '$mediaID'" . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, false, "green");
                    returnMessage("success", "Datei erfolgreich hochgeldaden.", false, array("id" => $id));
                    die();
                } else {
                    logWrite($conn, "medienVerwaltung", "A file has has failed to upload as BLOB: mediaID = '$mediaID' " . json_encode(array("dirname" => $dirname, "basename" => $basename, "extension" => $extension, "size" => $size)), true, true);
                    returnMessage("failed", "Ein Fehler beim Verschieben der Datei ist aufgetreten.");
                    deleteRowFromDatabase($conn, "medienVerwaltung", "id", "id", $id);
                    die();
                }
            } else {
                returnMessage("failed", "Ein Fehler beim Hochladen ist aufgetreten. Keine Datei vorhanden.");
                die();
            }
        } else if ($type == "addOnlineSource") {
            $url = json_decode($_POST["url"]);
            $url = $url->{"url"};
            $mediaID = createEntryMedienverwaltung($conn);
            $id = getValueFromDatabase($conn, "medienVerwaltung", "id", "mediaID", $mediaID, 1, false);
            if (!$mediaID || !$id) {
                returnMessage("failed", "Ein Fehler beim Erstellen des Medienentrages ist aufgetreten.");
                die();
            }
            setValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "id", $id, 1);
            setValueFromDatabase($conn, "medienVerwaltung", "path", "id", $id, $url);
            setValueFromDatabase($conn, "medienVerwaltung", "type", "id", $id, "Onlinequelle");
            logWrite($conn, "medienVerwaltung", "A media entry has been created (onlineeSource): id = '$id' finalPath = '$finalPath'" . json_encode(array("url" => $url, "mediaID" => $mediaID)), true, false, "green");
            returnMessage("success", "Medieneintrag erfolgreich erstellt. (Falls der Link nicht mehr funktioniert, kann das Medium nicht mehr angezeigt werden; Besser: Als Datei ins Dateisystem hochladen)", false, array("id" => $id));
            die();
        }
    } else if ($operation === "removeMedia") {
        if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues" => gnVP($conn, "medienverwaltungChangeValues"), "medienverwaltungADDandREMOVE" => gnVP($conn, "medienverwaltungADDandREMOVE")])) {
            permissionDenied();
            die();
        }
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "medienVerwaltung", "id", "id", $id)) {
            returnMessage("failed", "Der Medieneintrag, den du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        removeFileOrLinkToFile($conn, $id);
        removeFileOrLinkToFileThumbnail($conn, $id);

        if (deleteRowFromDatabase($conn, "medienVerwaltung", "id", "id", $id)) {
            logWrite($conn, "medienVerwaltung", "The media entry has been successfully deleted id='$id'", true, false, "yellow");
            returnMessage("success", "Der Medieneintrag wurde erfolgreich gelöscht.");
        } else {
            logWrite($conn, "medienVerwaltung", "The media entry couldn't be deleted id='$id'", true, true);
            returnMessage("error", "Der Medieneintrag konnte nicht vollständig gelöscht werden. Dateien wurden möglicherweise trotzdem entfernt.");
        }
        die();
    }
}
