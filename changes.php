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
<style>
    .container section img {
        border: 2px solid gray;
        margin: 10px;
        display: block;
        max-height: 450px;
        max-width: 95vw;
        width: auto;
        height: auto;
    }

    @media screen and (max-width: 600px) {
        .container section img {
            max-height: 500px;
            border: 2px solid gray;
        }
    }
</style>

<link rel="stylesheet" href="css/index.css?v=<?php echo getNewestVersion(); ?>">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <script>
        // location.reload();
    </script>

    <div class="main-content">
        <div class="container">
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>21.12.2021</h3>
                <p>Fertigstellung Benutzerverwaltung (Lehrerpanel), Verbesserung Verbindung zum Server während Anmeldung und Registrierung</p>
                <img src="/images/changes/Screenshot 2021-12-22 171616.png" class="fullscreenToggle">
            </section>
            <section id="fullscreenContainer">
                <h3>22.12.2021</h3>
                <p>Startseite, Verbesserung des Systems, um Quizze auszuwählen</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>29.12.2021</h3>
                <p>Fertigstellung Organisation (Lehrerpanel), Verbeserung durch bessere Coding-Skills des gesamten Codes, Bugfixes</p>
                <img src="/images/changes/Screenshot 2021-12-31 081216.png">
                <img src="/images/changes/Screenshot 2021-12-31 081539.png">
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>01.01.2022 - 04.01.2022</h3>
                <p>Fertigstellung Berechtigungsverwaltung (Berechtigung & Gruppen), Bugfixes</p>
                <img src="/images/changes/Screenshot 2022-01-04 215804.png">
                <img src="/images/changes/Screenshot 2022-01-04 220053.png">
                <img src="/images/changes/Screenshot 2022-01-04 220150.png" class="fullscreenToggle">
                <p class="description">-> live Motivations-Anzeige der verbleibenden Zeit bis zur Abgabe mit JavaScript <-</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>04.01.2021</h3>
                <p> Fertigstellung der Einstellungen (Lehrerpanel)</p>
                <img src="/images/changes/SettingsFinished01.png">
                <p class="description">Um die Webseite möglichst flexibel und einstellungsreich zu gestalten, mussten verschiedene Einstellungsarten her, wie ein Schieberegler, Texteingabe, Nummerneingabe und einen Button zum ausführen. Der Administrator kann einstellen, wer welche Einstellungen ändern darf, in dem er die Berechtigung dafür ändert, was durch das Benutzersystem und die Berechtigungsverwaltung nun möglich geworden ist.</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>15.01.2021</h3>
                <p>Einbindung SoundManager2 als Framework zum Abspielen von Sounds.</p>
                <p class="description">Diese Sounds werden bei den Quizzen eingesetzt werden.</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>04.01.2021</h3>
                <p> Erste Fortschritte in der Quizverwaltung</p>
                <img src="/images/changes/SettingsFinished01.png">
                <p class="description">Ab diesem Tage ist es möglich Quizze zu erstellen und zu löschen, sowie einige Einstellungen der Quizdaten aus der Tabelle "selectquiz" zu bearbeiten. Es fehlt noch die Bearebeitung von allen Ausgewählten Quizzen, das ändern der Fragen und Antworten und das Suchen nach Nutzern. Um das Suchen der Nutzer zu implementieren muss fast der gesamte Code für eine Optimierung geändert werden.</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>07.03.2022</h3>
                <p> Fertigstellung der ersten Version von Eduquiz. (V 1.0)</p>
                <img src="/images/changes/Screenshot 2022-03-08 142306.png">
                <img src="/images/changes/Screenshot 2022-03-10 192123.png">
                <p class="description">Wir sind stolz auf die Fertigstellung des Projektes. Unsere Ideen konnten praktisch umgesetzt werden. Leider kann die Seite wegen fehlenden Datenschutzbestimmungen nicht produktiv eingesetzt werden, sondern nur im Netzwerk der Schule.</p>
            </section>
            <section id="fullscreenContainer" class="fullscreenToggle">
                <h3>10.03.2022</h3>
                <p class="description"> Nur noch wenige Stunden bis zur Abgabe der Projektarbeit.</p>
                <img src="/images/changes/Screenshot 2022-03-10 192457.png">
            </section>






    </div>

    <?php
    require_once 'footer.php';
    require_once 'body-scripts.php';
    ?>
</body>

</html>