<section>
    <?php
    $now = new DateTime(getCurrentDateAndTime(1));
    $untilFinished = new DateTime("11-3-2022 08:00:00 Europe/Berlin");
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
        <div id="fullscreenContainer" class="fullscreenToggle"><span style="font-size: 1.3rem;">Zeit verbleibend bis zur Abgabe:</span><span id="timeLeft" style="font-size: 2rem; color: white;"> <?php echo $inWords; ?></span></div>
    </div>
</section>

<script type="module">
    import * as Utils from "./includes/utils.js";
    let update = () => {
        let timeElement = document.getElementById("timeLeft");

        let now = new Date();
        // console.log(now);
        let enddate = new Date(2022, 2, 11, 7, 0, 0, 0);

        let timeLeft  = (enddate - now) / 1000;
        let timeLeftString = Utils.secondsToArrayOrString(timeLeft, "String");
        timeElement.innerHTML = timeLeftString;
    }
    setInterval(() => {
        update();
    }, 1000);

    
</script>