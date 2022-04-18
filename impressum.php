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

$database = new Dbh();
$conn = $database->connect();
?>
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>


    <div class="main-content container mt-4">
        <h1>Impressum</h1>
        <h2>Anbieter</h2>
        <p>Diese Webseite ist ein Ergebnis eines Schulprojektes. Verantwortlicher für den Souce-Code ist: <strong>Jonas Naumann</strong>
        <br>
        <strong>Email:</strong> jonasnaumann06@gmail.com</p>
        <strong>Github:</strong> <a href="https://github.com/JonasNau/webseite">Github-Seite der Webseite</a></p>
        <h2>Kontaktdaten des Datenschutzbeauftragten:</h2>
        <p>Name, Vorname: Beauftrage/r für den Datenschutz des Staatlichen Schulamtes Ostthüringen<br>
        <strong>Anschrift:</strong> Name und Anschrift der 4. Staatlichen Regelschule in Gera
        <br>
        <strong>Telefon:</strong> 0365 548 54 600
        <br>
        <strong>Fax:</strong>Fax: 0365 548 54 666
        <br>
        <strong>E-Mail:</strong> poststelle.ostthueringen@schulamt.thueringen.de
    </p>



 



 



 



 


        </p>

    </div>


    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>

</body>