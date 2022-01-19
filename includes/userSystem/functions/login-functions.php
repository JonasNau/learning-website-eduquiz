<?php

// require_once ("functions/generalFunctions.php");
// require_once ("../generalFunctions.php");


function emptyInputLogin($username, $pwd)
{
    $result = true;
    if (empty($username) || empty($pwd)) {
        $result = true;
    } else {
        $result = false;
    }
    return $result;
}

// function loginUser($conn, $username)
// {
//     #Check if User Exists, just for error handling
//     $type = null;
//     #check if it is a username or email
//     if (invalidEmail($username)) {
//         $type = "username";
//         if (usernameExists($conn, $username) === false) {
//             echo "Username doesn't exist. Couldn't log in User.";
//             $_SESSION["message"] = "Username doesn't exist. Couldn't log in User.";
//             header("Location: ../../index.php");
//             die();
//         }
//     } else {
//         $type = "email";
//         if (emailExits($conn, $username) === false) {
//             echo "Email doesn't exist. Couldn't log in User.";
//             $_SESSION["message"] = "Email doesn't exist. Couldn't log in User.";
//             header("Location: ../../index.php");
//             die();
//         }
//         if (!userWithThisEmailIsConfirmed($conn, $username)) {
//             $_SESSION["message"] = "Die Email-Adresse ist noch nicht bestätigt, deshalb kannst du dich damit noch nicht anmelden.";
//             header("Location: /index.php");
//             die();
//         }
//     }

//     if ($type === "email") {
//         #Login with Email

//         $stmt = $conn->prepare("SELECT userID FROM users WHERE email = ?");
//         if ($stmt->execute([$username])) {
//             if ($stmt->rowCount()) {
//                 $result = $stmt->fetch(PDO::FETCH_ASSOC);

//                 $_SESSION["loggedin"] = true;
//                 $_SESSION["userID"] = $result["userID"];

//                 $now = DateTime::createFromFormat('U.u', microtime(true));
//                 $timeNow = $now->format("d-m-Y H:i:s.u");

//                 $stmt = $conn->prepare("UPDATE users SET lastLogin = ? WHERE email = ? ");
//                 $stmt->execute([$timeNow, $username]);

//                 return true;
//             } else {
//                 echo "No User found.";
//             }
//         } else {
//             echo "Error in executing Statement.";
//         }
//         $stmt = null;
//     } else {
//         if ($type === "username") {
//             #Login with Username

//             $stmt = $conn->prepare("SELECT userID FROM users WHERE username = ?");
//             if ($stmt->execute([$username])) {
//                 if ($stmt->rowCount()) {
//                     $result = $stmt->fetch(PDO::FETCH_ASSOC);

//                     $_SESSION["loggedin"] = true;
//                     $_SESSION["userID"] = $result["userID"];

//                     $now = DateTime::createFromFormat('U.u', microtime(true));
//                     $timeNow = $now->format("d-m-Y H:i:s.u");

//                     $stmt = $conn->prepare("UPDATE users SET lastLogin = ? WHERE username = ? ");
//                     $stmt->execute([$timeNow, $username]);

//                     return true;
//                 } else {
//                     echo "No User found.";
//                 }
//             } else {
//                 echo "Error in executing Statement.";
//             }
//         }
//     }
//     return false;
// }


function loginUser($conn, $userID)
{

    #check if it is a username or email
    if (!userExists($conn, $userID)) {
        $_SESSION["message"] = "Benutzer existiert nicht mehr";
        return false;
    }


    if (!userHasPermissions($conn, $userID, ["canLogin" => gnVP($conn, "canLogin")])) {
        $_SESSION["message"] = "Die Funktion zum Anmelden wurde für dich gesperrt. Falls dies ein Fehler sein sollte, melde dich bei einem Administrator.";
        returnMessage(false, "Die Funktion zum Anmelden wurde für dich gesperrt. Falls dies ein Fehler sein sollte, melde dich bei einem Administrator.", "/index.php");
        return false;
    }

    //Test if user should log out
    shouldLogOut($conn, $userID);



    $username = getValueFromDatabase($conn, "users", "username", "userID", $userID, 1, false);
    if (!$username) {
        return false;
    }
    session_destroy();
    session_start();

    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");

    $_SESSION["loggedin"] = true;
    $_SESSION["userID"] = $userID;

    setLastActivity($conn, $userID);

    setValueFromDatabase($conn, "users", "lastLogin", "userID", $userID, $timeNow, false);

    $log  = "Anmeldung erfolgreich | username: $username userId: $userID -> ". $_SERVER['REMOTE_ADDR'];
    logWrite($conn, "login", $log, true, false, "green");
    return true;
}

function setNewPassword($conn, $userID, $newPwd)
{
    $result = false;
    try {

        if (empty($newPwd)) {
            return "Error, Password is empty.";
        }

        #only username not e-mail
        $now = DateTime::createFromFormat('U.u', microtime(true));
        $lastPwdChange = $now->format("d-m-Y H:i:s.u e");
        $stmt = $conn->prepare("UPDATE users SET password = ?, lastPwdChange = ? WHERE userID = ?;");
        if ($stmt->execute([$newPwd, $lastPwdChange, $userID])) {
            if ($stmt->rowCount()) {
                $result = true;
            }
        }

        $stmt = null;
    } catch (Exception $e) {
        echo $e;
        die();
    }


    return $result;
}

function pwdNeedsRehash($conn, $userID, $hash, $password)
{

    $options = array('cost' => 12);
    if (password_needs_rehash($hash, PASSWORD_DEFAULT, $options)) {
        // Falls ja, dann erzeuge einen neuen Hash und ersetze den alten
        $newHash = password_hash($password, PASSWORD_DEFAULT, $options);

        if (setNewPassword($conn, $userID, $newHash)) {
            return true;
        }
    }
    return false;
}

function deleteExpiredEntries($conn)
{

    try {
        $stmt = $conn->prepare("SELECT expires, selector FROM keepUserLoggedIn;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                //print_r($rows);
                foreach ($rows as $row) {
                    $dbTime = $row["expires"];
                    $now = date("d-m-Y H:i:s e");
                    $dateFrom = new DateTime($now);
                    $dateTo = new DateTime($dbTime);
                    $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());
                    if ($difference < 0) {
                        deleteOldStayLoggedInToken($conn, $row["selector"]);
                    }
                }
            }
        }
        $stmt = null;
    } catch (Exception $e) {
        echo $e;
    }
}

function stayLoggedIn($conn, $userID)
{
    deleteExpiredEntries($conn);
    if (getSettingVal($conn, "usersCanStayLoggedIn") != 1) {
        $_SESSION["message"] = "Das angemeldet bleiben ist zur Zeit deaktiviert.";
        return false;
    }
    try {
        $created =  date("d-m-Y H:i:s e");
        $stayLoggedInDurationDays = getSettingVal($conn, "stayLoggedInTime");
        $duration = (3600 * 24) * $stayLoggedInDurationDays;
        $expires = date("d-m-Y H:i:s e", strtotime("+$duration sec"));


        $selector = bin2hex(random_bytes(6) . $created);
        $token = random_bytes(32);
        $hashedToken = password_hash($token, PASSWORD_DEFAULT);


        $username = getParameterFromUser($conn, $userID, "username", "userID");

        $stmt = $conn->prepare("INSERT INTO keepUserLoggedIn (username, userID, selector, tokenHashed, created, expires) VALUES (?, ?, ?, ?, ?, ?);");
        if ($stmt->execute([$username, $userID, $selector, $hashedToken, $created, $expires])) {
            if ($stmt->rowCount()) {
                //Delete Old if exists
                setcookie("stayLoggedInSelector", $selector, time() - 3600, "/");
                setcookie("stayLoggedInToken", $token, time() + -3600, "/");
                //SetCookie
                setcookie("stayLoggedInSelector", $selector, time() + (3600 * 24) * 31, "/");
                setcookie("stayLoggedInToken", $token, time() + (3600 * 24) * 31, "/");


                return true;
            }
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
    }

    return false;
}

function deleteOldStayLoggedInToken($conn, $selector)
{
    $result = false;
    try {

        $stmt = $conn->prepare("DELETE FROM keepUserLoggedIn WHERE selector = ?;");
        if ($stmt->execute([$selector])) {
            $result = true;
        }

        $stmt = null;
    } catch (Exception $e) {
        echo $e;
        die();
    }


    return $result;
}

function deleteAllStayLoggedInTokens($conn, $value, $type)
{
    $result = false;
    try {
        $stmt = $conn->prepare("DELETE FROM keepUserLoggedIn WHERE $type = ?;");
        if ($stmt->execute([$value])) {
            $result = true;
        }

        $stmt = null;
    } catch (Exception $e) {
        echo $e;
        die();
    }


    return $result;
}

function getStayLoggedInValue($conn, $parameter, $selector)
{
    try {
        $stmt = $conn->prepare("SELECT $parameter FROM keepUserLoggedIn WHERE selector = ?");
        if ($stmt->execute([$selector])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                return $data[$parameter];
            }
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
    }

    return false;
}
