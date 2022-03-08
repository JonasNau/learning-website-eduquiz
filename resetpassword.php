<?php

require_once("./includes/generalFunctions.php");
require_once("./includes/userSystem/functions/generalFunctions.php");
require_once("./includes/dbh.incPDO.php");
require_once("./includes/userSystem/resetPassword.inc.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("./includes/userSystem/functions/email-functions.php");
require_once("./includes/userSystem/activateAccount.inc.php");
require_once("./includes/userSystem/functions/permission-functions.php");

require_once("./global.php");

require_once 'header-start.php';



$database = new Dbh();
$conn = $database->connect();


?>
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container d-block m-auto main-content mt-3">
            <h3>Passwort vergessen?</h3>
            <p>Wenn du zu deinem Account eine E-Mail-Adresse hinzugefügt hast, kannst du hier eine Anfrage zum Zurücksetzen des Passworts stellen.</p>
            <p>Falls dein Account aber nicht aktiviert ist, tut es uns leid. Du kannst uns kontaktieren und ein neues Passwort anfordern.</p>
            <div class="row d-flex">
                <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                    <form action="includes/userSystem/reset-request.inc.php" method="post">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="email" name="email" aria-describedby="emailHelp" placeholder="E-Mail-Adresse oder Benutzername">
                        </div>
                        <button type="submit" class="btn btn-secondary" name="submitResetPassword">Anfragen</button>
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