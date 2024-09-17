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



if (isset($_POST["berechtigungsverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    require_once("../includes/berechtigungsverwaltung-functions.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessBerechtigungsverwaltung" => gnVP($conn, "accessBerechtigungsverwaltung")])) {
        permissionDenied();
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $customID = getValueFromDatabase($conn, "permissions", "customID", "id", $result, 1, false);
                $name = getValueFromDatabase($conn, "permissions", "name", "id", $result, 1, false);
                $type = getValueFromDatabase($conn, "permissions", "type", "id", $result, 1, false);
                $description = getValueFromDatabase($conn, "permissions", "description", "id", $result, 1, false);
                $ranking = getValueFromDatabase($conn, "permissions", "ranking", "id", $result, 1, false);
                $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "id", $result, 1, false);
                $usedAt = getValueFromDatabase($conn, "permissions", "usedAt", "id", $result, 1, false);
                $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "id", $result, 1, false);

                $resultArray[] = array("id" => intval($result), "customID" => $customID, "name" => $name, "type" => $type, "description" => $description, "ranking" => $ranking, "normalValue" => $normalValue, "usedAt" => $usedAt, "hinweis" => $hinweis);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $permissionName = getValueFromDatabase($conn, "permissions", "name", "id", $permission, 1, false);
                if (str_contains(strtolower($permissionName), strtolower($input))) {
                    $resultArray[] = $permission;
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
            $input = custom_json_validate($_POST["input"]);
            if (!$input) {
                echo 0;
                die();
            }
            $permissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true);
            if (!$permissions) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($permissions as $permission) {
                $usedAt = custom_json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $permission, 1, false));
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
            echo json_encode(getAllValuesFromDatabase($conn, "permissions", "type", 0, true, true));
            die();
        } else if ($type === "getAllAvailableUsedAt") {
            $allPermissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true, false);
            if (!$allPermissions) {
                echo 0;
                die();
            }
            $usedAtList = array();
            foreach ($allPermissions as $currentPermission) {
                $usedAt = custom_json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $currentPermission, 1, false));
                if (!$usedAt) {
                    continue;
                }
                foreach ($usedAt as $currentUsedAt) {
                    if (!in_array($currentUsedAt, $usedAtList)) {
                        $usedAtList[] = $currentUsedAt;
                    }
                }
            }
            echo json_encode($usedAtList);
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
            echo json_encode(custom_json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $id, 1, false)));
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

if (isset($_POST["gruppenverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    require_once("../includes/berechtigungsverwaltung-functions.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessGrupenverwaltung" => gnVP($conn, "accessGrupenverwaltung")])) {
        permissionDenied();
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $name = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $result, 1, false);
                $permissionsAllowed = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $result, 1, false));
                $permissionsForbidden = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $result, 1, false));
                $description = getValueFromDatabase($conn, "groupPermissions", "description", "id", $result, 1, false);
                $ranking =  getPermissionRankingGroup($conn, getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $result, 1, false));

                $resultArray[] = array("id" => intval($result), "description" => $description, "name" => $name, "ranking" => $ranking, "permissionsAllowed" => $permissionsAllowed, "permissionsForbidden" => $permissionsForbidden);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
            die();
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) {returnResults($conn, false, $limitResults); die();};
            $resultArray = array();
            foreach ($groups as $group) {
                $groupName = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $group, 1, false);
                if (str_contains(strtolower($groupName), strtolower($input))) {
                    $resultArray[] = $group;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByDescription") {
            $input = $_POST["input"];
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($groups as $group) {
                $groupDescription = getValueFromDatabase($conn, "groupPermissions", "description", "id", $group, 1, false);
                if (str_contains(strtolower($groupDescription), strtolower($input))) {
                    $resultArray[] = $group;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByRanking") {
            $input = intval($_POST["input"]);
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($groups as $group) {
                $groupRanking = getPermissionRankingGroup($conn, getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $group, 1, false));
                if ($groupRanking == $input) {
                    $resultArray[] = $group;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByPermissionsAllowed") {
            $input = custom_json_validate($_POST["input"]);
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($groups as $group) {
                $allPermissionsFromGroup = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $group, 1, false));
                   if (hasAllContidions($conn, $input, $allPermissionsFromGroup, false)) {
                        $resultArray[] = $group;
                   }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByPermissionsForbidden") {
            $input = custom_json_validate($_POST["input"]);
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($groups as $group) {
                $allPermissionsFromGroup = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $group, 1, false));
                   if (array_contains_all_values($allPermissionsFromGroup, $input, true)) {
                        $resultArray[] = $group;
                   }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByid") {
            $input = $_POST["input"];
            $groups = getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true, true);
            if (!$groups) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($groups as $group) {
                if ($group == $input) {
                    $resultArray[] = $group;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllValuesFromDatabase($conn, "groupPermissions", "id", 0, true), $limitResults);
            die();
        }
    } else if ($operation === "other") {
        // $type = $_POST["type"];
        // if ($type === "getAllAvailableTypes") {
        //     echo json_encode(getAllValuesFromDatabase($conn, "permissions", "type", 0, true, true));
        //     die();
        // } else if ($type === "getAllAvailableUsedAt") {
        //     $allPermissions = getAllValuesFromDatabase($conn, "permissions", "id", 0, true, false);
        //     if (!$allPermissions) {
        //         echo 0;
        //         die();
        //     }
        //     $usedAtList = array();
        //     foreach ($allPermissions as $currentPermission) {
        //         $usedAt = custom_json_validate(getValueFromDatabase($conn, "permissions", "usedAt", "id", $currentPermission, 1, false));
        //         if (!$usedAt) {
        //             continue;
        //         }
        //         foreach ($usedAt as $currentUsedAt) {
        //             if (!in_array($currentUsedAt, $usedAtList)) {
        //                 $usedAtList[] = $currentUsedAt;
        //             }
        //         }
        //     }
        //     echo json_encode($usedAtList);
        //     die();
        // }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["berechtigungsVerwaltungEditGroups" => gnVP($conn, "berechtigungsVerwaltungEditGroups")])) {
            permissionDenied();
            die();
        }
        $id = $_POST["id"];
        $groupName = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false);
        $rankingGroup = intval(getPermissionRankingGroup($conn, $groupName));
        $usersRank = getPermissionRanking($conn, $userID);
        if (!valueInDatabaseExists($conn, "groupPermissions", "id", "id", $id)) {
            returnMessage("failed", "Die Gruppe, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }

        if (!userHasPermissionRanking($conn, $userID, $rankingGroup)) {
            returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingGroup");
            die();
        }

        $type = $_POST["type"];

        if ($type === "changeName") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                returnMessage("failed", "Der Name für die Gruppe darf nicht leer sein. (Eingabe: $newName)");
                die();
            }
            if ($returnArray = renameGroupInDatabase($conn, $id, $newName)) {
                echo json_encode($returnArray);
                die();
            } else {
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeDescription") {
            $input = $_POST["input"];
            if (empty($input)) {
                $input = null;
            }
            if (setValueFromDatabase($conn, "groupPermissions", "description", "id", $id, $input, false)) {
                returnMessage("success", "Beschreibung erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Fehler beim ändern der Beschreibung.");
                die();
            }
        }
    } else if ($operation === "getFullInfromation") {

        $id = $_POST['id'];
        if (!valueInDatabaseExists($conn, "groupPermissions", "id", "id", $id)) {
            returnMessage("success", "Diese Gruppe (id: $id) existiert nicht.");
            die();
        }

        $name = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false);
        $permissionsAllowed = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
        $permissionsForbidden = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false));
        $description = getValueFromDatabase($conn, "groupPermissions", "description", "id", $id, 1, false);
        $ranking =  getPermissionRankingGroup($conn, getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false));

        echo json_encode(array("id" => intval($id), "description" => $description, "name" => $name, "ranking" => $ranking, "permissionsAllowed" => $permissionsAllowed, "permissionsForbidden" => $permissionsForbidden));
        die();
    } else if ($operation === "createGroup") {
        $groupName = $_POST["name"];
        if (valueInDatabaseExists($conn, "groupPermissions", "groupName", "groupName", $groupName)) {
            returnMessage("success", "Die Gruppe $groupName existiert bereits.", false, getValueFromDatabase($conn, "groupPermissions", "id", "groupName", $groupName, 1, false));
            die();
        }
        if (setValueFromDatabase($conn, "groupPermissions", "groupName", "groupName", $groupName, $groupName, true)) {
            returnMessage("success", "Gruppe <b>$groupName</b> erfolgreich erstellt.", false, getValueFromDatabase($conn, "groupPermissions", "id", "groupName", $groupName, 1, false));
        } else {
            returnMessage("failed", "Ein Fehler ist aufgetreten");
        }
        die();
    } else if ($operation === "changePermissions") {
        if (!userHasPermissions($conn, $userID, ["berechtigungsVerwaltungEditGroups" => gnVP($conn, "berechtigungsVerwaltungEditGroups")])) {
            permissionDenied();
            die();
        }
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "groupPermissions", "id", "id", $id)) {
            returnMessage("failed", "Die Gruppe, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        $groupName = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false);
        $rankingGroup = intval(getPermissionRankingGroup($conn, $groupName));
        $usersRank = getPermissionRanking($conn, $userID);

        if (!userHasPermissionRanking($conn, $userID, $rankingGroup)) {
            returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingGroup");
            die();
        }

        $type = $_POST["type"];

        if ($type === "allowedPermissions") {
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllAllowedPermissionNamesGroupHas") {
                $allPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                $resultArray = array();
                if ($allPermissions) {
                    foreach ($allPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $resultArray[] = $currentPermissionKey;
                    }
                }
                echo json_encode($resultArray);
                die();
            } else if ($secondOperation === "addPermission") {
                $permissionNameToAdd = $_POST['permissionName'];
                $value = $_POST['value'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionNameToAdd, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (setObjectKeyAndValueDatabase($conn, "groupPermissions", "permissions", "id", $id, $permissionNameToAdd, $value)) {
                        returnMessage("success", "Berechtigung erfolgreich hinzugefügt");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht hinzugefügt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removePermission") {
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (removePermissionGroup($conn, $groupName, $permissionName)) {
                        returnMessage("success", "Berechtigung erfolgreich entfernt");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht entfernt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removeAllPermissions") {
                $allPermissions = getAllValuesFromDatabase($conn, "permissions", "name", 0, true, true);
                if (!$allPermissions || !count($allPermissions) > 0) {
                  returnMessage("failed", "Benutzer hat keine erlaubten Berechtigungen");
                }
                $resultArray = array();
                foreach ($allPermissions as $currentPermission) {
                    if (userHasPermissions($conn, $userID, [$currentPermission=>gnVP($conn, $currentPermission)])) {
                        removeFromObjectDatabase($conn, "groupPermissions", "permissions", "id", $id, $currentPermission, true, true, "key");
                    }
                }
                die();
            } else if ($secondOperation === "search") {
                $searchBy = $_POST["searchBy"];


                function returnFoundAllowedPermissions($conn, $groupName, $results)
                {
                    if (!$results) {
                        echo false;
                        die();
                    }

                    $resultArray = array();
                    foreach ($results as $result) {
                        $description = getValueFromDatabase($conn, "permissions", "description", "name", $result, 1, false);
                        $value = getPermissionGroup($conn, $groupName, $result);
                        $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "name", $result, 1, false);
                        $ranking = getValueFromDatabase($conn, "permissions", "ranking", "name", $result, 1, false);
                        $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "name", $result, 1, false);


                        $resultArray[] = array("name" => $result, "description" => $description, "value" => $value, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis);
                    }
                    echo json_encode($resultArray);
                    die();
                }

                if ($searchBy === "name") {
                    $input = $_POST["input"];

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
                        if (str_contains($currentPermissionKey, $input)) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "ranking") {
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "name", $currentPermissionKey, 1, false));
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "description") {
                    $input = $_POST["input"];

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionDescription = getValueFromDatabase($conn, "permissions", "description", "name", $currentPermissionKey, 1, false);
                        if (str_contains($permissionDescription, $input)) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "value") {
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionRanking = getPermissionGroup($conn, $groupName, $currentPermissionKey);
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "all") {
                    $resultArray = array();
                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $resultArray[] = $currentPermissionKey;
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                }
            } else if ($secondOperation === "getFullInformationForEdit") {
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (!valueInDatabaseExists($conn, "permissions", "name", "name", $permissionName)) {
                        returnMessage("failed", "Berechtigung <b>$permissionName</b>existiert nicht.");
                        die();
                    }
                    $description = getValueFromDatabase($conn, "permissions", "description", "name", $permissionName, 1, false);
                    $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "name", $permissionName, 1, false);
                    $ranking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                    $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "name", $permissionName, 1, false);
                    $value = getPermissionGroup($conn, $groupName, $permissionName);

                    echo json_encode(array("name" => $permissionName, "description" => $description, "value" => $value, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis));
                } else {
                    permissionDenied("Du hast nicht die erforderlichen Berechtigungen, um  <b>$permissionName</b> zu bearbeiten (Ranking benötigt: $permissionRanking)");
                    die();
                }
            } else if ($secondOperation === "changeValueFromPermission") {
                $permissionName = $_POST["permissionName"];
                $value = $_POST['value'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                $usersRank = getPermissionRanking($conn, $userID);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (setPermissionGroup($conn, $groupName, $permissionName, $value)) {
                        returnMessage("success", "Berechtigung erfolgreich geändert.");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht geändet werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
            }
        } else  if ($type === "forbiddenPermissions") {
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllForbiddenPermissionNamesGroupHas") {
                $allPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false));
                $resultArray = array();
                if ($allPermissions) {
                    foreach ($allPermissions as $currentPermission) {
                        $resultArray[] = $currentPermission;
                    }
                }
                echo json_encode($resultArray);
                die();
            } else if ($secondOperation === "addPermission") {
                $permissionNameToAdd = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionNameToAdd, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (addToArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, $permissionNameToAdd, false)) {
                        returnMessage("success", "Berechtigung erfolgreich hinzugefügt");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht hinzugefügt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removePermission") {
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (removeFromArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, $permissionName, true, true)) {
                        returnMessage("success", "Verbotene Berechtigung erfolgreich entfernt");
                    } else {
                        returnMessage("failed", "Verbotene Berechtigung konnte nicht entfernt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removeAllPermissions") {
                $allPermissions = getAllValuesFromDatabase($conn, "permissions", "name", 0, true, true);
                if (!$allPermissions || !count($allPermissions) > 0) {
                  returnMessage("failed", "Benutzer hat keine erlaubten Berechtigungen");
                }
                $resultArray = array();
                foreach ($allPermissions as $currentPermission) {
                    if (userHasPermissions($conn, $userID, [$currentPermission=>gnVP($conn, $currentPermission)])) {
                        removeFromArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, $currentPermission, true, true);
                    }
                }
                die();
            } else if ($secondOperation === "search") {
                $searchBy = $_POST["searchBy"];


                function returnFoundAllowedPermissions($conn, $groupName, $results)
                {
                    if (!$results) {
                        echo false;
                        die();
                    }

                    $resultArray = array();
                    foreach ($results as $result) {
                        $description = getValueFromDatabase($conn, "permissions", "description", "name", $result, 1, false);
                        $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "name", $result, 1, false);
                        $ranking = getValueFromDatabase($conn, "permissions", "ranking", "name", $result, 1, false);
                        $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "name", $result, 1, false);


                        $resultArray[] = array("name" => $result, "description" => $description, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis);
                    }
                    echo json_encode($resultArray);
                    die();
                }

                if ($searchBy === "name") {
                    $input = $_POST["input"];

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermission) {
                        if (str_contains($currentPermission, $input)) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "description") {
                    $input = $_POST["input"];

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermission) {
                        $permissionDescription = getValueFromDatabase($conn, "permissions", "description", "name", $currentPermission, 1, false);
                        if (str_contains($permissionDescription, $input)) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "ranking") {
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $groupPermissions = custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $id, false);
                        die();
                    }
                    foreach ($groupPermissions as $currentPermission) {
                        $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "name", $currentPermissionKey, 1, false));
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $groupName, $resultArray);
                    die();
                } else if ($searchBy === "all") {
                    $resultArray = array();
                    returnFoundAllowedPermissions($conn, $groupName, custom_json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "id", $id, 1, false)));
                    die();
                }
            } else if ($secondOperation === "getFullInformationForEdit") {
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (!valueInDatabaseExists($conn, "permissions", "name", "name", $permissionName)) {
                        returnMessage("failed", "Berechtigung <b>$permissionName</b>existiert nicht.");
                        die();
                    }
                    $description = getValueFromDatabase($conn, "permissions", "description", "name", $permissionName, 1, false);
                    $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "name", $permissionName, 1, false);
                    $ranking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                    $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "name", $permissionName, 1, false);


                    echo json_encode(array("name" => $permissionName, "description" => $description, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis));
                } else {
                    permissionDenied("Du hast nicht die erforderlichen Berechtigungen, um  <b>$permissionName</b> zu bearbeiten (Ranking benötigt: $permissionRanking)");
                    die();
                }
            }
        }
    } else if ($operation === "deleteGroup") {
        if (!userHasPermissions($conn, $userID, ["berechtigungsVerwaltungEditGroups" => gnVP($conn, "berechtigungsVerwaltungEditGroups")])) {
            permissionDenied();
            die();
        }
        $id = $_POST["id"];
        $groupName = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false);
        $rankingGroup = intval(getPermissionRankingGroup($conn, $groupName));
        $usersRank = getPermissionRanking($conn, $userID);
        if (!valueInDatabaseExists($conn, "groupPermissions", "id", "id", $id)) {
            returnMessage("failed", "Die Gruppe, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }

        if (!userHasPermissionRanking($conn, $userID, $rankingGroup)) {
            returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $rankingGroup");
            die();
        }

        if (deleteRowFromDatabase($conn, "groupPermissions", "groupName", "groupName", $groupName)) {
            returnMessage("success", "Gruppe erfolgreich gelöscht.");
            die();
        } else {
            returnMessage("failed", "Ein Fehler ist aufgetreten.");
            die();
        }
    }
}
