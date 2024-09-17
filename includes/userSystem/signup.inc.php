<?php
session_start();
require_once("functions/signup-functions.php");
require_once("./functions/generalFunctions.php");
require_once("../getSettings.php");
require_once("./functions/password-check-functions.php");
require_once("./functions/permission-functions.php");
require_once("functions/login-functions.php");
require_once("confirmAccount.php");

require_once("../generalFunctions.php");
require_once("functions/email-functions.php");
require_once("activateAccount.inc.php");

require_once("../sendmail.php");
require_once("../../vendor/autoload.php");


if (isset($_SESSION["loggedin"])) {
    returnMessage("failed", "Du bist schon angemeldet, also musst du keinen neuen Accout erstellen. Wenn doch melde dich bitte ab.", "index.php");
    die();
}
#include Settings

require_once("../dbh.incPDO.php");
$datase = new Dbh();
$conn = $datase->connect();

#If Sign up is deactivated stop here and throw an error
if (getSettingVal($conn, "usersCanSignUp") != 1) {
    returnMessage("failed", "Das registrieren ist vorrübergehend deaktiviert.", "/index.php");
    die();
}

if (isset($_POST["submitSignup"])) {

    $username = $_POST["username"];
    $password = custom_json_validate($_POST["password"])?->{"password"};
    $passwordRepeat = custom_json_validate($_POST["passwordRepeat"])?->{"passwordRepeat"};

    #Optional
    $email = $_POST["email"];
    $grade = $_POST["klasse"];

    $stayLoggedIn = custom_json_validate($_POST["stayLoggedIn"]);

    if ($stayLoggedIn) {
        $stayLoggedIn = true;
    } else {
        $stayLoggedIn = false;
    }

    $datenschutzOK = custom_json_validate($_POST["datenschutzOK"]);

    if (!$datenschutzOK) {
        returnMessage("failed", "Um dich zu registieren musst du der <b>Datenschutzerklärung</b> zustimmen.");
        die();
    }



    if (empty($username)) {
        returnMessage("failed", "Der Benutzername darf nicht leer sein");
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

    if (usernameAlreadyExists($conn, $username)) {
        returnMessage("failed", "Der Benutzername ist schon vergeben.");
        die();
    }
    if (!empty($email)) {
        if (invalidEmail($email)) {
            returnMessage("failed", "Die Formatierung der Email stimmt nicht.");
            die();
        }
        $email = formatEmail($email);
    }
    if (emailAlreadyExists($conn, $email)) {
        returnMessage("failed", "Ein Benutzer mit der E-Mail existiert bereits.");
        die();
    }

    if (!checkPassword($password)) {
        returnMessage("failed", "Das Passwort entspricht nicht den Anforderungen. (8 Zeichen und mind. 1 Ziffer.)");
        die();
    }

    ##Check if user has entered Klassenstufe
    $hasKlassenstufe = false;
    if (!empty($grade)) {
        $hasKlassenstufe = true;
    } else {
        $hasKlassenstufe = false;
        $grade = null;
    }

    #Validate Users Input
    if (!pwdMatch($password, $passwordRepeat)) {
        returnMessage("failed", "Die Passwörter stimmen nicht überein. Überpfüfe, ob die Feststelltaste versehentlich aktiviert ist.");
        die();
    }


    ##With or without Email
    if ($email) {
        if (!createUserWithEmail($conn, $username, $email, $grade, $password)) {
            returnMessage("failed", "Ein Fehler beim Erstellen des Benutzers ist aufgetreten. Versuche es erneut.");
            die();
        } else {
            

            $userID = getParameterFromUser($conn, $username, "userID", "username");

            //Set all Groups an Permissions which are defined in settings
            addGroupUser($conn, $userID, getSettingVal($conn, "normalGroup"));

            if (loginUser($conn, $userID)) {
                if ($stayLoggedIn) {
                    stayLoggedIn($conn, $userID);
                }
                confirmAccount($conn, $email, $userID);
                returnMessage("success", "Dein Account " . $username . " wurde Erfolgreich erstellt. Jetzt musst musst du noch deine E-Mail ($email) bestätigen, denn ansonsten gilt: Unautorisierte Accounts werden bei Nichtanmeldung nach einem Jahr gelöscht.", "account.php");
                die();
            } else {
                returnMessage("success", "Wir konnten dich nich automatisch einloggen. Versuche es manuell.", "account.php");
                if (confirmAccount($conn, $email, $userID)) {
                    $_SESSION["message"] = "Dein Account " . $username . " wurde Erfolgreich erstellt. Jetzt musst musst du noch deine E-Mail ($email) bestätigen, denn ansonsten gilt: Unautorisierte Accounts werden bei Nichtanmeldung nach einem Jahr gelöscht.";
                }
                die();
            }
        }
        die();
    } else {
        if (!createUserWithoutEmail($conn, $username, $grade, $password)) {
            returnMessage("failed", "Ein Fehler beim Erstellen des Benutzers ist aufgetreten. Versuche es erneut.");
            die();
        } else {          
            $userID = getParameterFromUser($conn, $username, "userID", "username");
             //Set all Groups an Permissions which are defined in settings
             addGroupUser($conn, $userID, getSettingVal($conn, "normalGroup"));


            if (loginUser($conn, $userID)) {
                if ($stayLoggedIn) {
                    stayLoggedIn($conn, $userID);
                }
                returnMessage("success", "Dein Account " . $username . " wurde Erfolgreich erstellt. Da du keine Email angegeben hast wird der Account automatisch nach einem Jahr bei Nichtanmeldung gelöscht. Mehr dazu findest du in den Datenschutzbestimmungen. Um dies zu verhindern gehe in die Accounteinstellungen und füge eine Email hinzu.", "account.php");
                die();
            } else {
                returnMessage("success", "Wir konnten dich nich automatisch einloggen. Versuche es manuell.", "account.php");
                die();
            }
        }
    }

    die();
}


