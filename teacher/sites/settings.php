<?php
if (!isset($_SESSION["open"])) {
    header("location: /teacher");
    die();
}
unset($_SESSION["open"]);

if (!isLoggedIn()) {
    $_SESSION["message"] = "Du musst dafür angemeldet sein";
    die();
}

$userID = $_SESSION["userID"];
$username = getParameterFromUser($conn, $userID, "username", "userID");

if (userHasPermissions($conn, $userID, ["accessSettings" =>  gnVP($conn, "accessSettings")])) {

?>
    <link rel="stylesheet" href="./css/settings.css">
    <div class="container" id="">
        <h2>Einstellungen</h2>
        <p>Hier ist es möglich Parameter an der Webseite zu ändern, sowie</p>
        <section>
            <div class="row">
                <div id="einstellungen">
                    <h3>Einstellungen treffen</h3>
                    <button class="btn btn-secondary" id="addBtn">Einstellung hinzufügen</button>
                    <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="name">Name</option>
                                <option data-value="type">Typ</option>
                                <option data-value="description">Beschreibung</option>
                                <option data-value="setting">Aktueller Einstellung</option>
                                <option data-value="normalValue">Normaler Wert</option>
                                <option data-value="id">id</option>
                                <option data-value="permissionNeeded">Benötigte Berechtigung</option>
                                <option data-value="usedAt">Benutzt bei</option>
                                <option data-value="all">Alle anzeigen</option>
                            </select>
                        </div>
                        <div class="selectionFilters">
                            <div id="other">
                                <div id="searchWhileTyping">
                                    <label for="allowSearchWhileTyping">Während der Eingabe suchen</label>
                                    <input type="checkbox" id="allowSearchWhileTyping">
                                </div>
                            </div>
                            <div class="mt-2" id="name">
                                <label for="textInput" class="form-label">Filtern nach Name</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel" autocomplete="off">
                            </div>
                            <div class="mt-2" id="type">
                                <label for="selectInput" class="form-label">Filtern nach Typ</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="switch">Schalter (an/aus)</option>
                                    <option data-value="text">Texteingabe</option>
                                    <option data-value="number">Nummerneingabe</option>
                                    <option data-value="executeSystem">Auf dem System ausführend</option>
                                    <option data-value="task">Aufgabe (z.B. Alle Benutzer abmelden)</option>
                                </select>
                            </div>
                            <div class="mt-2" id="description">
                                <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Wird benötigt, um das Lehrerpanel zu betreten." autocomplete="off">
                            </div>
                            <div class="mt-2" id="setting">
                                <label for="textInput" class="form-label">Filtern nach Einstellung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 1 oder /var/log/www/webseite" autocomplete="off">
                            </div>
                            <div class="mt-2" id="normalValue">
                                <label for="textInput" class="form-label">Filtern nach Normaler Wert für Ja</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 1" autocomplete="off">
                            </div>
                            <div class="mt-2" id="usedAt">
                                <label for="selectInput" class="form-label">Filtern nach "Benutzt bei"</label>
                                <select class="form-select" aria-label="Benutzt bei jener Seite Auswahlfeld" id="selectInput">
                                    <!-- Insert all usedAt locations That are available -->
                                </select>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="id">
                                <label for="numberInput" class="form-label">Filtern nach id (Fester Wert, der in Aufsteigender Reihenfolge bei Erstellung von Berechtigungen generiert wird.</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" placeholder="z.B. 22" autocomplete="off">
                            </div>
                            <div class="mt-2" id="permissionNeeded">
                                <button type="button" class="btn btn-primary btn-sm" id="set">Auswahl</button>
                                <div class="selected"></div>
                            </div>
                            <div class="mt-2" id="limitResults">
                                <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>

                        </div>
                        <button type="button" class="btn btn-primary" id="search" style="position: relative"><span>Suchen</span></button>
                    </div>
                    <div class="resultDesciption">

                    </div>
                    <div class="row" id="editContainer">
                        <h4>Bearbeiten</h4>

                        <div class="overflow-auto" id="edit">
                            <table class="table styled-table" id="editTable">
                                <thead>
                                    <tr>
                                        <th id="name">Name</th>
                                        <th id="setting" style="min-width: 350px;"><span>Einstellung</span></th>
                                        <th id="description">Beschreibung</td>
                                        <th id="normalValue">Normaler Wert</th>
                                        <th id="id">id</th>
                                        <th id="permissionNeeded">Benötigte Berechtigung</th>
                                        <th id="usedAt">Benutzt bei</th>
                                        <th id="min">Minimalwert</th>
                                        <th id="max">Maximalwert</th>
                                        <th id="remove"><span>Entfernen</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name">usersCanSignUp</td>
                                        <td id="setting">
                                            <!-- Rounded switch -->
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>

                                        </td>
                                        <td id="description"><span>Benutzer können sich registrieren.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">1</td>
                                        <td id="permissionNeeded"><span>SETTINGS_usersCanSignUp</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt">Global</td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>
                                    <tr>
                                        <!-- Text input -->
                                        <td id="name">servername</td>
                                        <td id="setting">
                                            <input type="text" class="form-control" id="textBox" value="eduquiz.ddns.net">
                                            <button type="button" class="btn btn-secondary btn-sm" id="set">Ändern</button>
                                        </td>
                                        <td id="description"><span>Servername, um z.B. die Funktionalität der E-Mail-Verifikation sicherzustellen.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>eduquiz.ddns.net</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">3</td>
                                        <td id="permissionNeeded"><span>SETTINGS_servername</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt">Global</td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>
                                    <tr>
                                        <!-- Text area -->
                                        <td id="name">welcomeMessage</td>
                                        <td id="setting">
                                            <textarea name="" id="textArea" cols="30" rows="10"></textarea>
                                            <button type="button" class="btn btn-secondary btn-sm" id="set">Ändern</button>
                                        </td>
                                        <td id="description"><span>Servername, um z.B. die Funktionalität der E-Mail-Verifikation sicherzustellen.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>eduquiz.ddns.net</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">3</td>
                                        <td id="permissionNeeded"><span>SETTINGS_servername</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt">Global</td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>
                                    <tr>
                                        <td id="name">usersCanSignUp</td>
                                        <td id="setting">
                                            <button type="button" class="btn btn-warning btn-sm" id="set">Ausführen</button>

                                        </td>
                                        <td id="description"><span>Benutzer können sich registrieren.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">1</td>
                                        <td id="permissionNeeded"><span>SETTINGS_usersCanSignUp</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt">Global</td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>
                                    <tr>
                                        <td id="name">restartServer</td>
                                        <td id="setting">
                                            <button type="button" class="btn btn-danger btn-sm" id="set">Ausführen</button>

                                        </td>
                                        <td id="description"><span>Benutzer können sich registrieren.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">1</td>
                                        <td id="permissionNeeded"><span>SETTINGS_usersCanSignUp</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt">Global</td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>

                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>

        </section>


    </div>


    <script src="./js/settings.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>