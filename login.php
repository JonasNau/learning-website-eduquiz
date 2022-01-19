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

</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container d-flex flex-column">

        <div class="row d-flex justify-content-center">
            <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                <form id="loginForm">
                    <div class="mb-3">
                        <label for="username" class="form-label">Benutzername / E-Mail</label>
                        <input type="text" class="form-control" id="username" name="username" aria-describedby="emailHelp">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Passwort</label>
                        <input type="password" class="form-control showPasswordField" id="password" name="password">
                        <label for="showPassword" class="form-label">Passwort anzeigen</label>
                        <input type="checkbox" class="form-check-input" id="showPassword">
                    </div>
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="stayloggedIn" name="stayloggedIn">
                        <label class="form-check-label" for="stayloggedIn">Angemeldet beleiben</label>
                    </div>
                    <button type="submit" class="btn btn-primary" name="submitLogin">Anmelden</button>
                </form>
            </div>
        </div>
        <div class="row mt-4 d-flex justify-content-center">
            <div class="col-12 col-sm-10 col-md-9 col-lg-7">
                <a href="resetpassword.php">Passwort vergessen?</a>
            </div>
        </div>
        <div class="row mt-4 d-flex justify-content-center">
            <div class="col-12 col-sm-10 col-md-9 col-lg-7 ">
                <a href="signup.php">Noch keinen Account?</a>
            </div>
        </div>

        <?php
        require_once 'body-scripts.php';
        ?>
        <script type="module" defer>
            import * as Utils from '/includes/utils.js';

            let form = document.getElementById("loginForm");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                let username = form.querySelector("#username").value;
                let password = form.querySelector("#password").value;
                let stayLoggedIn = form.querySelector("#stayloggedIn").checked;

                let response = Utils.makeJSON(await Utils.sendXhrREQUEST("POST", "submitLogin&username=" + username + "&password=" + password + "&stayloggedIn=" + JSON.stringify(stayLoggedIn), "includes/userSystem/login.inc.php", "application/x-www-form-urlencoded", true, true, true, true, false));
                if (response["status"] == "success") {
                    form.reset();
                }
                return true;

            });
        </script>
</body>

</html>