<?php
require_once("/var/www/webseite/includes/generalFunctions.php");
require_once("/var/www/webseite/includes/userSystem/functions/generalFunctions.php");
require_once("/var/www/webseite/includes/dbh.incPDO.php");
require_once("/var/www/webseite/includes/getSettings.php");
require_once("/var/www/webseite/includes/userSystem/functions/deleteAccount-functions.php");
require_once("/var/www/webseite/includes/userSystem/activateAccount.inc.php");

$database = new Dbh();
$conn = $database->connect();

function deleteTokensWhichAreExpired($conn)
{

    $selectors = getAllValuesFromDatabase($conn, "confirmAccount", "selector", 0, true);

    if (!$selectors)  {
        logWrite($conn, "confirmAccount", "Keine Anfragen zum bestätigen gefunden.");
        return true;
    }
    foreach ($selectors as $currentSelector) {
        $selector = $currentSelector;
        $username = getValueFromDatabase($conn, "confirmAccount", "username", "selector", $currentSelector, 1, false);
        $userID = getValueFromDatabase($conn, "confirmAccount", "userID", "selector", $currentSelector, 1, false);
        $expires = getValueFromDatabase($conn, "confirmAccount", "expires", "selector", $currentSelector, 1, false);

        $now = DateTime::createFromFormat('U.u', microtime(true));
        $timeNow = $now->format("d-m-Y H:i:s.u e");
        $timeNow = new DateTime($timeNow);

        $expires = new DateTime($expires);

        $timeExpired = differenceOfTime($timeNow, $expires);
        

        if ($timeExpired < 0) {
            $timeExpiredWords = secondsToArrayOrString(-$timeExpired, "String");
            deleteOldConfirmEntry($conn, $selector, "selector");
            logWrite($conn, "confirmAccount", "Token $selector von $username mit der userID $userID ist seit $timeExpired Sekunden abgelaufen. Das sind ($timeExpiredWords) und wurde gelöscht");
        } else {
            $timeExpiredWords = secondsToArrayOrString(-$timeExpired, "String");
            logWrite($conn, "confirmAccount", "Token $selector von $username mit der userID $userID noch nicht abgelaufen. Läuft $timeExpired ab. ($timeExpiredWords)");
        }
    }
    $now = DateTime::createFromFormat('U.u', microtime(true));
    $timeNow = $now->format("d-m-Y H:i:s.u e");
    lastUpdate($conn, "deleteExpiredConfirmTokens", $timeNow);
    return true;
}


deleteTokensWhichAreExpired($conn);