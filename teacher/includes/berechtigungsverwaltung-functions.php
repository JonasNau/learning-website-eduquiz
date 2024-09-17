<?php


function renamePermissionInDatabase($conn, $id, $newName)
{
    $returnArray = array();
    //Check if Permssion Name is already given
    if (valueInDatabaseExists($conn, "permissions", "id", "name", $newName)) {
        $returnArray["message"] = "Die Berechtigung mit der id $id hat bereits den Namen $newName.";
        $returnArray["status"] = "failed";
        return $returnArray;
    }

    $permissionName = getValueFromDatabase($conn, "permissions", "name", "id", $id, 1, false);
    if (!$permissionName) {
        $returnArray["message"] = "Die Berechtigung mit der id $id hat keinen Namen ($permissionName)";
        $returnArray["status"] = "failed";
        return $returnArray;
    }

    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung $permissionName mit der id: $id soll in $newName umbenannt werden.", true, false, "light yellow");
    //Change every at groups
    //TODO: allowed and forbidden

    $responseArray = changePermissionNameFromUsersAndGroups($conn, $permissionName, $newName);

    //Change Name from Permission
    if (setValueFromDatabase($conn, "permissions", "name", "name", $permissionName, $newName, false)) {
        $returnArray["status"] = "success";
        $returnArray["message"] = "Der Name der Berechtigung $permissionName wurde <b>erfolgreich</b> zu $newName <b>geändert</b>. Falls dieser Name ($permissionName) im Programmcode von Eduquiz verwendet wird muss dieser manuell zu dem neuen Namen geändert werden. Kontaktiere einen Serveradministrator. (Neuer Name: $newName). Ergebnis: Groups: Geänderte Gruppen:" . json_encode($responseArray["changedGroups"]) . "Fehler:" . json_encode($responseArray["changedGroupsERROR"]) . " Users: Geänderte Benutzer:" . json_encode($responseArray["changedUsers"]) . "Fehler:" . json_encode($responseArray["changedUsersERROR"]);
    } else {
        $returnArray["status"] = false;
        $returnArray["message"] = "Der Name der Berechtigung $permissionName konnte <b>nicht</b> geändert werden.";
    }

    $userID = $_SESSION["userID"];
    $username = getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);
    logWrite($conn, "berechtigungsverwaltung", "Der Name $permissionName muss im Programmcode zu $newName geändert werden. Geändert von Username: '$username' userID: '$userID'.", true, false, "yellow");

    return $returnArray;
}

function changePermissionNameFromUsersAndGroups($conn, $permissionName, $newName)
{
    //If name = false it will just remove
    $returnArray = array();
    $allGroups = getAllValuesFromDatabase($conn, "groupPermissions", "groupName", 0, true);
    $changedGroupsArray = array();
    $returnArray["changedGroupsERROR"] = false;
    if ($allGroups) {
        foreach ($allGroups as $currentGroup) {
            //check for allowed 
            if (getPermissionGroup($conn, $currentGroup, $permissionName)) {
                //Group Has Permission
                $oldValue = getPermissionGroup($conn, $currentGroup, $permissionName);
                logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $currentGroup hat die Berechtigung (allowed) $permissionName mit dem Wert: $oldValue", true, false);
                //Remove
                if (removeFromObjectDatabase($conn, "groupPermissions", "permissions", "groupName", $currentGroup, $permissionName, true, false, "key")) {
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $permissionName wurde von Gruppe $currentGroup entfernt.", true, false, "green");
                } else {
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $permissionName wurde nicht von Gruppe $currentGroup entfernt. Fehler", true, true);
                    $returnArray["changedGroupsERROR"] = true;
                }
                if ($newName) {
                    //Set new name with old value
                    if (setObjectKeyAndValueDatabase($conn, "groupPermissions", "permissions", "groupName", $currentGroup, $newName, $oldValue)) {
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $newName wurde zur Gruppe $currentGroup mit dem Wert $oldValue hinzugefügt.", true, false, "green");
                        $changedGroupsArray = addToArray($changedGroupsArray, $currentGroup, false);
                    } else {
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $newName wurde nicht zur Gruppe $currentGroup hinzugefügt.", true, true);
                        $returnArray["changedGroupsERROR"] = true;
                    }
                }
            } else {
                logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $currentGroup hat die Berechtigung (allowed) $permissionName nicht. Keine Aktion unternommen", true, false, "gray");
            }

            //Check for forbidden
            if (groupIsForbiddenTo($conn, $currentGroup, [$permissionName])) {
                //Group has this permission in forbidden permissions
                if (removeFromArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $currentGroup, $permissionName, true, true)) {
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $permissionName wurde von Gruppe $currentGroup entfernt.", true, false, "green");
                } else {
                    $returnArray["changedGroupsERROR"] = true;
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $permissionName wurde nicht von Gruppe $currentGroup entfernt. Fehler", true, true);
                }
                if ($newName) {
                    if (addToArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $currentGroup, $newName, false)) {
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $newName wurde zur Gruppe $currentGroup hinzugefügt.", true, false, "green");
                        $changedGroupsArray = addToArray($changedGroupsArray, $currentGroup, false);
                    } else {
                        $returnArray["changedGroupsERROR"] = true;
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $newName wurde nicht zur Gruppe $currentGroup hinzugefügt.", true, true);
                    }
                }
            } else {
                logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $currentGroup hat die Berechtigung (forbidden) $permissionName nicht. Keine Aktion unternommen", true, false, "gray");
            }
        }
    } else {
        logWrite($conn, "berechtigungsverwaltung", "Keine Gruppen vorhanden, um deren Berechtigungen zu ändern", true, false, "yellow", ".log");
    }
    //Change every at users
    //TODO: allowed and forbidden
    $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
    $changedUsersArray = array();
    $returnArray["changedUsersERROR"] = false;
    if ($allUsers) {
        foreach ($allUsers as $currentUser) {
            $username = getValueFromDatabase($conn, "users", "username", "userID", $currentUser, 1, false);
            //check for allowed 
            if (getPermissionUser($conn, $currentUser, $permissionName)) {
                //User Has Permission
                $oldValue = getPermissionUser($conn, $currentGroup, $permissionName);
                logWrite($conn, "berechtigungsverwaltung", "Der Nutzer Username: '$username' userID: '$currentUser' hat die Berechtigung (allowed) $permissionName mit dem Wert: $oldValue", true, false);
                //Remove
                if (removeFromObjectDatabase($conn, "users", "permissions", "userID", $currentUser, $permissionName, true, false, "key")) {
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $permissionName wurde von Nutzer Username: '$username' userID: '$currentUser' entfernt.", true, false, "green");
                } else {
                    $returnArray["changedUsersERROR"] = true;
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $permissionName wurde nicht von GUsername: '$username' userID: '$currentUser' entfernt. Fehler", true, true);
                }
                if ($newName) {
                    //Set new name with old value
                    if (setObjectKeyAndValueDatabase($conn, "users", "permissions", "userID", $currentUser, $newName, $oldValue,)) {
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $newName wurde dem Nutzer Username: '$username' userID: '$currentUser' mit dem Wert $oldValue hinzugefügt.", true, false, "green");
                        $changedUsersArray = addToArray($changedUsersArray, $username, false);
                    } else {
                        $returnArray["changedUsersERROR"] = true;
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (allowed) $newName wurde nicht dem Nutzer Username: '$username' userID: '$currentUser' hinzugefügt.", true, true);
                    }
                }
            } else {
                logWrite($conn, "berechtigungsverwaltung", "Der Nutzer Username: '$username' userID: '$currentUser' hat die Berechtigung (allowed) $permissionName nicht. Keine Aktion unternommen", true, false, "gray");
            }

            //Check for forbidden
            if (userIsForbiddenTo($conn, $currentUser, [$permissionName])) {
                //Group has this permission in forbidden permissions
                if (removeFromArrayDatabase($conn, "users", "isForbiddenTo", "userID", $currentUser, $permissionName, true, true)) {
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $permissionName wurde von Nutzer Username: '$username' userID: '$currentUser' entfernt.", true, false, "green");
                } else {
                    $returnArray["changedUsersERROR"] = true;
                    logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $permissionName wurde nicht von Nutzer Username: '$username' userID: '$currentUser' entfernt. Fehler", true, true);
                }
                if ($newName) {
                    if (addToArrayDatabase($conn, "users", "isForbiddenTo", "userID", $currentUser, $newName, false)) {
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $newName wurde dem Nutzer Username: '$username' userID: '$currentUser' hinzugefügt.", true, false, "green");
                        $changedUsersArray = addToArray($changedUsersArray, $username, false);
                    } else {
                        $returnArray["changedUsersERROR"] = true;
                        logWrite($conn, "berechtigungsverwaltung", "Die Berechtigung (forbidden) $newName wurde nicht dem Nutzer Username: '$username' userID: '$currentUser' hinzugefügt.", true, true);
                    }
                }
            } else {
                logWrite($conn, "berechtigungsverwaltung", "Nutzer Username: '$username' userID: '$currentUser' hat die Berechtigung (forbidden) $permissionName nicht. Keine Aktion unternommen", true, false, "gray");
            }
        }
    } else {
        logWrite($conn, "berechtigungsverwaltung", "Keine Nutzer vorhanden, um deren Berechtigungen zu ändern", true, false, "yellow");
    }

    $returnArray["changedGroups"] = $changedGroupsArray;
    $returnArray["changedUsers"] = $changedUsersArray;
    return $returnArray;
}

function renameGroupInDatabase($conn, $id, $newName)
{
    $returnArray = array();
    //Check if Permssion Name is already given
    if (valueInDatabaseExists($conn, "groupPermissions", "id", "groupName", $newName)) {
        $returnArray["message"] = "Es existiert bereits eine Gruppe mit dem Namen $newName.";
        $returnArray["status"] = "failed";
        return $returnArray;
    }

    $groupName = getValueFromDatabase($conn, "groupPermissions", "groupName", "id", $id, 1, false);
    if (!$groupName) {
        $returnArray["message"] = "Die Berechtigung mit der id $id hat keinen Namen ($groupName)";
        $returnArray["status"] = "failed";
        return $returnArray;
    }

    logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $groupName mit der id: $id soll in $newName umbenannt werden.", true, false, "light yellow");
    //Change every at groups
    //TODO: allowed and forbidden

    $responseArray = changeGroupNameFromUsers($conn, $groupName, $newName);

    //Change Name from Permission
    if (setValueFromDatabase($conn, "groupPermissions", "groupName", "groupName", $groupName, $newName, false)) {
        $returnArray["status"] = "success";
        $returnArray["message"] = "Der Name der Gruppe $groupName wurde <b>erfolgreich</b> zu $newName <b>geändert</b>. | Ergebnis Users: Geänderte Benutzer:" . json_encode($responseArray["changedUsers"]) . "Fehler:" . json_encode($responseArray["changedUsersERROR"]);
        logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $groupName mit der id: $id wurde erfolgreich in $newName umbenannt", true, false, "green");
    } else {
        $returnArray["status"] = false;
        $returnArray["message"] = "Der Name der Berechtigung $groupName konnte <b>nicht</b> geändert werden.";
        logWrite($conn, "berechtigungsverwaltung", "Die Gruppe $groupName mit der id: $id konnte nicht in $newName umbenannt werden.", true, true);
    }
    return $returnArray;
}

function changeGroupNameFromUsers($conn, $groupName, $newName)
{
    //If name = false it will just remove
    $returnArray = array();
   
    //Change every at users
    //TODO: allowed and forbidden
    $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
    $changedUsersArray = array();
    $returnArray["changedUsersERROR"] = false;
    if ($allUsers) {
        foreach ($allUsers as $currentUser) {
            $username = getValueFromDatabase($conn, "users", "username", "userID", $currentUser, 1, false);
            $usersGroups = custom_json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $currentUser, 1, false));
            if (!$usersGroups || !count($usersGroups) > 0) {continue;}
            foreach ($usersGroups as $currentGroup) {
                if ($currentGroup == $groupName) {
                    if (removeFromArrayDatabase($conn, "users", "groups", "userID", $currentUser, $groupName, true, true)) {
                        logWrite($conn, "berechtigungsverwaltung", "Dem Nutzer mit der userID: $currentUser mit dem Namen $username wurde die Gruppe $groupName enfernt (ersetzen)", true, false, "green");
                        if (addToArrayDatabase($conn, "users", "groups", "userID", $currentUser, $newName, false)) {
                            logWrite($conn, "berechtigungsverwaltung", "Dem Nutzer mit der userID: $currentUser mit dem Namen $username wurde die Gruppe $newName hinzugefügt (ersetzen)", true, false, "green");
                            $changedUsersArray = addToArray($changedUsersArray, $currentUser, false);
                        } else {
                            $returnArray["changedUsersERROR"] = true;
                            logWrite($conn, "berechtigungsverwaltung", "Dem Nutzer mit der userID: $currentUser mit dem Namen $username wurde die Gruppe $newName nicht hinzugefügt (ersetzen)", true, true);
                        }
                    } else {
                        $returnArray["changedUsersERROR"] = true;
                        logWrite($conn, "berechtigungsverwaltung", "Dem Nutzer mit der userID: $currentUser mit dem Namen $username wurde die Gruppe $groupName nicht enfernt (ersetzen", true, true);
                    }
                } 
            }
        }

    }
    $returnArray["changedUsers"] = $changedUsersArray;
    return $returnArray;
}
