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

            $resultArray = array();

            foreach ($results as $result) {
               $fileName = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $result, 1, false);
               $description = getValueFromDatabase($conn, "medienVerwaltung", "description", "id", $result, 1, false);
               $type = getValueFromDatabase($conn, "medienVerwaltung", "type", "id", $result, 1, false);
               $mimeType = getValueFromDatabase($conn, "medienVerwaltung", "mimeType", "id", $result, 1, false);
               $mediaID = getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $result, 1, false);
               $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $result, 1, false));
               $onFilesystem = boolval(getValueFromDatabase($conn, "medienVerwaltung", "mediaID", "id", $result, 1, false));
               $fileSize = getValueFromDatabase($conn, "medienVerwaltung", "fileSize", "id", $result, 1, false);
               $uploaded = getValueFromDatabase($conn, "medienVerwaltung", "uploaded", "id", $result, 1, false);
            

                $resultArray[] = array("id" => intval($result), "filename" => $fileName, "description" => $description, "type" => $type, "description" => $description, "mimeType" => $mimeType, "mediaID" => $mediaID, "keywords" => $keywords, "onFilesystem" => $onFilesystem, "fileSize" => $fileSize, "uploaded" => $uploaded);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = isset($_POST["limit"]) ? intval($_POST["limit"]): 0;

        if ($filter === "filename") {
            $input = $_POST["filename"];
            $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
            if (!$allMediaIDs) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($allMediaIDs as $currentMediaID) {
                $fileName = getValueFromDatabase($conn, "medienVerwaltung", "filename", "id", $currentMediaID, 1, false);
                if (str_contains(strtolower($fileName), strtolower($input)) || str_contains(strToUpper($fileName), strToUpper($input))) {
                    $resultArray[] = $currentMediaID;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByDescription") {
            $input = $_POST["input"];
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionDescription = getValueFromDatabase($conn, "permissions", "description", "id", $permission, 1, false);
                if (str_contains(strtolower($permissionDescription), strtolower($input))) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByType") {
            $input = $_POST["input"];
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionType = getValueFromDatabase($conn, "permissions", "type", "id", $permission, 1, false);
                if ($permissionType == $input) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByRanking") {
            $input = intval($_POST["input"]);
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "id", $permission, 1, false));
                if ($permissionRanking == $input) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByid") {
            $input = intval($_POST["input"]);
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                if (intval($permission) == intval($input)) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterBycustomID") {
            $input = $_POST["input"];
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionCustomID = getValueFromDatabase($conn, "permissions", "customID", "id", $permission, 1, false);
                if ($permissionCustomID == $input) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByUsedAt") {
            $input = json_validate($_POST["input"]);
            if (!$input) {
                echo 0;
                die();
            }
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $usedAt = json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $permission, 1, false));
                if (!$usedAt) {
                    continue;
                }
                if (array_contains_all_values($usedAt, $input)) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByHinweis") {
            $input = $_POST["input"];
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionHinweis = getValueFromDatabase($conn, "permissions", "hinweis", "id", $permission, 1, false);
                if (str_contains(strtolower($permissionHinweis), strtolower($input))) {
                    $resultArray[] = $permission;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllValuesFromDatabase($conn, "permissions", "id", 0, true), $limitResults);
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
        } else if ($type === "getKeywords") {
            $searchFor = $_POST['searchFor'];
            echo json_encode(searchForKeywords($conn, $searchFor));
            die();
        }
    } else if ($operation === "changeValue") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "permissions", "id", "id", $id)) {
            returnMessage("failed", "Die Berechtigung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        $type = $_POST["type"];

        if ($type === "changeName") {
            $rankingPermission = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
            if (!userHasPermissionRanking($conn, $userID, $rankingPermission)) {
                returnMessage(false, "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingPermission");
                die();
            }
            $newName = $_POST["input"];
            if (empty($newName)) {
                returnMessage("failed", "Der Name für die Berechtigung darf nicht leer sein. (Eingabe: $newName)");
                die();
            }
            if ($returnArray = renamePermissionInDatabase($conn, $id, $newName)) {
                echo json_encode($returnArray);
                die();
            } else {
                echo json_encode($returnArray);
                die();
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
        if (!valueInDatabaseExists($conn, "permissions", "id", "id", $id)) {
            returnMessage("success", "Diese Berechtigung (id: $id) existiert nicht.");
            die();
        }

        $customID = getValueFromDatabase($conn, "permissions", "customID", "id", $id, 1, false);
        $name = getValueFromDatabase($conn, "permissions", "name", "id", $id, 1, false);
        $type = getValueFromDatabase($conn, "permissions", "type", "id", $id, 1, false);
        $description = getValueFromDatabase($conn, "permissions", "description", "id", $id, 1, false);
        $ranking = getValueFromDatabase($conn, "permissions", "ranking", "id", $id, 1, false);
        $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "id", $id, 1, false);
        $usedAt = getValueFromDatabase($conn, "permissions", "usedAt", "id", $id, 1, false);
        $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "id", $id, 1, false);

        echo json_encode(array("id" => intval($id), "customID" => $customID, "name" => $name, "type" => $type, "description" => $description, "ranking" => $ranking, "normalValue" => $normalValue, "usedAt" => $usedAt, "hinweis" => $hinweis));
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