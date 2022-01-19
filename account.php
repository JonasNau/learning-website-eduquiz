<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("includes/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("includes/userSystem/functions/email-functions.php");
require_once("includes/userSystem/activateAccount.inc.php");

require_once("./global.php");
?>
<?php


require_once("./header-start.php");

setPermissionGroup($conn, "PA-Gruppe", "accessLehrerpanel", 1);


if (!isLoggedIn()) {
    $_SESSION["message"] = "Melde dich an, um deine Account Details anzusehen.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();

$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

$confirmed = "Nein";
$addEmail = false;
$changeEmail = true;

accountExists($conn, $userID);

if (getParameterFromUser($conn, $userID, "authenticated", "userID") == "1") {
    $confirmed = "Ja";
    $email = getParameterFromUser($conn, $userID, "email", "userID");
    $addEmail = false;
    $changeEmail = true;
} else {
    $changeEmail = false;
    $confirmed = "Nein";
    if (hasAskedForActivation($conn, $userID, "userID")) {
        if (confirmAccountExpired($conn, $userID, "userID")) {
            $email = "Deine Anfrage zum Aktivieren des Accounts ist Abgelaufen. Klicke auf 'Email hinufügen / Account Aktivieren'.";
            $addEmail = true;
        } else {
            $confirmEmail = getParameterFromConfirmAccount($conn, "email", $userID, "userID");
            $expires = getParameterFromConfirmAccount($conn, "expires", $userID, "userID");
            $email = "Bestätigung ausstehend für: $confirmEmail. Gültig bis: $expires. <a href='/includes/userSystem/sendNewToken.php'>erneut senden</a>";
        }
    } else {
        $email = "nicht hinzugefügt";
        $addEmail = true;
    }
}

$klassenstufe = getParameterFromUsername($conn, $username, "klassenstufe");
$gruppen = getAllGroupsFromUser($conn, $userID);
$gruppenText = "";
if ($gruppen && count($gruppen) > 0) {
    $gruppenText = implode(", ", $gruppen);
}




?>
<link rel="stylesheet" href="/css/account.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container accountContainer">
        <div class="accountOptionen">
            <ul class="nav justify-content-center">
                <li class="nav-item">
                    <button class="nav-link active" aria-current="page" href="#">Benutzerdaten</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" href="#">Scores</button>
                </li>
            </ul>
            <hr>
            <div class="content">
                <div class="accountDetails">
                    <ul class="details">
                        <li><b>Nutzername</b>: <?php echo $username ?> <span><a href="changeUsername.php" class="changeEmail">ändern?</a></span></li>
                        <li><b>Email</b>: <?php echo $email ?>
                            <?php
                            if ($changeEmail) {
                            ?>
                                <span class="changeEmail"><a href="removeEmail.php">ändern?</a></span>
                            <?php
                            }
                            ?>
                        </li>
                        <?php
                        if ($addEmail) {
                        ?>
                            <li class="addEmail"><a href="addEmail.php">Email hinzufügen / Account Aktivieren</a></li>
                        <?php
                        }
                        ?>

                        <li><b>Bestätigt</b>: <?php echo $confirmed ?></li>
                        <li><b>Klassenstufe</b>:
                            <span class="usersGrade">
                                <!-- Set Select Field by JavaScript -->
                                <!-- <select id="cars" class="form-control" sytyle="display: inline-block !important;">
                                    <option value="volvo">Volvo</option>
                                    <option value="saab">Saab</option>
                                    <option value="vw">VW</option>
                                    <option value="audi" selected>Audi</option>
                                </select> -->
                            </span>
                        </li>
                        <li><b>Berechtigung</b>: <?php echo $gruppenText ?></li>
                    </ul>
                    <div class="otherOptions">
                        <a href="changePassword.php" class="link">Passwort ändern</a>
                        <a href="removeEmail.php" class="link">Email entfernen</a>
                        <a href="./includes/userSystem/unauthorizeAllDevices.inc.php" class="link">Von allen Geräten abmelden</a>
                        <a href="deleteAccount.php" class="link deleteAccount">Account löschen</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>

    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
    <script src="includes/account.inc.js?v=?<?php echo  getNewestVersion();?>" type="module" defer></script>
</body>

</html>