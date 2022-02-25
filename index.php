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
logWrite($conn, "general", "Jemand hat die Webseite betreten! Connected Clients now: ". getNumOnlineClients($conn), true, false, "yellow", ".log", true, false);

?>
<link rel="stylesheet" href="css/index.css?v=<?php echo getNewestVersion(); ?>">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <script>
        // location.reload();
    </script>

    <div class="main-content">
        <section class="header mb-3">
            <div class="welcomeHeader growIn">
                <div class="welcomeMessage growIn">
                   <span>Willkommen auf Eduquiz!</span>
                </div>
                <div class="text2 growIn">
                   <span>Eine Lernwebseite von Schülern, für Schüler</span>
                </div>
            </div>
        </section>
        <div class="container">
            <section class="chooseKlassenstufe row">
                <h2>Wähle eine Klassenstufe aus.</h2>
                <div class="grid">
                    <!-- Klassenstufenauswahl -->

                </div>
            </section>
        </div>





    </div>

    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    require_once './cookiePopUp.php';
    ?>

    <script type="module" src="./includes/index.js" defer></script>
    <!-- <script type="module" defer>
        import * as Utils from "/includes/utils.js";

        let string= "20 + 20 = 40";
        Utils.escapeSpecialCharsInStringToUnicode(string);
    </script> -->
</body>

</html>