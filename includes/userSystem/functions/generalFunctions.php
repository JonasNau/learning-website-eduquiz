<?php

function emailExits($conn, $email)
{
    $result = false;

    $stmt = $conn->prepare("SELECT email, username FROM users WHERE email = ?");
    if ($stmt->execute([$email])) {
        if ($stmt->rowCount()) {
            $result = true;
        } else {
            $result = false;
        }
    } else {
        echo "Failed to execute statement. (Email exists function)";
    }

    return $result;
}

function usernameExists($conn, $username)
{
    $result = false;

    $stmt = $conn->prepare("SELECT email, username FROM users WHERE username = ?;");
    if ($stmt->execute([$username])) {
        if ($stmt->rowCount()) {
            $result = true;
        } else {
            $result = false;
        }
    } else {
        echo "Failed to execute statement. (Email exists function)";
    }

    return $result;
}

function userExists($conn, $userID)
{
    try {
        $stmt = $conn->prepare("SELECT userID FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                return true;
            }
        } else {
            echo "Failed to execute statement. (Email exists function)";
        }
    } catch (Exception $e) {
        echo $e;
        return false;
    }

    return false;
}

function usernameAlreadyExists($conn, $username)
{
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?;");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {
                return true;
            }
        } else {
            echo "error in executing statement";
        }
    } catch (Exception $e) {
        echo $e;
        return false;
    }

    $stmt = null;
    return false;
}

function emailAlreadyExists($conn, $email)
{

    $result = true;

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?;");
    if ($stmt->execute([$email])) {
        if ($stmt->rowCount()) {
            $result = true;
        } else {
            $result = false;
        }
    } else {
        echo "error in executing statement";
    }
    return $result;


    $stmt = null;
}

function isEmail($email)
{
    $result = false;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $result = false;
    } else {
        $result = true;
    }
    return $result;
}


function getParameterFromUsername($conn, $username, $parameter)
{

    $result = false;

    try {
        $stmt = $conn->prepare("SELECT $parameter FROM users WHERE username = ? LIMIT 1;");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {

                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data[$parameter];
            }
        } else {
            $result = false;
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        header("Location: /index.php");
        die();
    }
    return $result;
}

function getParameterFromUser($conn, $username, $parameter, $type)
{

    $result = false;

    try {
        $stmt = $conn->prepare("SELECT $parameter FROM users WHERE $type = ? LIMIT 1;");
        if ($stmt->execute([$username])) {
            if ($stmt->rowCount()) {

                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $result = $data[$parameter];
            }
        } else {
            $result = false;
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        header("Location: /index.php");
        die();
    }
    return $result;
}

function setParameterFromUser($conn, $username, $parameter, $value, $type)
{
    try {
        $stmt = $conn->prepare("UPDATE users SET $parameter = ? WHERE $type = ? ");
        if ($stmt->execute([$value, $username])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        header("Location: /index.php");
        die();
    }
    return false;
}

function accountExists($conn, $userID)
{
    if (!getParameterFromUser($conn, $userID, "userID", "userID")) {
        $_SESSION["message"] = "Der Benutzername, mit dem du angemeldet bist existiert nicht / nicht mehr.";
        header("Location: /includes/userSystem/logout.inc.php");
        die();
    }
}

function unAuthorizeUser($conn, $userID)
{
    $result = false;

    try {
        $stmt = $conn->prepare("UPDATE users SET authenticated = '0' WHERE userID = ?");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $result = true;
            }
        } else {
            $result = false;
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        header("Location: /index.php");
        die();
    }
    return $result;
}

function removeEmailFromAccount($conn, $userID)
{
    $result = false;

    try {
        $stmt = $conn->prepare("UPDATE users SET email = NULL WHERE userID = ?");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $result = true;
            }
        } else {
            $result = false;
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        header("Location: /index.php");
        die();
    }
    return $result;
}

function shouldLogOut($conn, $userID)
{
    try {
        $stmt = $conn->prepare("SELECT shouldLogOut FROM users WHERE userID = ? LIMIT 1");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $logoutUntil = $data["shouldLogOut"];
                if (!$logoutUntil) return false;

                $now = DateTime::createFromFormat('U.u', microtime(true));
                $timeNow = $now->format("d-m-Y H:i:s.u e");


                $timeNow = new DateTime($timeNow);
                $logoutUntil = new DateTime($logoutUntil);

                $difference = ($logoutUntil->getTimestamp() - $timeNow->getTimestamp());


                if ($difference > 0) {
                    logout();
                    $_SESSION["message"] = "Du wurdest duch eine Nutzerfunktion abgemeldet. Warte noch " . secondsToArrayOrString($difference, "String");
                    returnMessage("success", $_SESSION["message"], "/");
                    die();
                } else {
                    setParameterFromUser($conn, $userID, "shouldLogOut", null, "userID");
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function logOutAllDevices($conn, $userID)
{
    try {
        $duration = getSettingVal($conn, "logoutAllDevicesTime");
        $logoutEnd = date("d-m-Y H:i:s e", strtotime("+$duration sec"));

        $stmt = $conn->prepare("UPDATE users SET shouldLogOut = ? WHERE userID = ?;");
        if ($stmt->execute([$logoutEnd, $userID])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function setLastActivity($conn, $userID)
{
    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");

    $_SESSION["LAST_ACTIVITY"] = $timeNow;

    try {

        $stmt = $conn->prepare("UPDATE users SET lastActivity = ? WHERE userID = ?;");
        if ($stmt->execute([$timeNow, $userID])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}


function checkExpired($conn)
{
    $lastActivity = $_SESSION["LAST_ACTIVITY"];

    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");

    $timeNow = new DateTime($timeNow);
    $lastActivity = new DateTime($lastActivity);

    $difference = differenceOfTime($lastActivity, $timeNow);

    $expireTime = getSettingVal($conn, "onlineUsersExpireTime");


    if (!$expireTime) {
        $expireTime = 60;
    }

    if ($difference > $expireTime) {
        $username = getValueFromDatabase($conn, "users", "username", "userID", $_SESSION["userID"], 1, false);
        logWrite($conn, "onlineUsers", "$username is now offline");
        logout();
        setSessionData("success", "Du wars zu lange inaktiv $difference Sekunden und wurdest automatisch abgemeldet (" . secondsToArrayOrString($difference, "String") . ").", "/login.php");
        die();
    }
}

function logout()
{
    if (isLoggedIn()) {
        $database = new Dbh();
        $conn = $database->connect();

        #Delete login Cookies

        setcookie("stayLoggedInSelector", "", time() - 3600, "/");
        setcookie("stayLoggedInToken", "", time() + -3600, "/");

        if (isset($_COOKIE["stayLoggedInSelector"]) && isset($_COOKIE["stayLoggedInToken"])) {
            $selector = $_COOKIE["stayLoggedInSelector"];
            $token = isset($_COOKIE["stayLoggedInToken"]);
            if (boolval(getValueFromDatabaseMultipleWhere($conn, "keepUserLoggedIn", "userID", ["selector" => $selector, "token" => password_hash($token, PASSWORD_DEFAULT)], false))) {
                deleteOldStayLoggedInToken($conn, $selector);
            }
        }

        #Destroy Session
        session_unset();
        session_destroy();

        #Create new Session (for example for messages)
        session_start();
    } else {
        createNewSession();
    }
}

function createNewSession()
{
    session_regenerate_id();
    #Destroy Session
    session_unset();
    session_destroy();
    session_start();
}

function getNumOnlineUsers($conn)
{
    try {
        $stmt = $conn->prepare("SELECT COUNT(isOnline) AS onlineUsers FROM users WHERE isOnline = 1;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return $result["onlineUsers"];
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getNumOnlineClients($conn)
{
    try {
        $stmt = $conn->prepare("SELECT COUNT(isOnline) AS onlineClients FROM onlineClients WHERE isOnline = 1;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return $result["onlineClients"];
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getOnlineUsers($conn)
{
    try {
        $stmt = $conn->prepare("SELECT userID, username, email FROM users WHERE isOnline = 1;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $userArray = array();

                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($users as $user) {
                    $userArray = array_push($userArray, $user);
                }
                return $userArray;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}


function updateOnlineStatus($conn)
{


    $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true, true);
    if (!$allUsers) {
        return true;
    }
    $expireTime = getSettingVal($conn, "onlineUsersExpireTime");

    if (!$expireTime) {
        $expireTime = 60;
    }

    foreach ($allUsers as $user) {
        $now = new DateTime(getCurrentDateAndTime(1));

        $lastActivity = getValueFromDatabase($conn, "users", "lastActivity", "userID", $user, 1, false);
        if ($lastActivity) {
            $lastActivity = new DateTime($lastActivity);
            if (!$lastActivity) {
                setValueFromDatabase($conn, "users", "isOnline", "userID", $user, 0);
                setValueFromDatabase($conn, "users", "lastActivity", "userID", $user, null);
            }
            $username = getValueFromDatabase($conn, "users", "username", "userID", $user, 1, false);

            $difference = differenceOfTime($lastActivity, $now);



            $oldOnline = getValueFromDatabase($conn, "users", "isOnline", "userID", $user, 1, false);
            if ($difference > $expireTime) {
                # Offline
                setValueFromDatabase($conn, "users", "isOnline", "userID", $user, 0,);

                $lastLogin = getValueFromDatabase($conn, "users", "lastLogin", "userID", $user, 1, false) ?? getCurrentDateAndTime(1);
                $loginTime = differenceOfTime(new DateTime($lastLogin), new DateTime(getCurrentDateAndTime(1)));

                if ($oldOnline == 1) {
                    logWrite($conn, "onlineUsers", "User $username is now offline, online time = " . secondsToArrayOrString($loginTime, "String"), true, false, "yellow");
                }
            } else {
                # Online
                setParameterFromUser($conn, $user, "isOnline", 1, "userID");
                logWrite($conn, "onlineUsers", "User $username is still online", true, false, "green");
            }
        } else {
            # Offline
            $oldOnline = getValueFromDatabase($conn, "users", "isOnline", "userID", $user, 1, false);
            setValueFromDatabase($conn, "users", "isOnline", "userID", $user, 0,);
            if ($oldOnline == 1) {
                logWrite($conn, "onlineUsers", "User $user is now offline", true, false, "yellow");
            }
        }
    }
}

function userIsOnline($conn, $userID)
{
    try {
        $stmt = $conn->prepare("SELECT isOnline FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result["isOnline"] == "1") {
                    return true;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function valueExists($conn, $tablename, $parameter, $value)
{
    try {
        $stmt = $conn->prepare("SELECT $parameter FROM $tablename WHERE $parameter = ?");
        if ($stmt->execute([$value])) {
            if ($stmt->rowCount()) {
                return true;
            } else {
                try {
                    $stmt = $conn->prepare("DELETE FROM $tablename WHERE $parameter = ?");
                } catch (Exception $e) {
                    echo $e;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function connectedClientsUpdateOnlineStatus($conn)
{

    $expireTime = intval(getSettingVal($conn, "onlineClientExpireTime"));

    if (!$expireTime) {
        $expireTime = 60;
    }

    $users = getAllValuesFromDatabase($conn, "onlineClients", "sessionID", 0, true, true);
    if (!$users) {
        return true;
    }

    foreach ($users as $sessID) {
        $now = DateTime::createFromFormat('U.u', microtime(true));
        $timeNow = $now->format("d-m-Y H:i:s.u e");
        $timeNow = new DateTime($timeNow);

        $lastActivity = getValueFromDatabase($conn, "onlineClients", "lastActivity", "sessionID", $sessID, 1, false);
        if ($lastActivity) {
            $lastActivity = new DateTime($lastActivity);


            $difference = differenceOfTime($timeNow, $lastActivity);

            $sessionStarted = getValueFromDatabase($conn, "onlineClients", "sessionStarted", "sessionID", $sessID, 1, false) ?? getCurrentDateAndTime(1);
            $connectionTime = differenceOfTime(new DateTime($sessionStarted), new DateTime(getCurrentDateAndTime(1)));

            if ($difference > $expireTime) {
                # Offline



                logWrite($conn, "onlineClients", "sessionID is offline: $sessID connection time = " . secondsToArrayOrString($connectionTime, "String"), true, false, "yellow");
                setParameterFromOnlineClients($conn, "isOnline", 0, $sessID);
                deleteClientFromOnline($conn, $sessID);
            } else {
                # Online
                logWrite($conn, "onlineClients", "sessionID is still online: $sessID. connection time: " . secondsToArrayOrString($connectionTime, "String"), true, false, "green");
                setParameterFromOnlineClients($conn, "isOnline", 1, $sessID);
            }
        } else {
            deleteRowFromDatabase($conn, "onlineClients", "sessionID", "sessionID", $sessID);
        }
    }


    return false;
}

function setParameterFromOnlineClients($conn, $parameter, $value, $sessionID)
{
    #Check if entry is set
    if (!valueExists($conn, "onlineClients", "sessionID", $sessionID)) {
        try {
            $stmt = $conn->prepare("INSERT INTO onlineClients (sessionID, isOnline, sessionStarted) VALUES (?, 1, ?);");
            if ($stmt->execute([$sessionID, getCurrentDateAndTime(1)])) {
                if ($stmt->rowCount()) {
                    if (setParameterFromOnlineClients($conn, "lastActivity", getCurrentDateAndTime(2), $sessionID)) {
                        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
                        $ip = $_SERVER['REMOTE_ADDR'];
                        $browser = new Browser;
                        $browser->Browser($userAgent);
                        $browserType = $browser->getBrowser();
                        $platform = $browser->getPlatform();
                        $version = $browser->getVersion();

                        setParameterFromOnlineClients($conn, "userAgent", $userAgent, $sessionID);
                        setParameterFromOnlineClients($conn, "ip", $ip, $sessionID);
                        setParameterFromOnlineClients($conn, "browser", $browserType, $sessionID);
                        setParameterFromOnlineClients($conn, "platform", $platform, $sessionID);
                        setParameterFromOnlineClients($conn, "version", $version, $sessionID);
                    }
                } else {
                    try {
                        $stmt = $conn->prepare("DELETE FROM onlineClients WHERE sessionID = ?");
                        $stmt->execute([$sessionID]);
                    } catch (Exception $e) {
                        echo $e;
                    }
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
    }
    try {



        $stmt = $conn->prepare("UPDATE onlineClients SET $parameter = ? WHERE sessionID = ?;");
        if ($stmt->execute([$value, $sessionID])) {
            return true;
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function setLastActivityOnlineClient($conn, $sessID)
{
    if (valueExists($conn, "onlineClients", "sessionID", $sessID)) {
        if (checkOnlineClientExpired($conn, $sessID)) {
            return true;
        }
    }
    #Client doesn't exitst in database yet
    setParameterFromOnlineClients($conn, "sessionID", $sessID, $sessID); #Create Client

}

function onlineClientExpired($conn, $sessID)
{

    $expireTime = getSettingVal($conn, "onlineClientExpireTime");
    if (!$expireTime) {
        $expireTime = 60;
    }

    try {
        $stmt = $conn->prepare("SELECT lastActivity, sessionID FROM onlineClients WHERE sessionID = ?;");
        if ($stmt->execute([$sessID])) {
            if ($stmt->rowCount()) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);


                $now = DateTime::createFromFormat('U.u', microtime(true));
                $timeNow = $now->format("d-m-Y H:i:s.u e");
                $timeNow = new DateTime($timeNow);

                $lastActivity = $user["lastActivity"];

                if (!$lastActivity == null) {
                    $lastActivity = new DateTime($lastActivity);
                    $sessID = $user["sessionID"];

                    $difference = differenceOfTime($now, $lastActivity);

                    $sessionStarted = getValueFromDatabase($conn, "onlineClients", "sessionStarted", "sessionID", $sessID, 1, false) ?? getCurrentDateAndTime(1);
                    $connectionTime = differenceOfTime(new DateTime($sessionStarted), new DateTime(getCurrentDateAndTime(1)));

                    if ($difference > $expireTime) {
                        # Offline
                        logWrite($conn, "onlineClients", "sessionID is expired and will be new created: $sessID. expire time = $expireTime difference = $difference connection time:" . secondsToArrayOrString($connectionTime, "String"), true, false, "yellow");
                        deleteClientFromOnline($conn, $sessID);
                        createNewSession();
                        return true;
                    } else {
                        # Online
                        //echo "Is Online $difference";
                        return false;
                    }
                }
            } else {
            }
        }
    } catch (Exception $e) {
    }
    return true;
}

function checkOnlineClientExpired($conn, $sessID)
{

    if (onlineClientExpired($conn, $sessID)) {
        createNewSession();
        logout();
        session_destroy();
        session_start();
        return true;
    }
    return false;
}

function deleteClientFromOnline($conn, $sessID)
{
    try {
        $stmt = $conn->prepare("DELETE FROM onlineClients WHERE sessionID = ?");
        if ($stmt->execute([$sessID])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
    }
    return false;
}


function lastUpdate($conn, $name, $timeNow)
{
    try {
        $stmt = $conn->prepare("SELECT name FROM lastUpdate WHERE name = ?");
        if ($stmt->execute([$name])) {
            if ($stmt->rowCount()) {
                #Update
                try {
                    $stmt = $conn->prepare("UPDATE lastUpdate SET time = ? WHERE name = ?");
                    if ($stmt->execute([$timeNow, $name])) {
                        if ($stmt->rowCount()) {
                            return true;
                        }
                    }
                } catch (Exception $e) {
                    echo $e;
                }
            } else {
                #Insert
                try {
                    $stmt = $conn->prepare("INSERT INTO lastUpdate (name, time) VALUES (?, ?)");
                    if ($stmt->execute([$name, $timeNow])) {
                        if ($stmt->rowCount()) {
                            return true;
                        }
                    }
                } catch (Exception $e) {
                    echo $e;
                }
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;


    return false;
}

function differenceOfTime($timeStart, $timeEnd)
{
    // $now = DateTime::createFromFormat('U.u', microtime(true));
    // $timeNow = $now->format("d-m-Y H:i:s.u e");
    // $timeStart = new DateTime($timeStart);
    // $timeEnd = new DateTime($timeEnd);
    $difference = (date($timeEnd->getTimestamp()) - date($timeStart->getTimestamp()));

    return $difference;
}

function secondsToArrayOrStringOld($seconds, $StringOrArray = "String")
{

    $ret = "";

    /*** get the days ***/
    $days = intval(intval($seconds) / (3600 * 24));
    if ($days > 0) {
        if ($days > 1) {
            $ret .= "$days Tage ";
        } else {
            $ret .= "$days Tage ";
        }
    }

    /*** get the hours ***/
    $hours = (intval($seconds) / 3600) % 24;
    if ($hours > 0) {
        if ($hours > 1) {
            $ret .= "$hours Stunden ";
        } else {
            $ret .= "$hours Stunde ";
        }
    }

    /*** get the minutes ***/
    $minutes = (intval($seconds) / 60) % 60;
    if ($minutes > 0) {
        if ($minutes > 1) {
            $ret .= "$minutes Minuten ";
        } else {
            $ret .= "$minutes Minute ";
        }
    }

    /*** get the seconds ***/
    $seconds = intval($seconds) % 60;
    if ($seconds > 0) {
        if ($seconds > 1) {
            $ret .= "$seconds Sekunden ";
        } else {
            $ret .= "$seconds Sekunde ";
        }
    }
    if ($StringOrArray == "String") {
        return $ret;
    }
    if ($StringOrArray == "Array") {
        return array("seconds" => $seconds, "minutes" => $minutes, "hours" => $hours, "days" => $days);
    }
}


function secondsToArrayOrString($seconds, $StringOrArray = "String", $options = array(

    "wordspelling" => array(
        "seconds" => array("singular" => "Sekunde", "plural" => "Sekunden"),
        "minutes" => array("singular" => "Minute", "plural" => "Minuten"),
        "hours" => array("singular" => "Stunde", "plural" => "Stunden"),
        "days" => array("singular" => "Tag", "plural" => "Tage"),
        "years" => array("singular" => "Jahr", "plural" => "Jahre"),
    ),
    "empty" => "keine"
), $logConsole = false)
{

    $seconds = intval($seconds);

    $yearsRemaining = floor($seconds / (60 * 60 * 24 * 365));
    $daysRemaining = floor(($seconds / (60 * 60 * 24)) % 365);
    $hoursRemaining = floor(($seconds / (60 * 60)) % 24);
    $minutesRemaining = floor(($seconds / 60) % 60);
    $secondsRemaining = floor($seconds % 60);

    if ($logConsole) logWrite(false, "general", json_encode($yearsRemaining, $daysRemaining, $hoursRemaining, $minutesRemaining, $secondsRemaining), true, false, "yellow");

    if ($StringOrArray === "Array") {
        return
            array(
                "years" => $yearsRemaining,
                "days" => $daysRemaining,
                "hours" => $hoursRemaining,
                "minutes" => $minutesRemaining,
                "seconds" =>  $secondsRemaining
            );
    } else {
        $string = "";
        //Years
        if ($yearsRemaining > 0 && $yearsRemaining == 1)
            $string = "$string $yearsRemaining " . $options["wordspelling"]["years"]["singular"];
        if ($yearsRemaining > 0 && $yearsRemaining > 1)
            $string = "$string $yearsRemaining " . $options["wordspelling"]["years"]["plural"];
        //Days
        if ($daysRemaining > 0 && $daysRemaining == 1)
            $string = "$string $daysRemaining " . $options["wordspelling"]["days"]["singular"];
        if ($daysRemaining > 0 && $daysRemaining > 1)
            $string = "$string $daysRemaining " . $options["wordspelling"]["days"]["plural"];
        //Hours
        if ($hoursRemaining > 0 && $hoursRemaining == 1)
            $string = "$string $hoursRemaining " . $options["wordspelling"]["hours"]["singular"];
        if ($hoursRemaining > 0 && $hoursRemaining > 1)
            $string = "$string $hoursRemaining " . $options["wordspelling"]["hours"]["plural"];
        //Minutes
        if ($minutesRemaining > 0 && $minutesRemaining == 1)
            $string = "$string $minutesRemaining " . $options["wordspelling"]["minutes"]["singular"];
        if ($minutesRemaining > 0 && $minutesRemaining > 1)
            $string = "$string $minutesRemaining " . $options["wordspelling"]["minutes"]["plural"];
        //Seconds
        if ($secondsRemaining > 0 && $secondsRemaining == 1)
            $string = "$string $secondsRemaining " . $options["wordspelling"]["seconds"]["singular"];
        if ($secondsRemaining > 0 && $secondsRemaining > 1)
            $string = "$string $secondsRemaining " . $options["wordspelling"]["seconds"]["plural"];

        if (empty($string)) {
            return $options["empty"] ?? "";
        }
        return $string;
    }
}

function getAvailableGroups($conn, $limit)
{

    if ($limit > 0) {
        try {
            $stmt = $conn->prepare("SELECT DISTINCT groupName, description  FROM groupPermissions; :limit");
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    return json_encode($results);
                } else {
                    echo "Keine Gruppen gefunden";
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
    } else {
        try {
            $stmt = $conn->prepare("SELECT DISTINCT groupName, description  FROM groupPermissions;");
            if ($stmt->execute()) {
                if ($stmt->rowCount()) {
                    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    return json_encode($results);
                } else {
                    echo "Keine Gruppen gefunden";
                }
            }
        } catch (Exception $e) {
            echo $e;
        }
    }
}


function userHasComeBackMessage($conn, $userID)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("SELECT DISTINCT messageForComeBack FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $results = $stmt->fetch(PDO::FETCH_ASSOC);
                $data = $results["messageForComeBack"];
                if (json_validate($data)) {
                    $messageArray = json_decode($data);
                    if (gettype($messageArray) != gettype(array())) {
                        setComebackmessages($conn, $userID, []);
                    }
                    if (count($messageArray) > 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return $data;
            } else {
                echo "Keine Gruppen gefunden";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getNextComeBackMessage($conn, $userID)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("SELECT DISTINCT messageForComeBack FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $results = $stmt->fetch(PDO::FETCH_ASSOC);
                $data = $results["messageForComeBack"];

                $messageArray = json_decode($data);
                if (count($messageArray) > 0) {
                    return $messageArray[0];
                } else {
                    return false;
                }

                return $data;
            } else {
                echo "Keine Gruppen gefunden";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function addNewComebackMessage($conn, $userID, $message)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("SELECT DISTINCT messageForComeBack FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $results = $stmt->fetch(PDO::FETCH_ASSOC);
                $data = $results["messageForComeBack"];

                $messageArray = json_decode($data);
                $messageArray[] = $message;
                print_r($messageArray);

                setComebackmessages($conn, $userID, $messageArray);

                return $data;
            } else {
                echo "Keine Gruppen gefunden";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function removeComebackMessage($conn, $userID, $message)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("SELECT DISTINCT messageForComeBack FROM users WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                $results = $stmt->fetch(PDO::FETCH_ASSOC);
                $data = $results["messageForComeBack"];
                $messageArray = json_decode($data);
                if (gettype($messageArray) != gettype(array())) return false;
                if ($message != "") {
                    $messageArray = removeFromArray($messageArray, $message, "value");
                    setComebackmessages($conn, $userID, $messageArray);
                } else {
                    array_shift($messageArray);
                    if (gettype($messageArray) != gettype(array())) return false;
                    setComebackmessages($conn, $userID, $messageArray);
                }


                return $data;
            } else {
                echo "Keine Gruppen gefunden";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function setComebackmessages($conn, $userID, $data)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("UPDATE users SET messageForComeBack = ? WHERE userID = ?;");
        if ($stmt->execute([json_encode($data), $userID])) {
            if ($stmt->rowCount()) {
                return true;
            } else {
                return false;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function removeAllComebackMessages($conn, $userID)
{
    dbValidJSON($conn, "users", "messageForComeBack", "userID", $userID, "[]");
    try {
        $stmt = $conn->prepare("UPDATE users SET messageForComeBack = '[]' WHERE userID = ?;");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                return true;
            } else {
                return false;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}


function checkPassword($password)
{
    if (strlen($password) < 5) {
        $errorArray[] = "Das Passwort muss mindestens 5 Zeichen enthalten.";
        $result = false;
        return false;
    }
    return true;
}

function permissionDenied($message = "Keine Berechtigung zum ausführen der Aktion")
{
    $returnArray = array();
    if ($message) {
        $returnArray["message"] = $message;
        $returnArray["status"] = "failed";
    }
    $returnArray["permissionDenied"] = true;
    echo json_encode($returnArray);
}
