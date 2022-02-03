<?php

use function PHPSTORM_META\type;


function getPermissionUser($conn, $userID, $permission)
{
    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $userID, 1, false));
    if ($usersPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "users", "permissions", "userID", $userID, "{}");
        return false;
    }
    if (isset($usersPermissions->$permission)) {
        return $usersPermissions->$permission;
    }
    return false;
}
function setPermissionUser($conn, $userID, $permission, $value)
{
    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $userID, 1, false));
    if ($usersPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "users", "permissions", "userID", $userID, "{}");
    }
    $usersPermissions->$permission = $value;
    if (insertObjectDatabase($conn, "users", "permissions", "userID", $userID, $usersPermissions)) {
        return true;
    }
    return false;
}

function removePermissionUser($conn, $userID, $permission)
{
    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $userID, 1, false));
    if ($usersPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "users", "permissions", "userID", $userID, "{}");
        return false;
    }
    $usersPermissions = removeFromObject($usersPermissions, $permission, "key", true);
    if (insertObjectDatabase($conn, "users", "permissions", "userID", $userID, $usersPermissions)) {
        return true;
    }
    return false;
}



# Group Permissions
function addGroup($conn, $groupName)
{
    if (groupExists($conn, $groupName)) {
        return false;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO groupPermissions (groupName) VALUES (?);");
        if ($stmt->execute([$groupName])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if (dbValidJSON($conn, "groupPermissions", "permissions", "groupName", $groupName, "{}")) {
                    return json_decode($result["permissionData"], TRUE);
                }
            }
        } else {
            echo "Error in executing Statement getting settings";
            return false;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function removeGroup($conn, $groupName)
{
    if (!groupExists($conn, $groupName)) {
        return false;
    }

    //Remove Group From every user Who has this group

    try {
        $stmt = $conn->prepare("DELETE FROM groupPermissions WHERE groupName = ?");
        if ($stmt->execute([$groupName])) {
            if ($stmt->rowCount()) {
                return true;
            }
        } else {
            echo "Error in executing Statement getting settings";
            return false;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function groupExists($conn, $groupName)
{
    try {
        $stmt = $conn->prepare("SELECT groupName FROM groupPermissions WHERE groupName = ?");
        if ($stmt->execute([$groupName])) {
            if ($stmt->rowCount()) {
                return true;
            }
        } else {
            echo "Error in executing Statement getting settings";
            return false;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getGroupPermissions($conn, $groupName)
{
    $groupPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, 1, false));
    if ($groupPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, "{}");
        return false;
    }
    return false;
}

function getPermissionGroup($conn, $groupName, $permission)
{
    $groupPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, 1, false));
    if ($groupPermissions === false) {
        repairObjectOrArrayInDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, "{}");
        return false;
    }
    if (isset($groupPermissions->$permission)) {
        return $groupPermissions->$permission;
    }
    return false;
}



function setPermissionsGroup($conn, $groupName, $permissions)
{
    if (!json_validate($permissions)) {
        return false;
    }
    if (json_validate($permissions) == false) {
        return false;
    }
    if (insertObjectDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, $permissions)) {
        return true;
    }
    return false;
}

function setPermissionGroup($conn, $groupName, $permission, $value)
{
    if (!$permission) return false;
    if (!valueInDatabaseExists($conn, "groupPermissions", "groupName", "groupName", $groupName)) {
        return false;
    }
    if (setObjectKeyAndValueDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, $permission, $value)) {
        return true;
    }
    return false;
}

function removePermissionGroup($conn, $groupName, $permission)
{
    $groupPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, 1, false));
    if ($groupPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, "{}");
        return false;
    }
    $groupPermissions = removeFromObject($groupPermissions, $permission, "key", true);
    if (insertObjectDatabase($conn, "groupPermissions", "permissions", "groupName", $groupName, $groupPermissions)) {
        return true;
    }
    return false;
}

# Users Groups

function userHasGroup($conn, $userID, $groupName)
{
    $allGroupsFromUser = getAllGroupsFromUser($conn, $userID);
    if (!$allGroupsFromUser) return false;
    #print_r($allGroupsFromUser);
    if (in_array($groupName, $allGroupsFromUser)) {
        return true;
    }
    return false;
}

function getAllGroupsFromUser($conn, $userID)
{
    $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $userID, 1, false));
    if ($usersGroups == false) {
        repairObjectOrArrayInDatabase($conn, "users", "groups", "userID", $userID, "[]");
        return false;
    }
    return $usersGroups;
}

function addGroupUser($conn, $userID, $groupName)
{
    $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $userID, 1, false));
    if ($usersGroups == false) {
        repairObjectOrArrayInDatabase($conn, "users", "groups", "userID", $userID, "[]");
    }
    if (addToArrayDatabase($conn, "users", "groups", "userID", $userID, $groupName, false)) {
        return true;
    }
    return false;
}

function removeGroupUser($conn, $userID, $groupName)
{
    $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $userID, 1, false));
    if ($usersGroups == false) {
        repairObjectOrArrayInDatabase($conn, "users", "groups", "userID", $userID, "[]");
        return false;
    }
    $usersGroups = removeFromArray($usersGroups, $groupName, "value", true, true);
    if (insertArrayDatabase($conn, "users", "groups", "userID", $userID, $usersGroups)) {
        return true;
    }
    return false;
}

function setGroupsUser($conn, $userID, $groups)
{
    if (!json_validate($groups)) {
        return false;
    }
    $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $userID, 1, false));
    if ($usersGroups == false) {
        repairObjectOrArrayInDatabase($conn, "users", "groups", "userID", $userID, "[]");
    }
    if (insertObjectDatabase($conn, "users", "groups", "userID", $userID, $groups)) {
        return true;
    }
    return false;
}


function userHasPermissions($conn, $userID, $permissionsNeeded, $checkRanking = false)
{
    logWrite($conn, "permissions", "userid: $userID => Passed In: ". json_encode($permissionsNeeded). "| SESSION_ID: ". session_id());
    #check for group
    $usersGroups = getAllGroupsFromUser($conn, $userID);

    $permissionsLeft = array();

    foreach ($permissionsNeeded as $currentPermissionKey => $value) {
        $permissionsLeft = addToArray($permissionsLeft, $currentPermissionKey, false);
        if (!valueExists($conn, "permissions", "name", $currentPermissionKey)) {
            logWrite($conn, "permissionAccess", "User id: $userID tries to check for not given Permission $currentPermissionKey", true, false, "yellow");
            return false;
        }
        if (userIsForbiddenTo($conn, $userID, [$currentPermissionKey])) {
            return false;
        }
        #Check for users Groups and those permissions
        $rankingNeeded = 0;
        if (gettype($usersGroups) == gettype(array())) {
            if ($usersGroups) {
                foreach ($usersGroups as $group) {
                    $rankingPermission = intval(getParamterFromPermissions($conn, $currentPermissionKey, "ranking"));
                    if ($rankingPermission > $rankingNeeded) {
                        $rankingNeeded = $rankingPermission;
                    }
                    if (groupIsForbiddenTo($conn, $group, [$currentPermissionKey])) {
                        logWrite($conn, "permissionAccess", "Group ($group) forbidden to $currentPermissionKey.", true, false, "red");
                        return false;
                    }
                    if (getPermissionGroup($conn, $group, $currentPermissionKey) == $value) {
                        $permissionsLeft = removeFromArray($permissionsLeft, $currentPermissionKey, "value");
                    } else {
                        #Check for users permissions
                        if (getPermissionUser($conn, $userID, $currentPermissionKey) == $value) {
                            $permissionsLeft = removeFromArray($permissionsLeft, $currentPermissionKey, "value");
                        } else {
                        }
                    }
                }
            } else {
                #Check for users permissions
                if (getPermissionUser($conn, $userID, $currentPermissionKey) == $value) {
                    $permissionsLeft = removeFromArray($permissionsLeft, $currentPermissionKey, "value");
                } else {
                    logWrite($conn, "permissionAccess", "User (id: $userID) hasn't the Permission $currentPermissionKey.", true, false, "red");
                }
            }
        } else {
            if (getPermissionUser($conn, $userID, $currentPermissionKey) == $value) {
                $permissionsLeft = removeFromArray($permissionsLeft, $currentPermissionKey, "value");
            }
        }
    }
    
    if (count($permissionsLeft) === 0) {
        return true;
    } else if ($checkRanking) {
        if (userHasPermissionRanking($conn, $userID, $permissionsLeft)) return true;
    }
    return false;
}

function userHasPermissionRanking($conn, $userID, $numberNeeded)
{
    //if the number needed is false or null there is no permission set and so the user is able to access whatever it wants to access
    if ($numberNeeded === false || $numberNeeded === null) {
        return true;
    }
    $usersRank = intval(getPermissionRanking($conn, $userID));
    if ($usersRank === 0) {
        return false;
    }
    if ($usersRank >= $numberNeeded) {
        return true;
    }
    return false;
}

function getPermissionRanking($conn, $userID)
{
    $groupsFromUser = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $userID, 1, false));
    $number = 0;

    //Get it from groups
    if (gettype($groupsFromUser) == gettype(array() && count($groupsFromUser) > 0)) {
        if ($groupsFromUser) {
            foreach ($groupsFromUser as $currentGroup) {
                $groupRanking = getPermissionRankingGroup($conn, $currentGroup);
                if ($groupRanking > $number) {
                    $number = $groupRanking;
                }
            }
        }
    }
    //If user has some higher permissions set increase number
    $allPermissions = getAvailablePermissions($conn);
    if (gettype($allPermissions) == gettype(array()) && count($allPermissions) > 0) {
        foreach ($allPermissions as $currentPermission) {
            $permissionName = $currentPermission["name"];
            $permissionRanking = $currentPermission["ranking"];
            $permissionNormalValue = $currentPermission["normalValue"];
            if (userHasPermissions($conn, $userID, [$permissionName => $permissionNormalValue], false)) {
                $permissionRanking = intval($permissionRanking);
                if ($permissionRanking > $number) {
                    $number = $permissionRanking;
                }
            }
        }
    }

    return $number;
}

function getPermissionRankingGroup($conn, $group)
{
    if (!$group && !count($group) > 0) return false;
    $number = 0;
    $groupPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "groupName", $group, 1, false));
    if (!$groupPermissions) return false;
    foreach ($groupPermissions as $currentPermissionKey => $currentPermissionValue) {
        if (!groupIsForbiddenTo($conn, $group, [$currentPermissionKey])) {
            $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "name", $currentPermissionKey, 1, false));
            if ($permissionRanking !== false) {
                if ($permissionRanking > $number) {
                    $number = $permissionRanking;
                }
            }
        }
    }
    return $number;
}

function getParamterFromGroup($conn, $groupName, $parameter)
{
    return getValueFromDatabase($conn, "groupPermissions", $parameter, "groupName", $groupName, 1, false);
}

function setParameterFromGroup($conn, $groupName, $parameter, $value)
{
    if (setValueFromDatabase($conn, "groupPermissions", $parameter, "groupName", $groupName, $value, false)) {
        return true;
    }
    return false;
}

function getParamterFromPermissions($conn, $permission, $parameter)
{
    return getValueFromDatabase($conn, "permissions", $parameter, "name", $permission, 1, false);
}


function getAvailablePermissions($conn, $onlyName = false)
{
    if ($onlyName) {
        try {
            $stmt = $conn->prepare("SELECT DISTINCT name FROM permissions ORDER BY name ASC;");
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $resultArray = array();

                    foreach ($result as $current) {
                        $resultArray[] = $current["name"];
                    }
                    return $resultArray;
                } else {
                    echo "Keine Berechtigungen gefunden.";
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
        return false;
    } else {
        try {
            $stmt = $conn->prepare("SELECT DISTINCT name, type, description, normalValue, ranking FROM permissions ORDER BY name ASC;");
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    return $result;
                } else {
                    echo "Keine Berechtigungen gefunden.";
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
        return false;
    }
}

function setParameterFromPermissions($conn, $permissionName, $parameter, $value)
{
    if (setValueFromDatabase($conn, "permissions", $parameter, "name", $permissionName, $value, false)) {
        return true;
    }
    return false;
}


function userIsForbiddenTo($conn, $userID, $forbidden = array())
{
    if (count($forbidden) > 0 && gettype($forbidden) == gettype(array())) {
        $forbiddenPermissionsUser = getAllForbiddenPermissionsFromUser($conn, $userID);
        foreach ($forbidden as $currentCheckForbidden) {
            if ($forbiddenPermissionsUser) {
                foreach ($forbiddenPermissionsUser as $currentForbiddenUser) {
                    if ($currentForbiddenUser == $currentCheckForbidden) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}



function getAllForbiddenPermissionsFromUser($conn, $userID)
{
    dbValidJSON($conn, "users", "isForbiddenTo", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare(("SELECT isForbiddenTo AS permissionData FROM users WHERE userID = ?;"));
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = json_decode($result["permissionData"]);
                $resultArray = array();
                foreach ($result as $current) {
                    $resultArray[] = $current;
                }
                return $resultArray;
            }
        } else {
            echo "Error in executing Statement getting settings";
            return false;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function groupIsForbiddenTo($conn, $groupName, $forbidden = array())
{
    if (count($forbidden) > 0 && gettype($forbidden) == gettype(array())) {
        $forbiddenPermissionsGroup = getAllForbiddenPermissionsFromGroup($conn, $groupName);
        foreach ($forbidden as $currentCheckForbidden) {
            if ($forbiddenPermissionsGroup) {
                foreach ($forbiddenPermissionsGroup as $currentForbiddenGroup) {
                    if ($currentForbiddenGroup == $currentCheckForbidden) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}



function getAllForbiddenPermissionsFromGroup($conn, $groupName)
{
    $forbiddenPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $groupName, 1, false));
    if ($forbiddenPermissions === false) {
        repairObjectOrArrayInDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $groupName, "[]");
    }
    return $forbiddenPermissions;
}

function getAllPermissionNamesFromUser($conn, $userID, $onlyFromUserTable = false)
{

    if ($onlyFromUserTable) {
        dbValidJSON($conn, "users", "permissions", "userID", $userID, "{}");
        try {
            $stmt = $conn->prepare(("SELECT permissions AS permissionData FROM users WHERE userID = ?;"));
            if ($stmt->execute([$userID])) {
                if ($stmt->rowCount()) {
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);
                    $usersPermissions = json_decode($result['permissionData']);

                    $resultArray = array();
                    foreach ($usersPermissions as $currentPermissionName => $value) {
                        $resultArray[] = $currentPermissionName;
                    }

                    return $resultArray;
                }
            } else {
                echo "Error in executing Statement getting settings";
                return false;
            }
        } catch (Exception $e) {
            echo $e;
        }
        return false;
    } else {
        $allPermissions = getAvailablePermissions($conn);
        if (count($allPermissions) > 0) {
            $resultArray = array();
            foreach ($allPermissions as $currentPermission) {
                $permissionName = $currentPermission["name"];
                $permissionRanking = $currentPermission["ranking"];
                $permissionNormalValue = $currentPermission["normalValue"];
                if (userHasPermissions($conn, $userID, [$permissionName => $permissionNormalValue], false)) {
                    $resultArray[] = $permissionName;
                }
            }
            return json_encode($resultArray);
        }
        echo 0;
    }
}


function returnFullPermission($conn, $permissionName)
{
    try {
        $stmt = $conn->prepare(("SELECT DISTINCT name, type, description, ranking, normalValue, hinweis FROM permissions WHERE name = ?"));
        if ($stmt->execute([$permissionName])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return $result;
            }
        } else {
            echo "Error in executing Statement getting settings";
            return false;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}


function addForbiddenPermissionUser($conn, $userID, $toAdd)
{
    $usersForbiddenPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $userID, 1, false));
    if ($usersForbiddenPermissions === false) {
        repairObjectOrArrayInDatabase($conn, "users", "isForbiddenTo", "userID", $userID, "[]");
    }
    if (addToArrayDatabase($conn, "users", "isForbiddenTo", "userID", $userID, $toAdd, false)) {
        return true;
    }
    return false;
}

function removeForbiddenPermissionUser($conn, $userID, $toRemove)
{
    $usersForbiddenPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $userID, 1, false));
    if ($usersForbiddenPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "users", "isForbiddenTo", "userID", $userID, "[]");
        return false;
    }
    $usersForbiddenPermissions = removeFromArray($usersForbiddenPermissions, $toRemove, "value", true, true);
    if (insertArrayDatabase($conn, "users", "isForbiddenTo", "userID", $userID, $usersForbiddenPermissions)) {
        return true;
    }
    return false;
}

function setForbiddenPermissionUser($conn, $userID, $forbiddenPermissions)
{
    if (!json_validate($forbiddenPermissions)) {
        return false;
    }
    $UsersforbiddenPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $userID, 1, false));
    if ($UsersforbiddenPermissions == false) {
        repairObjectOrArrayInDatabase($conn, "users", "isForbiddenTo", "userID", $userID, "[]");
    }
    if (insertObjectDatabase($conn, "users", "isForbiddenTo", "userID", $userID, $forbiddenPermissions)) {
        return true;
    }
    return false;
}

function gnVP($conn, $permissionName)
{
    $value = -1;
    if (!$permissionName) return "nope";
    if (gettype($permissionName) == "string") {
        if ($res = getValueFromDatabase($conn, "permissions", "normalValue", "name", $permissionName, 1, false)) {
            $value = $res;
        }
    } else if (gettype($permissionName) == "integer" || gettype($permissionName) == "double") {
        if ($res = getValueFromDatabase($conn, "permissions", "normalValue", "codeID", $permissionName, 1, false)) {
            $value = $res;
        }
    }


    return intval($value);
}


function getGroupsUserCanAdd($conn, $userID) {
    $allGroups = getAllValuesFromDatabase($conn, "groupPermissions", "groupName", 0, true, true);
   if (!$allGroups) {
       return false;
   }

   $resultArray = array();
   foreach ($allGroups as $group) {
    $groupsRank = intval(getPermissionRankingGroup($conn, $group));
    if (userHasPermissionRanking($conn, $userID, $groupsRank)) {
        $resultArray[] = $group;
    }
   }

   return $resultArray;
}