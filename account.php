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
require_once("includes/userSystem/functions/email-functions.php");
require_once("includes/userSystem/activateAccount.inc.php");

require_once("./global.php");
?>
<?php


require_once("./header-start.php");


if (!isLoggedIn()) {
    $_SESSION["message"] = "Melde dich an, um deine Account Details anzusehen.";
    header("Location: /login.php");
    die();
}

$database = new Dbh();
$conn = $database->connect();

$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

$confirmed = "Nein";
$addEmail = false;
$changeEmail = true;

accountExists($conn, $userID);

if (getParameterFromUser($conn, $userID, "authenticated", "userID") == "1") {
    $confirmed = "Ja";
    $email = getParameterFromUser($conn, $userID, "email", "userID");
    $addEmail = false;
    $changeEmail = true;
} else {
    $changeEmail = false;
    $confirmed = "Nein";
    if (hasAskedForActivation($conn, $userID, "userID")) {
        if (confirmAccountExpired($conn, $userID, "userID")) {
            $email = "Deine Anfrage zum Aktivieren des Accounts ist Abgelaufen. Klicke auf 'Email hinufügen / Account Aktivieren'.";
            $addEmail = true;
        } else {
            $confirmEmail = getParameterFromConfirmAccount($conn, "email", $userID, "userID");
            $expires = getParameterFromConfirmAccount($conn, "expires", $userID, "userID");
            $email = "Bestätigung ausstehend für: $confirmEmail. Gültig bis: $expires. <a href='/includes/userSystem/sendNewToken.php'>erneut senden</a>";
        }
    } else {
        $email = "nicht hinzugefügt";
        $addEmail = true;
    }
}

$klassenstufe = getParameterFromUsername($conn, $username, "klassenstufe");
$gruppen = getAllGroupsFromUser($conn, $userID);
$gruppenText = "";
if ($gruppen && count($gruppen) > 0) {
    $gruppenText = implode(", ", $gruppen);
}




?>
<link rel="stylesheet" href="/css/account.css">
</head>

<body>
    <?php
    require_once 'navigation-bar.php';
    ?>
    <div class="container accountContainer">
        <div class="accountOptionen">
            <ul class="nav justify-content-center">
                <li class="nav-item">
                    <button class="nav-link active" data-toggle="userdata" aria-current="page">Benutzerdaten</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-toggle="scores">Scores</button>
                </li>
            </ul>
            <hr>
            <div class="content">
                <div id="accountDetails">
                    <ul class="details">
                        <li><b>Nutzername</b>: <?php echo $username ?> <span><a href="changeUsername.php" class="changeEmail">ändern?</a></span></li>
                        <li><b>Email</b>: <?php echo $email ?>
                            <?php
                            if ($changeEmail) {
                            ?>
                                <span class="changeEmail"><a href="removeEmail.php">ändern?</a></span>
                            <?php
                            }
                            ?>
                        </li>
                        <?php
                        if ($addEmail) {
                        ?>
                            <li class="addEmail"><a href="addEmail.php">Email hinzufügen / Account Aktivieren</a></li>
                        <?php
                        }
                        ?>

                        <li><b>Bestätigt</b>: <?php echo $confirmed ?></li>
                        <li><b>Klassenstufe</b>:
                            <span class="usersGrade">

                            </span>
                        </li>
                        <li><b>Berechtigung</b>: <?php echo $gruppenText ?></li>
                    </ul>
                    <div class="otherOptions">
                        <a href="changePassword.php" class="link">Passwort ändern</a>
                        <a href="removeEmail.php" class="link">Email entfernen</a>
                        <a href="./includes/userSystem/unauthorizeAllDevices.inc.php" class="link">Von allen Geräten abmelden</a>
                        <a href="deleteAccount.php" class="link deleteAccount">Account löschen</a>
                    </div>
                </div>
                <div id="scores" class="hidden">
                    <h3>Deine Ergebnisse</h3>
                    <p>Hier bekommst du eine Übersicht über deine Ergebnisse in Tabellenform. Du kannst dir alle anzeigen lassen, filtern und vieles mehr. Viel Erfolg!</p>
                    <div class="container" id="scoreVerwaltung">
                        <div class="filter">
                            <div id="chooseFilterTypeContainer">
                                <label for="chooseFilter" class="form-label">Filtern nach</label>
                                <select id="chooseFilter" class="form-select">
                                    <option data-value="all">Alle anzeigen</option>
                                    <option data-value="date">Zeitspanne</option>
                                    <option data-value="klassenstufe">Klassenstufe</option>
                                    <option data-value="fach">Fach</option>
                                    <option data-value="thema">Thema</option>
                                    <option data-value="quizname">Quizname</option>
                                    <option data-value="quizID">QuizID</option>
                                    <option data-value="timeNeeded">Zeit benötigt</option>
                                    <option data-value="result">Ergebnis</option>
                                    <option data-value="multiple">Mehreres</option>
                                </select>
                            </div>


                            <div class="selectionFilters">
                                <div id="other">
                                    <div id="searchWhileTyping">
                                        <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                                        <input type="checkbox" id="allowSearchWhileTyping">
                                    </div>
                                </div>
                                <div class="mt-2" id="result">
                                    <label for="selectInput" class="form-label">Filtern nach Ergebnis</label>
                                    <select class="form-select" aria-label="Bestätigt Filter" id="selectInput">
                                        <option data-value="" selected="selected">Auswahl</option>
                                        <option data-value="bestFirst">bestes zuerst</option>
                                        <option data-value="worstFirst">schlechtestes zuerst</option>
                                    </select>
                                </div>
                                <div class="mt-2" id="date">
                                    <label class="form-label">Filtern nach Zeitraum</label>
                                    <br>
                                    <label for="startDate" class="form-label">Startdatum:</label>
                                    <input type="date" id="startDate">
                                    <label for="endDate" class="form-label">Enddatum:</label>
                                    <input type="date" id="endDate">
                                </div>
                                <div class="mt-2" id="klassenstufe">
                                    <label for="select" class="form-label">Filtern nach Klassenstufe (Oder):</label>
                                    <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                    <div id="choosen"></div>
                                </div>
                                <div class="mt-2" id="fach">
                                    <label for="select" class="form-label">Filtern nach Fach (Oder):</label>
                                    <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                    <div id="choosen"></div>
                                </div>
                                <div class="mt-2" id="thema">
                                    <label for="select" class="form-label">Filtern nach Thema (Oder):</label>
                                    <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                    <div id="choosen"></div>
                                </div>
                                <div class="mt-2" id="quizname">
                                    <label for="textInput" class="form-label">Filtern nach Quizname</label>
                                    <input type="text" id="textInput" class="form-control" autocomplete="off">
                                </div>
                                <div class="mt-2" id="quizID">
                                    <label for="textInput" class="form-label">Filtern nach QuizID</label>
                                    <input type="text" id="textInput" class="form-control" autocomplete="off">
                                </div>
                                <div class="mt-2" id="timeNeeded">
                                    <label class="form-label">Filtern nach Zeit benötigt</label>
                                    <br>
                                    <label for="from" class="form-label">von</label>
                                    <input type="number" id="from" name="numberInput" min="0" placeholder="0" autocomplete="off">
                                    <label for="to" class="form-label">bis</label>
                                    <input type="number" id="to" name="numberInput" min="0" placeholder="60" autocomplete="off">
                                    <label for="to" class="form-label">In Sekunden</label>
                                </div>
                                <div class="mt-2" id="limitResults">
                                    <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                                    <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                                </div>
                            </div>


                            <button type="button" class="btn btn-primary" id="search" style="position: relative"><span>Suchen</span></button>
                            <button class="btn btn-info" id="reload">Neuladen</button>
                        </div>
                        <div class="resultDesciption">

                        </div>
                        <style>
                            .copyQuizID-wrapper {
                                width: 120px !important;
                                height: 40px !important;
                            }
                        </style>
                        <div class="overflow-auto">
                            <table class="styled-table" id="resultTable">
                                <thead>
                                    <tr>
                                        <th id="date" style="min-width: 150px;">Datum & Uhrzeit</th>
                                        <th id="results" style="min-width: 300px;">Ergebnis</th>
                                        <th id="klassenstufe">Klassenstufe</th>
                                        <th id="fach">Fach</th>
                                        <th id="thema" style="min-width: 300px;">Thema</th>
                                        <th id="quizname" style="min-width: 300px;">Quizname</th>
                                        <th id="quizID" style="min-width: 300px;">QuizID</th>
                                        <th id="actions" style="min-width: 150px;">Weitere Aktionen</th>
                                        <th id="information">Weitere Information</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Results -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</body>

</html>

<?php
require_once 'footer.php';
require_once 'body-scripts.php';
?>
<script src="includes/account.inc.js?v=?<?php echo  getNewestVersion(); ?>" type="module" defer></script>
</body>

</html>