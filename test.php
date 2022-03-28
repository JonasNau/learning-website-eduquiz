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
        <!-- <button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top">
        Tooltip on top
      </button>
      <button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="right" title="Tooltip on right">
        Tooltip on right
      </button>
      <button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tooltip on bottom">
        Tooltip on bottom
      </button>
      <button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="left" title="Tooltip on left">
        Tooltip on left
      </button> -->





    </div>
    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    require_once './cookiePopUp.php';
    ?>

<script defer>
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map( function(tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl, {
  trigger : 'hover'
  });
});
</script>

    <script type="module" src="./includes/index.js"></script>
</body>

</html>