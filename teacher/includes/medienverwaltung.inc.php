<?php
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
                $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "mediaID", $result, 1, false);
                $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "mediaID", $result, 1, false);
                $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "mediaID", $result, 1, false));
                $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "mediaID", $result, 1, false);
                $changed = getValueFromDatabase($conn, "medienVerwaltung", "changed", "mediaID", $result, 1, false);
                $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "mediaID", $result, 1, false);
                $uploadedBy = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "mediaID", $result, 1, false);
                $changedBy = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "mediaID", $result, 1, false));

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
            $input = json_validate($_POST["input"]);
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
            $input = json_validate($_POST["input"]);
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
            $input = json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keyWords", "id", $currentID, 1, false));
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
            $input = json_validate($_POST["input"]);
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentID) {
                $changedBy = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $currentID, 1, false));
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
            $input = json_validate($_POST["input"]);
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
            $type = json_validate($_POST["type"]);
            $mimeType = json_validate($_POST["mimeType"]);
            $path = $_POST["path"];
            $id = $_POST["id"];
            $mediaID = $_POST["mediaID"];
            $keyWords = json_validate($_POST["keyWords"]);
            $isOnlineSource = $_POST["isOnlineSource"];
            $inMediaFolder = $_POST["inMediaFolder"];
            $uploaded = $_POST["uploaded"];
            $uploadedBy = $_POST["uploadedBy"];
            $changed = $_POST["changed"];
            $changedBy = json_validate($_POST["changedBy"]);
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
                    $keywordsCurrent = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $currentID, 1, false));
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
                    $changedByCurrent = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "id", $currentID, 1, false));
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
        if (!userHasPermissions($conn, $userID, ["medienverwaltungChangeValues"=>gnVP($conn, "medienverwaltungChangeValues")])) {
            permissionDenied();
            die();
        }
        $type = $_POST["type"];

        if ($type === "changeData") {
           $secondOperation = $_POST["secondOperation"] ?? "";
           if ($secondOperation === "changeFileData") {
            $files = json_validate($_POST["file"]);
            echo json_encode($files);
            echo "hre";
            die();
           } else if ($secondOperation === "changeBlobData") {

           } else if ($secondOperation === "changeOnlineData") {

           }

        } else if ($type === "changeType") {
            $rankingPermission = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
            if (!userHasPermissionRanking($conn, $userID, $rankingPermission)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingPermission");
                die();
            }
            $type = $_POST["input"];
            if (empty($type) || !$type) {
                returnMessage("failed", "Der Typ darf nicht leer sein (Eingabe: $type)");
                die();
            }
            if (setValueFromDatabase($conn, "permissions", "type", "id", $id, $type, false)) {
                returnMessage("success", "Erfolg! Typ von id: $id wurde auf $type gesetzt.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern des Types.");
                die();
            }
        } else if ($type === "deletePermission") {
            $rankingPermission = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
            if (!userHasPermissionRanking($conn, $userID, $rankingPermission)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingPermission");
                die();
            }
            logWrite($conn, "berechtigungsverwaltung", "Berechtigung $id soll von Benutzer mit id: $userID gelöscht werden");
            if (deleteRowFromDatabase($conn, "permissions", "type", "id", $id)) {
                returnMessage("success", "Erfolg! Erfolgreich gelöscht.");
                die();
            } else {
                returnMessage("failed", "Fehler beim Löschen");
                die();
            }
        } else if ($type === "changeDescription") {
            $input = $_POST["input"];
            if (empty($input)) {
                $input = null;
            }
            if (setValueFromDatabase($conn, "permissions", "description", "id", $id, $input, false)) {
                returnMessage("success", "Beschreibung erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern der Beschreibung.");
                die();
            }
        } else if ($type === "changeHinweis") {
            $input = $_POST["input"];
            if (empty($input)) {
                $input = null;
            }
            if (setValueFromDatabase($conn, "permissions", "hinweis", "id", $id, $input, false)) {
                returnMessage("success", "Hinweis erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern des Hinweises.");
                die();
            }
        } else if ($type === "changeRank") {
            $newRank = intval($_POST["rank"]);
            if (empty($newRank)) {
                returnMessage("failed", "Der Rang darf nicht leer sein (Eingabe: $newRank)");
                die();
            }
            $usersRank = getPermissionRanking($conn, $userID);
            $rankingPermission = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
            if ($rankingPermission === false) {
                returnMessage(false, "Fehler, Berechtigung hat keinen Rang. Frage einen Administrator.");
                die();
            }

            if (!userHasPermissionRanking($conn, $userID, $newRank)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang, den du setzen möchtest: $newRank");
                die();
            }
            if (!userHasPermissionRanking($conn, $userID, $rankingPermission)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingPermission");
                die();
            }
            if (setValueFromDatabase($conn, "permissions", "ranking", "id", $id, $newRank, false)) {
                returnMessage("success", "Erfolg! Rang von id: $id wurde auf $newRank gesetzt.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern des Ranges.");
                die();
            }
        } else if ($type === "changeNormalValue") {
            $newValue = intval($_POST["input"]);
            if (empty($newValue)) {
                returnMessage("failed", "Der Wert darf nicht leer sein (Eingabe: $newValue)");
                die();
            }
            $usersRank = getPermissionRanking($conn, $userID);
            $rankingPermission = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
            if (!userHasPermissionRanking($conn, $userID, $rankingPermission)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingPermission");
                die();
            }
            if (setValueFromDatabase($conn, "permissions", "normalValue", "id", $id, $newValue, false)) {
                returnMessage("success", "Erfolg! normalerWert von id: $id wurde auf $newValue gesetzt.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern des Wertes.");
                die();
            }
        } else if ($type === "changeUsedAt") {
            $secondOperation = "";
            if (isset($_POST["secondOperation"])) {
                $secondOperation = $_POST["secondOperation"];
            } else {
                returnMessage("failed", "Keine operation angegeben. (add; remove)");
                die();
            }

            if ($secondOperation === "add") {
                $toAdd = $_POST["toAdd"];
                if (empty($toAdd)) {
                    returnMessage("failed", "Leere Eingabe");
                }
                if (addToArrayDatabase($conn, "permissions", "usedAt", "id", $id, $toAdd, false)) {
                    returnMessage("success", "Erfolgreich hinzugefügt");
                } else {
                    returnMessage("failed", "Fehler beim hinzufügen");
                }
                die();
            } else if ($secondOperation === "remove") {
                $toRemove = $_POST["toRemove"];
                if (empty($toRemove)) {
                    returnMessage("failed", "Leere Eingabe");
                }
                if (removeFromArrayDatabase($conn, "permissions", "usedAt", "id", $id, $toRemove, true, true)) {
                    returnMessage("success", "Erfolgreich entfernt");
                } else {
                    returnMessage("failed", "Fehler beim entfernen");
                }
                die();
            } else if ($secondOperation === "removeAll") {
                if (insertArrayDatabase($conn, "permissions", "usedAt", "id", $id, array())) {
                    returnMessage("success", "Erfolgreich geleert.");
                } else {
                    returnMessage("failed", "Fehler beim leeren.");
                }
                die();
            }
        } else if ($type === "changecustomID") {
            $input = $_POST["input"];
            if (empty($input)) {
                $input = null;
            }
            if (setValueFromDatabase($conn, "permissions", "customID", "id", $id, $input, false)) {
                returnMessage("success", "CustomID erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern der CustomID.");
                die();
            }
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
        $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "mediaID", $id, 1, false);
        $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "mediaID", $id, 1, false);
        $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "mediaID", $id, 1, false));
        $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "mediaID", $id, 1, false);
        $changed = getValueFromDatabase($conn, "medienVerwaltung", "changed", "mediaID", $id, 1, false);
        $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "mediaID", $id, 1, false);
        $uploadedBy = getValueFromDatabase($conn, "medienVerwaltung", "uploadedBy", "mediaID", $id, 1, false);
        $changedBy = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "changedBy", "mediaID", $id, 1, false));

        echo json_encode(array("id" => $id, "mediaID" => $mediaID, "uploadedBy" => $uploadedBy, "changedBy" => $changedBy, "uploaded" => $uploaded, "changed" => $changed, "thumbnailIsBlob" => $thumbnailIsBlob, "thumbnailIsOnlineSource" => $thumbnailIsOnlineSource, "thumbnail" => $thumbnail, "isBlob" => $isBlob, "isOnlineSource" => $isOnlineSource, "inMediaFolder" => $inMediaFolder, "uploaded" => $uploaded, "filename" => $filename, "mimeType" => $mimeType, "type" => $type, "path" => $path, "thumbnailFileName" => $thumbnailFileName, "thumbnailMimeType" => $thumbnailMimeType, "thumbnailPath" => $thumbnailPath, "description" => $description, "keywords" => $keywords, "fileSize" => $fileSize, "thumbnailInMediaFolder" => $thumbnailInMediaFolder));
        die();
    } else if ($operation === "getValues") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "permissions", "id", "id", $id)) {
            returnMessage("failed", "Die Berechtigung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        $type = $_POST["type"];
        if ($type === "getType") {
            echo getValueFromDatabase($conn, "permissions", "type", "id", $id, 1, false);
            die();
        } else if ($type === "getCurrentUsed") {
            echo json_encode(json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $id, 1, false)));
            die();
        }
    } else if ($operation === "createPermission") {
        $permissionName = $_POST["name"];
        if (valueInDatabaseExists($conn, "permissions", "name", "name", $permissionName)) {
            returnMessage("success", "Die Berechtigung $permissionName existiert bereits.", getValueFromDatabase($conn, "permissions", "id", "name", $permissionName, 1, false));
            die();
        }
        if (setValueFromDatabase($conn, "permissions", "name", false, false, $permissionName, true)) {
            returnMessage("success", "Berechtigung <b>$permissionName</b> erfolgreich erstellt.", false, getValueFromDatabase($conn, "permissions", "id", "name", $permissionName, 1, false));
        } else {
            returnMessage("failed", "Ein Fehler ist aufgetreten");
        }
    }
}
