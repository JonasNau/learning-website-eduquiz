<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

?>
<?php
    require_once 'header-start.php';
?>
<link rel="stylesheet" href="css/quiz.css">
</head>
<body>
    <?php
        require_once 'navigation-bar.php';
    ?>
    <div id="quizContainer">

    </div>
    <script type="module" src="includes/quizlogik.js?v=?<?php echo  getNewestVersion();?>" defer></script>
    <?php
        require_once 'body-scripts.php';
    ?>
</body>
</html>