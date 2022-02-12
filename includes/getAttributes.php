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
            echo json_encode(getColumsFromDatabaseMultipleWhere($conn, "selectquiz", ["klassenstufe", "fach", "thema", "quizname"], ["quizId" => $quizId], 1, false, false));
            die();
        }
    } else if ($type === "userSystem") {
        $secondOperation = $_POST["secondOperation"];

        if ($secondOperation === "userIsLoggedIn") {
            echo json_encode(isLoggedIn());
            die();
        } else if ($secondOperation === "GET_username_FROM_userID") {
            $userID = $_POST["userID"];
            echo getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);
            die();
        }
    } else if ($type === "medienverwaltung") {
        $secondOperation = $_POST["secondOperation"];
        if ($secondOperation === "getMediaData") {
            $mediaID = $_POST["mediaID"];
            if (!valueInDatabaseExists($conn, "medienVerwaltung", "id", "mediaID", $mediaID)) {
                echo json_encode(false);
                die();
            }
    
            $mediaFolderPath = getSettingVal($conn, "mediaPATH");
    
            $isOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isOnlineSource", "mediaID", $mediaID, 1, false));
            $isBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "isBlob", "mediaID", $mediaID, 1, false));
            $inMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "inMediaFolder", "mediaID", $mediaID, 1, false));
            $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "mediaID", $mediaID, 1, false);
            $filename = getValueFromDatabase($conn, "medienVerwaltung", "filename", "mediaID", $mediaID, 1, false);
            $mimeType = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "mediaID", $mediaID, 1, false);
            $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "mediaID", $mediaID, 1, false);
            $path = getValueFromDatabase($conn, "medienVerwaltung", "path", "mediaID", $mediaID, 1, false);
            $thumbnail = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnail", "mediaID", $mediaID, 1, false));
            $thumbnailIsBlob = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsBlob", "mediaID", $mediaID, 1, false));
            $thumbnailIsOnlineSource = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailIsOnlineSource", "mediaID", $mediaID, 1, false));
            $thumbnailFileName = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailFileName", "mediaID", $mediaID, 1, false);
            $thumbnailInMediaFolder = boolval(getValueFromDatabase($conn, "medienVerwaltung", "thumbnailInMediaFolder", "mediaID", $mediaID, 1, false));
            $thumbnailMimeType = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailMimeType", "mediaID", $mediaID, 1, false);
            $thumbnailPath = getValueFromDatabase($conn, "medienVerwaltung", "thumbnailPath", "mediaID", $mediaID, 1, false);
            
            $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "mediaID", $mediaID, 1, false);
            $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "description", "mediaID", $mediaID, 1, false));
            $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "mediaID", $mediaID, 1, false);
    
            echo json_encode(array("mediaID" => $mediaID, "thumbnailIsBlob" => $thumbnailIsBlob, "thumbnailIsOnlineSource" => $thumbnailIsOnlineSource, "thumbnail" => $thumbnail, "isBlob" => $isBlob, "isOnlineSource" => $isOnlineSource, "inMediaFolder" => $inMediaFolder, "uploaded" => $uploaded, "filename" => $filename, "mimeType" => $mimeType, "type" => $type, "path" => $path, "thumbnailFileName" => $thumbnailFileName, "thumbnailMimeType" => $thumbnailMimeType, "thumbnailPath" => $thumbnailPath, "description" => $description, "keywords" => $keywords, "fileSize" => $fileSize, "mediaFolderPath" => $mediaFolderPath, "thumbnailInMediaFolder" => $thumbnailInMediaFolder));
            die();
        } else if ($secondOperation === "getBlob") {
            $thirdOperation = $_POST["thirdOperation"];
            if ($thirdOperation === "primary") {
                $mediaID = $_POST["mediaID"];
                echo getValueFromDatabase($conn, "medienVerwaltung", "blobData", "mediaID", $mediaID, 1, false);
            } else if ($thirdOperation === "thumbnail") {
                $mediaID = $_POST["mediaID"];
                echo getValueFromDatabase($conn, "medienVerwaltung", "blobData", "mediaID", $mediaID, 1, false);
            }
            die();
        } else if ($secondOperation === "GET mediaID BY id") {
            $id = $_POST['id'];
            echo getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $id, 1, false);
            die();
        }
    }
}


echo "Nope";
