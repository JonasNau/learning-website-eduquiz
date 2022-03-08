<?php
require_once("./includes/generalFunctions.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/generalFunctions.php");
require_once("./includes/dbh.incPDO.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/getSettings.php");

require_once("./global.php");
?>

<?php
require_once 'header-start.php';


if (isLoggedIn()) {
    header("location: /account.php");
    die();
}
?>

</head>

<body>
    <?php
    require_once "navigation-bar.php";
    ?>

    <div class="container">
    
        <div class="row">
            <div class="col-11 col-md-9 col-lg-8 m-auto">
                <form action="includes/userSystem/signup.inc.php" method="post" id="signupform">
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="uid" class="form-label">Benutzername</label>
                            <input type="text" class="form-control" id="uid" name="username" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="password" class="form-label">Passwort</label>
                            <input type="password" class="form-control showPasswordField" id="password" name="password" oncopy="return false;" oncut="return false;" onpaste="return false;" required>
                            <label for="showPassword" class="form-label">Passwort anzeigen</label>
                            <input type="checkbox" class="form-check-input" id="showPassword">
                        </div>
                    </div>
                    <div class="form-group">
                        <p>Du bist dir nicht sicher, ob dein Passwort gut genug ist? <a href="https://checkdeinpasswort.de/">Bei checkdeinpasswort.de siehst du, wie lange ein Hacker zum Erraten brauchen würde</a></p>
                    </div>
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="passwordRepeat" class="form-label" required>Passwort wiederholen</label>
                            <input type="password" class="form-control showPasswordField" id="passwordRepeat" name="passwordRepeat" oncopy="return false;" oncut="return false;" onpaste="return false;" required>
                            <label for="showPassword" class="form-label">Passwort anzeigen</label>
                            <input type="checkbox" class="form-check-input" id="showPassword">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="mb-3">
                            <label for="email" class="form-label">E-Mail-Adresse <br>(Muss nicht, aber dann kannst du dein Passwort nicht zurücksetzen)</label>
                            <input type="email" class="form-control" id="email" name="email">
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="mb-3">
                            <label for="klasse-auswahl" class="form-label">Wähle deine Klassenstufe aus (Optional, für Vorschläge)</label>
                            <br>
                            <select id="klasse-auswahl" class="form-control" name="klasse" form="signinform">
                                <!--Hier werden die verfügbaren Klassenstufen angezeigt-->
                            </select>
                        </div>
                    </div>
                    <div class="form-group mb-3">
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="datenschutzOK" name="datenschutzOK">
                            <label class="form-check-label" for="datenschutz">Ich akzeptiere die <a href="datenschutz.php">Datenschutzbestimmungen</a>.</label>
                        </div>

                    </div>
                    <div class="form-group mt-4">
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="stayLoggedIn" name="stayLoggedIn">
                            <label class="form-check-label" for="stayloggedIn">Angemeldet beleiben</label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" name="submitSignup">Registrieren</button>
                </form>
            </div>
        </div>

    </div>

    <?php
    require_once 'body-scripts.php';
    ?>

    <script type="module" defer>
        import * as Utils from '/includes/utils.js';

        function getKlassen() {

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'includes/changeGrade.inc.php', true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            //Wenn Antwort
            xhr.onload = function() {
                if (this.status == 200) {


                    let valid = false;
                    let data = null;
                    //Check if valid response
                    if (Utils.IsJsonString(this.response)) {
                        var parsed = JSON.parse(this.response);
                        if (parsed.length > 0) {
                            valid = true;
                            data = parsed;
                        }
                    }
                    setKlassenauswahl(valid, data);


                }
            }

            xhr.send("getKlassenstufenUsersCanTake");

        }

        function setKlassenauswahl(valid, available) {
            const auswahlmenu = document.getElementById("klasse-auswahl");
            let auswahlInhalt = `<option value="" selected>Auswahl (keine Angabe)</option>`;

            if (valid === true) {
                //Konvertiret das Objet in ein Array
                available = Object.values(available);
                console.log("Dropdown Auswahl: ", available, available.length);

                //Sortiert die Klassenstufen in aufsteigender Reihenfolge
                available = available.sort((a, b) => a.localeCompare(b, undefined, {
                    numeric: true
                }));

                //Setzt verfügbare Klassenstufen in Auswahlmenü
                available.forEach(element => {
                    auswahlInhalt += `<option value='${element}'>${element}</option>`;
                });

            } else {
                //Setzt das in dem Array definierte in die Auswahlfelder
                let standard = ["Klasse 5", "Klasse 6", "Klasse 7", "Klasse 8", "Klasse 9", "Klasse 10"];
                standard.forEach(element => {
                    auswahlInhalt += `<option value='${element}'>${element}</option>`;
                });

            }
            //Setzt Ausgabe
            auswahlmenu.innerHTML = auswahlInhalt;


        }

        getKlassen();

        let signupform = document.getElementById("signupform");
        signupform.addEventListener("submit", async (e) => {
            e.preventDefault();
            let username = signupform.querySelector("#uid").value;
            let password = signupform.querySelector("#password").value;
            let passwordRepeat = signupform.querySelector("#passwordRepeat").value;
            let klassenstufe = signupform.querySelector("#klasse-auswahl").value;
            let email = signupform.querySelector("#email").value;
            let datenschutzOK = signupform.querySelector("#datenschutzOK").checked;
            let stayLoggedIn = signupform.querySelector("#stayLoggedIn").checked;


            let response = Utils.makeJSON(await Utils.sendXhrREQUEST("POST", "submitSignup&username=" + username + "&password=" + JSON.stringify({password}) + "&passwordRepeat=" + JSON.stringify({passwordRepeat}) + "&email=" + email + "&klasse=" + klassenstufe + "&stayLoggedIn=" + JSON.stringify(stayLoggedIn) + "&datenschutzOK=" + JSON.stringify(datenschutzOK), "includes/userSystem/signup.inc.php", "application/x-www-form-urlencoded", true, true, true, true, false));
            if (response["status"] == "success") {
                signupform.reset();
            }
            return true;
        });
    </script>
</body>

</html>