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
                                <option data-value="path">Pfad / URL</option>
                                <option data-value="id">id</option>
                                <option data-value="mediaID">MediaID</option>
                                <option data-value="keywords">Schlüsselwörter</option>
                                <option data-value="isOnlineSource">ist eine Onlinequelle</option>
                                <option data-value="inMediaFolder">Im Media-Ordner</option>
                                <option data-value="uploaded">Hochgeladen am / um</option>
                                <option data-value="changed">Geändert am / um</option>
                                <option data-value="isBlob">ist "BLOB"</option>
                                <option data-value="thumbnail">Vorschaubild vorhanden (Nur bei Videos)</option>
                                <option data-value="thumbnailIsBlob">Vorschaubild ist "BLOB"</option>
                                <option data-value="thumbnailFileName">Vorschaubild - Dateiname</option>
                                <option data-value="thumbnailMimeType">Vorschaubild - MIME-Type</option>
                                <option data-value="thumbnailIsOnlineSource">Vorschaubild - ist eine Onlinequelle</option>
                                <option data-value="thumbnailPath">Vorschaubild - Dateipfad / URL</option>
                                <option data-value="thumbnailInMediaFolder">Vorschaubild - Im Media-Ordner</option>
                                <option data-value="uploadedBy">Hochgeladen von</option>
                                <option data-value="changedBy">Geändert von</option>
                                <option data-value="multiple">mehreres</option>
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
                                <button type="button" class="btn btn-primary" id="addBtn">Inhaltstyp hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="path">
                                <label for="textInput" class="form-label">Filtern nach Dateipfad / URL</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. https://wikipedia.org/..." autocomplete="off">
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
                            <div class="mt-2" id="isOnlineSource">
                                <label for="selectInput" class="form-label">Filtern nach "ist eine Oninequelle"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="inMediaFolder">
                                <label for="selectInput" class="form-label">Filtern nach "Im Media-Ordner"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="isBlob">
                                <label for="selectInput" class="form-label">Filtern nach "ist BLOB"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="thumbnail">
                                <label for="selectInput" class="form-label">Filtern nach "Vorschaubild vorhanden (Nur bei Videos)"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="thumbnailIsBlob">
                                <label for="selectInput" class="form-label">Filtern nach "Vorschaubildist BLOB"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="thumbnailFileName">
                                <label for="textInput" class="form-label">Filtern nach "Vorschaubild - Dateiname"</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Erlenmeyerkolben-preview.png" autocomplete="off">
                            </div>
                            <div class="mt-2" id="thumbnailMimeType">
                                <label for="selectInput" class="form-label">Filtern nach Vorschaubild - Inhaltstyp (MIME-Type)</label>
                                <button type="button" class="btn btn-primary" id="addBtn">Inhaltstyp hinzufügen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="thumbnailIsOnlineSource">
                                <label for="selectInput" class="form-label">Filtern nach "Vorschaubild - ist eine Oninequelle"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="thumbnailPath">
                                <label for="textInput" class="form-label">Filtern nach Vorschaubild - Dateipfad / URL</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. https://wikipedia.org/..." autocomplete="off">
                            </div>
                            <div class="mt-2" id="thumbnailInMediaFolder">
                                <label for="selectInput" class="form-label">Filtern nach "Vorschaubild - Im Media-Ordner"</label>
                                <select class="form-select" aria-label="Typ Filter Auswahl" id="selectInput">
                                    <option data-value="">Auswahl</option>
                                    <option data-value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="uploaded">
                                <label for="textInput" class="form-label">Filtern nach "Hochgeladen am / um"</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 05-02-2022 12:00:21.2432423" autocomplete="off">
                            </div>
                            <div class="mt-2" id="uploadedBy">
                                <label for="addBtn" class="form-label">Filtern nach "erstellt von"</label>
                                <button class="btn btn-sm btn-primary" id="addBtn">Auswahl</button>
                                <button class="btn btn-sm btn-danger" id="removeBtn">Entfernen</button>
                                <div id="choosen"></div>
                            </div>
                            <div class="mt-2" id="changed">
                                <label for="textInput" class="form-label">Filtern nach "Geändert am / um"</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 06-02-2022 12:00:21.2432423" autocomplete="off">
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
                        <table class="styled-table shrinkMedia" id="resultTable">
                            <thead>
                                <tr>
                                    <th id="select" style="min-width: 150px;">
                                        <div class="heading">Ausgewählt</div>
                                        <hr>
                                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                                    </th>
                                    <th id="data">
                                        <span class="heading">Daten</span>
                                        <span><input type="checkbox" id="checkbox" checked="checked">Verkleinerte Ansicht</span>
                                    </th>
                                    <th id="description" style="min-width: 300px;">Beschreibung</td>
                                    <th id="keywords" style="min-width: 200px;">Schlüsselwörter</th>
                                    <th id="isOnlineSource">Ist eine Onlinequelle</th>
                                    <th id="type">Typ</th>
                                    <th id="mimeType">Inhaltstyp (MIME-Type)</th>
                                    <th id="isBlob">Ist BLOB (direkt in der Datenbank)</th>
                                    <th id="path" style="min-width: 200px;">Pfad / URL</th>
                                    <th id="inMediaFolder">Im Media-Ordner</th>
                                    <th id="uploaded">Hochgeladen am / um</th>
                                    <th id="changed">Geändert am / um</th>
                                    <th id="filename" style="min-width: 200px;">Dateiname</th>
                                    <th id="id">id</th>
                                    <th id="mediaID">mediaID</th>
                                    <th id="thumbnail">Hat eine Miniaturansicht (Nur bei Videos)</th>
                                    <th id="thumbnailData">Miniaturansicht</th>
                                    <th id="thumbnailFileName">Miniaturansicht - Dateiname</th>
                                    <th id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</th>
                                    <th id="thumbnailIsOnlineSource">Miniaturansicht - Ist eine Onlinequelle</th>
                                    <th id="thumbnailIsBlob">Miniaturansicht - Ist BLOB</th>
                                    <th id="thumbnailPath">Miniaturansicht - Pfad / URL</th>
                                    <th id="thumbnailInMediaFolder">Miniaturansicht - Pfad / URL</th>
                                    <th id="fileSize">Dateigröße</th>
                                    <th id="uploadedBy">Hochgeladen von</th>
                                    <th id="changedBy">Geändert von</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="data">Beschreibung</td>
                                    <td id="description" style="min-width: 300px;">Beschreibung</td>
                                    <td id="keywords" style="min-width: 200px;">Schlüsselwörter</td>
                                    <td id="isOnlineSource">Ist eine Onlinequelle</td>
                                    <td id="type">Typ</td>
                                    <td id="mimeType">Inhaltstyp (MIME-Type)</td>
                                    <td id="isBlob">Ist BLOB (direkt in der Datenbank)</td>
                                    <td id="path" style="min-width: 200px;">Pfad</td>
                                    <td id="inMediaFolder">Im Media-Ordner</td>
                                    <td id="uploaded">Hochgeladen am / um</td>
                                    <td id="changed">Geändert am / um</td>
                                    <td id="filename" style="min-width: 200px;">Dateiname</th>
                                    <td id="id">id</td>
                                    <td id="mediaID">mediaID</td>
                                    <td id="thumbnail">Hat eine Miniaturansicht (Nur bei Videos)</th>
                                    <td id="thumbnailData">Miniaturansicht</td>
                                    <td id="thumbnailFileName">Miniaturansicht - Dateiname</td>
                                    <td id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</td>
                                    <td id="thumbnailIsOnlineSource">Miniaturansicht - Ist eine Onlinequelle</td>
                                    <td id="thumbnailIsBlob">Miniaturansicht - Ist BLOB</td>
                                    <td id="thumbnailPath">Miniaturansicht - Pfad / URL</td>
                                    <td id="thumbnailInMediaFolder">Miniaturansicht - Pfad / URL</td>
                                    <td id="fileSize">Dateigröße</td>
                                    <td id="uploadedBy">Hochgeladen von</td>
                                    <td id="changedBy">Geändert von</td>
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
                            <table class="table styled-table shrinkMedia" id="editTable">
                                <thead>
                                    <tr>
                                        <th id="data">
                                            <span class="heading">Daten</span>
                                            <span><input type="checkbox" id="checkbox" checked="checked">Verkleinerte Ansicht</span>
                                        </th>
                                        <th id="description" style="min-width: 300px;"><span>Beschreibung</span><button type="button" id="changeAll">alle ändern</button></td>
                                        <th id="keywords" style="min-width: 200px;"><span>Schlüsselwörter</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="isOnlineSource"><span>Ist eine Onlinequelle</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="type">Typ</th>
                                        <th id="mimeType">Inhaltstyp (MIME-Type)</th>
                                        <th id="isBlob">Ist BLOB (direkt in der Datenbank)</th>
                                        <th id="path" style="min-width: 200px;"><span>Pfad / URL</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="inMediaFolder"><span>Im Media-Ordner</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="uploaded">Hochgeladen am / um</th>
                                        <th id="changed">Geändert am / um</th>
                                        <th id="filename" style="min-width: 200px;">Dateiname</th>
                                        <th id="id">id</th>
                                        <th id="mediaID">mediaID</th>
                                        <th id="thumbnail">Hat eine Miniaturansicht (Nur bei Videos)</th>
                                        <th id="thumbnailData"><span>Miniaturansicht</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thumbnailFileName"><span>Miniaturansicht - Dateiname</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thumbnailMimeType">Miniaturansicht - Inhaltstyp (MIME-Type)</th>
                                        <th id="thumbnailIsOnlineSource"><span>Miniaturansicht - Ist eine Onlinequelle</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thumbnailIsBlob">Miniaturansicht - Ist BLOB</th>
                                        <th id="thumbnailPath"><span>Miniaturansicht - Pfad / URL</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="thumbnailInMediaFolder"><span>Miniaturansicht - Im Media-Ordner</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="fileSize">Dateigröße</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="removeAll">alle
                                                Entfernen</button></th>


                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="data">
                                            <div class="content"></div>
                                            <div class="change"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></div>
                                        </td>
                                        <td id="description"><span>Erlenmeyerkolben auf einem Tisch.</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="keywords" style="min-width: 200px;"></td>
                                        <td id="isOnlineSource">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="type">image</td>
                                        <td id="mimeType">image/jepg</td>
                                        <td id="isBlob">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="path"><span>/media</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="inMediaFolder">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="uploaded">05-02-2022 22:22:00.2432423</td>
                                        <td id="changed">06-02-2022 22:22:00.2432423</td>
                                        <td id="filename" style="min-width: 200px;">
                                            <span>Erlenmeyerkolben.jpg</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button>
                                        </td>
                                        <td id="id">id</td>
                                        <td id="mediaID"> <span>28974932eurkfk3</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="thumbnail">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="thumbnailData">
                                            <div class="dataContent"></div>
                                            <div class="change"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></div>
                                        </td>
                                        <td id="thumbnailFileName"><span>Erlenmeyerkolben-preview.jpg</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="thumbnailMimeType">image/jepg</td>
                                        <td id="thumbnailIsOnlineSource">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="thumbnailIsBlob">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="thumbnailPath"><span>/thumbnails</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="thumbnailInMediaFolder">
                                            <span>Ja</span>
                                            <label class="switch">
                                                <input type="checkbox" id="checkbox">
                                                <span class="slider round"></span>
                                            </label>
                                        </td>
                                        <td id="fileSize">22434</td>
                                        <th id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
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