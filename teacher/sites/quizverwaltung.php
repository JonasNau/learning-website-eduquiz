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
    <link rel="stylesheet" href="./css/quizverwaltung.css">
    <div class="container" id="quizverwaltungsContainer">
        <h2>Quizverwaltung</h2>
        <p>Hier ist es möglich Quizze zu suchen und zu bearbeiten, sie zu bearbeiten und auch gegebenenfalls zu löschen. Das wird der meist genutzte Bereich des Lehrerpanels sein.</p>
        <section>
            <div class="row">
                <div id="quizverwaltung">
                    <h3>Quizze verwalten</h3>
                    <button class="btn btn-secondary" id="addBtn">Quiz erstellen</button>
                    <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="showQuizAuswahl">Bei der Quzauswahl angezeigt</option>
                                <option data-value="visibility">Sichtbarkeit</option>
                                <option data-value="klassenstufe">Klassenstufe</option>
                                <option data-value="fach">Fach</option>
                                <option data-value="thema">Thema</option>
                                <option data-value="name">Name</option>
                                <option data-value="description">Beschreibung</option>
                                <option data-value="quizId">quizId</option>
                                <option data-value="id">id</option>
                                <option data-value="requireKlassenstufe">Klassenstufe erzwungen</option>
                                <option data-value="requireFach">Fach erzwungen</option>
                                <option data-value="requireThema">Thema erzwungen</option>
                                <option data-value="requireName">Name erzwungen</option>
                                <option data-value="questions">Fragen enthalten</option>
                                <option data-value="numberOfQuizCards">Anzahl der Fragen</option>
                                <option data-value="created">Erstelldatum</option>
                                <option data-value="createdBy">Erstellt von</option>
                                <option data-value="changed">Änderungsdatum</option>
                                <option data-value="changedBy">Geändert durch</option>
                                <option data-value="all">Alle anzeigen</option>
                                <option data-value="multiple">Mehreres</option>
                            </select>
                        </div>
                        <div class="selectionFilters">
                            <div id="other">
                                <div id="searchWhileTyping">
                                    <label for="allowSearchWhileTyping">Während der Eingabe suchen</label>
                                    <input type="checkbox" id="allowSearchWhileTyping">
                                </div>
                            </div>
                            <div class="mt-2" id="showQuizAuswahl">
                                <label for="selectInput" class="form-label">Filtern nach bei der Quizauswahl anzeigen</label>
                                <select class="form-select" aria-label="Bei der Quizauswahl anzeigen" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="visibility">
                                <label for="selectInput" class="form-label">Filtern nach bei Sichtbarkeit</label>
                                <select class="form-select" aria-label="Bei der Quizauswahl anzeigen" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">sichtbar</option>
                                    <option data-value="0">unsichtbar</option>
                                </select>
                            </div>
                            <div class="mt-2" id="klassenstufe">
                                <label for="selectInput" class="form-label">Filtern nach Klassenstufe</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="fach">
                                <label for="selectInput" class="form-label">Filtern nach Fach</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="thema">
                                <label for="selectInput" class="form-label">Filtern nach Thema</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="name">
                                <label for="textInput" class="form-label">Filtern nach Name</label>
                                <input type="text" id="textInput" class="form-control" autocomplete="off">
                            </div>
                            <div class="mt-2" id="description">
                                <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Dieses Quiz hilft dir dabei, dich in der Zeichensetzung zu verbessern!" autocomplete="off">
                            </div>
                            <div class="mt-2" id="questions">
                                <label for="selectInput" class="form-label">Filtern nach enthaltenen Fragen</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="quizId">
                                <label for="textInput" class="form-label">Filtern nach quizId</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 23452b4-43" autocomplete="off">
                            </div>
                            <div class="mt-2" id="id">
                                <label for="numberInput" class="form-label">Filtern nach id (Fester Wert, der in Aufsteigender Reihenfolge bei Erstellung von Quizzen generiert wird.</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" placeholder="z.B. 22" autocomplete="off">
                            </div>
                            <div class="mt-2" id="requireKlassenstufe">
                                <label for="selectInput" class="form-label">Filtern nach "Klassenstufe benötigt"</label>
                                <select class="form-select" aria-label="Klassenstufe benötigt" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="requireFach">
                                <label for="selectInput" class="form-label">Filtern nach "Fach benötigt"</label>
                                <select class="form-select" aria-label="Fach benötigt" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="requireThema">
                                <label for="selectInput" class="form-label">Filtern nach "Thema benötigt"</label>
                                <select class="form-select" aria-label="Thema benötigt" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="requireName">
                                <label for="selectInput" class="form-label">Filtern nach "Name benötigt"</label>
                                <select class="form-select" aria-label="Name benötigt" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="numberOfQuizCards">
                                <label for="numberInput" class="form-label">Filtern nach "Anzahl der Fragen"</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                            </div>
                            <div class="mt-2" id="created">
                                <label for="textInput" class="form-label">Filtern nach Erstelldatum</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 12.01.2022" autocomplete="off">
                            </div>
                            <div class="mt-2" id="createdBy">
                                <label for="addBtn" class="form-label">Filtern nach "erstellt von"</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <button class="btn btn-sm btn-danger" id="removeBtn">Entfernen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="changed">
                                <label for="textInput" class="form-label">Filtern nach Änderungsdatum</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 12.01.2022" autocomplete="off">
                            </div>
                            <div class="mt-2" id="changedBy">
                                <label for="addBtn" class="form-label">Filtern nach "bearbeitet von"</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <button class="btn btn-sm btn-danger" id="removeBtn">Entfernen</button>
                                <div id="choosen"></div>
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
                                    <th id="klassenstufe">Klassenstufe</th>
                                    <th id="fach">Fach</th>
                                    <th id="thema">Thema</th>
                                    <th id="description">Beschreibung</th>
                                    <th id="quizId">quizId</th>
                                    <th id="id">id</th>
                                    <th id="showQuizAuswahl">Bei der Quizauswahl anzeigen</th>
                                    <th id="visibility">Verfügbarkeitsstatus</th>
                                    <th id="requireKlassenstufe">Klassenstufe wird benötigt</th>
                                    <th id="requireFach">Fach wird benötigt</th>
                                    <th id="requireThema">Thema wird benötigt</th>
                                    <th id="requireName">Name wird benötigt</th>
                                    <th id="questions">Fragen</th>
                                    <th id="lastUsed">zuletzt Benutzt</th>
                                    <th id="created">Erstelldatum</th>
                                    <th id="createdBy">erstellt von</th>
                                    <th id="changed">Änderungsdatum</th>
                                    <th id="changedBy">geändert von</th>


                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name">Name</td>
                                    <td id="klassenstufe">Klassenstufe</th>
                                    <td id="fach">Fach</td>
                                    <td id="thema">Thema</td>
                                    <td id="description">Beschreibung</td>
                                    <td id="quizId">quizId</td>
                                    <td id="id">id</td>
                                    <td id="showQuizAuswahl">Bei der Quizauswahl anzeigen</td>
                                    <td id="visibility">Verfügbarkeitsstatus</td>
                                    <td id="requireKlassenstufe">Klassenstufe wird benötigt</td>
                                    <td id="requireFach">Fach wird benötigt</td>
                                    <td id="requireThema">Thema wird benötigt</td>
                                    <td id="requireName">Name wird benötigt</td>
                                    <td id="questions">Fragen</td>
                                    <td id="lastUsed">12.01.2022</td>
                                    <td id="created">18.09.2021</td>
                                    <td id="createdBy">Benutzername: Jonas</td>
                                    <td id="changed">18.09.2021</td>
                                    <td id="changedBy">Benutzername: Jonas</td>
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

                                        <th id="name"><span>Name</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="quizData">Quizdaten</th>
                                        <th id="klassenstufe"><span>Klassenstufe</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="fach"><span>Fach</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thema"><span>Thema</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="description"><span>Beschreibung</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="quizId">quizId</th>
                                        <th id="id">id</th>
                                        <th id="showQuizAuswahl"><span>Bei der Quizauswahl anzeigen</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="visibility"><span>Bei dem Nutzer angezeigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="requireKlassenstufe"><span>Klassenstufe wird benötigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="requireFach"><span>Fach wird benötigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="requireThema"><span>Thema wird benötigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="requireName"><span>Name wird benötigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="questions">Fragen</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    
                                    <td id="name"><span>Zeichensetzung 1 (Komma bei Aufzählungen)</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="quizData"><span>Quiz bearbeiten</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="klassenstufe"><span>Klassenstufe</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="fach"><span>Fach</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="thema"><span>Thema</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="description"><span>Dieses Quiz hilft dir, dich in der Zeichensetzung zu verbessern, viel Erfolg!</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="quizId"><span>quizId</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="id">id</td>
                                    <td id="showQuizAuswahl"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="visibility"><span>1</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="requireKlassenstufe"><span>Klassenstufe wird benötigt</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="requireFach"><span>Fach wird benötigt</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="requireThema"><span>Thema wird benötigt</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="requireName"><span>Name wird benötigt</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                    <td id="questions">.</td>
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


    <script src="./js/quizverwaltung.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>