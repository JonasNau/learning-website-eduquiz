<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once "includes/dbh.incPDO.php";
require_once "includes/getSettings.php";
require_once("includes/generalFunctions.php");
require_once "includes/userSystem/activateAccount.inc.php";
require_once "includes/userSystem/functions/generalFunctions.php";
require_once "includes/userSystem/functions/email-functions.php";
require_once("includes/userSystem/functions/login-functions.php");


require_once("./global.php");


$datase = new Dbh();
$conn = $datase->connect();

if (isLoggedIn()) {
    $userID = $_SESSION["userID"];
    if (getParameterFromUser($conn, $userID, "authenticated", "userID") == "1") {
        $_SESSION["message"] = "Dein Account hat schon eine aktivierte E-Mail-Adresse.";
        header("location: /account.php");
        die();
    }
}

if (getSettingVal($conn, "usersCanActivateAccount") != 1) {
    $_SESSION["message"] = "Das Aktiveren von Accounts ist zur Zeit deaktiviert.";
    header("Location: index.php?activationDeactivated");
    die();
}

#check if parameters selector and validator are in url
if (isset($_GET["selector"]) != true || isset($_GET["validator"]) != true) {
    $_SESSION["message"] = "Fehlende Parameter zum Aktivieren deines Accounts.";
    header("Location: index.php");
    die();
}

$tokenBin = hex2bin($_GET["validator"]);
$selector = $_GET["selector"];

#get Validator hashed and verify
$validatorDB = getValidator($conn, $selector);

if ($validatorDB === false) {
    $_SESSION["message"] = "Account Aktivierung fehlgeschlagen. Keine Einträge dazu in der Datenbank. Versuche es erneut.";
    header("Location: index.php");
    die();
} else {
    if (!password_verify($tokenBin, $validatorDB)) {
        $_SESSION["message"] = "Account Aktivierung fehlgeschlagen Validator stimmt nicht mit dem in der Datenbank überein.";
        header("Location: index.php");
        die();
    } else {
        #check if expired
        if (confirmAccountExpired($conn, $selector, "selector")) {
            $_SESSION["message"] = "Account Aktivierung fehlgeschlagen Token Abgelaufen.";
            header("Location: index.php");
            die();
        } else {
            #get Data form Row

            $userID = getParameterFromConfirmAccount($conn, "userID", $selector, "selector");
            $email = getParameterFromConfirmAccount($conn, "email", $selector, "selector");
            if (empty($email) || empty($userID)) {
                $_SESSION["message"] = "Ein Fehler ist aufgetreten. Fehlercode: AA1)";
                header("Location: index.php");
                die();
            }
            if (activateAccountAndSetEmail($conn, $userID, $email) === true) {
                $_SESSION["message"] = "Account erfolgreich Aktiviert! (Email Adresse hinzugefügt)";
                header("Location: index.php");
                die();
            } else {
                $_SESSION["message"] = "Account Aktivierung fehlgeschlagen DatabaseError2. Falls dieses Problem öfters auftritt gebe uns bescheid.";
                header("Location: index.php");
                die();
            }
        }
    }
}



#check if expired -> delete

#activate Account


require_once 'header-start.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Account</title>
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container">
        <div class="userFeedback">

        </div>
    </div>

    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>