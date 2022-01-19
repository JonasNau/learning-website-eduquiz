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

if (userHasPermissions($conn, $userID, ["accessBerechtigungsverwaltung" => 1])) {

?>
    <link rel="stylesheet" href="./css/benutzerverwaltung.css">
    <div class="container" id="berechtigungsverwaltungContainer">
        <h2>Berechtigungsverwaltung</h2>
        <p>Hier ist es möglich Berechtigungen zu ändern, sowie Gruppen zu bearbeiten.</p>
        <section>
            <div class="row">
                <div id="berechtigungsVerwaltung">
                    <h3>Berechtigungen verwalten</h3>
                    <button class="btn btn-secondary" id="addBtn">Hinzufügen</button>
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
                                <option data-value="ranking">Rang</option>
                                <option data-value="normalValue">Normaler Wer für Ja</option>
                                <option data-value="usedAt">Benutzt bei</option>
                                <option data-value="hinweis">Hinweis</option>
                                <option data-value="id">id</option>
                                <option data-value="customID">customID</option>
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
                                    <!-- Insert all Types That are available -->
                                </select>
                            </div>
                            <div class="mt-2" id="description">
                                <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Wird benötigt, um das Lehrerpanel zu betreten." autocomplete="off">
                            </div>
                            <div class="mt-2" id="ranking">
                                <label for="numberInput" class="form-label">Filtern nach Rang</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
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
                            <div class="mt-2" id="hinweis">
                                <label for="textInput" class="form-label">Filtern nach Hinweis</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. mit Bedacht..." autocomplete="off">
                            </div>
                            <div class="mt-2" id="customID">
                                <label for="textInput" class="form-label">Filtern nach customID (Nur ein jeweils zugewiesener Zahlenwert, um die Berechtigung besser zu finden)</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 25" autocomplete="off">
                            </div>
                            <div class="mt-2" id="id">
                                <label for="numberInput" class="form-label">Filtern nach id (Fester Wert, der in Aufsteigender Reihenfolge bei Erstellung von Berechtigungen generiert wird.</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" placeholder="z.B. 22" autocomplete="off">
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
                    <div class="overflow-auto">
                        <table class="styled-table" id="resultTable">
                            <thead>
                                <tr>
                                    <th id="select">
                                        <div class="heading">Ausgewählt</div>
                                        <hr>
                                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                                    </th>
                                    <th id="name">Name</th>
                                    <th id="type">Typ</th>
                                    <th id="description">Beschreibung</td>
                                    <th id="ranking">Rang</th>
                                    <th id="normalValue">Normaler Wert für Ja</th>
                                    <th id="usedAt">Benutzt bei</th>
                                    <th id="hinweis">Hinweis</th>
                                    <th id="id">id</th>
                                    <th id="customID">customID</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name">accessLeherpanel</td>
                                    <td id="type">Lehrer</td>
                                    <td id="description">Wird benötigt, um das Lehrerpanel zu betreten.</td>
                                    <td id="ranking">1</td>
                                    <td id="normalValue">1</td>
                                    <td id="usedAt">Lehrerpanel</td>
                                    <td id="hinweis">Grundvorraussetzung, um das Lehrerpanel zu betreten.</td>
                                    <td id="id">id</td>
                                    <td id="customID">customID</td>
                                </tr>
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
                                        <th id="name">Name</th>
                                        <th id="type"><span>Typ</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="description">Beschreibung</td>
                                        <th id="ranking"><span>Rang</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="normalValue"><span>Normaler Wert für Ja</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="usedAt"><span>Benutzt bei</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="hinweis">Hinweis</th>
                                        <th id="id">id</th>
                                        <th id="customID">customID</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name"><span>accessLeherpanel</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="type"><span>Lehrer</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="description"><span>Wir benötigt, um das Lehrerpanel zu betreten.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="ranking"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="normalValue"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="usedAt"><span id="list">Lehrerpanel</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="hinweis"><span>Grundvorraussetzung, um das Lehrerpanel zu betreten.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">id</td>
                                        <td id="customID"><span>customID</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>

                                    </tr>

                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>

        </section>
        <section>
            <div class="row">
                <div id="gruppenVerwaltung">
                    <h3>Gruppen verwalten</h3>
                    <button class="btn btn-secondary" id="addBtn">Hinzufügen</button>
                    <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="name">Name</option>
                                <option data-value="description">Beschreibung</option>
                                <option data-value="ranking">Rang</option>
                                <option data-value="id">id</option>
                                <option data-value="permissionsAllowed">Berechtigung (erlaubt)</option>
                                <option data-value="permissionsForbidden">Berechtigung (verboten)</option>
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
                            <div class="mt-2" id="description">
                                <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Wird benötigt, um das Lehrerpanel zu betreten." autocomplete="off">
                            </div>
                            <div class="mt-2" id="ranking">
                                <label for="numberInput" class="form-label">Filtern nach Rang</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>
                            <div class="mt-2" id="id">
                                <label for="numberInput" class="form-label">Filtern nach id (Fester Wert, der in Aufsteigender Reihenfolge bei Erstellung von Gruppen generiert wird.</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" placeholder="z.B. 7" autocomplete="off">
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
                            <div class="mt-2" id="limitResults">
                                <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>

                        </div>
                        <button type="button" class="btn btn-primary" id="search" style="position: relative"><span>Suchen</span></button>
                    </div>
                    <div class="resultDesciption">

                    </div>
                    <div class="overflow-auto">
                        <table class="styled-table" id="resultTable">
                            <thead>
                                <tr>
                                    <th id="select">
                                        <div class="heading">Ausgewählt</div>
                                        <hr>
                                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                                    </th>
                                    <th id="name">Name</th>
                                    <th id="description">Beschreibung</td>
                                    <th id="ranking">Rang</th>
                                    <th id="permissionsAllowed">Berechtigungen (erlaubt)</th>
                                    <th id="permissionsForbidden">Berechtigungen (verboten)</th>
                                    <th id="id">id</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name">accessLeherpanel</td>
                                    <td id="description">Wird benötigt, um das Lehrerpanel zu betreten.</td>
                                    <td id="ranking">1</td>
                                    <td id="permissionsAllowed">Berechtigungen (erlaubt)</td>
                                    <td id="permissionsForbidden">Berechtigungen (verboten)</td>
                                    <td id="id">id</td>
                                </tr>
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
                                        <th id="name">Name</th>
                                        <th id="description">Beschreibung</td>
                                        <th id="ranking">Rang</th>
                                        <th id="permissionsAllowed"><span>Berechtigungen (erlaubt)</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="permissionsForbidden"><span>Berechtigungen (verboten)</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="id">id</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name"><span>accessLeherpanel</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="description"><span>Wir benötigt, um das Lehrerpanel zu betreten.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="ranking"></td>
                                        <td id="permissionsAllowed">Berechtigungen (erlaubt)</td>
                                        <td id="permissionsForbidden">Berechtigungen (verboten)</td>
                                        <td id="id">id</td>
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


    <script src="./js/berechtigungsverwaltung.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>