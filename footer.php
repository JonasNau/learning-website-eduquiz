<section>
    <?php
    $now = new DateTime(getCurrentDateAndTime(1));
    $untilFinished = new DateTime("27-4-2022 08:00:00 Europe/Berlin");
    $difference = differenceOfTime($now, $untilFinished);
    $inWords = secondsToArrayOrString($difference);
    ?>
    <div class="footer">
        <ul>
            <li> <a href="/">Startseite</a></li>
            <li><a href="/datenschutz.php">Datenschutzerklärung</a></li>
            <li><a href="/impressum.php">Impressum</a></li>
            <li><a href="/faq.php">Fragen? FAQ</a></li>
            <li><a href="/changes.php">Letzte Veränderungen</a></li>
        </ul>
        <div id="fullscreenContainer" class="fullscreenToggle"><span style="font-size: 1.3rem;">Zeit verbleibend bis zur Präsentation (27.04):</span><span id="timeLeftToPresentation" style="font-size: 2rem; color: white;"> <?php echo $inWords; ?></span></div>
        <div id="fullscreenContainer" class="fullscreenToggle"><span style="font-size: 1.3rem;">Zeit verbleibend bis zur Deutsch Prüfung:</span><span id="timeLeftToExams" style="font-size: 2rem; color: white;"></span></div>
        <div class="notice">Diese Webseite kann noch nicht produktiv eingesetzt werden, da einige Datenschutz und Sicherheitsbestimmungen noch nicht vollständig umgesetzt sind und umgesetzt werden können, daher ist beispielsweise im Impressum Max Mustermann angegeben.</div>
        <div class="version"><strong>Ver. 1.0</strong></div>
    </div>
</section>

<script type="module">
    import * as Utils from "./includes/utils.js";
    let updateTimeLeftPresentation = () => {
        let timeElement = document.getElementById("timeLeftToPresentation");

        let now = new Date();
        let enddate = new Date("Apr 27 2022 08:00:00 GMT+0100");
        let timeLeft  = (enddate - now) / 1000; //in seconds
        let timeLeftString = Utils.secondsToArrayOrString(timeLeft, "String");
        timeElement.innerHTML = timeLeftString;
    }
    let updateTimeLeftExams = () => {
        let timeElement = document.getElementById("timeLeftToExams");

        let now = new Date();
        let enddate = new Date("Jun 16 2022 08:00:00 GMT+0100");
        let timeLeft  = (enddate - now) / 1000; //in seconds
        let timeLeftString = Utils.secondsToArrayOrString(timeLeft, "String");
        timeElement.innerHTML = timeLeftString;
    }
    setInterval(() => {
        updateTimeLeftPresentation();
        updateTimeLeftExams();
    }, 1000);

    
</script>