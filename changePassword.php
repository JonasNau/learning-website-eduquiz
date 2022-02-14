<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("includes/userSystem/functions/email-functions.php");
require_once("includes/userSystem/activateAccount.inc.php");

require_once("./header-start.php");

if (!isLoggedIn()) {
    $_SESSION["message"] = "Um dein Passwort zu ändern musst du dich anmelden.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
accountExists($conn, $userID);


?>

<link rel="stylesheet" href="/css/account.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container main-content mt-4">
        <div class="row d-flex">
            <div class="col-12 col-sm-10 col-md-9 col-lg-7 mb-4">
                <form action="includes/userSystem/changePassword.inc.php" method="post">
                    <h4>Dein altes Passwort</h4>
                    <div class="mb-3">
                        <input type="password" class="form-control" id="oldPassword" name="oldPassword" aria-describedby="passwordHelp" placeholder="Altes Passwort" required>
                    </div>
                    <h4>Dein neues Passwort</h4>
                    <div class="mb-3">
                        <input type="password" class="form-control" id="newPassword" name="newPassword" aria-describedby="passwordHelp" placeholder="Altes Passwort" required>
                    </div>
                    <div class="form-group">
                        <p>Du bist dir nicht sicher, ob dein Passwort gut genug ist? <a href="https://checkdeinpasswort.de/">Bei checkdeinpasswort.de siehst du, wie lange ein Hacker zum Erraten brauchen würde</a></p>
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control" id="newPasswordRepeat" name="newPasswordRepeat" aria-describedby="passwordHelp" placeholder="Altes Passwort" required>
                    </div>
                    <button type="submit" class="btn btn-primary" name="submitchangePassword">Passwort ändern</button>
                </form>
            </div>
            <div class="col-12">
                <a href="resetpassword.php" class="link-primary">Passwort vergessen?</a>
            </div>
        </div>
    </div>
    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>