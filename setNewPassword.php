<?php

require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("includes/userSystem/resetPassword.inc.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

require_once 'header-start.php';

// require_once("includes/userSystem/functions/email-functions.php");
// require_once("includes/userSystem/activateAccount.inc.php");

if (isset($_GET["selector"]) != true || isset($_GET["validator"]) != true) {
    $_SESSION["message"] = "Fehlende Parameter zum Aktivieren deines Accounts.";
    header("Location: index.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();

$tokenBin = hex2bin($_GET["validator"]);
$selector = $_GET["selector"];

#Check if exists
if (!getParameterPwdReset($conn, "username", $selector, "selector")) {
    $_SESSION["message"] = "Ungültiger Aktivierungslink.";
    header("Location: index.php");
    die();
}
$userID = getParameterPwdReset($conn, "userID", $selector, "selector");
$username = getParameterPwdReset($conn, "username", $userID, "userID");
if (pwdTokenExpired($conn, $selector, "selector")) {
    $_SESSION["message"] = "Link abgelaufen.";
    header("Location: resetpassword.php");
    die();
}


#get Validator hashed and verify
$validatorDB = "";
if (!$validatorDB = getParameterPwdReset($conn, "validator", $selector, "selector")) {
    $_SESSION["message"] = "Validator nicht gefunden";
    header("Location: index.php");
    die();
}

if (!password_verify($tokenBin, $validatorDB)) {
    $_SESSION["message"] = "Link stimmt nicht mit der Datenbank überein. (Password does not match)";
    header("Location: index.php");
    die();
}
?>
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container d-block m-auto mt-3 main-content">
        <h3><?php echo $username ?>, lege dein neues Passwort fest</h3>
        <div class="row d-flex">
            <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                <form action="includes/userSystem/setNewPassword.inc.php?selector=<?php echo $selector ?>&validator=<?php echo bin2hex($tokenBin);?>" method="post">
                <div class="mb-3">
                            <label for="password" class="form-label">Neues Passwort</label>
                            <input type="password" class="form-control showPasswordField" id="newPassword" name="newPassword" aria-describedby="passwordHelp" placeholder="Neues Passwort" required oncopy="return false;" oncut="return false;" onpaste="return false;">
                            <label for="showPassword" class="form-label">Passwort anzeigen</label>
                            <input type="checkbox" class="form-check-input" id="showPassword">
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Neues Passwort wiederholen</label>
                            <input type="password" class="form-control showPasswordField" id="newPasswordRepeat" name="newPasswordRepeat" aria-describedby="passwordHelp" placeholder="Neues Passwort wiederholen" required oncopy="return false;" oncut="return false;" onpaste="return false;">
                            <label for="showPassword" class="form-label">Passwort anzeigen</label>
                            <input type="checkbox" class="form-check-input" id="showPassword">
                        </div>
                        <button type="submit" class="btn btn-primary" name="submitchangePassword">Bestätigen</button>
                </form>
            </div>
        </div>
    </div>


    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>