<?php

require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");
require_once("includes/generalFunctions.php");
require_once("includes/dbh.incPDO.php");

if (!isLoggedIn()) {
    if (!isset($_COOKIE["cookieConsent"])) {
?>
        <script type="module" defer>
            //Cookie Consent
            import * as Utils from "./includes/utils.js";

            export async function cookieOk() {
                let now = new Date(); // Aktuelles Datum
                let nowSeconds = now.getSeconds(); // Millisekunden seit 1970 bis heute
                let expires = await Utils.getSettingVal("CookieConsentTime");
                const expiresDate = new Date();
                expiresDate.setTime(expiresDate.getTime() + (expires*24*60*60*1000));
                console.log(expiresDate)
                console.log("Cookie expires:", expiresDate)
                
                Utils.setCookie("cookieConsent", `Set until ${expiresDate}`, expires);
                document.getElementById("cookieConsent").classList.add("hidden");
            }

            let cookieBanner = document.createElement("div");
            cookieBanner.setAttribute("id", "cookieConsent");
            cookieBanner.innerHTML = `
<div id="cookie-popup">
<div class="cookie-popup-inner">
<div class="hinweis">
<p>Wir verwenden Cookies. Durch die weitere Nutzung der Webseite stimmen Sie der Verwendung von Cookies zu.</p>
</div> 
<div class="row">
<div class="col-md-6 text-center">
<button id="ok">OK, ich bin einverstanden.</button>
</div>
<div class="col-md-6 text-center">
<span class="more">
<a href="/datenschutz.php">Details</a>
</span>
</div>				
</div>
</div>
</div>
`;
            document.body.appendChild(cookieBanner);

            let okBtn = cookieBanner.querySelector("#ok");
            okBtn.addEventListener("click", () => {
                cookieOk();
            })

            
        </script>
<?php
    }
}

$database = new Dbh();
$conn = $database->connect();

?>

<script>

</script>