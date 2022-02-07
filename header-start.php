<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--Logo in Tab Bar-->
  <link rel="shortcut icon" href="images/logo.png">
  <title>Eduquiz - Lernen kann auch Spaß machen! Lernanwendung für die Vierte</title>
  <!--Styles Global-->

  <!--Bootstrap CSS-->
  <link href="/includes/frameworks/bootstrapAndpopper/bootstrap.min.css" rel="stylesheet">
  <!--Custom Global-->
  <link rel="stylesheet" href="css/style.css?v=?<?php echo  getNewestVersion(); ?>">
  <link rel="stylesheet" href="/css/global.css?v=?<?php echo  getNewestVersion(); ?>">
  <link rel="stylesheet" href="css/navigationsleiste.css?v=?<?php echo  getNewestVersion(); ?>">
  <link rel="stylesheet" href="css/utils.css?v=?<?php echo  getNewestVersion(); ?>">
  <link rel="stylesheet" href="css/footer.css?v=?<?php echo  getNewestVersion(); ?>">
  <!-- <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="ede9af5a-1cf5-444a-a4fb-222d2abfcec6" data-blockingmode="auto" type="text/javascript"></script> -->

  <noscript>
    <meta content="0;url=/noscript.html" http-equiv="refresh" />
  </noscript>
  <?php
  if (secureConnection() == false) {
    if (!isset($_COOKIE["unSecureConnectionOK"])) {
      setcookie("unSecureConnectionOK", true, 0, "/");

  ?>
      <script type='module' defer>
        import * as Utils from '/includes/utils.js';
        Utils.alertUser('Hinweis', 'Sensible Daten, wie Benutzername und Passowrt könnten ausgespäht werden, da du mit dem Server unverschlüsselt mit http statt https kommunizierst. (Auf eigene Gefahr)');
      </script>

  <?php

      echo "Keine sichere Verbindung.";
    }
  }
  ?>