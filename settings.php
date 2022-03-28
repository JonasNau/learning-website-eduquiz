<?php
require_once("./includes/generalFunctions.php");
require_once("./includes/userSystem/functions/generalFunctions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("./includes/generalFunctions.php");
require_once("./includes/dbh.incPDO.php");

require_once("./global.php");
?>
<?php


require_once("./header-start.php");

$database = new Dbh();
$conn = $database->connect();

?>
<link rel="stylesheet" href="/css/settings.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container settingsContainer main-content">

        <ul class="nav justify-content-center">
            <h1>Einstellungen</h1>
        </ul>
        <hr>
        <div class="content">
            <section class="dataUsage">
                <h3>Daten</h3>
                <ul class="settingsList">
                    <li class="setting-item" id="saveData">
                    <p class="description">Wenn aktiviert, werden Medien wie Videos, Bilder und Audios nicht automatisch heruntergeladen.</p>
                        <span class="name"><b>Datensparmodus:</b></span>
                        <label class="switch">
                            <input type="checkbox" id="checkbox">
                            <span class="slider round"></span>
                        </label>
                        <script type="module" defer>
                            import {
                                makeJSON
                            } from "/includes/utils.js";
                            let saveDataSwitch = document.querySelector("#saveData #checkbox");
                            saveDataSwitch.checked = makeJSON(window.localStorage.getItem("SETTING_lightDataUsage"));
                            saveDataSwitch.addEventListener("change", () => {
                                window.localStorage.setItem("SETTING_lightDataUsage", saveDataSwitch.checked);
                            });
                        </script>
                    </li>
                </ul>
            </section>
        </div>
    </div>

</body>

</html>

<?php
require_once 'footer.php';
require_once 'body-scripts.php';
?>
</body>

</html>