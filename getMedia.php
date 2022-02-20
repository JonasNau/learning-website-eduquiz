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
<?php
require_once 'navigation-bar.php';
?>
<?php



$database = new Dbh();
$conn = $database->connect();

if (isset($_GET["mediaID"])) {
    ?>
    <style>
        .main-content {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .mediaContainer > * {
            margin: auto;
            display: block;
            border: 2px solid black;
            padding: 5px;
        }
    </style>
        <div class="main-content"></div>
        <script type="module" defer>
            import * as Utils from '/includes/utils.js';
    
            Utils.setMedia({
                mediaID: "<?php echo $_GET["mediaID"] ?>"
            }, document.querySelector(".main-content"));
        </script>
    
    
    
    
    
    <?php
    
    }

require_once 'footer.php';
require_once 'body-scripts.php';
require_once './cookiePopUp.php';
