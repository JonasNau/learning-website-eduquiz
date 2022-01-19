<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");


    //Zur Sicherheit
    if (!isset($_GET["quizId"])){
        header("Location: choosequiz.php");
    }
?>
<?php
    require_once 'header-start.php';
?>
<link rel="stylesheet" href="css/quiz.php.css">
</head>
<body>
    <?php
        require_once 'navigation-bar.php';
    ?>
    <div class="container-fluid">
        <div class="outerContainer">
            
            <div class="startQuizContainer">
                <div class="quizDescription">
                    <span class="item klasse"><b>Klasse: </b><span>none</span></span>
                    <span class="item fach"><b>Fach : </b><span>none</span></span>
                    <span class="item thema"><b>Thema: </b><span>none</span></span>
                    <span class="item quizname"><b>Quizname: </b><span>none<span></span>
                </div>
            <button type="button" id="startQuizBtn">Quiz Starten</button>

            </div>
        </div>
    </div>
    <script type="module" src="includes/quizlogik.js?v=?<?php echo  getNewestVersion();?>" defer></script>
    <?php
        require_once 'body-scripts.php';
    ?>
</body>
</html>