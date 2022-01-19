<?php
require_once("../includes/dbh.incPDO.php");
require_once("../includes/getSettings.php");
require_once("../includes/userSystem/functions/permission-functions.php");
require_once("../includes/generalFunctions.php");
require_once("../includes/userSystem/functions/generalFunctions.php");
require_once("../includes/userSystem/autologin.php");
require_once("../includes/userSystem/functions/login-functions.php");
require_once("./includes/lehrerpanel.inc.php");

require_once("../global.php");

#Check Logged in
if (!isLoggedIn()) {
  $_SESSION["message"] = "Um diese Funktion zu nutzen musst du angemeldet sein.";
  header("Location: /index.php");
  die();
}
$dababase = new Dbh();
$conn = $dababase->connect();

#Check Permission to enter "Lehrerpanel"
$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");



if (!userHasPermissions($conn, $userID, ["accessLehrerpanel" => gnVP($conn, "accessLehrerpanel")])) {
  $_SESSION["message"] = "Du hast nicht die erforderlichen Berechtigungen.";
  header("location: /index.php");
  die();
}


if (!secureConnection()) {
  $_SESSION["message"] = "Um Nutzerdaten zu schützen musst du https benutzen, denn ansonsten können sensible Daten böswillig abgefangen werden. (Sniffing) (permission denied).";
  GoToNow("/");
  die();
}
logWrite($conn, "general", "$username hat das Lehrerpanel betreten -> " . $_SERVER["REMOTE_ADDR"], true, false, "white");



?>

<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--Logo in Tab Bar-->
  <link rel="shortcut icon" href="../images/logo.png?v=<?php echo getNewestVersion(); ?>">
  <title>Lehrerpanel</title>
  <!--Styles Global-->

  <!--Bootstrap CSS-->
  <link href="/includes/frameworks/bootstrapAndpopper/bootstrap.min.css" rel="stylesheet">

  <link rel="stylesheet" href="./css/lehrerpanel.css?v=<?php echo getNewestVersion(); ?>">
  <!-- <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="ede9af5a-1cf5-444a-a4fb-222d2abfcec6" data-blockingmode="auto" type="text/javascript"></script> -->
  <link rel="stylesheet" href="./css/style.css?v=<?php echo getNewestVersion(); ?>">
  <link rel="stylesheet" href="../css/utils.css?v=<?php echo getNewestVersion(); ?>">
  <noscript>
    <meta content="0;url=/noscript.html" http-equiv="refresh" />
  </noscript>
</head>

<body>

  <div class="sidebar close">
    <span class='navbar-toggle-btn-navbar'>
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </span>
    <div class="logo-details">
      <a href="/"><img src="../images/logo.png" class="sidebar-logo" alt="Logo"></a>
      <span class="logo_name">Lehrerpanel</span>
    </div>
    <ul class="nav-links">
      <li class="navigationsLink">
        <a href="?route=/home">
          <img src="../images/icons/home.svg" class="navImage invertWhite" alt="Home">
          <span class="link_name">Home</span>
        </a>
        <ul class="sub-menu blank">
          <li><a class="link_name" href="#">Home</a></li>
        </ul>
      </li>
      <?php
      if (userHasPermissions($conn, $userID, ["accessBenutzerverwaltung" => gnVP($conn, "accessBenutzerverwaltung")])) {
      ?>
        <li class="navigationsLink">
          <a href="?route=/benutzerverwaltung">
            <img src="../images/icons/multipleusers.svg" class="navImage invertWhite" alt="User">
            <span class="link_name">Benutzerverwaltung</span>
          </a>
          <ul class="sub-menu blank">
            <li><a class="link_name" href="#">Benutzerverwaltung</a></li>
          </ul>
        </li>
      <?php
      }
      ?>
      <?php
      if (userHasPermissions($conn, $userID, ["accessQuizverwaltung" => gnVP($conn, "accessQuizverwaltung")])) {
      ?>
        <li class="navigationsLink">
          <a href="?route=/quizverwaltung">
            <img src="../images/icons/quizIcon.svg" class="navImage invertWhite" alt="Users">
            <span class="link_name">Quizze Verwalten</span>
          </a>
          <ul class="sub-menu blank">
            <li><a class="link_name" href="?route=/quizverwaltung">Quizze Verwalten</a></li>
          </ul>
        </li>
      <?php
      }
      ?>
      <?php
      if (userHasPermissions($conn, $userID, ["accessOrganisation" => gnVP($conn, "accessOrganisation")])) {
      ?>
        <li class="navigationsLink">
          <div class="iocn-link">
            <a href="?route=/organisation" class="sidebar-link">
              <img src="../images/icons/hierarchie.svg" class="navImage invertWhite" alt="Zahnrad">
              <span class="link_name">Organisation</span>
            </a>
            <i class='arrow'>&#8593;</i>
          </div>
          <ul class="sub-menu">
            <li><a class="link_name" href="?route=/organisation">Organisation</a></li>
            <li><a href="?route=/organisation#overwiew">Übersicht</a></li>
            <li><a href="?route=/organisation#klassenstufenVerwaltung">Klassenstufen bearbeiten</a></li>
            <li><a href="?route=/organisation#faecherVerwaltung">Fächer bearbeiten</a></li>
            <li><a href="?route=/organisation#themenVerwaltung">Themen bearbeiten</a></li>
          </ul>
        </li>
      <?php
      }
      ?>
      <?php
      setPermissionGroup($conn, "PA-Gruppe", "berechtigungsVerwaltungEditPermissions", 1);
      if (userHasPermissions($conn, $userID, ["accessBerechtigungsverwaltung" => gnVP($conn, "accessBerechtigungsverwaltung")])) {
      ?>
        <li class="navigationsLink">
          <div class="iocn-link">
            <a href="?route=/berechtigungsverwaltung" class="sidebar-link">
              <img src="../images/icons/permssions.svg" class="navImage invertWhite" alt="Berechtigungen">
              <span class="link_name">Berechtigungsverw.</span>
            </a>
            <i class='arrow'>&#8593;</i>
          </div>
          <ul class="sub-menu">
            <li><a class="link_name" href="?route=/berechtigungsverwaltung">Berechtigungsverw.</a></li>
            <li><a href="?route=/berechtigungsverwaltung#berechtigungsVerwaltung">Berechtigungen</a></li>
            <li><a href="?route=/berechtigungsverwaltung#gruppenVerwaltung">Gruppen</a></li>
          </ul>
        </li>
      <?php
      }
      ?>
      <?php
      if (userHasPermissions($conn, $userID, ["accessSettings" => gnVP($conn, "accessSettings")])) {
      ?>
        <li class="navigationsLink">
          <a href="?route=/settings" class="sidebar-link">
            <img src="../images/icons/zahnrad.svg" class="navImage invertWhite" alt="Zahnrad">
            <span class="link_name">Einstellungen</span>
          </a>
          <ul class="sub-menu blank">
            <li><a class="link_name" href="#">Einstellungen</a></li>
          </ul>
        </li>
      <?php
      }
      ?>

      <li>
        <a href="/" class="sidebar-link leave">
          <img src="../images/icons/goBack.svg" class="navImage invertWhite" alt="Pfeil">
          <span class="link_name">Verlassen</span>
        </a>
        <ul class="sub-menu blank">
          <li><a class="link_name" href="#">Verlassen</a></li>
        </ul>
      </li>
      <li class="profile-li">
        <div class="profile-details">
          <div class="profile-content">
            <img src="../images/icons/user.svg">
          </div>
          <div class="name-job">
            <div class="profile_name showDotsIfTooLong"><?php echo $username ?></div>
            <div class="job showDotsIfTooLong"><?php
                                                $gruppen = getAllGroupsFromUser($conn, $userID);
                                                $gruppenText = "";
                                                if (count($gruppen) > 0) {
                                                  $gruppenText = implode(", ", $gruppen);
                                                }
                                                echo $gruppenText;
                                                ?></div>
          </div>
          <a href="../includes/userSystem/logout.inc.php"><img src="../images/icons/logout.svg" class="logoutIcon" alt="Pfeil" data-bs-toggle="tooltip" data-bs-placement="right" title="Abmelden"></a>
        </div>
      </li>
    </ul>
  </div>
  <section class="home-section">
    <i class='navbar-toggle-btn-inside'>
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </i>
    <div class="home-content">
      <?php
      if (isset($_GET["route"])) {
        processRoute($_GET["route"], $conn, $userID);
      } else {
        processRoute("/home", $conn, $userID);
      }
      ?>

    </div>
  </section>


  <!--Libraries-->
  <!-- Bootstrap and Popper -- Local hosted -->
  <script src="https://eduquiz.ddns.net/includes/frameworks/bootstrapAndpopper/bootstrap.bundle.min.js"></script>
  <!-- Sund manager -->
  <script src="/includes/frameworks/soundManager/soundmanager2.js" defer type="module"></script>

  <script src="./js/lehrerpanel.js?v=<?php echo  getNewestVersion(); ?>" type="module" defer></script>

  <script src="/includes/every.js?v=?<?php echo  getNewestVersion(); ?>" type="module" defer></script>

  <script type="module" defer>
    import * as Utils from "../includes/utils.js";

    Utils.holdSererContact("../includes/generalFunctions.php");
  </script>
</body>

</html>