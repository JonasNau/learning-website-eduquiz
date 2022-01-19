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
<link rel="stylesheet" href="css/choosequiz.css">
</head>
<body>
    <?php
        require_once 'navigation-bar.php';
    ?>
    <div class="container">
        <div class="row mt-4">
            <div class="col-12 col-md-7">
                <div class="search-container" data-results-container>
                    <input type="search" class="form-control rounded" id="searchbox" placeholder="Quize suchen" aria-label="Search" aria-describedby="search-addon" autocomplete="off">
                    <div class="search-results hidden" >
                        <div class="themen">
                           <!--Content get inseted by js-->
                        </div>
                        <div class="quize">
                            <!--Content get inseted by js-->
                        </div>
                        
                    </div>
                </div>
            </div>
            <div class="col">
                <button type="button" class="btn btn-outline-success reloadButton">Neu laden</button>
            </div>
        </div>
        <div class="row mt-5">
            <h2>Quizze Suchen</h2>
            <div class="row dropdownContainer d-block m-auto">
            

            
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col d-block m-auto quizIDInputContainer">
                <p class="content">
                    <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
                        Du hast eine QuizID?
                    </button>
                </p>
                <div style="min-height: 120px;" class="content">
                    <div class="collapse collapse-horizontal" id="collapseWidthExample">
                        <div class="card card-body">
                            <input type="search" class="form-control rounded" id="quizIDInput" placeholder="Gib hier die QuizID ein, wenn du eine hast." aria-label="Search" aria-describedby="search-addon">
                            <button type="button" class="btn btn-outline-success" id="quizIDInputBtn">Quiz aufrufen</button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
        
    </div>
    

    <?php
        require_once 'body-scripts.php';
    ?>
    <!-- <script type="module" src="includes/choosequiz.inc.js" defer></script> -->
    <script type="module" src="includes/choosequiz.inc.js?v=?<?php echo  getNewestVersion();?>" defer></script>
    
</body>
</html>