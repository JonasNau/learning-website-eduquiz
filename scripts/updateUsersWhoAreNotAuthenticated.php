<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");
require_once("/var/www/webseite/includes/userSystem/functions/deleteAccount-functions.php");


$database = new Dbh();
$conn = $database->connect();








function getUnauthenticatedAccounts($conn)
{
    try {
        $stmt = $conn->prepare("SELECT userID, username, email, lastActivity, lastLogin FROM users WHERE authenticated = 0;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $userArray = array();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($users as $user) {
                    //echo gettype($userArray);
                    array_push($userArray, $user);
                }
                return $userArray;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function deleteAccountsWhichAreTooOld($conn)
{
    $count = 0;
    $deleteOlderThanFactor = getSettingVal($conn, "deleteOlderThanFactor");

    $users = getValueFromDatabase($conn, "users", "userID", "authenticated", 0, 0, true, true);

    if (!$users) return false;

    foreach ($users as $user) {
        $username = getValueFromDatabase($conn, "users", "username", "userID", $user, 1, false);
        $now = DateTime::createFromFormat('U.u', microtime(true));
        $timeNow = $now->format("d-m-Y H:i:s.u e");
        $timeNow = new DateTime($timeNow);

        $lastActivityDB = getValueFromDatabase($conn, "users", "lastActivity", "userID", $user, 1, false);

        if (!$lastActivityDB) {
            if (deleteAccount($conn, $user)) {

                $log = "Deleted User: userID = $user; username = $username; lastActivity = $lastActivityDB" . PHP_EOL;
                echo $log."<hr>";
                logWrite($conn, "deletedAccounts_Log_", $log);
            }
            $count++;
            continue;
        }

        $lastActivity = date($lastActivityDB);
        $lastActivity = new DateTime($lastActivity);

        

        $timeOffline = differenceOfTime($lastActivity, $timeNow);
       
        $timeOfflineWord = secondsToArrayOrString($timeOffline, "String");

        echo "User $username with the userID of $user was $timeOffline seconds not online. This means $timeOfflineWord"."<hr>";
    
        if ($timeOffline > $deleteOlderThanFactor) {
            if (deleteAccount($conn, $user)) {

                $log = "Deleted User: userID = $user; username = $username; time Offline = $timeOffline this means: $timeOfflineWord" . PHP_EOL;
                echo $log."<hr>";
                logWrite($conn, "deletedAccounts_Log_", $log);
            }
            $count++;
        }
    }

    return $count;
}

$numberOfdeletetUsers = deleteAccountsWhichAreTooOld($conn);
if ($numberOfdeletetUsers == 0) {
    echo "No user Deleted\n";
} else {

}

$now = DateTime::createFromFormat('U.u', microtime(true));
$timeNow = $now->format("d-m-Y H:i:s.u e");
lastUpdate($conn, "deleteUsersWhoAreNotAuthenticated", $timeNow);
//print_r(secondsToArrayOrString(3744000, "Array"));
