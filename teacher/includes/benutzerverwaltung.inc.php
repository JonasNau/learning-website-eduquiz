<?php
require_once("../../includes/dbh.incPDO.php");
require_once("../../includes/getSettings.php");
require_once("../../includes/userSystem/functions/permission-functions.php");
require_once("../../includes/generalFunctions.php");
require_once("../../includes/userSystem/functions/generalFunctions.php");
require_once("../../includes/userSystem/functions/deleteAccount-functions.php");
require_once("../../includes/userSystem/autologin.php");
require_once("../../includes/userSystem/functions/login-functions.php");
require_once("../../includes/organisationFunctions.inc.php");

require_once("../../includes/userSystem/functions/signup-functions.php");
require_once("../../includes/userSystem/functions/signup-functions.php");
require_once("../../includes/getSettings.php");
require_once("../../includes/userSystem/functions/password-check-functions.php");
require_once("../../includes/userSystem/functions/login-functions.php");

require_once("./lehrerpanel.inc.php");

require_once("../../global.php");

mustBeLoggedIn();

$userID = $_SESSION['userID'];
$username = getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);

$database = new dbh();
$conn = $database->connect();

if (isset($_POST["benutzerverwaltung"])) {
    if (!userHasPermissions($conn, $userID, ["accessBenutzerverwaltung" => gnVP($conn, "accessBenutzerverwaltung")])) {
        permissionDenied();
        die();
    }
    if (!isset($_POST["operation"])) {
        returnMessage("failed", "Keine Operation angegeben.");
        die();
    }
    $operation = $_POST["operation"];

    if ($operation === "search") {
        $type = $_POST["type"];

        $limitResults = $_POST["limitResults"];

        function returnFoundUsers($conn, $users, $limitResults)
        {
            if (!$users) {
                returnMessage("failed", "Keine Ergebnisse");
                die();
            }

            if (count($users) > 0) {
                $resultArray = array();

                foreach ($users as $user) {
                    if ($user == null) continue;
                    $username = getValueFromDatabase($conn, "users", "username", "userID", $user, 1, false);
                    $email = getValueFromDatabase($conn, "users", "email", "userID", $user, 1, false);
                    $klassenstufe = getValueFromDatabase($conn, "users", "klassenstufe", "userID", $user, 1, false);
                    $isOnline = getValueFromDatabase($conn, "users", "isOnline", "userID", $user, 1, false);
                    $authenticated = getValueFromDatabase($conn, "users", "authenticated", "userID", $user, 1, false);
                    $groups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $user, 1, false));

                    //Create Readable feedback like lastLogin etc
                    $now = new DateTime(getCurrentDateAndTime(1));


                    $lastLoginString = "Noch Nie";
                    $lastLoginRaw = getValueFromDatabase($conn,  "users", "lastLogin", "userID", $user, 1, false);
                    if ($lastLoginRaw != null && $lastLoginRaw != "never") {
                        $lastLogin = new DateTime($lastLoginRaw);
                        $lastLogin = differenceOfTime($lastLogin, $now);
                        $lastLoginString = secondsToArrayOrString($lastLogin, "String");
                    }

                    $createdString = "";
                    $createdRaw = getValueFromDatabase($conn,  "users", "created", "userID", $user, 1, false);
                    if ($createdRaw != null && !empty($createdRaw)) {
                        $created = new DateTime($createdRaw);
                        $created = differenceOfTime($created, $now);
                        $createdString = secondsToArrayOrString($created, "String");
                    }

                    $lastPwdChangeString = "Noch nie";
                    $lastPwdChangeRaw = getValueFromDatabase($conn,  "users", "lastPwdChange", "userID", $user, 1, false);
                    if ($lastPwdChangeRaw != null && !empty($lastPwdChangeRaw)) {
                        $lastPwdChange = new DateTime($lastPwdChangeRaw);
                        $lastPwdChange = differenceOfTime($lastPwdChange, $now);
                        $lastPwdChangeString = secondsToArrayOrString($lastPwdChange, "String");
                    }

                    $lastActivityString = "Noch Nie";
                    $lastActivityRaw = getValueFromDatabase($conn,  "users", "lastActivity", "userID", $user, 1, false);
                    if ($lastActivityRaw != null && !empty($lastActivityRaw)) {
                        $lastActivity = new DateTime($lastActivityRaw);
                        $lastActivity = differenceOfTime($lastActivity, $now);
                        $lastActivityString = secondsToArrayOrString($lastActivity, "String");
                    }

                    $permissionsAllowed = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $user, 1, false));
                    $permissionsForbidden = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $user, 1, false));
                    $ranking = getPermissionRanking($conn, $user);
                    $usersnextMessages = json_validate(getValueFromDatabase($conn, "users", "messageForComeBack", "userID", $user, 1, false));
                    $showPublic = getValueFromDatabase($conn, "users", "showPublic", "userID", $user, 1, false);
                    //Insert new Group and Permissions and deniedPermissions if these values are null in DB set it to valid json

                    array_push($resultArray, array("userID" => $user, "username" => $username, "email" => $email, "klassenstufe" => $klassenstufe, "created" => $createdRaw, "lastLogin" => $lastLoginRaw, "lastPwdChange" => $lastPwdChange, "authenticated" => $authenticated, "groups" => $groups, "permissionsAllowed" => $permissionsAllowed, "permissionsForbidden" => $permissionsForbidden, "lastActivity" => $lastActivityRaw, "isOnline" => $isOnline, "lastLoginString" => $lastLoginString, "createdString" => $createdString, "lastPwdChangeString" => $lastPwdChangeString, "lastActivityString" => $lastActivityString, "nextMessages" => $usersnextMessages, "ranking" => $ranking, "showPublic" => $showPublic));
                }
                echo json_encode(limitArray($resultArray, intval($limitResults)));
                return true;
            }
        }

        if ($type === "username") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $username = getValueFromDatabase($conn, "users", "username", "userID", $currentUser, 1, false);
                if (str_contains(strToLower($username), strToLower($input)) || str_contains(strToUpper($username), strToUpper($input))) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "email") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $email = getValueFromDatabase($conn, "users", "email", "userID", $currentUser, 1, false);
                if (str_contains(strToLower($email), strToLower($input)) || str_contains(strToUpper($email), strToUpper($input))) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "userID") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                if ($input == $currentUser) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "ranking") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $usersRanking = getPermissionRanking($conn, $currentUser);
                if ($input == $usersRanking) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "authenticated") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $usersAuthentication = getValueFromDatabase($conn, "users", "authenticated", "userID", $currentUser, 1, false);
                if ($input == $usersAuthentication) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "isOnline") {
            $input = $_POST["input"];
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $isOnline = getValueFromDatabase($conn, "users", "isOnline", "userID", $currentUser, 1, false);
                if ($input == $isOnline) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "groups") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $currentUser, 1, false));
                if (array_contains_all_values($usersGroups, $input, true)) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "klassenstufe") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $usersKlassenstufe = getValueFromDatabase($conn, "users", "klassenstufe", "userID", $currentUser, 1, false);
                if (in_array($usersKlassenstufe, $input)) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "permissionsAllowed") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $allPermissionsFromUser = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $currentUser, 1, false));
                if (hasAllContidions($conn, $input, $allPermissionsFromUser, false)) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "permissionsForbidden") {
            $input = json_validate($_POST["input"]);
            $resultArray = array();
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }
            foreach ($allUsers as $currentUser) {
                $allPermissionsFromUser = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $user, 1, false));
                if (array_contains_all_values($allPermissionsFromUser, $input, true)) {
                    $resultArray[] = $currentUser;
                }
            }
            returnFoundUsers($conn, $resultArray, $limitResults);
            die();
        } else if ($type === "multiple") {
            $username = $_POST["username"];
            $email = $_POST["email"];
            $userID = $_POST["userID"];
            $ranking = $_POST["ranking"];
            $groups = json_validate($_POST["groups"]);
            $klassenstufen = json_validate($_POST["klassenstufen"]);
            $isOnline = $_POST["isOnline"];
            $authenticated = $_POST["authenticated"];
            $permissionsAllowed = json_validate($_POST["permissionsAllowed"]);
            $permissionsForbidden = json_validate($_POST["permissionsForbidden"]);

            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            if (!$allUsers || !count($allUsers) > 0) {
                returnFoundUsers($conn, false, $limitResults);
                die();
            }

            if ($username !== false && count($allUsers) > 0 && $username != "false") {
                foreach ($allUsers as $currentUser) {
                    $usernameCurrent = getValueFromDatabase($conn, "users", "username", "userID", $currentUser, 1, false);
                    if (str_contains(strToLower($usernameCurrent), strToLower($username)) == false && str_contains(strToUpper($usernameCurrent), strToUpper($username)) == false) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($email !== false && count($allUsers) > 0 && $email != "false") {
                foreach ($allUsers as $currentUser) {
                    $emailCurrent = getValueFromDatabase($conn, "users", "email", "userID", $currentUser, 1, false);
                    if ($emailCurrent != $email) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($userID !== false && count($allUsers) > 0 && $userID != "false") {
                foreach ($allUsers as $currentUser) {
                    if (str_contains(strToLower($currentUser), strToLower($userID)) == false && str_contains(strToUpper($currentUser), strToUpper($userID)) == false) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($ranking !== false && count($allUsers) > 0 && $ranking != "false") {
                foreach ($allUsers as $currentUser) {
                    $rankingCurrent = getPermissionRanking($conn, $currentUser);
                    if ($rankingCurrent != $ranking) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($groups !== false && count($allUsers) > 0 && $groups != "false") {
                foreach ($allUsers as $currentUser) {
                    $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $currentUser, 1, false));
                    if (!array_contains_all_values($usersGroups, $groups, true)) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }

            if ($klassenstufen !== false && count($allUsers) > 0 && $klassenstufen != "false") {
                foreach ($allUsers as $currentUser) {
                    $usersKlassenstufe = getValueFromDatabase($conn, "users", "klassenstufe", "userID", $currentUser, 1, false);
                    if (!in_array($usersKlassenstufe, $klassenstufen)) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($isOnline !== false && count($allUsers) > 0 && $isOnline != "false") {
                foreach ($allUsers as $currentUser) {
                    $isOnlineCurrent = getValueFromDatabase($conn, "users", "isOnline", "userID", $currentUser, 1, false);
                    if ($isOnlineCurrent != $isOnline) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($authenticated !== false && count($allUsers) > 0 && $authenticated != "false") {
                foreach ($allUsers as $currentUser) {
                    $authenticatedCurrent = getValueFromDatabase($conn, "users", "authenticated", "userID", $currentUser, 1, false);
                    if ($authenticatedCurrent != $authenticated) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($permissionsAllowed !== false && count($allUsers) > 0 && $permissionsAllowed != "false") {
                foreach ($allUsers as $currentUser) {
                    $allPermissionsFromUser = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $currentUser, 1, false));
                    if (hasAllContidions($conn, $permissionsAllowed, $allPermissionsFromUser, false)) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            if ($permissionsForbidden !== false && count($allUsers) > 0 && $permissionsForbidden != "false") {
                foreach ($allUsers as $currentUser) {
                    $allPermissionsFromUser = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $currentUser, 1, false));
                    if (!array_contains_all_values($allPermissionsFromUser, $permissionsForbidden, true)) {
                        $allUsers = removeFromArray($allUsers, $currentUser, "value", true, true);
                    }
                }
            }
            returnFoundUsers($conn, $allUsers, $limitResults);
            die();
        } else if ($type === "all") {
            $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
            returnFoundUsers($conn, $allUsers, $limitResults);
            die();
        }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["editUserInformation" => gnVP($conn, "editUserInformation")])) {
            permissionDenied();
            die();
        }

        $sendUserID = $_POST["userID"];
        if (!valueInDatabaseExists($conn, "users", "userID", "userID", $sendUserID)) {
            returnMessage("failed", "Kein Nutzer mit der userID: $sendUserID gefunden.");
            die();
        }
        //Check permission
        $permissionRanking = getPermissionRanking($conn, $sendUserID);
        if (!userHasPermissionRanking($conn, $_SESSION["userID"], $permissionRanking)) {
            permissionDenied("Dein Rang reicht nicht aus, um den Nutzer mit der userID: $sendUserID zu bearbeiten. Benötigter Rang: $permissionRanking | Dein Rang:" . getPermissionRanking($conn, $_SESSION["userID"]));
            die();
        }

        $type = $_POST["type"];

        if ($type === "username") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeUsername" => gnVP($conn, "benutzerverwaltungChangeUsername")])) {
                permissionDenied();
                die();
            }
            $input = $_POST["input"];
            if (empty($input)) {
                returnMessage("failed", "Der Nutzername darf nicht leer sein.");
                die();
            }
            $oldValue = getValueFromDatabase($conn, "users", "username", "userID", $sendUserID, 1, false);

            if (valueInDatabaseExists($conn, "users", "username", "username", $input)) {
                returnMessage("failed", "Der Nutzername $input existiert bereits.");
                die();
            }
            if (setValueFromDatabase($conn, "users", "username", "userID", $sendUserID, $input)) {
                returnMessage("success", "Erfolg! Benutzername von $oldValue zu $input geändert.");
            } else {
                returnMessage("failed", "Nutzername wurde nicht geändert.");
            }
            die();
        } else if ($type === "email") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeEmail" => gnVP($conn, "benutzerverwaltungChangeEmail")])) {
                permissionDenied();
                die();
            }
            $input = $_POST["input"];
            if (isEmail($input) == false && !empty($input)) {
                returnMessage("failed", "Das ist kein gültiges Format für eine E-Mail-Adresse. ($input)");
                die();
            }
            if (!empty($input)) {
                $input = formatEmail($input);
            } else {
                $input = null;
            }
            $oldValue = getValueFromDatabase($conn, "users", "email", "userID", $sendUserID, 1, false);
            if (valueInDatabaseExists($conn, "users", "email", "username", $input)) {
                returnMessage("failed", "Die E-Mail $input existiert bereits.");
                die();
            }
            if (setValueFromDatabase($conn, "users", "email", "userID", $sendUserID, $input)) {
                returnMessage("success", "Erfolg! Email von '$oldValue' zu '$input' geändert.");
            } else {
                returnMessage("failed", "Email wurde nicht geändert.");
            }
            die();
        } else if ($type === "klassenstufe") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeKlassenstufe" => gnVP($conn, "benutzerverwaltungChangeKlassenstufe")])) {
                permissionDenied();
                die();
            }
            $input = $_POST["input"];
            if (!empty($input)) {
                $userCanBe = getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "userCanBe", 1, 0, true, true);
                if (!in_array($input, $userCanBe)) {
                    returnMessage("failed", "Der Benutzer kann die Klassenstufe $input nicht annehmen. Siehe Klassenstufenverwaltung");
                    die();
                }
            } else {
                $input = null;
            }
            $oldValue = getValueFromDatabase($conn, "users", "klassenstufe", "userID", $sendUserID, 1, false);
            if (setValueFromDatabase($conn, "users", "klassenstufe", "userID", $sendUserID, $input)) {
                returnMessage("success", "Erfolg! Klassenstufe von '$oldValue' zu '$input' geändert.");
            } else {
                returnMessage("failed", "Klassenstufe wurde nicht geändert.");
            }
            die();
        } else if ($type === "authenticated") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeAuthenticated" => gnVP($conn, "benutzerverwaltungChangeAuthenticated")])) {
                permissionDenied();
                die();
            }
            $input = $_POST["input"];

            $oldValue = getValueFromDatabase($conn, "users", "username", "userID", $sendUserID, 1, false);

            if (setValueFromDatabase($conn, "users", "authenticated", "userID", $sendUserID, $input)) {
                returnMessage("success", "Erfolg! Authentifizierungsstatus von $oldValue zu $input geändert.");
            } else {
                returnMessage("failed", "Authentifizierungsstatus wurde nicht geändert.");
            }
            die();
        } else if ($type === "changeGroups") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeGroups" => gnVP($conn, "benutzerverwaltungChangeGroups")])) {
                permissionDenied();
                die();
            }
            $method = $_POST["method"];

            dbValidJSON($conn, "users", "groups", "userID", $sendUserID, "[]");
            if ($method == "add") {
                $group = $_POST["group"];
                $groupsRanking = intval(getPermissionRankingGroup($conn, $group));
                if (!userHasPermissionRanking($conn, $userID, $groupsRanking)) {
                    permissionDenied();
                    die();
                } else {
                    if (addGroupUser($conn, $sendUserID, $group)) {
                        returnMessage("success", "Gruppe $group wurde dem Nutzer mit der userID: $sendUserID erfolgreich hinzugefügt.");
                        die();
                    }
                }
            } else if ($method == "remove") {
                $group = $_POST["group"];
                $groupsRanking = intval(getPermissionRankingGroup($conn, $group));
                if (!userHasPermissionRanking($conn, $userID, $groupsRanking)) {
                    permissionDenied();
                    die();
                } else {
                    if (removeGroupUser($conn, $sendUserID, $group)) {
                        returnMessage("success", "Gruppe $group wurde von dem Nutzer mit der userID: $sendUserID erfolgreich entfernt.");
                        die();
                    }
                }
            } else if ($method == "removeAll") {
                $usersGroups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $sendUserID, 1, false));
                if ($usersGroups == false || !count($usersGroups) > 0) {
                    returnMessage("success", "Alle Gruppen vom Nutzer erfolgreich entfernt. (hatte vorher auch keine).");
                    die();
                }
                $message = "";
                foreach ($usersGroups as $currentGroup) {
                    $permissionRanking = getPermissionRankingGroup($conn, $currentGroup);
                    if (!userHasPermissionRanking($conn, $userID, $permissionRanking)) {
                        $message = $message . "Du hast nicht die erforderlichen Berechtigungen, um die Gruppe $currentGroup vom Nuzter mit der userID: $sendUserID zu entfernen.";
                    } else {
                        removeGroupUser($conn, $sendUserID, $currentGroup);
                    }
                }
                returnMessage("success", $message);
                die();
            }
        } else if ($type === "password") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangePasswords" => gnVP($conn, "benutzerverwaltungChangePasswords")])) {
                permissionDenied();
                die();
            }
            $newPassword = $_POST["input"];

            $errorArray = array();
            if (checkPassword($newPassword, $errorArray)) {
                if (setNewPassword($conn, $sendUserID, password_hash($newPassword, PASSWORD_DEFAULT))) {
                    returnMessage("success", "Passwort des Benutzers erfolgreich geändert.");
                } else {
                    returnMessage("failed", "Passwort des Nutzers konnte nicht geänderet werden");
                }
                die();
            } else {
                returnMessage("failed", json_encode($errorArray));
                die();
            }
        } else if ($type === "logOutFromAllDevices") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltunglogoutFromAlldevices" => gnVP($conn, "benutzerverwaltunglogoutFromAlldevices")])) {
                permissionDenied();
                die();
            }
            if (logOutAllDevices($conn, $sendUserID)) {
                returnMessage("success", "Benutzer erfolgreich von allen Geräten abgemeldet.");
            } else {
                returnMessage("failed", "Benutzer konnte nicht von allen Geräten abgemeldet werden.");
            }
            die();
        } else if ($type === "newComeBackMessage") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungCreateComeBackMessages" => gnVP($conn, "benutzerverwaltungCreateComeBackMessages")])) {
                permissionDenied();
                die();
            }
            $message = $_POST['message'];
            if (!$message || empty($message)) {
                returnMessage("failed", "Nachricht darf nicht leer sein");
                die();
            }
            if (addToArrayDatabase($conn, "users", "messageForComeBack", "userID", $sendUserID, $username . ": " . $message, true)) {
                returnMessage("success", "Nachricht gesendet.");
            } else {
                returnMessage("failed", "Nachricht konnte nicht gesendet werden.");
            }
            die();
        } else if ($type === "removeAllComeBackMessages") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungDeleteComeBackMessages" => gnVP($conn, "benutzerverwaltungDeleteComeBackMessages")])) {
                permissionDenied();
                die();
            }
            if (insertArrayDatabase($conn, "users", "messageForComeBack", "userID", $sendUserID, array())) {
                returnMessage("success", "Alle Nachrichten erfolgreich entfernt.");
            } else {
                returnMessage("failed", "Keine Nachrichten entfernt");
            }
            die();
        } else if ($type === "removeSpecificComeBackmessage") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungDeleteComeBackMessages" => gnVP($conn, "benutzerverwaltungDeleteComeBackMessages")])) {
                permissionDenied();
                die();
            }
            $message = $_POST['message'];
            if (!$message || empty($message)) {
                returnMessage("failed", "Nachricht darf nicht leer sein");
                die();
            }
            if (removeFromArrayDatabase($conn, "users", "messageForComeBack", "userID", $sendUserID, $message, true, true)) {
                returnMessage("success", "Nachricht ($message) erfolgreich entfernt.");
            } else {
                returnMessage("failed", "Nachricht ($message) wurde nicht entfernt.");
            }
            die();
        } else if ($type === "showPublic") {
            if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangeShowPublic" => gnVP($conn, "benutzerverwaltungChangeShowPublic")])) {
                permissionDenied();
                die();
            }
            $input = $_POST["input"];

            $oldValue = getValueFromDatabase($conn, "users", "showPublic", "userID", $sendUserID, 1, false);

            if (setValueFromDatabase($conn, "users", "showPublic", "userID", $sendUserID, $input)) {
                returnMessage("success", "Erfolg! Öffenlichkeitswert von $oldValue zu $input geändert.");
            } else {
                returnMessage("failed", "Öffenlichkeitswert wurde nicht geändert.");
            }
            die();
        }
    } else if ($operation === "other") {
        $type = $_POST["type"];


        if ($type === "getAvailableGroups") {
            echo json_encode(getAllValuesFromDatabase($conn, "groupPermissions", "groupName", 0, true, true));
            die();
        } else if ($type === "getAllKlassenstufen") {
            $klassenstufenNormal = getAllValuesFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", 0, true, true);
            $klassenstufenBackup = getAllValuesFromDatabase($conn, "backupKlassenstufen", "klassenstufeBackup", 0, true, true);

            $resultArray = array();
            if ($klassenstufenNormal) {
                foreach ($klassenstufenNormal as $current) {
                    $resultArray[] = $current;
                }
            }
            if ($klassenstufenBackup) {
                foreach ($klassenstufenBackup as $current) {
                    $resultArray[] = $current;
                }
            }
            echo json_encode($resultArray);
            die();
        } else if ($type === "getGroupsUserCanAdd") {
            echo json_encode(getGroupsUserCanAdd($conn, $_SESSION["userID"]));
            die();
        } else if ($type === "getAllKlassenstufenUserCanBe") {
            echo json_encode(getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "userCanBe", 1, 0, true, true));
            die();
        } else if ($type === "getAllGroupsFromUser") {
            $sendUserID = $_POST["userID"];
            echo json_encode(getValueFromDatabase($conn, "users", "groups", "userID", $sendUserID, 1, false));
            die();
        } else if ($type === "getAllAllowedPermissionNamesUser") {
            $sendUserID = $_POST["userID"];
            $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
            if (!$usersPermissions) {
                echo json_encode(array());
                die();
            }
            $returnArray = array();
            foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                $returnArray = addToArray($returnArray, $currentPermissionKey, false);
            }
            echo json_encode($returnArray);
            die();
        } else if ($type === "getAllComeBackMessagesFromUser") {
            $sendUserID = $_POST["userID"];
            $comeBackMessages = json_validate(getValueFromDatabase($conn, "users", "messageForComeBack", "userID", $sendUserID, 1, false));
            if (!$comeBackMessages) {
                echo json_encode(array());
                die();
            }
            echo json_encode($comeBackMessages);
            die();
        } else if ($type === "getAllPermissionsUserCanAdd") {
            $allPermissions = getAllValuesFromDatabase($conn, "permissions", "name", 0, true, true);
            if (!$allPermissions || !count($allPermissions) > 0) {
                return json_encode(array());
            }
            $resultArray = array();
            foreach ($allPermissions as $currentPermission) {
                if (userHasPermissions($conn, $userID, [$currentPermission => gnVP($conn, $currentPermission)])) {
                    $resultArray[] = $currentPermission;
                }
            }
            echo json_encode($resultArray);
            die();
        }
    } else if ($operation === "getFullInformation") {
        $sendUserID = $_POST['userID'];

        if (!userHasPermissions($conn, $userID, ["accessUserdata" => gnVP($conn, "accessUserdata")])) {
            permissionDenied();
            die();
        }
        if (!valueInDatabaseExists($conn, "users", "userID", "userID", $sendUserID)) {
            returnMessage("failed", "Der Nutzer mit der userID: $sendUserID existiert nicht.");
            die();
        }
        $username = getValueFromDatabase($conn, "users", "username", "userID", $sendUserID, 1, false);
        $email = getValueFromDatabase($conn, "users", "email", "userID", $sendUserID, 1, false);
        $klassenstufe = getValueFromDatabase($conn, "users", "klassenstufe", "userID", $sendUserID, 1, false);
        $isOnline = getValueFromDatabase($conn, "users", "isOnline", "userID", $sendUserID, 1, false);
        $authenticated = getValueFromDatabase($conn, "users", "authenticated", "userID", $sendUserID, 1, false);
        $groups = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $sendUserID, 1, false));

        //Create Readable feedback like lastLogin etc
        $now = new DateTime(getCurrentDateAndTime(1));


        $lastLoginString = "Noch Nie";
        $lastLoginRaw = getValueFromDatabase($conn,  "users", "lastLogin", "userID", $sendUserID, 1, false);
        if ($lastLoginRaw != null && $lastLoginRaw != "never") {
            $lastLogin = new DateTime($lastLoginRaw);
            $lastLogin = differenceOfTime($lastLogin, $now);
            $lastLoginString = secondsToArrayOrString($lastLogin, "String");
        }

        $createdString = "";
        $createdRaw = getValueFromDatabase($conn,  "users", "created", "userID", $sendUserID, 1, false);
        if ($createdRaw != null && !empty($createdRaw)) {
            $created = new DateTime($createdRaw);
            $created = differenceOfTime($created, $now);
            $createdString = secondsToArrayOrString($created, "String");
        }

        $lastPwdChangeString = "Noch nie";
        $lastPwdChangeRaw = getValueFromDatabase($conn,  "users", "lastPwdChange", "userID", $sendUserID, 1, false);
        if ($lastPwdChangeRaw != null && !empty($lastPwdChangeRaw)) {
            $lastPwdChange = new DateTime($lastPwdChangeRaw);
            $lastPwdChange = differenceOfTime($lastPwdChange, $now);
            $lastPwdChangeString = secondsToArrayOrString($lastPwdChange, "String");
        }

        $lastActivityString = "Noch Nie";
        $lastActivityRaw = getValueFromDatabase($conn,  "users", "lastActivity", "userID", $sendUserID, 1, false);
        if ($lastActivityRaw != null && !empty($lastActivityRaw)) {
            $lastActivity = new DateTime($lastActivityRaw);
            $lastActivity = differenceOfTime($lastActivity, $now);
            $lastActivityString = secondsToArrayOrString($lastActivity, "String");
        }

        $permissionsAllowed = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
        $permissionsForbidden = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false));
        $ranking = getPermissionRanking($conn, $user);
        $usersnextMessages = json_validate(getValueFromDatabase($conn, "users", "messageForComeBack", "userID", $sendUserID, 1, false));
        $showPublic = getValueFromDatabase($conn, "users", "showPublic", "userID", $user, 1, false);
        //Insert new Group and Permissions and deniedPermissions if these values are null in DB set it to valid json

        echo json_encode(array("userID" => $sendUserID, "username" => $username, "email" => $email, "klassenstufe" => $klassenstufe, "created" => $createdRaw, "lastLogin" => $lastLoginRaw, "lastPwdChange" => $lastPwdChange, "authenticated" => $authenticated, "groups" => $groups, "permissionsAllowed" => $permissionsAllowed, "permissionsForbidden" => $permissionsForbidden, "lastActivity" => $lastActivityRaw, "isOnline" => $isOnline, "lastLoginString" => $lastLoginString, "createdString" => $createdString, "lastPwdChangeString" => $lastPwdChangeString, "lastActivityString" => $lastActivityString, "nextMessages" => $usersnextMessages, "ranking" => $ranking, "showPublic" => $showPublic));
        die();
    } else if ($operation === "createUser") {
        if (!userHasPermissions($conn, $userID, ["quizverwaltungADDandRemove" => gnVP($conn, "quizverwaltungADDandRemove")])) {
            permissionDenied();
            die();
        }

        $quizId = generateRandomUniqueName(3);
        while (valueInDatabaseExists($conn, "selectquiz", "quizId", "quizId", $quizId)) {
            $quizId = generateRandomUniqueName(3);
        }

        $resultArray = array();
        $resultArray["quizId"] = $quizId;
        try {
            $stmt = $conn->prepare("INSERT INTO selectquiz (showQuizauswahl, requireKlassenstufe, requireFach, requireThema, requireQuizname, quizId, created, createdBy, changedBy, visibility) VALUES (0, 0, 0, 0, 0, ?, ?, ?, ?, 0);");
            if ($stmt->execute([$quizId, $created, $createdBy, $changedBy])) {
                if ($stmt->rowCount()) {
                    $resultArray["uniqueID"] = $conn->lastInsertId();
                }
            }
        } catch (Exception $e) {
            returnMessage("failed", "Ein Fehler ist beim Erstellen des Quizes in der Datenbank aufgetreten: $e");
            die();
        }

        returnMessage("success", "Quiz erfolgreich erstellt. Nun kann mit der Bearbeitung begonnen werden.", false, $resultArray);
        die();
    } else if ($operation === "deleteUser") {
        if (!userHasPermissions($conn, $userID, ["editUserInformation" => gnVP($conn, "editUserInformation"), "benutzerverwaltungDeleteUsers" => gnVP($conn, "benutzerverwaltungDeleteUsers")])) {
            permissionDenied();
            die();
        }

        $sendUserID = $_POST["userID"];
        if (!valueInDatabaseExists($conn, "users", "userID", "userID", $sendUserID)) {
            returnMessage("failed", "Kein Nutzer mit der userID: $sendUserID gefunden.");
            die();
        }
        //Check permission
        $permissionRanking = getPermissionRanking($conn, $sendUserID);
        if (!userHasPermissionRanking($conn, $_SESSION["userID"], $permissionRanking)) {
            permissionDenied("Dein Rang reicht nicht aus, um den Nutzer mit der userID: $sendUserID zu bearbeiten. Benötigter Rang: $permissionRanking | Dein Rang:" . getPermissionRanking($conn, $_SESSION["userID"]));
            die();
        }

        //Logic for backuping user - TODO

        //Delete User
        logWrite($conn, "deleteAccount", "Der Nutzer mit der userID: $sendUserID soll durch den Nutzer mit der userID: $userID gelöscht werden.");
        if (deleteAccount($conn, $sendUserID)) {
            logWrite($conn, "deleteAccount", "Der Nutzer mit der userID: $sendUserID soll durch den Nutzer mit der userID: $userID gelöscht werden.");
            returnMessage("success", "Der Benutzer mit der userID: $sendUserID wurde erfolgreich gelöscht");
        } else {
            logWrite($conn, "deleteAccount", "Der Nutzer mit der userID: $sendUserID konnte nicht durch den Nutzer mit der userID: $userID gelöscht werden.", true, true);
        }
        die();
    } else if ($operation === "changePermissions") {
        if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangePermissions" => gnVP($conn, "benutzerverwaltungChangePermissions")])) {
            permissionDenied();
            die();
        }
        $sendUserID = $_POST["userID"];
        if (!valueInDatabaseExists($conn, "users", "userID", "userID", $sendUserID)) {
            returnMessage("failed", "Den Benutzer, den du bearbeiten möchtest gibt es nicht. (userID: $sendUserID)");
            die();
        }
        $username = getValueFromDatabase($conn, "users", "username", "userID", $sendUserID, 1, false);
        $rankingUser = getPermissionRanking($conn, $sendUserID);
        $usersRank = getPermissionRanking($conn, $userID);

        if (!userHasPermissionRanking($conn, $userID, $rankingUser)) {
            returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $rankingUser | Benötigter Rang: $rankingGroup");
            die();
        }

        $type = $_POST["type"];

        if ($type === "allowedPermissions") {
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllAllowedPermissionNamesUserHas") {
                //Done
                $allPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                $resultArray = array();
                if ($allPermissions) {
                    foreach ($allPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $resultArray[] = $currentPermissionKey;
                    }
                }
                echo json_encode($resultArray);
                die();
            } else if ($secondOperation === "addPermission") {
                //Done
                $permissionNameToAdd = $_POST['permissionName'];
                $value = $_POST['value'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionNameToAdd, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (setObjectKeyAndValueDatabase($conn, "users", "permissions", "userID", $sendUserID, $permissionNameToAdd, $value)) {
                        returnMessage("success", "Berechtigung erfolgreich hinzugefügt");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht hinzugefügt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removePermission") {
                //Done
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (removePermissionUser($conn, $sendUserID, $permissionName)) {
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
                    returnMessage("success", "Benutzer hat keine erlaubten Berechtigungen");
                    die();
                }
                $resultArray = array();
                foreach ($allPermissions as $currentPermission) {
                    if (userHasPermissions($conn, $userID, [$currentPermission => gnVP($conn, $currentPermission)])) {
                        removeFromObjectDatabase($conn, "users", "permissions", "userID", $sendUserID, $currentPermission, true, true, "key");
                    }
                }
                returnMessage("success", "Berechtigungen erfolgreich entfernt.");
                die();
            } else if ($secondOperation === "search") {
                //Done
                $searchBy = $_POST["searchBy"];


                function returnFoundAllowedPermissions($conn, $sendUserID, $results)
                {
                    if (!$results) {
                        echo false;
                        die();
                    }

                    $resultArray = array();
                    foreach ($results as $result) {
                        $description = getValueFromDatabase($conn, "permissions", "description", "name", $result, 1, false);
                        $value = getPermissionUser($conn, $sendUserID, $result);
                        $normalValue = getValueFromDatabase($conn, "permissions", "normalValue", "name", $result, 1, false);
                        $ranking = getValueFromDatabase($conn, "permissions", "ranking", "name", $result, 1, false);
                        $hinweis = getValueFromDatabase($conn, "permissions", "hinweis", "name", $result, 1, false);


                        $resultArray[] = array("name" => $result, "description" => $description, "value" => $value, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis);
                    }
                    echo json_encode($resultArray);
                    die();
                }

                if ($searchBy === "name") {
                    //Done
                    $input = $_POST["input"];

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                        if (str_contains($currentPermissionKey, $input)) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                } else if ($searchBy === "ranking") {
                    //Done
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "name", $currentPermissionKey, 1, false));
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                } else if ($searchBy === "description") {
                    //Done
                    $input = $_POST["input"];

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionDescription = getValueFromDatabase($conn, "permissions", "description", "name", $currentPermissionKey, 1, false);
                        if (str_contains($permissionDescription, $input)) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                } else if ($searchBy === "value") {
                    //Done
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $permissionValue = getPermissionUser($conn, $sendUserID, $currentPermissionKey);
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermissionKey;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                } else if ($searchBy === "all") {
                    //Done
                    $resultArray = array();
                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermissionKey => $currentPermissionValue) {
                        $resultArray[] = $currentPermissionKey;
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                }
            } else if ($secondOperation === "getFullInformationForEdit") {
                //Done
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
                    $value = getPermissionUser($conn, $sendUserID, $permissionName);

                    echo json_encode(array("name" => $permissionName, "description" => $description, "value" => $value, "normalValue" => $normalValue, "ranking" => $ranking, "hinweis" => $hinweis));
                } else {
                    permissionDenied("Du hast nicht die erforderlichen Berechtigungen, um  <b>$permissionName</b> zu bearbeiten (Ranking benötigt: $permissionRanking)");
                    die();
                }
            } else if ($secondOperation === "changeValueFromPermission") {
                //Done
                $permissionName = $_POST["name"];
                $value = $_POST['value'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                $usersRank = getPermissionRanking($conn, $userID);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (setPermissionUser($conn, $sendUserID, $permissionName, $value)) {
                        returnMessage("success", "Berechtigung erfolgreich geändert.");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht geändet werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
            }
        } else  if ($type === "forbiddenPermissions") {
            //Done
            $secondOperation = $_POST["secondOperation"];

            if ($secondOperation === "getAllForbiddenPermissionNamesUserHas") {
                $allPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false));
                $resultArray = array();
                if ($allPermissions) {
                    foreach ($allPermissions as $currentPermission) {
                        $resultArray[] = $currentPermission;
                    }
                }
                echo json_encode($resultArray);
                die();
            } else if ($secondOperation === "addPermission") {
                //Done
                $permissionNameToAdd = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionNameToAdd, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (addToArrayDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, $permissionNameToAdd, false)) {
                        returnMessage("success", "Berechtigung erfolgreich hinzugefügt");
                    } else {
                        returnMessage("failed", "Berechtigung konnte nicht hinzugefügt werden.");
                    }
                } else {
                    returnMessage("failed", "Du hast nicht den benötigten Rang. Dein Rang: $usersRank | Benötigter Rang: $permissionRanking");
                }
                die();
            } else if ($secondOperation === "removePermission") {
                //Done
                $permissionName = $_POST['permissionName'];
                $permissionRanking = getValueFromDatabase($conn, "permissions", "ranking", "name", $permissionName, 1, false);
                if ($permissionRanking === false) {
                    returnMessage("failed", "Berechtigung kann nicht ausgewertet werden");
                    die();
                }
                if (userHasPermissionRanking($conn, $userID, intval($permissionRanking))) {
                    if (removeFromArrayDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, $permissionName, true, true)) {
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
                    returnMessage("success", "Benutzer hat keine erlaubten Berechtigungen");
                }
                $resultArray = array();
                foreach ($allPermissions as $currentPermission) {
                    if (userHasPermissions($conn, $userID, [$currentPermission => gnVP($conn, $currentPermission)])) {
                        removeFromArrayDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, $currentPermission, true, true);
                    }
                }
                die();
            } else if ($secondOperation === "search") {
                //Done
                $searchBy = $_POST["searchBy"];


                function returnFoundAllowedPermissions($conn, $userID, $results)
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
                    //Done
                    $input = $_POST["input"];

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermission) {
                        if (str_contains($currentPermission, $input)) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $userID, $resultArray);
                    die();
                } else if ($searchBy === "description") {
                    //Done
                    $input = $_POST["input"];

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false));
                    if (!$groupPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermission) {
                        $permissionDescription = getValueFromDatabase($conn, "permissions", "description", "name", $currentPermission, 1, false);
                        if (str_contains($permissionDescription, $input)) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $userID, $resultArray);
                    die();
                } else if ($searchBy === "ranking") {
                    //Done
                    $input = intval($_POST["input"]);

                    $resultArray = array();

                    $usersPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false));
                    if (!$usersPermissions) {
                        returnFoundAllowedPermissions($conn, $sendUserID, false);
                        die();
                    }
                    foreach ($usersPermissions as $currentPermission) {
                        $permissionRanking = intval(getValueFromDatabase($conn, "permissions", "ranking", "name", $currentPermissionKey, 1, false));
                        if ($permissionRanking == $input) {
                            $resultArray[] = $currentPermission;
                        }
                    }
                    returnFoundAllowedPermissions($conn, $sendUserID, $resultArray);
                    die();
                } else if ($searchBy === "all") {
                    //Done
                    $resultArray = array();
                    returnFoundAllowedPermissions($conn, $sendUserID, json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $sendUserID, 1, false)));
                    die();
                }
            } else if ($secondOperation === "getFullInformationForEdit") {
                //Done
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
    } else if ($operation == "createNewUser") {
        if (!userHasPermissions($conn, $userID, ["benutzerverwaltungCreateUser" => gnVP($conn, "benutzerverwaltungCreateUser")])) {
            permissionDenied();
            die();
        }
        $username = $_POST["username"];
        $password = $_POST["password"];
        $email = $_POST["email"];

        if (empty($username)) {
            returnMessage("failed", "Der Benutzername darf nicht leer sein.");
            die();
        }
        if (empty($password)) {
            returnMessage("failed", "Das Passwort darf nicht leer sein.");
            die();
        }

        if (invalidUid($username)) {
            returnMessage("failed", "Der Benutzername enthält nicht erlaubte Zeichen. Erlaubt sind a-z, A-Z, 0-9 und Unterstriche. Leerzeichen sind nicht erlaubt.");
            die();
        }

        if (valueInDatabaseExists($conn, "users", "username", "username", $username)) {
            returnMessage("failed", "Es existiert bereits ein Nutzer mit dem Namen <b>$username</b>");
            die();
        }
        if (!empty($email)) {
            if (invalidEmail($email)) {
                returnMessage("failed", "Die Formatierung der E-Mail stimmt nicht.");
                die();
            }
            $email = formatEmail($email);
        }
        if (emailAlreadyExists($conn, $email)) {
            returnMessage("failed", "Es existiert bereits ein Nutzer mit der E-Mail <b>$email</b>");
            die();
        }

        if (createUserWithoutEmail($conn, $username, false, password_hash($password, PASSWORD_DEFAULT))) {
            $usersUserID = getParameterFromUser($conn, $username, "userID", "username");
            if ($email) {
                setValueFromDatabase($conn, "users", "email", "userID", $usersUserID, $email);
                setValueFromDatabase($conn, "users", "authenticated", "userID", $usersUserID, 1);
            }
            returnMessage("success", "Benutzer <b>$username</b> erfolgreich erstellt.", false, array("createduserID" => $usersUserID));
            die();
        }

        returnMessage("failed", "Benutzer <b>$username</b> konnte nicht erstellt werden.");
        die();
    }
}


//IMPORTANT - DO NOT DELETE
function returnPermissions($conn, $type, $permissions, $sendUserID = false, $limiter)
{
    if (!$type) return false;

    if ($type === "usersPermissions") {
        $finalArray = array();

        foreach ($permissions as $currentPermission) {
            $fullPermissionInfo = returnFullPermission($conn, $currentPermission);
            if ($fullPermissionInfo) {
                $name = $fullPermissionInfo["name"];
                $permissionType = $fullPermissionInfo["type"];
                $description = $fullPermissionInfo["description"];
                $ranking = $fullPermissionInfo["ranking"];
                $normalValue = $fullPermissionInfo["normalValue"];
                $hinweis = $fullPermissionInfo["hinweis"];
                $usersValue = getPermissionUser($conn, $sendUserID, $currentPermission);

                array_push($finalArray, array("name" => $name, "type" => $permissionType, "description" => $description, "ranking" => $ranking, "normalValue" => $normalValue, "hinweis" => $hinweis, "usersValue" => $usersValue));
            }
        }
        $finalArray = limitArray($finalArray, $limiter);
        echo json_encode($finalArray);
        die();
    } else if ($type === "usersForbiddenPermissions") {
    } else if ($type === "addPermissionsRESULT") {
        $finalArray = array();

        foreach ($permissions as $currentPermission) {
            $fullPermissionInfo = returnFullPermission($conn, $currentPermission);
            if ($fullPermissionInfo) {
                $name = $fullPermissionInfo["name"];
                $permissionType = $fullPermissionInfo["type"];
                $description = $fullPermissionInfo["description"];
                $ranking = $fullPermissionInfo["ranking"];
                $normalValue = $fullPermissionInfo["normalValue"];
                $hinweis = $fullPermissionInfo["hinweis"];

                array_push($finalArray, array("name" => $name, "type" => $permissionType, "description" => $description, "ranking" => $ranking, "normalValue" => $normalValue, "hinweis" => $hinweis));
            }
        }
        $finalArray = limitArray($finalArray, $limiter);
        echo json_encode($finalArray);
        die();
    }
}
if (isset($_POST["GETaddPermission"])) {
    if (!userHasPermissions($conn, $userID, ["benutzerverwaltungChangePermissions" => 1])) {
        echo "permission denied";
        die();
    }
    $limit = $_POST["limitResults"];
    $limitResults = 0;
    try {
        $limitResults = intval($limit);
    } catch (Exception $e) {
        echo $e;
    }


    $filter = $_POST["filter"];

    if ($filter === "name") {
        $input = $_POST["name"];

        $resultArray = array();

        $availablePermissions = getAvailablePermissions($conn, true);

        if (!$availablePermissions) {
            echo 0;
            die();
        }
        foreach ($availablePermissions as $currentPermission) {
            if (str_contains($currentPermission, $input)) {
                $resultArray[] = $currentPermission;
            }
        }

        if (count($resultArray) > 0) {
            returnPermissions($conn, "addPermissionsRESULT", $resultArray, false, $limitResults);
            die();
        }
        echo 0;
        die();
    } else if ($filter === "description") {
        $input = $_POST["input"];

        $resultArray = array();

        $availablePermissions = getAvailablePermissions($conn, true);

        if (!$availablePermissions) {
            echo 0;
            die();
        }
        foreach ($availablePermissions as $currentPermission) {
            $descriptionText = getParamterFromPermissions($conn, $currentPermission, "description");
            //echo $descriptionText;
            $lowerDescription = strtolower($descriptionText);
            $lowerInput = strtolower($input);
            if (str_contains($lowerDescription, $lowerInput)) {
                $resultArray[] = $currentPermission;
            }
        }

        if (count($resultArray) > 0) {
            returnPermissions($conn, "addPermissionsRESULT", $resultArray, false, $limitResults);
            die();
        }
        echo 0;
        die();
    } else if ($filter === "ranking") {
        $input = $_POST["input"];

        $resultArray = array();

        $availablePermissions = getAvailablePermissions($conn, true);

        if (!$availablePermissions) {
            echo 0;
            die();
        }
        foreach ($availablePermissions as $currentPermission) {
            $ranking = getParamterFromPermissions($conn, $currentPermission, "ranking");
            //echo $descriptionText;
            if ($ranking == $input) {
                $resultArray[] = $currentPermission;
            }
        }

        if (count($resultArray) > 0) {
            returnPermissions($conn, "addPermissionsRESULT", $resultArray, false, $limitResults);
            die();
        }
        echo 0;
        die();
    } else if ($filter === "value") {
        $input = $_POST["input"];

        $resultArray = array();

        $availablePermissions = getAvailablePermissions($conn, true);

        if (!$availablePermissions) {
            echo 0;
            die();
        }
        foreach ($availablePermissions as $currentPermission) {
            $value = getParamterFromPermissions($conn, $currentPermission, "normalValue");

            if ($value == $input) {
                $resultArray[] = $currentPermission;
            }
        }

        if (count($resultArray) > 0) {
            returnPermissions($conn, "addPermissionsRESULT", $resultArray, $false, $limitResults);
            die();
        }
        echo 0;
        die();
    } else if ($filter === "noFilter") {
        $resultArray = array();

        $availablePermissions = getAvailablePermissions($conn, true);

        if (!$availablePermissions) {
            echo 0;
            die();
        }

        returnPermissions($conn, "addPermissionsRESULT", $availablePermissions, false, $limitResults);

        echo 0;
        die();
    }
}
