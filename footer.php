<section>
    <div class="footer">
        <ul>
            <li> <a href="/">Startseite</a></li>
            <li><a href="/datenschutz.php">Datenschutzerklärung</a></li>
            <li><a href="/impressum.php">Impressum</a></li>
            <li><a href="/faq.php">Fragen? FAQ</a></li>
            <li><a href="/changes.php">Letzte Veränderungen</a></li>
        </ul>
        <div id="fullscreenContainer" class="fullscreenToggle"><span style="font-size: 1.3rem;">Zeit verbleibend bis zur Deutsch Prüfung:</span><span id="timeLeftToExams" style="font-size: 2rem; color: white;"></span></div>
        <div class="version"><strong>Ver. 1.1</strong></div>
    </div>
</section>

<script type="module">
    import * as Utils from "./includes/utils.js";
    let updateTimeLeftExams = () => {
        let timeElement = document.getElementById("timeLeftToExams");

        let now = new Date();
        let enddate = new Date("Jun 16 2022 08:00:00");
        let timeLeft  = (enddate - now) / 1000; //in seconds
        let timeLeftString = Utils.secondsToArrayOrString(timeLeft, "String");
        timeElement.innerHTML = timeLeftString;
    }
    setInterval(() => {
        updateTimeLeftExams();
    }, 1000);

    
</script>