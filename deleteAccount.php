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
$username = getParameterFromUser($conn, $userID, "username", "userID");
$email = getParameterFromUser($conn, $userID, "email", "userID");
checkAccount($conn, $userID);


?>
<link rel="stylesheet" href="css/deleteAccount.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container d-block m-auto deleteAccountOuter main-content mt-4">
        <div class="details">
            <ul>
                <li><b>Benutzername</b>: <?php echo $username ?></li>
                <li><b>Email</b>: <?php echo $email ?></li>
            </ul>
        </div>
        <div class="removeForm">
            <h3>Willst du wirklich deinen <b style="color: red;">Account löschen?</b></h3>
            <p>Damit entfernst du alle Daten unwiederruflich von unseren Datenbanken, die jemals über dich erstellt wurden.</p>
                <div class="row d-flex">
                <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                    <form action="includes/userSystem/deleteAccount.inc.php" method="post">
                        <button type="submit" class="btn btn-primary" name="submitdeleteAccount" id="deleteAccountBtn">Account löschen</button>   
                    </form>
                </div>
                <img src="https://assets.wprock.fr/emoji/joypixels/512/2639.png" alt="trauriger Smiley" id="sadEmoji">
        </div>
        </div>
    </div>


    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>