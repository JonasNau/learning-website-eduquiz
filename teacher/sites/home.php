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
<h1>Hallo <?php echo $username ?>, dies ist die Statseite des Lehrerpanels!</h1>

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
