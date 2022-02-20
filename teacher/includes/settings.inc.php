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

function allowedToChangeSetting($conn, $userID, $settingID)
{

    //if setting has permission set
    $permissionSET = getValueFromDatabase($conn, "settings", "permissionNeeded", "id", $settingID, 1, false);
    if ($permissionSET == "" || $permissionSET == null) {
        return true;
    }

    if (!valueExists($conn, "permissions", "name", $permissionSET)) {
        return true;
    }

    #Setting has Permission set
    if (userHasPermissions($conn, $userID, [$permissionSET => gnVP($conn, $permissionSET)])) {
        return true;
    }

    return false;
}

if (isset($_POST["settings"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    require_once("../includes/berechtigungsverwaltung-functions.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessSettings" => gnVP($conn, "accessSettings")])) {
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

            $results = limitArray($results, $limitResults);
            $resultArray = array();

            foreach ($results as $result) {
                if (!valueInDatabaseExists($conn, "settings", "id", "id", $result)) {
                    continue;
                }
                $name = getValueFromDatabase($conn, "settings", "name", "id", $result, 1, false);
                $type = getValueFromDatabase($conn, "settings", "type", "id", $result, 1, false);
                $description = getValueFromDatabase($conn, "settings", "description", "id", $result, 1, false);
                $setting = getValueFromDatabase($conn, "settings", "setting", "id", $result, 1, false);
                $description = getValueFromDatabase($conn, "settings", "description", "id", $result, 1, false);
                $usedAt = json_validate(getValueFromDatabase($conn, "settings", "usedAt", "id", $result, 1, false));
                $normalValue = getValueFromDatabase($conn, "settings", "normalValue", "id", $result, 1, false);
                $permissionNeeded = getValueFromDatabase($conn, "settings", "permissionNeeded", "id", $result, 1, false);

                $userIsAllowed = allowedToChangeSetting($conn, $_SESSION["userID"], $setting);
                $min = getValueFromDatabase($conn, "settings", "min", "id", $result, 1, false);
                $max = getValueFromDatabase($conn, "settings", "max", "id", $result, 1, false);

                if (json_validate($setting)) {
                    $setting = json_validate($setting);
                }

                $resultArray[] = array("id" => intval($result), "name" => $name, "type" => $type, "description" => $description, "normalValue" => $normalValue, "usedAt" => $usedAt, "usedAt" => $usedAt, "permissionNeeded" => $permissionNeeded, "userIsAllowed" => $userIsAllowed, "min" => $min, "max" => $max, "setting" => $setting);

            }
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $settingName = getValueFromDatabase($conn, "settings", "name", "id", $currentSetting, 1, false);
                if (str_contains(strtolower($settingName), strtolower($input))) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByDescription") {
            $input = $_POST["input"];
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $settingDescription = getValueFromDatabase($conn, "settings", "description", "id", $currentSetting, 1, false);
                if (str_contains(strtolower($settingDescription), strtolower($input))) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByType") {
            $input = $_POST["input"];
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $settingType = getValueFromDatabase($conn, "settings", "type", "id", $currentSetting, 1, false);
                if (str_contains(strtolower($settingType), strtolower($input))) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByNormalValue") {
            $input = $_POST["input"];
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $settingNormalValue = getValueFromDatabase($conn, "settings", "normalValue", "id", $currentSetting, 1, false);
                if (str_contains(strtolower($settingNormalValue), strtolower($input))) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByPermissionNeeded") {
            $input = $_POST["input"];
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $settingPermissionNeeded = getValueFromDatabase($conn, "settings", "permissionNeeded", "id", $currentSetting, 1, false);
                if ($input == $settingPermissionNeeded) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByid") {
            $input = intval($_POST["input"]);
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                if (intval($currentSetting) == $input) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterBySetting") {
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
            $input = json_decode($_POST["input"]);
            $settings = getAllValuesFromDatabase($conn, "settings", "id", 0, true);
            if (!$settings) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($settings as $currentSetting) {
                $usedAt = json_validate(getValueFromDatabase($conn, "settings", "usedAt", "id", $currentSetting, 1, false));
                if (!$usedAt) {
                    continue;
                }
                if (array_contains_all_values($usedAt, $input)) {
                    $resultArray[] = $currentSetting;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllValuesFromDatabase($conn, "settings", "id", 0, true), $limitResults);
            die();
        }
    } else if ($operation === "other") {
        $type = $_POST["type"];
        if ($type === "getAllAvailableTypes") {
            echo json_encode(getAllValuesFromDatabase($conn, "settings", "type", 0, true, true));
            die();
        } else if ($type === "getAllAvailableUsedAt") {
            $allSettings = getAllValuesFromDatabase($conn, "settings", "id", 0, true, false);
            if (!$allSettings) {
                echo 0;
                die();
            }
            $usedAtList = array();
            foreach ($allSettings as $currentSetting) {
                $usedAt = json_validate(getValueFromDatabase($conn, "settings", "usedAt", "id", $currentSetting, 1, false));
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
        if (!valueInDatabaseExists($conn, "settings", "id", "id", $id)) {
            returnMessage("failed", "Die Einstellung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }

        if (!allowedToChangeSetting($conn, $userID, $id)) {
            returnMessage("failed", "Du hast nicht die erforderlichen Berechtigungen, um dise Berechtigung zu ändern / zuzugreifen.");
            die();
        }
        $settingName = getValueFromDatabase($conn, "settings", "name", "id", $id, 1, false);
        $type = $_POST["type"];

        if ($type === "switch") {
            $newValue = json_decode($_POST["newValue"]);
            logWrite($conn, "general", "Der Wert des Schalters mit der id: $id = " . $newValue . " | Type: " . gettype(strval(intval($newValue))));

            if (setValueFromDatabase($conn, "settings", "setting", "id", $id, strval(intval($newValue)))) {
                returnMessage("success", "Wert erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Wert konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "text") {
            $newValue = $_POST["newValue"];
            if (setValueFromDatabase($conn, "settings", "setting", "id", $id, $newValue)) {
                returnMessage("success", "Wert erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Wert konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "number") {
            $newValue = intval($_POST["newValue"]);

            if (setValueFromDatabase($conn, "settings", "setting", "id", $id, $newValue)) {
                returnMessage("success", "Wert erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Wert konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "executeSystem") {
            if (getSettingVal($conn, "executeCommandsOnSystemByUser") == 1) {
                $command = getValueFromDatabase($conn, "settings", "normalValue", "id", $id, 1, false);
                if (!$command)  { returnMessage("failed", "Kein Shell Command eingetragen.");die();}
                $message = shell_exec($command);
                returnMessage("success", $message);
            } else {
                returnMessage("failed", "Das ausführen von Shell Commands ist durch den Administrator deaktiviert");
            }
            die();
        } else if ($type === "task") {
            if ($settingName === "logoutAllUsers") {
                $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true, true);
                if ($allUsers && count($allUsers) > 0) {
                    $allUsers = removeFromArray($allUsers, $userID, "value", true, true);
                    foreach ($allUsers as $user) {
                        $currentUsersPermissionRanking = getPermissionRanking($conn, $user);
                        if (userHasPermissionRanking($conn, $userID, $currentUsersPermissionRanking)) {
                            logOutAllDevices($conn, $user);
                        }
                    }
                }
            }
            returnMessage("success", "Erfolgreich alle User ausgeloggt, für die du Berechtigungen hast. Du selbst wurdest nicht ausgeloggt.");
            die();
        } else if ($type === "json") {
            $newValue = json_validate($_POST["newValue"]);
            if (setValueFromDatabase($conn, "settings", "setting", "id", $id, json_encode($newValue))) {
                returnMessage("success", "Wert erfolgreich geändert.");
                die();
            } else {
                returnMessage("failed", "Wert konnte nicht geändert werden.");
                die();
            }
        }
    } else if ($operation === "changeOtherValues") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "settings", "id", "id", $id)) {
            returnMessage("failed", "Die Einstellung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }

        if (!allowedToChangeSetting($conn, $userID, $id)) {
            returnMessage("failed", "Du hast nicht die erforderlichen Berechtigungen, um dise Berechtigung zu ändern / zuzugreifen.");
            die();
        }
        $settingName = getValueFromDatabase($conn, "settings", "name", "id", $id, 1, false);
        $type = $_POST["type"];

        if ($type === "changeName") {
            $newValue = $_POST["newValue"];

            if (valueExists($conn, "settings", "name", $newValue)) {
                returnMessage("failed", "Der Name <b>$newValue</b> existiert bereits.");
                die();
            }
            if (setValueFromDatabase($conn, "settings", "name", "id", $id, $newValue)) {
                returnMessage("success", "Namen erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Der Name <b>$newValue</b> konnte nicht gesetzt werden.");
                die();
            }
        } else if ($type === "changeDescription") {
            $newValue = $_POST["newValue"];

            if ($newValue == false) {
                $newValue = null;
            }
            if (setValueFromDatabase($conn, "settings", "description", "id", $id, $newValue)) {
                returnMessage("success", "Beschreibung erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Die Beschreibung konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "changeNormalValue") {
            $newValue = $_POST["newValue"];

            if (setValueFromDatabase($conn, "settings", "normalValue", "id", $id, $newValue)) {
                returnMessage("success", "Der Wert wurde erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Der Wert konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "changeNeededPermission") {
            $newValue = $_POST["newValue"];

            if (!userHasPermissions($conn, $userID, [$newValue=>gnVP($conn, $newValue)], false)) {
                returnMessage("failed", "Dir fehlt die Berechtigung, die du hinzufügen möchtest.");
                die();
            }

            if (setValueFromDatabase($conn, "settings", "permissionNeeded", "id", $id, $newValue)) {
                returnMessage("success", "Berechtigung erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Die Berechtigung konnte nicht geändert werden.");
                die();
            }
        }  else if ($type === "changeUsedAt") {
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
                if (addToArrayDatabase($conn, "settings", "usedAt", "id", $id, $toAdd, false)) {
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
                if (removeFromArrayDatabase($conn, "settings", "usedAt", "id", $id, $toRemove, true, true)) {
                    returnMessage("success", "Erfolgreich entfernt");
                } else {
                    returnMessage("failed", "Fehler beim entfernen");
                }
                die();
            } else if ($secondOperation === "removeAll") {
                if (insertArrayDatabase($conn, "settings", "usedAt", "id", $id, array())) {
                    returnMessage("success", "Erfolgreich geleert.");
                } else {
                    returnMessage("failed", "Fehler beim leeren.");
                }
                die();
            }
        }  else if ($type === "changeType") {
            $newValue = $_POST["newValue"];

            if ($newValue == false || empty($newValue)) {
                returnMessage("failed", "Leere Eingabe.");
                die();
            }
            if (setValueFromDatabase($conn, "settings", "type", "id", $id, $newValue)) {
                returnMessage("success", "Typ erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Der Typ konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "changeMin") {
            $newValue = $_POST["newValue"];

            if ($newValue == false) {
                $newValue = null;
            }
            if (setValueFromDatabase($conn, "settings", "min", "id", $id, $newValue)) {
                returnMessage("success", "Minimalwert erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Minimalwert konnte nicht geändert werden.");
                die();
            }
        } else if ($type === "changeMax") {
            $newValue = $_POST["newValue"];

            if ($newValue == false) {
                $newValue = null;
            }
            if (setValueFromDatabase($conn, "settings", "max", "id", $id, $newValue)) {
                returnMessage("success", "Maximalwert erfolgrich geändert.");
                die();
            } else {
                returnMessage("failed", "Maximalwert konnte nicht geändert werden.");
                die();
            }
        }

       
    } else if ($operation === "getValues") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "settings", "id", "id", $id)) {
            returnMessage("failed", "Die Einstellung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }
        $type = $_POST["type"];
        if ($type === "getType") {
            echo getValueFromDatabase($conn, "settings", "type", "id", $id, 1, false);
            die();
        } else if ($type === "getCurrentUsed") {
            echo json_encode(json_validate(getValueFromDatabase($conn, "settings", "usedAt", "id", $id, 1, false)));
            die();
        }
    } else if ($operation === "createSetting") {
        if (!userHasPermissions($conn, $userID, ["SettingsADDandREMOVE"=>gnVP($conn, "SettingsADDandREMOVE")])) {
            permissionDenied();
            die();
        }
        $settingName = $_POST["name"];
        if (valueInDatabaseExists($conn, "settings", "name", "name", $settingName)) {
            returnMessage("success", "Die Einstellung $settingName existiert bereits.", getValueFromDatabase($conn, "settings", "id", "name", $settingName, 1, false));
            die();
        }
        if (setValueFromDatabase($conn, "settings", "name", false, false, $settingName, true)) {
            returnMessage("success", "Berechtigung <b>$settingName</b> erfolgreich erstellt.", false, getValueFromDatabase($conn, "settings", "id", "name", $settingName, 1, false));
        } else {
            returnMessage("failed", "Ein Fehler ist aufgetreten");
        }
        die();
    } else if ($operation === "deleteSetting") {
        $id = $_POST["id"];
        if (!valueInDatabaseExists($conn, "settings", "id", "id", $id)) {
            returnMessage("failed", "Die Einstellung, die du bearbeiten möchtest gibt es nicht. (id: $id)");
            die();
        }

        if (!allowedToChangeSetting($conn, $userID, $id)) {
            returnMessage("failed", "Du hast nicht die erforderlichen Berechtigungen, um dise Berechtigung zu ändern / zuzugreifen.");
            die();
        }

        if (deleteRowFromDatabase($conn, "settings", "id", "id", $id)) {
            returnMessage("success", "Berechtigung <b>$settingName</b> erfolgreich gelöscht.");
        } else {
            returnMessage("failed", "Ein Fehler ist aufgetreten");
        }
        die();
    }
}
