<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

require_once("./includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/generalFunctions.php");
require_once("./includes/generalFunctions.php");
require_once("./includes/getSettings.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/userSystem/functions/permission-functions.php");

?>
<a href="#main-content" class="skip-nav-link">
  skip navigation
</a>
<nav class="navbar navbar-expand-lg navbar-light sticky-top justify-content-end" style="background-color: #e3f2fd;">
  <div class="container-fluid">
    <div class="brand">
      <div class="box-1">
        <a href="/"><img src="./images/logo.png" srcset=""></a>
      </div>
      <div class="box-2">
        <a class="goBack" href="/">Eduquiz</a>
        <span class="zeitAnzeige"></span>
      </div>

    </div>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0 navigationsleiste">
        <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="offcanvas" href="#offcanvasChoosequiz" role="button" aria-controls="offcanvasChoosequiz">Seitenleiste</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="choosequiz.php">Quiz Wählen</a>
        </li>
      </ul>
      <?php
      if (isset($_SESSION["loggedin"])) {
        $userID = $_SESSION["userID"];
        $username = getParameterFromUser($conn, $userID, "username", "userID");
      ?>
        <div class="nav-item ml-1 navigationslink right">
          <a>Hallo, <?php
                    echo "<b>$username</b>";
                    ?>!</a>

          <a href="includes/userSystem/logout.inc.php" class="link-primary" style="color: red;">Abmelden</a>
          <?php
          if (userHasPermissions($conn, $userID, ["accessLehrerpanel"=>1], false)) {
          ?>
            <a href="./teacher" class="link-primary"><img src="./images/icons/stift.svg" alt="Lehrerpanel" style="height: 35px; margin: 5px;"></a>
          <?php
          }
          ?>
          <a href="./account.php" class="link-primary"><img src="./images//icons/user.svg" alt="Accounteinstellungen" style="height: 40px;"></a>
        </div>
      <?php
      } else {
      ?>
        <div class="nav-item align-items-right">
          <a>Hallo, Gast!</a>
          <a href="login.php" class="link-primary" style="margin: 0 5px 0 5px;;">Anmelden</a>
        </div>
      <?php
      }
      ?>
       <a href="./settings.php" class="link-primary" style="margin: 0 5px 0 5px;"><img src="./images//icons/zahnrad.svg" alt="Einstellungen" style="height: 40px;"></a>
      <script type="module" src="includes/selectquiz.inc.js?v=?<?php echo  getNewestVersion(); ?>" defer></script>
      <div class="nav-item align-items-right" style="text-align: center">
         <?php echo getNumOnlineClients($conn)?> Online
      </div>
    </div>
  </div>
</nav>
<link rel="stylesheet" href="css/choosequiz.css">

<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasChoosequiz" aria-labelledby="offcanvasChoosequizLabel">
  <div class="offcanvas-header">
    <img src="images/logo.png" alt="Eduquiz" style="height: 40px; display: block;">
    <h5 class="offcanvas-title" id="offcanvasExampleLabel">Schnellauswahl</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <div>
      <h3>Quiz auswählen</h3>
    </div>
    <div class="offcanvasContainer">

    </div>
    <hr>
    <div class="col d-block m-auto quizIDInputContainer">
      <p class="content">
        <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
          Du hast eine QuizID?
        </button>
      </p>
      <div style="min-height: 120px;" class="content">
        <div class="collapse collapse-horizontal" id="collapseWidthExample">
          <div class="card card-body">
            <input type="search" class="form-control rounded" id="quizIDInputOffcanvas" placeholder="Gib hier die QuizID ein, wenn du eine hast." aria-label="Search" aria-describedby="search-addon">
            <button type="button" class="btn btn-outline-success" id="quizIDInputBtnOffcanvas">Quiz aufrufen</button>
          </div>
        </div>
      </div>


    </div>
    <button type="button" class="btn btn-primary" id="inputMediaIDBtn">Du hast eine MediaID?</button>
  </div>
</div>



<main id="main-content">
  
<?php

?>
<script defer>
  function updateTime() {
    let zeitAnzeige = document.querySelector(".zeitAnzeige");
    var zeit = new Date();
    var tag = zeit.getDay();
    switch (tag) {
      case (1):
        tag = "Mo";
        break;
      case (2):
        tag = "Di";
        break;
      case (3):
        tag = "Mi";
        break;
      case (4):
        tag = "Do";
        break;
      case (5):
        tag = "Fr";
        break;
      case (6):
        tag = "Sa";
        break;
      case (0):
        tag = "So";
        break;
    }
    var stunde = (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours());
    var minute = (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes());
    var sekunde = (zeit.getSeconds() < 10 ? '0' + zeit.getSeconds() : zeit.getSeconds());
    zeitAnzeige.innerText = `${tag} ${stunde}:${minute}:${sekunde}`;


  }
  window.setInterval("updateTime()", 1000);
  updateTime();
</script>