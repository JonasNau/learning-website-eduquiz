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
        <p><strong>Impressum</strong></p>
        <p>Anbieter:<br />Jonas Naumann<br />Jenaer Str 45<br />07549 Gera</p>
        <p>Kontakt:<br />Telefon: 0365 20410839<br /><br />E-Mail: jonasnaumann06@gmail.com<br />Website: eduquiz.ddns.net</p>
        <p> </p>
        <p>Bei redaktionellen Inhalten:</p>
        <p>Verantwortlich nach § 55 Abs.2 RStV<br />Max Mustermann<br />Musterstraße 2<br />80999 München</p>

    </div>


    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>

</body>