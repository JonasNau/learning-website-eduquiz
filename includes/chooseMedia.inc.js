import * as Utils from "/includes/utils.js";

export async function pickMedia(
  multiple = false,
  options = {
    allowedTypes: ["audio", "video", "image"],
  }
) {
  return new Promise(async function (resolve, reject) {
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }

    if (document.querySelector("#modalContainer") == null) {
      alert("no modal container found");
      reject();
    }
    let number = 1;
    let modals = modalContainer.querySelectorAll(".modal");
    console.log(modals);
    if (modals.length > 0) {
      number = modals.length + 1;
    }
    console.log("Number of Modals", number);

    let modalOuter = document.createElement("div");
    modalOuter.classList.add("modal-div");
    modalOuter.setAttribute("id", number);
    modalContainer.appendChild(modalOuter);

    let modalHTML = `
      <!-- Modal -->
      <style>
      table.shrinkMedia .mediaContainer > * {
        max-width: 35vw;
      }
      
      table .mediaContainer {
        word-wrap: break-word;
        /* word-break: break-all; */
      }
      </style>
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Medien auswählen ${Utils.valueToString(
              Boolean(options?.allowedTypes),
              {
                true: `${JSON.stringify(options?.allowedTypes, null, 2)}`,
                false: "",
              }
            )}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
          </div>
          <div class="modal-body">
           
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" id="no">Nein</button>
            <button type="button" class="btn btn-success" id="yes">Ja</button>
          </div>
        </div>
      </div>
      </div>
                   `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");
    let modalBody = modal.querySelector(".modal-body");

    modalBody.innerHTML = `
      <section>
      <div class="row">
          <div id="medienverwaltung">
              <h3>Medien verwalten</h3>
              <a type="button" class="btn btn-secondary" id="addBtn" href="/teacher/?route=/medienverwaltung&action=addMedia" target="_blank">Hinzufügen (Hochladen)</a>
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
                              <th id="select">
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
            </div>

          </div>
      </div>

  </section>
      `;

    //Class
    class Medienverwaltung {
      constructor(container, options) {
        this.userID = null;
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.filenameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.typeSelectContainer = null;
        this.choosenTypesArray = new Array();
        this.mimeTypeSelectContainer = null;
        this.choosenMimeypesArray = new Array();
        this.pathSelectContainer = null;
        this.idSelectContainer = null;
        this.mediaIDSelectContainer = null;
        this.keyWordsSelectContainer = null;
        this.keyWordsSearchArray = new Array();
        this.isOnlineSourceSelectContainer = null;
        this.inMediaFolderSelectContainer = null;
        this.uploadedSelectContainer = null;
        this.changedSelectContainer = null;
        this.isBlobSelectContainer = null;
        this.thumbnailSelectContainer = null;
        this.thumbnailIsBlobSelectContainer = null;
        this.thumbnailFileNameSelectContainer = null;
        this.thumbnailMimeTypeSelectContainer = null;
        this.thumbnailChoosenMimeypesArray = new Array();
        this.thumbnailIsOnlineSourceSelectContainer = null;
        this.thumbnailPathSelectContainer = null;
        this.thumbnailInMediaFolderSelectContainer = null;
        this.uploadedBySelectContainer = null;
        this.uploadedBySelected = false;
        this.changedBySelectContainer = null;
        this.changedFromArray = new Array();

        this.options = options;

        this.limiter = null;

        //others
        this.searchWhileTyping = false;

        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        this.resultDescriptionContainer = null;

        this.searchReloadBtn = null;
      }

      async prepareSearch() {
        if (!this.container) return "No container";

        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        if (!searchBtn) return "No searchBtn";
        this.searchBtn = searchBtn;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return "no chooseFilterTypeSelect";
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let filenameSelectContainer =
          selectionFiltersContainer.querySelector("#filename");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let typeSelectContainer =
          selectionFiltersContainer.querySelector("#type");
        let mimeTypeSelectContainer =
          selectionFiltersContainer.querySelector("#mimeType");
        let pathSelectContainer =
          selectionFiltersContainer.querySelector("#path");
        let idSelectContainer = selectionFiltersContainer.querySelector("#id");
        let mediaIDSelectContainer =
          selectionFiltersContainer.querySelector("#mediaID");
        let keyWordsSelectContainer =
          selectionFiltersContainer.querySelector("#keywords");
        let isOnlineSourceSelectContainer =
          selectionFiltersContainer.querySelector("#isOnlineSource");
        let inMediaFolderSelectContainer =
          selectionFiltersContainer.querySelector("#inMediaFolder");
        let uploadedSelectContainer =
          selectionFiltersContainer.querySelector("#uploaded");
        let changedSelectContainer =
          selectionFiltersContainer.querySelector("#changed");
        let isBlobSelectContainer =
          selectionFiltersContainer.querySelector("#isBlob");
        let thumbnailSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnail");
        let thumbnailIsBlobSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailIsBlob");
        let thumbnailFileNameSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailFileName");
        let thumbnailMimeTypeSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailMimeType");
        let thumbnailisOnlineSourceSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailIsOnlineSource");
        let thumbnailPathSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailPath");
        let thumbnailInMediaFolderSelectContainer =
          selectionFiltersContainer.querySelector("#thumbnailInMediaFolder");
        let uploadedBySelectContainer =
          selectionFiltersContainer.querySelector("#uploadedBy");
        let changedBySelectContainer =
          selectionFiltersContainer.querySelector("#changedBy");

        if (
          !filenameSelectContainer ||
          !descriptionSelectContainer ||
          !typeSelectContainer ||
          !mimeTypeSelectContainer ||
          !pathSelectContainer ||
          !idSelectContainer ||
          !mediaIDSelectContainer ||
          !keyWordsSelectContainer ||
          !isOnlineSourceSelectContainer ||
          !inMediaFolderSelectContainer ||
          !uploadedSelectContainer ||
          !changedSelectContainer ||
          !isBlobSelectContainer ||
          !thumbnailSelectContainer ||
          !thumbnailIsBlobSelectContainer ||
          !thumbnailFileNameSelectContainer ||
          !thumbnailMimeTypeSelectContainer ||
          !thumbnailisOnlineSourceSelectContainer ||
          !thumbnailPathSelectContainer ||
          !thumbnailInMediaFolderSelectContainer ||
          !uploadedBySelectContainer ||
          !changedBySelectContainer
        )
          return "Error in initializing Filters";
        this.filenameSelectContainer = filenameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.typeSelectContainer = typeSelectContainer;
        this.mimeTypeSelectContainer = mimeTypeSelectContainer;
        this.pathSelectContainer = pathSelectContainer;
        this.idSelectContainer = idSelectContainer;
        this.mediaIDSelectContainer = mediaIDSelectContainer;
        this.keyWordsSelectContainer = keyWordsSelectContainer;
        this.isOnlineSourceSelectContainer = isOnlineSourceSelectContainer;
        this.inMediaFolderSelectContainer = inMediaFolderSelectContainer;
        this.uploadedSelectContainer = uploadedSelectContainer;
        this.changedSelectContainer = changedSelectContainer;
        this.isBlobSelectContainer = isBlobSelectContainer;
        this.thumbnailSelectContainer = thumbnailSelectContainer;
        this.thumbnailIsBlobSelectContainer = thumbnailIsBlobSelectContainer;
        this.thumbnailFileNameSelectContainer =
          thumbnailFileNameSelectContainer;
        this.thumbnailMimeTypeSelectContainer =
          thumbnailMimeTypeSelectContainer;
        this.thumbnailIsOnlineSourceSelectContainer =
          thumbnailisOnlineSourceSelectContainer;
        this.thumbnailPathSelectContainer = thumbnailPathSelectContainer;
        this.thumbnailInMediaFolderSelectContainer =
          thumbnailInMediaFolderSelectContainer;
        this.uploadedBySelectContainer = uploadedBySelectContainer;
        this.changedBySelectContainer = changedBySelectContainer;

        //hide all
        this.filenameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.typeSelectContainer.classList.add("hidden");
        this.mimeTypeSelectContainer.classList.add("hidden");
        this.pathSelectContainer.classList.add("hidden");
        this.idSelectContainer.classList.add("hidden");
        this.mediaIDSelectContainer.classList.add("hidden");
        this.keyWordsSelectContainer.classList.add("hidden");
        this.isOnlineSourceSelectContainer.classList.add("hidden");
        this.inMediaFolderSelectContainer.classList.add("hidden");
        this.uploadedSelectContainer.classList.add("hidden");
        this.changedSelectContainer.classList.add("hidden");
        this.isBlobSelectContainer.classList.add("hidden");
        this.thumbnailSelectContainer.classList.add("hidden");
        this.thumbnailIsBlobSelectContainer.classList.add("hidden");
        this.thumbnailFileNameSelectContainer.classList.add("hidden");
        this.thumbnailMimeTypeSelectContainer.classList.add("hidden");
        this.thumbnailIsOnlineSourceSelectContainer.classList.add("hidden");
        this.thumbnailPathSelectContainer.classList.add("hidden");
        this.thumbnailInMediaFolderSelectContainer.classList.add("hidden");
        this.uploadedBySelectContainer.classList.add("hidden");
        this.changedBySelectContainer.classList.add("hidden");

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;
        limiter.value = 20;

        //Search While Typing
        let searchWhileTypingContainer =
          selectionFiltersContainer.querySelector("#other #searchWhileTyping");
        if (!searchWhileTypingContainer)
          return "no search while typin container";
        let searchWhileTypingCheckbox =
          searchWhileTypingContainer.querySelector("#allowSearchWhileTyping");
        if (!searchWhileTypingCheckbox) return "no search while typin checkbox";
        searchWhileTypingCheckbox.checked = false;
        this.searchWhileTyping = false;
        searchWhileTypingCheckbox.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("searchWhileTyping on");
            this.searchWhileTyping = true;
          } else {
            console.log("searchWhileTyping off");
            this.searchWhileTyping = false;
          }
        });

        let reloadBtn = this.container.querySelector("#reload");
        if (!reloadBtn) return "no reload button";
        reloadBtn.addEventListener("click", () => {
          this.search();
        });
        this.searchReloadBtn = reloadBtn;
        this.searchReloadBtn.disabled = true;

        //Result Table
        let resultTable = this.container.querySelector("#resultTable");
        if (!resultTable) {
          return "No result Table found.";
        }
        this.resultTable = resultTable;
        this.resultTable.classList.add("hidden");

        let tableBody = resultTable.querySelector("tbody");
        if (!tableBody) {
          return "no table body";
        }
        this.tableBody = tableBody;
        this.clear(this.tableBody);

        //ChooseAllBtn
        this.chooseAllBtn = this.resultTable.querySelector(
          "thead #select #chooseall"
        );
        if (!this.chooseAllBtn) return "No choose all btn";
        //Make Choose All -------

        this.chooseAllBtn.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("checked");
            this.oldCheckedArray = Utils.copyArray(this.choosenArray);
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");
              element.checked = true;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                dataValue,
                false
              );
            });
          } else {
            console.log("unchecked");
            let allCheckBtns =
              this.resultTable.querySelectorAll(".result #select");

            allCheckBtns.forEach((element) => {
              let dataValue = element
                .closest(".result")
                .getAttribute("data-value");

              if (this.oldCheckedArray.includes(dataValue)) {
                element.checked = true;
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  dataValue,
                  false
                );
              } else {
                element.checked = false;
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  dataValue
                );
              }
            });
          }
        });

        //Shrink media
        let shrinkToggleCheckboxes = this.container.querySelectorAll(
          "thead #data #checkbox"
        );

        for (const current of shrinkToggleCheckboxes) {
          current.addEventListener("click", () => {
            current.closest("table").classList.toggle("shrinkMedia");
          });
        }

        //Result Desription
        let resultDescriptionContainer =
          this.container.querySelector(".resultDesciption");
        if (!resultDescriptionContainer) {
          return "no discription container";
        }
        this.resultDescriptionContainer = resultDescriptionContainer;

        searchBtn.addEventListener("click", () => {
          this.search(this.arraySearch);
        });

        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
      }

      setFilterMode(value) {
        this.searchBtn.classList.remove("loading");
        //hide all
        this.filenameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.typeSelectContainer.classList.add("hidden");
        this.mimeTypeSelectContainer.classList.add("hidden");
        this.pathSelectContainer.classList.add("hidden");
        this.idSelectContainer.classList.add("hidden");
        this.mediaIDSelectContainer.classList.add("hidden");
        this.keyWordsSelectContainer.classList.add("hidden");
        this.isOnlineSourceSelectContainer.classList.add("hidden");
        this.inMediaFolderSelectContainer.classList.add("hidden");
        this.uploadedSelectContainer.classList.add("hidden");
        this.changedSelectContainer.classList.add("hidden");
        this.isBlobSelectContainer.classList.add("hidden");
        this.thumbnailSelectContainer.classList.add("hidden");
        this.thumbnailIsBlobSelectContainer.classList.add("hidden");
        this.thumbnailFileNameSelectContainer.classList.add("hidden");
        this.thumbnailMimeTypeSelectContainer.classList.add("hidden");
        this.thumbnailIsOnlineSourceSelectContainer.classList.add("hidden");
        this.thumbnailPathSelectContainer.classList.add("hidden");
        this.thumbnailInMediaFolderSelectContainer.classList.add("hidden");
        this.uploadedBySelectContainer.classList.add("hidden");
        this.changedBySelectContainer.classList.add("hidden");

        if (!value) return false;
        this.filterType = value;

        if (value === "filename") {
          this.enableFilter(this.filenameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "type") {
          this.enableFilter(this.typeSelectContainer);
        } else if (value === "mimeType") {
          this.enableFilter(this.mimeTypeSelectContainer);
        } else if (value === "path") {
          this.enableFilter(this.pathSelectContainer);
        } else if (value === "id") {
          this.enableFilter(this.idSelectContainer);
        } else if (value === "mediaID") {
          this.enableFilter(this.mediaIDSelectContainer);
        } else if (value === "keywords") {
          this.enableFilter(this.keyWordsSelectContainer);
        } else if (value === "isOnlineSource") {
          this.enableFilter(this.isOnlineSourceSelectContainer);
        } else if (value === "inMediaFolder") {
          this.enableFilter(this.inMediaFolderSelectContainer);
        } else if (value === "uploaded") {
          this.enableFilter(this.uploadedSelectContainer);
        } else if (value === "changed") {
          this.enableFilter(this.changedSelectContainer);
        } else if (value === "isBlob") {
          this.enableFilter(this.isBlobSelectContainer);
        } else if (value === "thumbnail") {
          this.enableFilter(this.thumbnailSelectContainer);
        } else if (value === "thumbnailIsBlob") {
          this.enableFilter(this.thumbnailIsBlobSelectContainer);
        } else if (value === "thumbnailFileName") {
          this.enableFilter(this.thumbnailFileNameSelectContainer);
        } else if (value === "thumbnailMimeType") {
          this.enableFilter(this.thumbnailMimeTypeSelectContainer);
        } else if (value === "thumbnailIsOnlineSource") {
          this.enableFilter(this.thumbnailIsOnlineSourceSelectContainer);
        } else if (value === "thumbnailPath") {
          this.enableFilter(this.thumbnailPathSelectContainer);
        } else if (value === "thumbnailInMediaFolder") {
          this.enableFilter(this.thumbnailInMediaFolderSelectContainer);
        } else if (value === "uploadedBy") {
          this.enableFilter(this.uploadedBySelectContainer);
        } else if (value === "changedBy") {
          this.enableFilter(this.changedBySelectContainer);
        } else if (value === "multiple") {
          this.enableFilter(this.filenameSelectContainer);
          this.enableFilter(this.descriptionSelectContainer);
          this.enableFilter(this.typeSelectContainer);
          this.enableFilter(this.mimeTypeSelectContainer);
          this.enableFilter(this.idSelectContainer);
          this.enableFilter(this.mediaIDSelectContainer);
          this.enableFilter(this.keyWordsSelectContainer);
          this.enableFilter(this.isOnlineSourceSelectContainer);
          this.enableFilter(this.inMediaFolderSelectContainer);
          this.enableFilter(this.uploadedSelectContainer);
          this.enableFilter(this.changedSelectContainer);
          this.enableFilter(this.isBlobSelectContainer);
          this.enableFilter(this.thumbnailSelectContainer);
          this.enableFilter(this.thumbnailIsBlobSelectContainer);
          this.enableFilter(this.thumbnailFileNameSelectContainer);
          this.enableFilter(this.thumbnailMimeTypeSelectContainer);
          this.enableFilter(this.thumbnailIsOnlineSourceSelectContainer);
          this.enableFilter(this.thumbnailPathSelectContainer);
          this.enableFilter(this.thumbnailInMediaFolderSelectContainer);
          this.enableFilter(this.uploadedBySelectContainer);
          this.enableFilter(this.changedBySelectContainer);
        } else if (value === "multiple") {
        } else if (value === "all") {
          //Nothing to show
        } else {
          console.log("no filter");
        }
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.filenameSelectContainer) {
          //name
          let textInput =
            this.filenameSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.filenameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.typeSelectContainer) {
          //type select
          this.choosenTypesArray = new Array();
          let choosenContainer =
            this.typeSelectContainer.querySelector("#choosen");

          let add = async () => {
            let types = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=other&type=getAllAvailableTypes",
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            );

            let choosen = await Utils.chooseFromArrayWithSearch(
              types,
              false,
              "Typ auswählen",
              this.choosenTypesArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.choosenTypesArray = Utils.addToArray(
                  this.choosenTypesArray,
                  current,
                  false
                );
              }
              update();
              if (this.searchWhileTyping) {
                this.search();
              }
            }
          };

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.choosenTypesArray.length > 0) {
              this.choosenTypesArray.forEach((element) => {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button>`;
                choosenContainer.appendChild(listItem);
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.choosenTypesArray = Utils.removeFromArray(
                    this.choosenTypesArray,
                    element
                  );
                  update();
                  console.log("After", this.choosenTypesArray);
                });
              });
            }
          };

          let addBtn = this.typeSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", () => {
            add();
          });
          this.typeSelectContainer.classList.remove("hidden");
        } else if (filter === this.mimeTypeSelectContainer) {
          //type select
          this.choosenMimeypesArray = new Array();
          let choosenContainer =
            this.mimeTypeSelectContainer.querySelector("#choosen");

          let add = async () => {
            let types = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=other&type=getAllAvailablMimeTypes",
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            );

            let choosen = await Utils.chooseFromArrayWithSearch(
              types,
              false,
              "Inhaltstyp auswählen",
              this.choosenMimeypesArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.choosenMimeypesArray = Utils.addToArray(
                  this.choosenMimeypesArray,
                  current,
                  false
                );
              }
              update();
              if (this.searchWhileTyping) {
                this.search();
              }
            }
          };

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.choosenMimeypesArray.length > 0) {
              this.choosenMimeypesArray.forEach((element) => {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button>`;
                choosenContainer.appendChild(listItem);
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.choosenMimeypesArray = Utils.removeFromArray(
                    this.choosenMimeypesArray,
                    element
                  );
                  update();
                  console.log("After", this.choosenMimeypesArray);
                });
              });
            }
          };

          let addBtn = this.mimeTypeSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", () => {
            add();
          });
          this.mimeTypeSelectContainer.classList.remove("hidden");
        } else if (filter === this.pathSelectContainer) {
          //path
          let textInput = this.pathSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.pathSelectContainer.classList.remove("hidden");
        } else if (filter === this.idSelectContainer) {
          //id
          let numberInput =
            this.idSelectContainer.querySelector("#numberInput");
          Utils.listenToChanges(numberInput, 200, "input", this.search());
          this.idSelectContainer.classList.remove("hidden");
        } else if (filter === this.mediaIDSelectContainer) {
          //mediaID
          let textInput =
            this.mediaIDSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.mediaIDSelectContainer.classList.remove("hidden");
        } else if (filter === this.keyWordsSelectContainer) {
          //keywords select
          this.keyWordsSearchArray = new Array();
          let choosenContainer =
            this.keyWordsSelectContainer.querySelector("#choosen");

          let add = async () => {
            let choosen = await Utils.chooseFromArrayWithSearch(
              new Array(),
              false,
              "Inhaltstyp auswählen",
              this.keyWordsSearchArray,
              false,
              true,
              "medienverwaltung&operation=other&type=getKeywords&searchFor=",
              "./includes/medienverwaltung.inc.php"
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.keyWordsSearchArray = Utils.addToArray(
                  this.keyWordsSearchArray,
                  current,
                  false
                );
              }
              update();
              if (this.searchWhileTyping) {
                this.search();
              }
            }
          };

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.keyWordsSearchArray.length > 0) {
              this.keyWordsSearchArray.forEach((element) => {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button>`;
                choosenContainer.appendChild(listItem);
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.keyWordsSearchArray = Utils.removeFromArray(
                    this.keyWordsSearchArray,
                    element
                  );
                  update();
                  console.log("After", this.keyWordsSearchArray);
                });
              });
            }
          };

          let addBtn = this.keyWordsSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", () => {
            add();
          });
          this.keyWordsSelectContainer.classList.remove("hidden");
        } else if (filter === this.isOnlineSourceSelectContainer) {
          let list =
            this.isOnlineSourceSelectContainer.querySelector("#selectInput");
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.isOnlineSourceSelectContainer.classList.remove("hidden");
        } else if (filter === this.inMediaFolderSelectContainer) {
          let list =
            this.inMediaFolderSelectContainer.querySelector("#selectInput");
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.inMediaFolderSelectContainer.classList.remove("hidden");
        } else if (filter === this.uploadedSelectContainer) {
          //uploaded
          let textInput =
            this.uploadedSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.uploadedSelectContainer.classList.remove("hidden");
        } else if (filter === this.uploadedBySelectContainer) {
          let choosen =
            this.uploadedBySelectContainer.querySelector("#choosen");
          //AddBtn
          let addBtn = this.uploadedBySelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let choosenUser = await Utils.pickUsers();
            if (choosenUser && choosenUser.length > 0) {
              choosenUser = choosenUser[0];
              this.uploadedBySelected = choosenUser;
              choosen.innerHTML = `Nutzer mit der userID: <b>${choosenUser}</b>`;
            } else {
              this.uploadedBySelected = false;
              choosen.innerText = "";
            }
          });
          //Remove
          let removeBtn =
            this.uploadedBySelectContainer.querySelector("#removeBtn");
          removeBtn.addEventListener("click", async () => {
            this.uploadedBySelected = false;
            choosen.innerText = "";
          });

          this.uploadedBySelectContainer.classList.remove("hidden");
        } else if (filter === this.changedSelectContainer) {
          //uploaded
          let textInput =
            this.uploadedSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.uploadedSelectContainer.classList.remove("hidden");
        } else if (filter === this.changedBySelectContainer) {
          let choosen = this.changedBySelectContainer.querySelector("#choosen");

          let update = async () => {
            choosen.innerHTML = "";
            if (
              this.changedBySelectArray &&
              this.changedBySelectArray.length > 0
            ) {
              let ul = document.createElement("ul");
              choosen.appendChild(ul);
              for (const current of this.changedBySelectArray) {
                let li = document.createElement("li");
                li.innerHTML = `Benutzer | userID: <b>${current}</b> <button type="button" id="remove">X</button>`;
                ul.appendChild(li);

                let removeBtn = li.querySelector("#remove");
                removeBtn.addEventListener("click", async () => {
                  this.changedBySelectArray = Utils.removeFromArray(
                    this.changedBySelectArray,
                    current
                  );
                  update();
                });
              }
            }
          };

          //AddBtn
          let addBtn = this.changedBySelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let choosenUsers = await Utils.pickUsers();
            if (choosenUsers && choosenUsers.length > 0) {
              for (const current of choosenUsers) {
                this.changedBySelectArray = Utils.addToArray(
                  this.changedBySelectArray,
                  current,
                  false
                );
              }
              update();
            } else {
              this.changedBySelectArray = new Array();
              choosen.innerHTML = "";
            }
          });
          //Remove
          let removeBtn =
            this.changedBySelectContainer.querySelector("#removeBtn");
          removeBtn.addEventListener("click", async () => {
            this.changedBySelectArray = new Array();
            choosen.innerHTML = "";
          });

          this.changedBySelectContainer.classList.remove("hidden");
        } else if (filter === this.isBlobSelectContainer) {
          let list = this.isBlobSelectContainer.querySelector("#selectInput");
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.isBlobSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailSelectContainer) {
          let list =
            this.thumbnailSelectContainer.querySelector("#selectInput");
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.thumbnailSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailIsBlobSelectContainer) {
          let list =
            this.thumbnailIsBlobSelectContainer.querySelector("#selectInput");
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.thumbnailIsBlobSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailFileNameSelectContainer) {
          //thumbnail filename
          let textInput =
            this.thumbnailFileNameSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.thumbnailFileNameSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailMimeTypeSelectContainer) {
          //type select
          this.thumbnailChoosenMimeypesArray = new Array();
          let choosenContainer =
            this.thumbnailMimeTypeSelectContainer.querySelector("#choosen");

          let add = async () => {
            let types = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=other&type=getAllAvailablMimeTypesThumbnail",
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            );

            let choosen = await Utils.chooseFromArrayWithSearch(
              types,
              false,
              "Inhaltstyp auswählen",
              this.thumbnailChoosenMimeypesArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.thumbnailChoosenMimeypesArray = Utils.addToArray(
                  this.thumbnailChoosenMimeypesArray,
                  current,
                  false
                );
              }
              update();
              if (this.searchWhileTyping) {
                this.search();
              }
            }
          };

          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.thumbnailChoosenMimeypesArray.length > 0) {
              this.thumbnailChoosenMimeypesArray.forEach((element) => {
                let listItem = document.createElement("li");

                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button>`;
                choosenContainer.appendChild(listItem);
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.thumbnailChoosenMimeypesArray = Utils.removeFromArray(
                    this.thumbnailChoosenMimeypesArray,
                    element
                  );
                  update();
                  console.log("After", this.thumbnailChoosenMimeypesArray);
                });
              });
            }
          };

          let addBtn =
            this.thumbnailMimeTypeSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", () => {
            add();
          });
          this.thumbnailMimeTypeSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailIsOnlineSourceSelectContainer) {
          let list =
            this.thumbnailIsOnlineSourceSelectContainer.querySelector(
              "#selectInput"
            );
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.thumbnailIsOnlineSourceSelectContainer.classList.remove(
            "hidden"
          );
        } else if (filter === this.thumbnailPathSelectContainer) {
          //name
          let textInput =
            this.thumbnailPathSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(textInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.thumbnailPathSelectContainer.classList.remove("hidden");
        } else if (filter === this.thumbnailInMediaFolderSelectContainer) {
          let list =
            this.thumbnailInMediaFolderSelectContainer.querySelector(
              "#selectInput"
            );
          list = Utils.removeAllEventlisteners(list);
          list.addEventListener("change", () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });

          this.thumbnailInMediaFolderSelectContainer.classList.remove("hidden");
        }

        console.log(filter);
      }

      async search() {
        console.log("Search...");
        this.searchReloadBtn.disabled = true;
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();

        if (this.filterType === "filename") {
          let input =
            this.filenameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=filename&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "description") {
          let input =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=description&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "type") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=type&input=" +
                  JSON.stringify(this.choosenTypesArray) +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "mimeType") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=mimeType&input=" +
                  JSON.stringify(this.choosenMimeypesArray) +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "path") {
          let input =
            this.pathSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=path&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "id") {
          let input =
            this.idSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=id&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "mediaID") {
          let input =
            this.mediaIDSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=mediaID&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "keywords") {
          console.log(this.keyWordsSearchArray);
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=keyWords&input=" +
                  JSON.stringify(this.keyWordsSearchArray) +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "isOnlineSource") {
          let select =
            this.isOnlineSourceSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=isOnlineSource&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "inMediaFolder") {
          let select =
            this.inMediaFolderSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=inMediaFolder&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "uploaded") {
          let input =
            this.uploadedSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=uploaded&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "uploadedBy") {
          console.log(this.keyWordsSearchArray);
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=uploadedBy&input=" +
                  this.uploadedBySelected +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "changed") {
          let input =
            this.changedSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=changed&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "changedBy") {
          console.log(this.keyWordsSearchArray);
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=changedBy&input=" +
                  JSON.stringify(this.changedBySelectArray) +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "isBlob") {
          let select = this.isBlobSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=isBlob&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnail") {
          let select =
            this.thumbnailSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnail&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailIsBlob") {
          let select =
            this.thumbnailIsBlobSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailIsBlob&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailFileName") {
          let input =
            this.thumbnailFileNameSelectContainer.querySelector(
              "#textInput"
            ).value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailFileName&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailMimeType") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailMimeType&input=" +
                  JSON.stringify(this.thumbnailChoosenMimeypesArray) +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailIsOnlineSource") {
          let select =
            this.thumbnailIsOnlineSourceSelectContainer.querySelector(
              "#selectInput"
            );
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailIsOnlineSource&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailPath") {
          let input =
            this.thumbnailPathSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailPath&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "thumbnailInMediaFolder") {
          let select =
            this.thumbnailInMediaFolderSelectContainer.querySelector(
              "#selectInput"
            );
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=thumbnailInMediaFolder&input=" +
                  input +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=all&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                true,
                true
              )
            )
          );
        } else if (this.filterType === "multiple") {
          //filename
          let filename =
            this.filenameSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(filename, true)) filename = false;

          //description
          let description =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(description, true)) description = false;

          //Type
          let type = this.choosenTypesArray;
          if (!this.choosenTypesArray || !this.choosenTypesArray.length > 0)
            type = false;

          //Mime-Type
          let mimeType = this.choosenMimeypesArray;
          if (
            !this.choosenMimeypesArray ||
            !this.choosenMimeypesArray.length > 0
          )
            mimeType = false;

          //path
          let path = this.pathSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(path, true)) path = false;

          //id
          let id = this.idSelectContainer.querySelector("#numberInput").value;
          if (Utils.isEmptyInput(id, true)) id = false;

          //mediaID
          let mediaID =
            this.mediaIDSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(mediaID, true)) mediaID = false;

          //keyWords
          let keyWords = this.keyWordsSearchArray;
          if (!this.keyWordsSearchArray || !this.keyWordsSearchArray.length > 0)
            keyWords = false;

          //isOnlineSource
          let isOnlineSourceSelect =
            this.isOnlineSourceSelectContainer.querySelector("#selectInput");
          let isOnlineSource =
            isOnlineSourceSelect[
              isOnlineSourceSelect.selectedIndex
            ].getAttribute("data-value");
          if (Utils.isEmptyInput(isOnlineSource, true)) isOnlineSource = false;

          //inMediaFolder
          let inMediaFolderSelect =
            this.inMediaFolderSelectContainer.querySelector("#selectInput");
          let inMediaFolder =
            inMediaFolderSelect[inMediaFolderSelect.selectedIndex].getAttribute(
              "data-value"
            );
          if (Utils.isEmptyInput(inMediaFolder, true)) inMediaFolder = false;

          //uploaded
          let uploaded =
            this.uploadedSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(uploaded, true)) uploaded = false;

          //uploadedBy
          let uploadedBy = this.uploadedBySelected;
          if (Utils.isEmptyInput(uploadedBy, true)) uploadedBy = false;

          //changed
          let changed =
            this.changedSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(changed, true)) changed = false;

          //changedBy
          let changedBy = this.changedBySelectArray;
          if (
            !this.changedBySelectArray ||
            !this.changedBySelectArray.length > 0
          )
            changedBy = false;

          //isBlob
          let isBlobSelect =
            this.isBlobSelectContainer.querySelector("#selectInput");
          let isBlob =
            isBlobSelect[isBlobSelect.selectedIndex].getAttribute("data-value");
          if (Utils.isEmptyInput(isBlob, true)) isBlob = false;

          //thumbnail
          let thumbnailSelect =
            this.thumbnailSelectContainer.querySelector("#selectInput");
          let thumbnail =
            thumbnailSelect[thumbnailSelect.selectedIndex].getAttribute(
              "data-value"
            );
          if (Utils.isEmptyInput(thumbnail, true)) thumbnail = false;

          //thumbnailIsBlob
          let thumbnailIsBlobSelect =
            this.thumbnailIsBlobSelectContainer.querySelector("#selectInput");
          let thumbnailIsBlob =
            thumbnailIsBlobSelect[
              thumbnailIsBlobSelect.selectedIndex
            ].getAttribute("data-value");
          if (Utils.isEmptyInput(thumbnailIsBlob, true))
            thumbnailIsBlob = false;

          //thumbnailFileName
          let thumbnailFileName =
            this.thumbnailFileNameSelectContainer.querySelector(
              "#textInput"
            ).value;
          if (Utils.isEmptyInput(thumbnailFileName, true))
            thumbnailFileName = false;

          //thumbnailMimeType
          let thumbnailMimeType = this.thumbnailChoosenMimeypesArray;
          if (
            !this.thumbnailChoosenMimeypesArray ||
            !this.thumbnailChoosenMimeypesArray.length > 0
          )
            thumbnailMimeType = false;

          //thumbnailIsOnlineSource
          let thumbnailIsOnlineSourceSelect =
            this.thumbnailIsOnlineSourceSelectContainer.querySelector(
              "#selectInput"
            );
          let thumbnailIsOnlineSource =
            thumbnailIsOnlineSourceSelect[
              thumbnailIsOnlineSourceSelect.selectedIndex
            ].getAttribute("data-value");
          if (Utils.isEmptyInput(thumbnailIsOnlineSource, true))
            thumbnailIsOnlineSource = false;

          //thumbnailPath
          let thumbnailPath =
            this.thumbnailPathSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(thumbnailPath, true)) thumbnailPath = false;

          //thumbnailIsOnlineSource
          let thumbnailInMediaFolderSelect =
            this.thumbnailInMediaFolderSelectContainer.querySelector(
              "#selectInput"
            );
          let thumbnailInMediaFolder =
            thumbnailInMediaFolderSelect[
              thumbnailInMediaFolderSelect.selectedIndex
            ].getAttribute("data-value");
          if (Utils.isEmptyInput(thumbnailInMediaFolder, true))
            thumbnailInMediaFolder = false;

          //Log out every value
          console.log(
            "MULTI SEARCH =>",
            "filename=>",
            filename,
            "description=>",
            description,
            "type=>",
            type,
            "mimeType=>",
            mimeType,
            "path=>",
            path,
            "id=>",
            id,
            "mediaID=>",
            mediaID,
            "keyWords=>",
            keyWords,
            "isOnlineSource=>",
            isOnlineSource,
            "inMediaFolder=>",
            inMediaFolder,
            "uploaded=>",
            uploaded,
            "uploadedBy=>",
            uploadedBy,
            "changed=>",
            changed,
            "changedBy=>",
            changedBy,
            "isBlob=>",
            isBlob,
            "thumbnail=>",
            thumbnail,
            "thumbnailIsBlob=>",
            thumbnailIsBlob,
            "thumbnailFileName=>",
            thumbnailFileName,
            "thumbnailMimeType=>",
            thumbnailMimeType,
            "thumbnailIsOnlineSource=>",
            thumbnailIsOnlineSource,
            "thumbnailPath=>",
            thumbnailPath,
            "thumbnailInMediaFolder=>",
            thumbnailInMediaFolder
          );

          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=search&filter=multiple&filename=" +
                  filename +
                  "&description=" +
                  description +
                  "&mimeType=" +
                  JSON.stringify(mimeType) +
                  "&type=" +
                  JSON.stringify(type) +
                  "&path=" +
                  path +
                  "&id=" +
                  id +
                  "&mediaID=" +
                  mediaID +
                  "&keyWords=" +
                  JSON.stringify(keyWords) +
                  "&isOnlineSource=" +
                  isOnlineSource +
                  "&inMediaFolder=" +
                  inMediaFolder +
                  "&uploaded=" +
                  uploaded +
                  "&uploadedBy=" +
                  uploadedBy +
                  "&changed=" +
                  changed +
                  "&changedBy=" +
                  JSON.stringify(changedBy) +
                  "&isBlob=" +
                  isBlob +
                  "&thumbnail=" +
                  thumbnail +
                  "&thumbnailIsBlob=" +
                  thumbnailIsBlob +
                  "&thumbnailFileName=" +
                  thumbnailFileName +
                  "&thumbnailMimeType=" +
                  thumbnailMimeType +
                  "&thumbnailIsOnlineSource=" +
                  thumbnailIsOnlineSource +
                  "&thumbnailPath=" +
                  thumbnailPath +
                  "&thumbnailInMediaFolder=" +
                  thumbnailInMediaFolder +
                  "&limit=" +
                  this.limiter.value,
                "./includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false,
                true
              )
            )
          );
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }

        //filter resluts by options
        if (this.options?.allowedTypes?.length) {
          for (const result of results) {
            if (!options.allowedTypes.includes(result["type"])) {
              results = Utils.removeFromArray(results, result);
              console.log(results, result);
            }
          }
        }

        this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

        results = Utils.sortItems(results, "id"); //Just sort it to better overview

        for (const result of results) {
          this.resultTable.classList.remove("hidden");
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["id"]);

          tableRow.innerHTML = `
            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
            <td id="data"></td>
            <td id="description" style="min-width: 300px;">${
              result["description"]
            }</td>
            <td id="keywords" style="min-width: 200px;">${JSON.stringify(
              Utils.makeJSON(result["keywords"], null, 2)
            )}</td>
            <td id="isOnlineSource">${Utils.valueToString(
              result["isOnlineSource"],
              {
                true: "Ja",
                false: "Nein",
              }
            )}</td>
            <td id="type">${result["type"]}</td>
            <td id="mimeType">${result["mimeType"]}</td>
            <td id="isBlob">${result["isBlob"]}</td>
            <td id="path" style="min-width: 200px;">${result["path"]}</td>
            <td id="inMediaFolder">${Utils.valueToString(
              result["inMediaFolder"],
              {
                true: "Ja",
                false: "Nein",
              }
            )}</td>
            <td id="uploaded">${result["uploaded"]}</td>
            <td id="changed">${result["changed"]}</td>
            <td id="filename" style="min-width: 200px;">${
              result["filename"]
            }</th>
            <td id="id">${result["id"]}</td>
            <td id="mediaID">${result["mediaID"]}</td>
            <td id="thumbnail">${Utils.valueToString(result["thumbnail"], {
              true: "Ja",
              false: "Nein",
            })}</th>
            <td id="thumbnailData"></td>
            <td id="thumbnailFileName">${result["thumbnailFileName"]}</td>
            <td id="thumbnailMimeType">${result["thumbnailMimeType"]}</td>
            <td id="thumbnailIsOnlineSource">${Utils.valueToString(
              result["thumbnailIsOnlineSource"],
              { true: "Ja", false: "Nein" }
            )}</td>
            <td id="thumbnailIsBlob">${Utils.valueToString(
              result["thumbnailIsBlob"],
              { true: "Ja", false: "Nein" }
            )}</td>
            <td id="thumbnailPath">${result["thumbnailPath"]}</td>
            <td id="thumbnailInMediaFolder">${Utils.valueToString(
              result["thumbnailInMediaFolder"],
              { true: "Ja", false: "Nein" }
            )}</td>
            <td id="fileSize">${result["fileSize"]}</td>
            <td id="uploadedBy">${result["uploadedBy"]}</td>
            <td id="changedBy">${JSON.stringify(
              Utils.makeJSON(result["changedBy"], null, 2)
            )}</td>
            `;
          this.tableBody.append(tableRow);

          let checkBox = tableRow.querySelector(".select #select");
          if (!checkBox) return false;
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              if (multiple) {
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  result["id"],
                  false
                );
              } else {
                this.choosenArray = new Array();
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  result["id"],
                  false
                );
              }
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["id"]
              );
            }
          });

          //Keywords
          let keywordsContainer = tableRow.querySelector("#keywords");
          Utils.listOfArrayToHTML(
            keywordsContainer,
            Utils.makeJSON(result["keywords"]),
            "keine"
          );

          //Disable cache for loading the newest version of media
          let oldCacheControl = window.localStorage.getItem("cacheControl");
          window.localStorage.setItem("cacheControl", "no-cache");
          //Data
          await Utils.setMedia(
            { mediaID: result["mediaID"] },
            tableRow.querySelector("#data")
          );

          //Thumbnail
          //GET thumbnail data if enabled

          if (result["thumbnail"]) {
            let thumbnailData = await Utils.getThumbnailURL(result);
            console.log(thumbnailData);
            if (thumbnailData.url) {
              await Utils.setMedia(
                {
                  type: "image",
                  url: thumbnailData.url,
                  isOnlineSource: false,
                  urlIsBLOB: true,
                  blobData: thumbnailData,
                },
                tableRow.querySelector("#thumbnailData"),
                true
              );
            }
          }

          //set cacheControl to old value
          window.localStorage.setItem("cacheControl", oldCacheControl);

          //ChangedBy
          Utils.listOfArrayToHTML(
            tableRow.querySelector("#changedBy"),
            result["changedBy"],
            "Noch nie"
          );

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) return false;

          chooseThis.addEventListener("click", (event) => {
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["id"],
              false
            );
            returnWithValue();
          });
        }
        this.searchReloadBtn.disabled = false;
      }

      async getMediaData(id) {
        let mediaID = await Utils.sendXhrREQUEST(
          "POST",
          "getAttribute&type=medienverwaltung&secondOperation=GET mediaID BY id&id=" +
            id,
          "/includes/getAttributes.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false,
          false
        );
        let mediaData = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAttribute&type=medienverwaltung&secondOperation=getMediaData&mediaID=" +
              mediaID,
            "/includes/getAttributes.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            false
          )
        );
        return mediaData;
      }
    }

    var myModal = new bootstrap.Modal(modal);
    myModal.show();
    //Create Medienverwaltung
    let medienverwaltung = new Medienverwaltung(
      modal.querySelector("#medienverwaltung"),
      options
    );
    console.log(medienverwaltung.prepareSearch());
    medienverwaltung.filterType = "all";

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    let returnWithValue = async () => {
      let media = new Array();
      for (const currentID of medienverwaltung.choosenArray) {
        media = Utils.addToArray(
          media,
          await medienverwaltung.getMediaData(currentID),
          true
        );
        console.log("MEDIA array:", media);
      }
      if (!media.length > 0) resolve(false);
      if (multiple) {
        myModal.hide();
        modalOuter.remove();
        resolve(media);
      } else {
        myModal.hide();
        modalOuter.remove();
        resolve(media[0]);
      }
    };

    yes.addEventListener("click", (target) => {
      returnWithValue();
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      resolve(false);
    });
  });
}
