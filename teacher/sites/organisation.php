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

require_once("../includes/organisationFunctions.inc.php");
repairDatabaseValues($conn);

if (userHasPermissions($conn, $userID, ["accessOrganisation" => gnVP($conn, "accessOrganisation")])) {
    logWrite($conn, "organisationLOG", "$username hat die Organisation betreten.", true, false, []);
?>
    <link rel="stylesheet" href="./css/organisation.css">
    <div class="container" id="organisationContainer">
        <h2>Organisation</h2>
        <p>Hier ist es möglich Klassenstufen zu verwalten, Fächer zu erstellen, Themen zu verwalten und vieles mehr.</p>
        <section>
            <div class="row">
                <h3 id="overwiew">Übersicht</h3>
                <p>Hier bekommst du eine Übersicht über die Struktur der Webseite von den erstellten Quizzen.</p>
                <div id="overwiewContainer">
                    <div id="uI">
                    <button class="btn btn-info" id="reloadOverview">Neuladen</button>
                    </div>
                    <div id="listContainer">

                    </div>
                </div>
        </section>
        <section>
            <div id="klassenstufenVerwaltung">
                <h3>Klassenstufenverwaltung</h3>
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
                            <option data-value="showQuizauswahl">Bei der Quizauswahl zeigen</option>
                            <option data-value="userCanBe">Benutzer kann annehmen</option>
                            <option data-value="quizCanBeCreated">Quiz mit der Klassenstufe kann erstellt werden</option>
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
                        <div class="mt-2" id="showQuizauswahl">
                            <label for="selectInput" class="form-label">Filtern nach "Bei der Quizauswahl zeigen"</label>
                            <select class="form-select" aria-label="Default select example" id="selectInput">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="1" value="1">Ja</option>
                                <option data-value="0">Nein</option>
                            </select>
                        </div>
                        <div class="mt-2" id="userCanBe">
                            <label for="selectInput" class="form-label">Filtern nach "Benutzer kann annehmen"</label>
                            <select class="form-select" aria-label="Default select example" id="selectInput">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="1" value="1">Ja</option>
                                <option data-value="0">Nein</option>
                            </select>
                        </div>
                        <div class="mt-2" id="quizCanBeCreated">
                            <label for="selectInput" class="form-label">Filtern nach "Quiz mit der Klassenstufe kann erstellt werden"</label>
                            <select class="form-select" aria-label="Default select example" id="selectInput">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="1" value="1">Ja</option>
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
                                <th id="name">Name</th>
                                <th id="showQuizauswahl">Bei Quizauswahl angezeigt</th>
                                <th id="userCanBe">Benutzer kann annehmen</th>
                                <th id="quizCanBeCreated">Quiz mit der Klassenstufe kann erstellt werden</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                <td id="name">Klasse 10</td>
                                <td id="showQuizauswahl" class="no">Nein</td>
                                <td id="userCanBe" class="yes">Ja</td>
                                <td id="quizCanBeCreated" class="yes">Ja</td>
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
                                    <th id="showQuizauswahl"><span>Bei Quizauswahl angezeigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                    <th id="userCanBe"><span>Benutzer kann annehmen</span><button type="button" id="changeAll">alle
                                            ändern</button></th>
                                    <th id="quizCanBeCreated"><span>Quiz mit der Klassenstufe kann erstellt werden</span><button type="button" id="changeAll">alle ändern</button></th>
                                    <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                            Entfernen</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="name">Klasse 10<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                    <td id="showQuizauswahl">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                    <td id="userCanBe">Nein<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                    <td id="quizCanBeCreated">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                    <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </section>
        <section>


            <div id="klassenstufenBackupVerwaltung">
                <h3>Klassenstufenverwaltung (Backup-Klassenstufen)</h3>
                <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                <button class="btn btn-info" id="reload">Neuladen</button>
                <div class="filter ">
                    <div id="chooseFilterTypeContainer">
                        <label for="chooseFilter" class="form-label">Filtern nach</label>
                        <select id="chooseFilter" class="form-select">
                            <option data-value="" selected="selected">Auswahl</option>
                            <option data-value="name">Name</option>
                            <option data-value="klassenstufeBefore">Vorherige Klassenstufe</option>
                            <option data-value="quizzesAvailable">Quize noch vorhanden</option>
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
                            <label for="textInput" class="form-label">Filtern nach Backup-Name</label>
                            <input type="text" id="textInput" class="form-control" placeholder="z.B. 21.12.201-1-Klasse 10" autocomplete="off">
                        </div>
                        <div class="mt-2" id="klassenstufeBefore">
                            <label for="textInput" class="form-label">Filtern nach dem vorherigen Namen</label>
                            <input type="text" id="textInput" class="form-control" placeholder="z.B. Klasse 10" autocomplete="off">
                        </div>
                        <div class="mt-2" id="quizzesAvailable">
                            <label for="selectInput" class="form-label">Filtern nach "Quize noch vorhanden"</label>
                            <select class="form-select" aria-label="Default select example" id="selectInput">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="1" value="1">Ja</option>
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
                                <th id="name">Name der Backup-Klassenstufe</th>
                                <th id="klassenstufeBefore">Vorheriger Name</th>
                                <th id="deletedAt">Gelöscht am und um</th>
                                <th id="quizzesAvailable">Anzahl der verfügbaren Quizze</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                <td id="name"></td>
                                <td id="klassenstufeBefore"></td>
                                <td id="deletedAt"></td>
                                <td id="quizzesAvailable"></td>
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
                                    <th id="klassenstufeBefore"><span>Name der Backup-Klassenstufe</span></th>
                                    <th id="deletedAt"><span>Gelöscht am und um</span></th>
                                    <th id="quizzesAvailable"><span>Verfügbare Quizze</span></th>
                                    <th id="recover">Wiederherstellen</th>
                                    <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                            Entfernen</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="name">Klasse 10<span></span></td>
                                    <td id="klassenstufeBefore">Ja<span></span></td>
                                    <td id="deletedAt">Nein<span></span></td>
                                    <td id="quizzesAvailable">Ja<span></span></td>
                                    <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
                                    <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </section>
        <section>
            <div class="row">
                <div id="faecherVerwaltung">
                    <h3>Fächerverwaltung</h3>
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
                                <option data-value="showQuizauswahl">Bei der Quizauswahl zeigen</option>
                                <option data-value="quizCanBeCreated">Quiz mit dem Fach kann erstellt werden</option>
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
                            <div class="mt-2" id="showQuizauswahl">
                                <label for="selectInput" class="form-label">Filtern nach "Bei der Quizauswahl zeigen"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="quizCanBeCreated">
                                <label for="selectInput" class="form-label">Filtern nach "Quiz mit dem Fach kann erstellt werden"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
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
                                    <th id="name">Name</th>
                                    <th id="showQuizauswahl">Bei Quizauswahl angezeigt</th>
                                    <th id="quizCanBeCreated">Quiz mit der Klassenstufe kann erstellt werden</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name">Klasse 10</td>
                                    <td id="showQuizauswahl" class="no">Nein</td>
                                    <td id="quizCanBeCreated" class="yes">Ja</td>
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
                                        <th id="showQuizauswahl"><span>Bei Quizauswahl angezeigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="quizCanBeCreated"><span>Quiz mit dem Fach kann erstellt werden</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name">Klasse 10<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="showQuizauswahl">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="quizCanBeCreated">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
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
                <div id="faecherBackupVerwaltung">
                    <h3>Fächerverwaltung (Backup-Fächer)</h3>
                    <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="name">Name</option>
                                <option data-value="fachBefore">Vorheriges Fach</option>
                                <option data-value="quizzesAvailable">Quize noch vorhanden</option>
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
                                <label for="textInput" class="form-label">Filtern nach Backup-Name</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 21.12.201-1-Klasse 10" autocomplete="off">
                            </div>
                            <div class="mt-2" id="fachBefore">
                                <label for="textInput" class="form-label">Filtern nach dem vorherigen Namen</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Klasse 10" autocomplete="off">
                            </div>
                            <div class="mt-2" id="quizzesAvailable">
                                <label for="selectInput" class="form-label">Filtern nach "Quize noch vorhanden"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
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
                                    <th id="name">Name des Backup-Faches</th>
                                    <th id="fachBefore">Vorheriger Name</th>
                                    <th id="deletedAt">Gelöscht am und um</th>
                                    <th id="quizzesAvailable">Anzahl der verfügbaren Quizze</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name"></td>
                                    <td id="fachBefore"></td>
                                    <td id="deletedAt"></td>
                                    <td id="quizzesAvailable"></td>
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
                                        <th id="fachBefore"><span>Name des Backup-Faches</span></th>
                                        <th id="deletedAt"><span>Gelöscht am und um</span></th>
                                        <th id="quizzesAvailable"><span>Verfügbare Quizze</span></th>
                                        <th id="recover">Wiederherstellen</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name">Klasse 10<span></span></td>
                                        <td id="fachBefore">Ja<span></span></td>
                                        <td id="deletedAt">Nein<span></span></td>
                                        <td id="quizzesAvailable">Ja<span></span></td>
                                        <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
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
                <div id="themenVerwaltung">
                    <h3>Themenverwaltung</h3>
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
                                <option data-value="showQuizauswahl">Bei der Quizauswahl zeigen</option>
                                <option data-value="quizCanBeCreated">Quiz mit dem Thema kann erstellt werden</option>
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
                            <div class="mt-2" id="showQuizauswahl">
                                <label for="selectInput" class="form-label">Filtern nach "Bei der Quizauswahl zeigen"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
                                    <option data-value="0">Nein</option>
                                </select>
                            </div>
                            <div class="mt-2" id="quizCanBeCreated">
                                <label for="selectInput" class="form-label">Filtern nach "Quiz mit dem Thema kann erstellt werden"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
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
                                    <th id="name">Name</th>
                                    <th id="showQuizauswahl">Bei Quizauswahl angezeigt</th>
                                    <th id="quizCanBeCreated">Quiz mit dem Thema kann erstellt werden</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name">Klasse 10</td>
                                    <td id="showQuizauswahl" class="no">Nein</td>
                                    <td id="quizCanBeCreated" class="yes">Ja</td>
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
                                        <th id="showQuizauswahl"><span>Bei Quizauswahl angezeigt</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="quizCanBeCreated"><span>Quiz mit dem Thema kann erstellt werden</span><button type="button" id="changeAll">alle ändern</button></th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <!-- <td id="name">Klasse 10<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="showQuizauswahl">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="quizCanBeCreated">Ja<span></span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
                                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td> -->
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
                <div id="themenBackupVerwaltung">
                    <h3>Themenverwaltung (Backup-Themen)</h3>
                    <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                    <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                    <button class="btn btn-info" id="reload">Neuladen</button>
                    <div class="filter ">
                        <div id="chooseFilterTypeContainer">
                            <label for="chooseFilter" class="form-label">Filtern nach</label>
                            <select id="chooseFilter" class="form-select">
                                <option data-value="" selected="selected">Auswahl</option>
                                <option data-value="name">Name</option>
                                <option data-value="themaBefore">Vorheriges Fach</option>
                                <option data-value="quizzesAvailable">Quize noch vorhanden</option>
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
                                <label for="textInput" class="form-label">Filtern nach Backup-Name</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. 21.12.201-1-Klasse 10" autocomplete="off">
                            </div>
                            <div class="mt-2" id="themaBefore">
                                <label for="textInput" class="form-label">Filtern nach dem vorherigen Namen</label>
                                <input type="text" id="textInput" class="form-control" placeholder="z.B. Quadratische Funktionen" autocomplete="off">
                            </div>
                            <div class="mt-2" id="quizzesAvailable">
                                <label for="selectInput" class="form-label">Filtern nach "Quize noch vorhanden"</label>
                                <select class="form-select" aria-label="Default select example" id="selectInput">
                                    <option data-value="" selected="selected">Auswahl</option>
                                    <option data-value="1" value="1">Ja</option>
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
                                    <th id="name">Name des Backup-Faches</th>
                                    <th id="themaBefore">Vorheriger Name</th>
                                    <th id="deletedAt">Gelöscht am und um</th>
                                    <th id="quizzesAvailable">Anzahl der verfügbaren Quizze</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                                    <td id="name"></td>
                                    <td id="themaBefore"></td>
                                    <td id="deletedAt"></td>
                                    <td id="quizzesAvailable"></td>
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
                                        <th id="themaBefore"><span>Vorheriger Name</span></th>
                                        <th id="deletedAt"><span>Gelöscht am und um</span></th>
                                        <th id="quizzesAvailable"><span>Verfügbare Quizze</span></th>
                                        <th id="recover">Wiederherstellen</th>
                                        <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                                Entfernen</button></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="name">Klasse 10<span></span></td>
                                        <td id="themaBefore">Ja<span></span></td>
                                        <td id="deletedAt">Nein<span></span></td>
                                        <td id="quizzesAvailable">Ja<span></span></td>
                                        <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
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


    <script src="./js/organisation.js?v=<?php echo getNewestVersion(); ?>" type="module" defer></script>

<?php
} else {
    echo "Keine Berechtigung";
}

?>