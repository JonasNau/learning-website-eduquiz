<?php
if (!isset($_SESSION["open"])) {
  header("location: /teacher");
  die();
}
unset($_SESSION["open"]);

if (!isLoggedIn()) {
  echo "Du musst dafür angemeldet sein";
  die();
}
$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

updateOnlineStatus($conn);
connectedClientsUpdateOnlineStatus($conn);

$totalUsers = getTotal($conn, "SELECT COUNT(userID) as total FROM users;");
$authenticatedUsers = getTotal($conn, "SELECT COUNT(authenticated) as total FROM users WHERE authenticated = 1;");
$usersOnline = getNumOnlineUsers($conn);
$clientsConnected = getNumOnlineClients($conn);


?>



<link rel="stylesheet" href="./css/home.css?v=<?php echo  getNewestVersion(); ?>">
<h1>Hallo <?php echo $username ?>, dies ist die Startseite des Lehrerpanels!</h1>

<div class="row">
  <div class="col">
    <div class="card-box">
      <div class="heading">Benutzer</div>
      <hr>
      <div class="description"><?php echo $totalUsers ?></div>
    </div>
  </div>
  <div class="col">
    <div class="card-box">
      <div class="heading">Authentifizierte Benutzer <?php
                                                      echo "(" . round(($authenticatedUsers / $totalUsers) * 100, 1) . "%)";
                                                      ?>
      </div>
      <hr>
      <div class="description"><?php echo $authenticatedUsers ?></div>
    </div>
  </div>
  <div class="col">
    <div class="card-box">
      <div class="heading">Online</div>
      <hr>
      <div class="description"><?php echo $usersOnline ?></div>
    </div>
  </div>
  <div class="col">
    <div class="card-box">
      <div class="heading">Clients Verbunden</div>
      <hr>
      <div class="description"><?php echo $clientsConnected ?></div>
    </div>
  </div>
</div>
<div class="row">
  <h2>Hinweise</h2>
  <h3>Erreichen verschiedener Seiten</h3>
  <p>Über die Navigationsleiste kann durch ein Klick auf die jeweiligen Bereiche des Lehrerpanels zugegriffen werden. Es werden nur Bereiche gezeigt, wofür man Berechtigungen hat.</p>
  <h3>Tastenkombinationen</h3>
  <p>Über die Tastenkombinationen können verschiedene Funktionen und Bereiche erreicht werden. Funktioniert etwas nicht, so hast du dafür keine Berechtigung.</p>
  <ul id="keyBindingsList">
    <li><kbd class="keyBinding" data-action="pickUsers" alt="Tastenkombination - Benutzer auswählen ALT + u">ALT + u (U)</kbd> Hier kann man Benutzer suchen, z.B. mit der UserID</li>
  </ul>
  <script type="module" defer>
    import * as Utils from "/includes/utils.js";

    let keyBindingsList = document.querySelector("#keyBindingsList");
    let keyBindings = keyBindingsList.querySelectorAll(".keyBinding");
    console.log(keyBindings);
    for (const current of keyBindings) {
      current.addEventListener("click", async () => {
        let action = current.getAttribute("data-action");
        if (action === "pickUsers") {
          if (!Utils.userHasPermissions(["accessBenutzerverwaltung"])) {
            Utils.permissionDENIED();
            return false;
          }
          Utils.pickUsers();
        }
      });
    }
  </script>
</div>