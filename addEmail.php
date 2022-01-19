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
    $_SESSION["message"] = "Um eine E-Mail hinzuzufügen melde dich bitte an.";
    header("Location: /login.php");
    die();
}

$userID = $_SESSION["userID"];
$database = new Dbh();
$conn = $database->connect();


accountExists($conn, $userID);

if (getParameterFromUser($conn, $userID, "authenticated", "userID") == "1") {

    $email = getParameterFromUsername($conn, $username, "email");
    $_SESSION["message"] = "Dein Account hat schon eine bestätigte E-Mail-Adresse: $email";
    header("Location: /account.php");
    die();
}


?>
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container d-block m-auto">
        <div class="details">
            <ul>
                <li><b>Benutzername</b>: <?php echo $username ?></li>
            </ul>
        </div>
        <div class="addForm">
            <h3>Aktiviere jetzt deinen Account</h3>
            <p>Trage dazu in das Formular unten deine E-Mail-Adresse ein</p>
            <p>Nach einer kurzen Zeit erhälst du eine E-Mail mit einem Bestätigungslink. Klicke auf diesen und das wars dann schon. Dein Account ist aktiviert.</p>
            <div class="row d-flex">
                <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                    <form action="includes/userSystem/addEmail.inc.php" method="post">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="email" name="email" aria-describedby="emailHelp" placeholder="Deine E-Mail-Adresse">
                        </div>
                        <button type="submit" class="btn btn-primary" name="submitaddEmail">Absenden</button>
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