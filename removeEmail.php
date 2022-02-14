<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

require_once 'header-start.php';
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("includes/userSystem/functions/email-functions.php");
require_once("includes/userSystem/activateAccount.inc.php");
if (!isLoggedIn()) {
    $_SESSION["message"] = "Um diese Funktion zu nutzen melde dich an.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();
$userID = $_SESSION["userID"];
checkAccount($conn, $userID);

if (getParameterFromUser($conn, $userID, "authenticated", "userID") != "1") {
    $_SESSION["message"] = "Bei deinem Account ist noch keine aktivierte E-Mail hinzugefügt.";
    header("Location: /account.php");
    die();
    
} else {
    $email = getParameterFromUsername($conn, $username, "email");
}


?>
<link rel="stylesheet" href="css/removeEmail.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container main-content mt-4 d-block m-auto">
        <div class="details">
            <ul>
                <li><b>Benutzername</b>: <?php echo $username ?></li>
                <li><b>Email</b>: <?php echo $email ?></li>
            </ul>
        </div>
        <div class="removeForm">
            <h3>Willst du wirklich deine <b>E-Mail-Adresse</b> von deinem Account <b>entfernen?</b></h3>
            <p>Damit ist dein Account nicht mehr autorisiert und wenn du dich dann für <b>1 Jahr</b> nicht anmeldest, dann wird dein Account automatisch gelöscht.</p>
            <p>Wenn du deinen Account löschen willst, dann mache das direkt über den "Account löschen" Button auf der Accountseite</p>
            <p>Wenn du dich doch anders entschließt kannst du die E-Mail-Adresse ohne Probleme wieder mit deinem Account verknüpfen.</p>
                <div class="row d-flex">
                <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                    <form action="includes/userSystem/removeEmail.inc.php" method="post">
                        <button type="submit" class="btn btn-primary" name="submitremoveEmail" id="removeEmailFromAccount">Email entfernen</button>   
                    </form>
                </div>
        </div>
        </div>
    </div>


    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>