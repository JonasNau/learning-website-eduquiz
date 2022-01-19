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

if (userHasPermissions($conn, $userID, ["accessBenutzerverwaltung" => 1])) {

?>
    <link rel="stylesheet" href="./css/benutzerverwaltung.css">
    <div class="container" id="benutzerverwaltungContainer">
        <h2>Benutzerverwaltung</h2>
        <p>Hier ist es möglich alle Benutzereinstellungen zu ändern, sowie Benutzer zu erstellen und zu löschen.</p>
        <section>
            <div class="row">
                <h3>Übersicht</h3>
                <p>Hier bekommt man eine Übersicht der Benutzer. Kann nach Gruppen Filtern und nach Nutzern suchen.</p>
                <div class="container" id="benutzerverwaltung">
                    <div class="filter">

                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="username">Benutzername</option>
                                <option data-value="groups">Gruppen</option>
                                <option data-value="email">Email</option>
                                <option data-value="isOnline">Onlinestatus</option>
                                <option data-value="userID">Benutzer ID</option>
                                <option data-value="authenticated">Bestätigt / Nicht bestätigt</option>
                                <option data-value="klassenstufe">Klassenstufe</option>
                                <option data-value="permissionsAllowed">Berechtigung (erlaubt)</option>
                                <option data-value="permissionsForbidden">Berechtigung (verboten)</option>
                                <option data-value="ranking">Rang</option>
                                <option data-value="multiple">Mehreres</option>
                                <option data-value="all">Alle anzeigen</option>
                            </select>
                        </div>


                        <div class="selectionFilters">
                            <div id="other">
                                <div id="searchWhileTyping">
                                    <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                                    <input type="checkbox" id="allowSearchWhileTyping">
                                </div>
                            </div>
                            <div class="mt-2" id="username">
                                <label for="textInput" class="form-label">Filtern nach Benutzername</label>
                                <input type="text" id="textInput" class="form-control" placeholder="Benutzername" autocomplete="off">
                            </div>
                            <div class="mt-2" id="email">
                                <label for="textInput" class="form-label">Filtern nach Email</label>
                                <input type="text" id="textInput" class="form-control" placeholder="Email" autocomplete="off">
                            </div>
                            <div class="mt-2" id="userID">
                                <label for="numberInput" class="form-label">Filtern nach UserID</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>
                            <div class="mt-2" id="ranking">
                                <label for="numberInput" class="form-label">Filtern nach Rang</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>
                            <div class="mt-2" id="klassenstufe">
                                <label for="select" class="form-label">Filtern nach Klassenstufe (Oder):</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="groups">
                                <label for="select" class="form-label">Filtern nach Gruppen (Und):</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                <ul id="choosen">

                                </ul>
                            </div>
                            <div class="mt-2" id="permissionsAllowed">
                                <label for="select" class="form-label">Filtern nach Berechtigungen (erlaubt):</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                <ul id="choosen">

                                </ul>
                            </div>
                            <div class="mt-2" id="permissionsForbidden">
                                <label for="select" class="form-label">Filtern nach Berechtigungen (verboten):</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                <ul id="choosen">

                                </ul>
                            </div>
                            <div class="mt-2" id="authenticated">
                                <label for="selectInput" class="form-label">Filtern nach "Bestätigtungsstatus"</label>
                                <select class="form-select" aria-label="Bestätigt Filter" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="isOnline">
                                <label for="selectInput" class="form-label">Filtern nach "Onlinestatus"</label>
                                <select class="form-select" aria-label="Bestätigt Filter" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Online</option>
                                    <option data-value="0">Offline</option>
                                </select>
                            </div>
                            <div class="mt-2" id="limitResults">
                                <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>
                        </div>


                        <button type="button" class="btn btn-primary" id="search" style="position: relative"><span>Suchen</span></button>
                        <button type="button" class="btn btn-secondary" id="editBtn">Ausgewählte Benutzer bearbeiten</button>
                        <button class="btn btn-info" id="reload">Neuladen</button>
                    </div>
                    <div class="resultDesciption">

                    </div>
                    <div class="overflow-auto">
                        <table class="styled-table" id="resultTable">
                            <thead>
                                <tr>
                                    <th>
                                        <div class="heading">Ausgewählt</div>
                                        <hr>
                                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                                    </th>
                                    <th id="username" style="min-width: 150px;">Username</th>
                                    <th id="email" style="min-width: 190px;">E-Mail</th>
                                    <th id="klassenstufe">Klassenstufe</th>
                                    <th id="authenticated">Verifiziert</th>
                                    <th id="isOnline">Onlinestatus</th>
                                    <th id="lastActivity" style="min-width: 150px;">Letzte Aktivität</th>
                                    <th id="lastQuiz" style="min-width: 200px;">Letztes Quiz</th>
                                    <th id="lastLogin" style="min-width: 150px;">Letzter Login</th>
                                    <th id="groups" style="min-width: 150px;">Gruppen</th>
                                    <th id="permissionsAllowed" style="min-width: 150px;">Berechtigungen (erlaubt)</th>
                                    <th id="permissionsForbidden" style="min-width: 150px;">Berechtigungen (verboten)</th>
                                    <th id="created" style="min-width: 150px;">Erstellt</th>
                                    <th id="lastPwdChange" style="min-width: 150px;">Passwort geändert</th>
                                    <th id="userID">UserID</th>
                                    <th id="nextMessages" style="min-width: 350px;">Ausstehende Nachrichten</th>
                                    <th id="ranking">Rang</th>
                                    <th id="showPublic">öffentlich anzeigen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Results -->
                            </tbody>
                        </table>
                    </div>
                    <div class="row" id="editContainer">
                        <h4>Bearbeiten</h4>
                        <div class="col-4">
                            <button class="btn btn-info btn-sm" id="reload">Neuladen</button>
                        </div>
                        <div class="overflow-auto" id="edit">
                            <table class="table styled-table" id="editTable">
                                <thead>
                                    <tr>
                                        <th id="userID">UserID</th>
                                        <th id="username" style="min-width: 150px;">Username</th>
                                        <th id="email" style="min-width: 170px;">E-Mail-Adresse</th>
                                        <th id="klassenstufe"><span>Klassenstufe</span><button type="button" id="changeAll">alle Ändern</button></th>
                                        <th id="authenticated"><span>Verifiziert</span><button type="button" id="changeAll">alle Ändern</button></th>
                                        <th id="groups"><span>Gruppen</span><button type="button" id="changeAll">alle Ändern</button></th>
                                        <th id="permissions"><span>Berechtigungen</span><button type="button" id="changeAll">alle Ändern</button></th>
                                        <th id="other"><span>Optionen</span><button type="button" id="btn">alle</button></th>
                                    </tr>
                                </thead>
                                <tbody>


                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

        </section>
        <section>
            <div class="row">
                <h3>Benutzer erstellen</h3>
                <div class="col">
                    <div id="createNewUser">
                        <form id="createNewUserForm">
                            <div class="form-group">
                                <div class="mb-3">
                                    <label for="uid" class="form-label">Benutzername</label required>
                                    <input type="text" class="form-control" id="uid" name="username" autocomplete="off">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="mb-3">
                                    <label for="password" class="form-label">Passwort</label required>
                                    <input type="text" class="form-control" id="password" name="password" autocomplete="off">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="mb-3">
                                    <label for="email" class="form-label">E-Mail-Adresse <br>(nicht notwendig)</label>
                                    <input type="email" class="form-control" id="email" name="email" autocomplete="off">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" name="submitSignup">Benutzer erstellen</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>



    </div>


    <script src="./js/benutzerverwaltung.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>