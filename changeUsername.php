
<?php
require_once("./includes/generalFunctions.php");
require_once("./includes/userSystem/functions/generalFunctions.php");
require_once("./includes/dbh.incPDO.php");
require_once("includes/userSystem/functions/email-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("global.php");

require_once 'header-start.php';

if (!isLoggedIn()) {
    $_SESSION["message"] = "Melde dich an, um deinen Namen zu ändern.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();


$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");


checkAccount($conn, $userID);




?>
<link rel="stylesheet" href="/css/account.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container main-content">
        <div class="row">
            <div class="col">
                <p><b>Aktueller Name</b> <?php echo $username?></p>
                <form action="includes/userSystem/changeUsername.inc.php" method="post">
                    <h4>Dein neuer Nutzername</h4>
                    <div class="mb-3">
                        <input type="text" class="form-control" id="newUsername" name="newUsername" aria-describedby="passwordHelp" placeholder="Neuer Nutzername" required>
                    </div>
                    <button type="submit" class="btn btn-primary" name="submitchangeUsername">Nutzername ändern</button>
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