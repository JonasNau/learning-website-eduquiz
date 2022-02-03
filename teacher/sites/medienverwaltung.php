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

if (userHasPermissions($conn, $userID, ["accessMediaVerwaltung" => gnVP($conn, "accessMediaVerwaltung")])) {

?>
    <link rel="stylesheet" href="./css/medienverwaltung.css">
    <div class="container" id="medienverwaltungsContainer">
        <h2>Medienverwaltung</h2>
        <p>Hier gibt es eine Übersicht aller Medien, wie Bilder, Videos und Audios, um ein doppeltes Hochladen und Speicherplatz zu sparen.</p>
        <section>
            <div class="row">
                <div id="medienverwaltung">
                    <h3>Medien verwalten</h3>
                    <button class="btn btn-secondary" id="addBtn">Hinzufügen (Hochladen)</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="filename">Dateiname</option>
                                <option data-value="description">Beschreibung</option>
                                <option data-value="type">Medientyp (Bild, Video, Audio)</option>
                                <option data-value="mimeType">Inhaltstyp (Content-Type / MIME-Type)</option>
                                <option data-value="id">id</option>
                                <option data-value="mediaID">MediaID</option>
                                <option data-value="keywords">Schlüsselwörter</option>
                                <option data-value="onFilesystem">auf dem Dateisystem (nicht als BLOB in Datenbank)</option>
                                <option data-value="multiple">mehreres</option>
                                <option data-value="all">Alle anzeigen</option>
                                <!-- Later on add feature to filter by image -->
                            </select>
                        </div>
                        <div class="selectionFilters">
                            <div id="other">
                                <div id="searchWhileTyping">
                                    <label for="allowSearchWhileTyping">Während der Eingabe suchen</label>
                                    <input type="checkbox" id="allowSearchWhileTyping">
                                </div>
                            </div>
                            <div class="mt-2" id="filename">
                                <label for="textInput" class="form-label">Filtern nach Dateiname</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Erlenmeyerkolben.png" autocomplete="off">
                            </div>
                            <div class="mt-2" id="description">
                                <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. leerer Erlenmeyerkolben auf einem Tisch" autocomplete="off">
                            </div>
                            <div class="mt-2" id="type">
                            <label for="addBtn" class="form-label">Filtern nach Typ</label>
                                <button type="button" class="btn btn-primary" id="addBtn">Typ hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="mimeType">
                                <label for="selectInput" class="form-label">Filtern nach Inhaltstyp (MIME-Type)</label>
                                <button type="button" class="btn btn-primary" id="addBtn">Schlüsselwort hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="id">
                                <label for="numberInput" class="form-label">Filtern nach id (Fester Wert, der in Aufsteigender Reihenfolge bei Erstellung von Berechtigungen generiert wird.)</label>
                                <input type="number" id="numberInput" name="numberInput" min="0" placeholder="z.B. 22" autocomplete="off">
                            </div>
                            <div class="mt-2" id="mediaID">
                                <label for="textInput" class="form-label">Filtern nach MediaID</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 53gt4tgg4t3tegdfge" autocomplete="off">
                            </div>
                            <div class="mt-2" id="keywords">
                                <label for="addBtn" class="form-label">Filtern nach Schlüsselwörtern</label>
                                <button type="button" class="btn btn-primary" id="addBtn">Schlüsselwort hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="onFilesystem">
                                <label for="selectInput" class="form-label">Filtern nach "auf dem Dateisystem"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
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
                                    <th id="data">Daten</th>
                                    <th id="fileName" style="min-width: 200px;">Dateiname</th>
                                    <th id="description" style="min-width: 300px;">Beschreibung</td>
                                    <th id="type">Typ</th>
                                    <th id="mimeType">Inhaltstyp (MIME-Type)</th>
                                    <th id="id">id</th>
                                    <th id="mediaID">mediaID</th>
                                    <th id="keywords" style="min-width: 200px;">Schlüsselwörter</th>
                                    <th id="thumbnail">Miniaturansicht</th>
                                    <th id="thumbnailFileName">Miniaturansicht - Dateiname</th>
                                    <th id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</th>
                                    <th id="onFilesystem">Auf dem Dateisystem</th>
                                    <th id="fileSize">Dateigröße</th>
                                    <th id="uploaded">Hochgeladen</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="data"><img src="../../images/logo.png"></td>
                                    <td id="fileName">Erlenmeyerkolben-01.jpg</td>
                                    <td id="description">Erlenmeyerkolben auf einem Tisch.</td>
                                    <td id="type">Bild</td>
                                    <td id="mimeType">image/jepg</td>
                                    <td id="id">1</td>
                                    <td id="mediaID">mediaID</td>
                                    <td id="keywords">Erlenmeyerkolben, Chemie</td>
                                    <td id="thumbnail">Miniaturansicht</td>
                                    <td id="thumbnailFileName">Miniaturansicht - Dateiname</td>
                                    <td id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</td>
                                    <td id="onFilesystem">Ja</td>
                                    <td id="fileSize">1,7 MB</td>
                                    <td id="uploaded">22.2.2022</td>
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
                                        <th id="data">Daten</th>
                                        <th id="fileName" style="min-width: 200px;">Dateiname</th>
                                        <th id="description" style="min-width: 300px;">Beschreibung</td>
                                        <th id="type">Typ</th>
                                        <th id="mimeType">Inhaltstyp (MIME-Type)</th>
                                        <th id="id">id</th>
                                        <th id="mediaID">mediaID</th>
                                        <th id="keywords" style="min-width: 200px;"><span>Schlüsselwörter</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thumbnail">Miniaturansicht</th>
                                        <th id="thumbnailFileName">Miniaturansicht - Dateiname</th>
                                        <th id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</th>
                                        <th id="onFilesystem">Auf dem Dateisystem</th>
                                        <th id="fileSize">Dateigröße</th>
                                        <th id="uploaded">Hochgeladen</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="data"><img src="../../images/logo.png"></td>
                                        <td id="fileName"><span>Erlenmeyerkolben-01.jpg</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="description"><span>Erlenmeyerkolben auf einem Tisch.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="type">Bild</td>
                                        <td id="mimeType">image/jepg</td>
                                        <td id="id">1</td>
                                        <td id="mediaID">4e5345345eege43t</td>
                                        <td id="keywords"><span id="list">Chemie, Erlenmeyerkolben</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="hinweis"><span>Grundvorraussetzung, um das Lehrerpanel zu betreten.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="id">id</td>
                                        <td id="customID"><span>customID</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="onFilesystem">Ja</td>
                                        <td id="fileSize">1,7 MB</td>
                                        <td id="uploaded">22.2.2022</td>
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


    <script src="./js/medienverwaltung.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>