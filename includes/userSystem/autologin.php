<?php
#$database = new Dbh();
function autoLogin()
{
    $database = new Dbh();
    $conn = $database->connect();
    if (!session_id()) {
        session_start();
    }
    if (!isset($_SESSION["loggedin"])) {
        #look for cookies
        if (isset($_COOKIE["stayLoggedInSelector"]) && isset($_COOKIE["stayLoggedInToken"])) {

            $selector = $_COOKIE["stayLoggedInSelector"];
            $token = $_COOKIE["stayLoggedInToken"];

            if ($tokenDB = getStayLoggedInValue($conn, "tokenHashed", $selector)) {
                $expiresDB = getStayLoggedInValue($conn, "expires", $selector);
                $dbTime = $expiresDB;
                $now = date("d-m-Y H:i:s e");
                $dateFrom = new DateTime($now);
                $dateTo = new DateTime($dbTime);
                $difference = ($dateTo->getTimestamp() - $dateFrom->getTimestamp());

                if ($difference < 0) {
                    $expired = true;
                } else {
                    $expired = false;
                }


                if (!$expired) {
                    if (password_verify($token, $tokenDB)) {
                        if (!$userID = getStayLoggedInValue($conn, "userID", $selector)) {

                            setcookie("stayLoggedInSelector", "", time() - 3600, "/");
                            setcookie("stayLoggedInToken", "", time() + -3600, "/");
                            deleteAllStayLoggedInTokens($conn, $userID, "userID");
                        } else {
                            checkAccount($conn, $userID);
                            if (loginUser($conn, $userID)) {
                                setcookie("stayLoggedInSelector", "", time() - 3600, "/");
                                setcookie("stayLoggedInToken", "", time() + -3600, "/");
                                deleteOldStayLoggedInToken($conn, $selector);
                                stayLoggedIn($conn, $userID);
                            } else {
                                setcookie("stayLoggedInSelector", "", time() - 3600, "/");
                                setcookie("stayLoggedInToken", "", time() + -3600, "/");
                                deleteOldStayLoggedInToken($conn, $selector);
                            }
                        }
                    } else {
                        deleteOldStayLoggedInToken($conn, $selector);
                    }
                } else {
                    deleteOldStayLoggedInToken($conn, $selector);
                }
            }
        } else {
            //Delete Old if exists
            setcookie("stayLoggedInSelector", "", time() - 3600, "/");
            setcookie("stayLoggedInToken", "", time() + -3600, "/");
        }
    } else {
        checkAccount($conn, $_SESSION["userID"]);
    }
}
