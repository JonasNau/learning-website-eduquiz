import * as Utils from "../../../includes/utils.js";

//Change Groups
export async function changeGroups(userID) {
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
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="staticBackdropLabel">Gruppen bearbeiten</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
                    </div>
                    <div class="modal-body">
                    <button type="button" class="btn btn-primary" id="add">Hinzufügen</button>
                    <button type="button" class="btn btn-sm btn-danger" id="removeAll">alle entfernen</button>
                      <ul id="usersGroupsList">
                      
                      </ul>
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

    let addBtn = modalBody.querySelector("#add");

    let addGroupList = modalBody.querySelector("#addGroupList");

    addBtn.addEventListener("click", async () => {
      //Add logic
      let groupsUserCanAdd = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "benutzerverwaltung&operation=other&type=getGroupsUserCanAdd",
          "./includes/benutzerverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false,
          true,
          true
        )
      );
      let usersGroups = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "benutzerverwaltung&operation=other&type=getAllGroupsFromUser&userID=" +
            userID,
          "./includes/benutzerverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      let toAdd = await Utils.chooseFromArrayWithSearch(
        groupsUserCanAdd,
        false,
        "Gruppen hinzufügen",
        usersGroups,
        true
      );
      if (toAdd && toAdd.length > 0) {
        for (const current of toAdd) {
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changeValue&type=changeGroups&method=add&group=" +
                current +
                "&userID=" +
                userID,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          reload();
        }
      }
    });

    let removeAllBtn = modalBody.querySelector("#removeAll");
    removeAllBtn.addEventListener("click", async () => {
      if (
        await Utils.askUser(
          "Nachricht",
          `Bist du dir sicher, dass du alle Gruppen von diesem Nutzer entfernen möchtest?`,
          false
        )
      ) {
        //Remove Group
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "benutzerverwaltung&operation=changeValue&type=changeGroups&method=removeAll&userID=" +
              userID,
            "./includes/benutzerverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true,
            true
          )
        );
      }
      reload();
    });

    let reload = async () => {
      // get all groups form user
      let usersGroups = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "benutzerverwaltung&operation=other&type=getAllGroupsFromUser&userID=" +
            userID,
          "./includes/benutzerverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false,
          true,
          true
        )
      );

      let ul = modal.querySelector("#usersGroupsList");
      ul.innerHTML = "";
      if (usersGroups.length > 0) {
        usersGroups.forEach((group) => {
          let li = document.createElement("li");
          li.setAttribute("data-value", group);

          ul.appendChild(li);
          li.innerHTML = `<span class="description">${group}</span> <button type="button" id="remove">X</button>`;

          let removeBtn = li.querySelector("#remove");
          removeBtn.addEventListener("click", async () => {
            if (
              await Utils.askUser(
                "Nachricht",
                `Bist du dir sicher, dass du die Gruppe ${group} von diesem Nutzer entfernen möchtest?`,
                false
              )
            ) {
              //Remove Group
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changeValue&type=changeGroups&method=remove&group=" +
                    group +
                    "&userID=" +
                    userID,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
            }
            reload();
          });
        });
      }

      addGroupList.innerHTML =
        "<option selected='selected' data-value=''>Auswahl</option>";
      shownGroups.forEach((currentGroup) => {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("data-value", currentGroup);
        addGroupList.appendChild(optionElement);
        optionElement.innerHTML = currentGroup;
      });
    };
    reload();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve("Erfolg!");
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function changePermissions(userID) {
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
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Berechtigungen ändern</h5>
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
    <div id="programContainer">
        <div id="currentUsersPermissions">
            <div class="set">
            <h3>Akutelle Berechtigungen</h3>
            <button class="btn btn-secondary" id="addPermissionsBtn">Hinzufügen</button>
            <button class="btn btn-secondary" id="filterToggle">Filtern</button>
            <button class="btn btn-secondary" id="edit">Bearbeiten</button>
            <div class="filter hidden">
                <div id="chooseFilterTypeContainer">
                    <label for="chooseFilter" class="form-label">Filtern nach</label>
                    <select id="chooseFilter" class="form-select">
                        <option data-value="" selected="selected">Auswahl</option>
                        <option data-value="name">Name</option>
                        <option data-value="description">Beschreibung</option>
                        <option data-value="ranking">Rang</option>
                        <option data-value="value">Wert</option>
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
                    <div class="mt-2" id="name">
                        <label for="textInput" class="form-label">Filtern nach Name</label>
                        <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="description">
                        <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                        <input type="text" id="textInput" class="form-control"
                            placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                    </div>
                    <div class="mt-2" id="ranking">
                        <label for="numberInput" class="form-label">Filtern nach Rang</label>
                        <input type="number" id="numberInput" name="numberInput" min="0" max="100"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="value">
                        <label for="textInput" class="form-label">Filtern nach Wert</label>
                        <input type="text" id="textInput" class="form-control" placeholder="z.B. 1"
                            autocomplete="off">
                    </div>
                    <div class="mt-2" id="limitResults">
                        <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                        <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                    </div>

                </div>
                <button type="button" class="btn btn-primary" id="search"
                    style="position: relative"><span>Suchen</span></button>
            </div>
            <div class="resultDesciption">

            </div>
            <table class="styled-table" id="currentUserPermissionsTable">
                <thead>
                    <tr>
                        <th id="select">
                            <div class="heading">Ausgewählt</div>
                            <hr>
                            <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                        </th>
                        <th id="name">Berechtigung</th>
                        <th id="description">Beschreibung</th>
                        <th id="value">Wert</th>
                        <td id="normalValue">Normaler Wert</td>
                        <th id="ranking">Rang</th>
                        <th id="hinweis">Hinweis</th>
                        <th id="remove">Entfernen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                    src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                        <td id="name">accessLeherpanel</td>
                        <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                        <td id="value">1</td>
                        <td id="normalValue"></td>
                        <td id="ranking">3</td>
                        <td id="hinweis">1 = an | 0 = aus</td>
                        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                    alt="Löschen"></button></td>
                    </tr>
                </tbody>
            </table>
            <div class="row" id="editContainer">
                <h4>Bearbeiten</h4>
                <div class="overflow-auto" id="edit">
                    <table class="table styled-table" id="editTable">
                        <thead>
                            <tr>
                                <th id="name">Name</th>
                                <th id="description">Beschreibung</th>
                                <th id="value"><span>Wert</span><button type="button" id="changeAll">alle
                                        Ändern</button></th>
                                        <th id="normalValue">Normaler Wert</th>
                                <th id="ranking">Rang</th>
                                <th id="hinweis">Hinweis</th>
                                <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                        Entfernen</button></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td id="name"></td>
                                <td id="description"></td>
                                <td id="value"><span></span><button class="changeBtn" id="change"><img
                                            src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
                                <td id="normalValue"></td>
                                <td id="ranking"></td>
                                <td id="hinweis"></td>
                                <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                            alt="Löschen"></button></td>
                            </tr>

                        </tbody>
                    </table>
                </div>

                </div>

            </div>
            <div class="forbidden">
                <h3>Verboten</h3>
                <button class="btn btn-secondary" id="addPermissionsBtn">Hinzufügen</button>
                <button class="btn btn-secondary" id="filterToggle">Filtern</button>
                <button class="btn btn-secondary" id="edit">Bearbeiten</button>
                <div class="filter hidden">
                    <div id="chooseFilterTypeContainer">
                        <label for="chooseFilter" class="form-label">Filtern nach</label>
                        <select id="chooseFilter" class="form-select">
                            <option data-value="" selected="selected">Auswahl</option>
                            <option data-value="name">Name</option>
                            <option data-value="description">Beschreibung</option>
                            <option data-value="ranking">Rang</option>
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
                        <div class="mt-2" id="name">
                            <label for="textInput" class="form-label">Filtern nach Name</label>
                            <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                                autocomplete="off">
                        </div>
                        <div class="mt-2" id="description">
                            <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                            <input type="text" id="textInput" class="form-control"
                                placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                        </div>
                        <div class="mt-2" id="ranking">
                            <label for="numberInput" class="form-label">Filtern nach Rang</label>
                            <input type="number" id="numberInput" name="numberInput" min="0" max="100"
                                autocomplete="off">
                        </div>
                        <div class="mt-2" id="limitResults">
                            <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                            <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                        </div>

                    </div>
                    <button type="button" class="btn btn-primary" id="search"
                        style="position: relative"><span>Suchen</span></button>
                </div>
                <div class="resultDesciption">

                </div>
                <table class="styled-table" id="currentUserForbiddenPermissionsTable">
                    <thead>
                        <tr>
                            <th id="select">
                                <div class="heading">Ausgewählt</div>
                                <hr>
                                <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                            </th>
                            <th id="name">Berechtigung</th>
                            <th id="description">Beschreibung</th>
                            <th id="ranking">Rang</th>
                            <th id="hinweis">Hinweis</th>
                            <th id="remove">Entfernen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                        src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
                            <td id="name">accessLeherpanel</td>
                            <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                            <td id="ranking">3</td>
                            <td id="hinweis">1 = an | 0 = aus</td>
                            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                        alt="Löschen"></button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="row" id="editContainer">
                    <h4>Bearbeiten</h4>
                    <div class="overflow-auto" id="edit">
                        <table class="table styled-table" id="editTable">
                            <thead>
                                <tr>
                                    <th id="name">Name</th>
                                    <th id="description">Beschreibung</th>
                                            <td id="normalValue">Normaler Wert</td>
                                    <th id="ranking">Rang</th>
                                    <th id="hinweis">Hinweis</th>
                                    <th id="remove"><span>Entfernen</span><button type="button" id="changeAll">alle
                                            Entfernen</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="name"></td>
                                    <td id="description"></td>
                                    <td id="normalValue"></td>
                                    <td id="ranking"></td>
                                    <td id="hinweis"></td>
                                    <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
                                                alt="Löschen"></button></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>

    </div>
    `;

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class CurrentPermissionsVerwaltung {
      constructor(container) {
        this.userID = null;
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.valueSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        // //Edit

        this.editContainer = null;
        this.editTable = null;
        this.editTableBody = null;
      }

      prepareEdit() {
        if (!this.editContainer) return false;
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
        let changeAllValues = thead.querySelector("#value #changeAll");
        let removeAllBtn = thead.querySelector("#remove #changeAll");

        changeAllValues.addEventListener("click", async () => {
          //Change All Values
          let value = await Utils.getUserInput(
            "Eingabe",
            `Welchen Wert für alle ausgewählten Berechtigungen (${this.choosenArray.length})?`,
            false
          );
          if (!Utils.isEmptyInput(value)) {
            for (const current of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=changeValueFromPermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    current +
                    "&value=" +
                    value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false,
                  false
                )
              );
            }
          }

          this.edit(this.choosenArray);
        });

        removeAllBtn.addEventListener("click", async () => {
          //Change All authenticated
          let value = await Utils.askUser(
            "Nachricht",
            `Willst du wirklich alle ausgewählten Berechtigungen (${this.choosenArray.length}) von dem Nutzer mit der userID: ${this.userID} entfernen?`,
            false
          );
          if (value) {
            for (const currentPermission of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    currentPermission,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true,
                  false
                )
              );
            }
          }
          this.choosenArray = new Array();
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
      }

      async prepareSearch(userID) {
        if (!userID) return "No userID";
        this.userID = userID;
        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Edit Table
        let editContainer = this.container.querySelector("#editContainer");
        if (!editContainer) return "No edit container";
        this.editContainer = editContainer;
        let editTable = editContainer.querySelector("#editTable");
        if (!editTable) return "No edit table";
        this.editTable = editTable;
        let editTableBody = editTable.querySelector("tbody");
        if (!editTableBody) return "No edit table body";
        this.editTableBody = editTableBody;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        let valueSelectContainer =
          selectionFiltersContainer.querySelector("#value");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer ||
          !valueSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;
        this.valueSelectContainer = valueSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

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

        //Result Table
        let resultTable = container.querySelector(
          "#currentUserPermissionsTable"
        );
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
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return false;
        //Make Choose All -------

        let editBtn = this.container.querySelector("#edit");
        if (!editBtn) return false;
        this.editBtn = editBtn;
        editBtn.addEventListener("click", () => {
          this.edit(this.choosenArray);
        });

        let chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!chooseAllBtn) return false;
        chooseAllBtn.addEventListener("change", (event) => {
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
          this.updateEditBtn();
        });

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

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();

        //AddPermissions
        let addPermissionsBtn =
          this.container.querySelector("#addPermissionsBtn");
        if (!addPermissionsBtn) {
          return "no addPermissionsBtn";
        }
        addPermissionsBtn.addEventListener("click", async () => {
          let allowedPermissionUserHas = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=getAllAllowedPermissionNamesUserHas&userID=" +
                this.userID,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          console.log("allowedPermissionsUserHas:", allowedPermissionUserHas)
          let addPermissionsArray = await addPermission(
            allowedPermissionUserHas
          );
          console.log(allowedPermissionUserHas);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            let type = await Utils.askUser(
              "Nachricht",
              "Wert für alle setzen?",
              false
            );
            if (type) {
              let value = await Utils.getUserInput(
                "Nachricht",
                `Welchen Wert sollen alle Berechtigungen haben?`,
                false
              );
              for (const element of addPermissionsArray) {
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&userID=" +
                      this.userID +
                      "&permissionName=" +
                      element +
                      "&value=" +
                      value,
                    "./includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    false,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                }
              }
            } else {
              for (const element of addPermissionsArray) {
                let value = await Utils.getUserInput(
                  "Nachricht",
                  `Welchen Wert soll die Berechtigung ${element} haben?`,
                  false
                );
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=addPermission&userID=" +
                      this.userID +
                      "&permissionName=" +
                      element +
                      "&value=" +
                      value,
                    "./includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                  this.choosenArray = Utils.addToArray(
                    this.choosenArray,
                    element,
                    false
                  );
                }
              }
            }
          }
          this.edit(this.choosenArray);
        });
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
        this.valueSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "value") {
          this.enableFilter(this.valueSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.valueSelectContainer) {
          //value
          let textInput = this.valueSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.valueSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=name&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
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
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=description&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=name&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "value") {
          let input =
            this.valueSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=value&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=search&searchBy=all&userID=" +
                  this.userID,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      updateEditBtn() {
        if (this.choosenArray.length > 0) {
          this.editBtn.disabled = false;
        } else {
          this.editBtn.disabled = true;
        }
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.updateEditBtn();
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

        results.forEach((result) => {
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["name"]);

          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
          src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="name">${result["name"]}</td>
          <td id="description">${result["description"]}</td>
          <td id="value">${result["value"]}</td>
          <td id="normalValue">${result["normalValue"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="hinweis">${result["hinweis"]}</td>
          <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
          alt="Löschen"></button></td>
          `;
          this.tableBody.append(tableRow);

          let checkBox = tableRow.querySelector(".select #select");
          if (!checkBox) return false;
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["name"]
              );
            }
            this.updateEditBtn();
          });

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) return false;

          chooseThis.addEventListener("click", (event) => {
            let name = event.target
              .closest(".result")
              .getAttribute("data-value");
            if (!name) return;
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["name"],
              false
            );
            this.edit(this.choosenArray);
          });

          let removeBtn = tableRow.querySelector("#remove .delete-btn");
          removeBtn.addEventListener("click", async () => {
            let value = await Utils.askUser(
              "Nachricht",
              `Willst du wirklich die Berechtigung <b>${result["name"]}</b> von der Gruppe entfernen?`,
              false
            );
            if (value) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    result["name"],
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
            }
            this.search();
          });
        });

        this.resultTable.classList.remove("hidden");
      }

      async edit(choosen) {
        if (!choosen || !choosen.length > 0) {
          this.editContainer.classList.add("hidden");
          this.clear(this.editTableBody);
          return false;
        }
        console.log("Edit:", choosen);

        this.resultTable.classList.add("hidden");
        this.clear(this.tableBody);

        this.clear(this.editTableBody);

        for (let current of choosen) {
          //Get Data
          current = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=getFullInformationForEdit&userID=" +
                this.userID +
                "&permissionName=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (!current) {
            continue;
          }

          console.log(current);

          if (current["name"]) {
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", current["name"]);

            tableRow.innerHTML = `
            <td id="name">${current["name"]}</td>
            <td id="description">${current["description"]}</td>
            <td id="value"><span>${current["value"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
            <td id="normalValue">${current["normalValue"]}</td>
            <td id="ranking">${current["ranking"]}</td>
            <td id="hinweis">${current["hinweis"]}</td>
            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
            `;
            this.editTableBody.appendChild(tableRow);

            let changeValueBtn = tableRow.querySelector("#value #change");

            changeValueBtn.addEventListener("click", async () => {
              let value = await Utils.getUserInput(
                "Eingabe",
                "Welchen Wert?",
                false
              );
              if (!Utils.isEmptyInput(value)) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=changeValueFromPermission&userID=" +
                      this.userID +
                      "&permissionName=" +
                      current["name"] +
                      "&value=" +
                      value,
                    "./includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
              }

              this.edit(this.choosenArray);
            });
            let removeBtn = tableRow.querySelector("#remove .delete-btn");
            removeBtn.addEventListener("click", async () => {
              let value = await Utils.askUser(
                "Nachricht",
                `Willst du wirklich die Berechtigung <b>${current["name"]}</b> von der Gruppe entfernen?`,
                false
              );
              if (value) {
                let res = await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "benutzerverwaltung&operation=changePermissions&type=allowedPermissions&secondOperation=removePermission&userID=" +
                      this.userID +
                      "&permissionName=" +
                      current["name"],
                    "./includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
                if (res["status"] == "success") {
                  this.choosenArray = Utils.removeFromArray(
                    this.choosenArray,
                    current["name"]
                  );
                }
              }
              this.edit(this.choosenArray);
            });
            this.editContainer.classList.remove("hidden");
            this.editTable.classList.remove("hidden");
          }
        }
        this.editContainer.classList.remove("hidden");
        this.editTable.classList.remove("hidden");
      }
    }

    class ForbiddenPermissionsVerwaltung {
      constructor(container) {
        this.userID = null;
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        // //Edit

        this.editContainer = null;
        this.editTable = null;
        this.editTableBody = null;
      }

      prepareEdit() {
        if (!this.editContainer) return "No edit container";
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
        let removeAllBtn = thead.querySelector("#remove #changeAll");

        removeAllBtn.addEventListener("click", async () => {
          //Change All authenticated
          let value = await Utils.askUser(
            "Nachricht",
            `Willst du wirklich alle ausgewählten Berechtigungen (${this.choosenArray.length}) von dem Nutzer mit der userID: ${this.group} entfernen?`,
            false
          );
          if (value) {
            for (const currentPermission of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    currentPermission,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true,
                  false
                )
              );
            }
          }
          this.choosenArray = new Array();
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
      }

      async prepareSearch(userID) {
        if (!this.container) return false;

        if (!userID) return "No userID";
        this.userID = userID;
        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Edit Table
        let editContainer = this.container.querySelector("#editContainer");
        if (!editContainer) return "No edit container";
        this.editContainer = editContainer;
        let editTable = editContainer.querySelector("#editTable");
        if (!editTable) return "No edit table";
        this.editTable = editTable;
        let editTableBody = editTable.querySelector("tbody");
        if (!editTableBody) return "No edit table body";
        this.editTableBody = editTableBody;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

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

        //Result Table
        let resultTable = container.querySelector(
          "#currentUserForbiddenPermissionsTable"
        );
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
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return false;
        //Make Choose All -------

        let editBtn = this.container.querySelector("#edit");
        if (!editBtn) return false;
        this.editBtn = editBtn;
        editBtn.addEventListener("click", () => {
          this.edit(this.choosenArray);
        });

        let chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!chooseAllBtn) return false;
        chooseAllBtn.addEventListener("change", (event) => {
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
          this.updateEditBtn();
        });

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

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();

        //AddForbiddenPermissions
        let addPermissionsBtn =
          this.container.querySelector("#addPermissionsBtn");
        if (!addPermissionsBtn) {
          return "no addPermissionsBtn";
        }
        addPermissionsBtn.addEventListener("click", async () => {
          let forbiddenPermissionUserHas = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=getAllForbiddenPermissionNamesUserHas&userID=" +
                this.userID,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          let addPermissionsArray = await addPermission(
            forbiddenPermissionUserHas
          );
          console.log(forbiddenPermissionUserHas);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            for (const element of addPermissionsArray) {
              let res = await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=addPermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    element,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  true
                )
              );
              console.log(this.choosenArray)
              if (res["status"] == "success") {
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  element,
                  false
                );
              }
            }
          }
          this.edit(this.choosenArray);
        });
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=name&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
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
                "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=description&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=name&userID=" +
                  this.userID +
                  "&input=" +
                  input,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=search&searchBy=all&userID=" +
                  this.userID,
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }

      clear(element) {
        element.innerHTML = "";
      }

      updateEditBtn() {
        if (this.choosenArray.length > 0) {
          this.editBtn.disabled = false;
        } else {
          this.editBtn.disabled = true;
        }
      }

      async showResults(results) {
        this.searchBtn.classList.remove("loading");
        this.clear(this.tableBody);
        this.updateEditBtn();
        this.resultDescriptionContainer.classList.remove("hidden");
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          this.resultTable.classList.add("hidden");
          return false;
        }

        results.forEach((result) => {
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["name"]);

          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
          src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="name">${result["name"]}</td>
          <td id="description">${result["description"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="hinweis">${result["hinweis"]}</td>
          <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg"
          alt="Löschen"></button></td>
          `;
          this.tableBody.append(tableRow);

          let checkBox = tableRow.querySelector(".select #select");
          if (!checkBox) return false;
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["name"]
              );
            }
            this.updateEditBtn();
          });

          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) return false;

          chooseThis.addEventListener("click", (event) => {
            let name = event.target
              .closest(".result")
              .getAttribute("data-value");
            if (!name) return;
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["name"],
              false
            );
            this.edit(this.choosenArray);
          });

          let removeBtn = tableRow.querySelector("#remove .delete-btn");
          removeBtn.addEventListener("click", async () => {
            let value = await Utils.askUser(
              "Nachricht",
              `Willst du wirklich die verbotene Berechtigung <b>${result["name"]}</b> von der Gruppe entfernen?`,
              false
            );
            if (value) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&userID=" +
                    this.userID +
                    "&permissionName=" +
                    result["name"],
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
            }
            this.search();
          });
        });

        this.resultTable.classList.remove("hidden");
      }

      async edit(choosen) {
        if (!choosen || !choosen.length > 0) {
          this.editContainer.classList.add("hidden");
          this.clear(this.editTableBody);
          return false;
        }
        console.log("Edit:", choosen);

        this.resultTable.classList.add("hidden");
        this.clear(this.tableBody);

        this.editTable.classList.remove("hidden");

        this.clear(this.editTableBody);

        for (let current of choosen) {
          //Get Data
          current = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=getFullInformationForEdit&userID=" +
                this.userID +
                "&permissionName=" +
                current,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );

          if (!current) {
            continue;
          }

          if (current["name"]) {
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", current["name"]);

            tableRow.innerHTML = `
            <td id="name">${current["name"]}</td>
            <td id="description">${current["description"]}</td>
            <td id="normalValue">${current["normalValue"]}</td>
            <td id="ranking">${current["ranking"]}</td>
            <td id="hinweis">${current["hinweis"]}</td>
            <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
            `;
            this.editTableBody.appendChild(tableRow);

            let removeBtn = tableRow.querySelector("#remove .delete-btn");
            removeBtn.addEventListener("click", async () => {
              let value = await Utils.askUser(
                "Nachricht",
                `Willst du wirklich die verbotene Berechtigung <b>${current["name"]}</b> von der Gruppe ${this.group} entfernen?`,
                false
              );
              if (value) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "benutzerverwaltung&operation=changePermissions&type=forbiddenPermissions&secondOperation=removePermission&userID=" +
                      this.userID +
                      "&permissionName=" +
                      current["name"],
                    "./includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                );
              }
            });
            this.editContainer.classList.remove("hidden");
            this.editTable.classList.remove("hidden");
          }
        }
        this.editContainer.classList.remove("hidden");
        this.editTable.classList.remove("hidden");
      }
    }

    let outerContainer = modal.querySelector("#programContainer");

    let currentUsersPermissions = outerContainer.querySelector(
      "#currentUsersPermissions"
    );

    let setPermissions = currentUsersPermissions.querySelector(".set");

    let forbiddenPermissions =
      currentUsersPermissions.querySelector(".forbidden");

    let container = modal.querySelector("#programContainer");
    console.log(container);

    let currentPermissionsVerwaltung = new CurrentPermissionsVerwaltung(
      setPermissions
    );
    console.log(await currentPermissionsVerwaltung.prepareSearch(userID));
    console.log(currentPermissionsVerwaltung.prepareEdit());

    let forbiddenPermissionsVerwaltung = new ForbiddenPermissionsVerwaltung(
      forbiddenPermissions
    );
    console.log(await forbiddenPermissionsVerwaltung.prepareSearch(userID));
    console.log(forbiddenPermissionsVerwaltung.prepareEdit());


    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve("Erfolg!");
    });

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}


export async function addPermission(hidePermissions) {
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
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Berechtigungen ändern</h5>
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
    <div id="programContainer">
    <div id="availablePermissionsContainer">
        <h3>Akutelle Berechtigungen</h3>
        <button class="btn btn-secondary" id="filterToggle">Filtern</button>
        <div class="filter hidden">
            <div id="chooseFilterTypeContainer">
                <label for="chooseFilter" class="form-label">Filtern nach</label>
                <select id="chooseFilter" class="form-select">
                    <option data-value="" selected="selected">Auswahl</option>
                    <option data-value="name">Name</option>
                    <option data-value="description">Beschreibung</option>
                    <option data-value="ranking">Rang</option>
                    <option data-value="value">Wert</option>
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
                <div class="mt-2" id="name">
                    <label for="textInput" class="form-label">Filtern nach Name</label>
                    <input type="text" id="textInput" class="form-control" placeholder="z.B. accessLeherpanel"
                        autocomplete="off">
                </div>
                <div class="mt-2" id="description">
                    <label for="textInput" class="form-label">Filtern nach Beschreibung</label>
                    <input type="text" id="textInput" class="form-control"
                        placeholder="z.B. 'Lehrerpanel zu betreten'" autocomplete="off">
                </div>
                <div class="mt-2" id="ranking">
                    <label for="numberInput" class="form-label">Filtern nach Rang</label>
                    <input type="number" id="numberInput" name="numberInput" min="0" max="100" autocomplete="off">
                </div>
                <div class="mt-2" id="value">
                    <label for="textInput" class="form-label">Filtern nach Wert</label>
                    <input type="text" id="textInput" class="form-control" placeholder="z.B. 1" autocomplete="off">
                </div>
                <div class="mt-2" id="limitResults">
                    <label for="numberInput" class="form-label">Ergebnisse Limitieren</label>
                    <input type="number" id="numberInput" name="numberInput" min="0" autocomplete="off">
                </div>

            </div>
            <button type="button" class="btn btn-primary" id="search"
                style="position: relative"><span>Suchen</span></button>
        </div>
        <div class="resultDesciption">

        </div>
        <table class="styled-table" id="availablePermissionsTable">
            <thead>
                <tr>
                    <th id="select">
                        <div class="heading">Auswählen</div>
                        <hr>
                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                    </th>
                    <th id="name">Name</th>
                    <th id="description">Beschreibung</th>
                    <th id="normalValue">Normaler Wert</td>
                    <th id="ranking">Rang</th>
                    <th id="hinweis">Hinweis</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
                    <td id="name">accessLeherpanel</td>
                    <td id="description">Wird benötigt, um das Lehrerpanel zu betreten</td>
                    <td id="value">1</td>
                    <td id="ranking">3</td>
                    <td id="hinweis">1 = an | 0 = aus</td>
                </tr>
            </tbody>
        </table>


    </div>


</div>
    `;

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class AddPermissionsVerwaltung {
      constructor(container) {
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;

        //Filters
        this.filterType = null;
        this.nameSelectContainer = null;
        this.descriptionSelectContainer = null;
        this.rankingSelectContainer = null;
        this.valueSelectContainer = null;
        this.limiter = null;

        //others
        this.searchWhileTyping = false;
        this.editBtn = null;

        // this.groupsSearchArray = new Array();
        // this.permissionsSearchArray = new Object();
        // this.klassenstufenSearchArray = new Array();
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();

        this.resultTable = null;
        // this.chooseAllBtn = null;
        this.tableBody = null;
        this.resultDescriptionContainer = null;
        // this.resultsDescription = null;
        // this.resultsFound = null;

        this.dontShowArray = null;
      }

      prepareEdit() {
        if (!this.editContainer) return false;
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);

        //Change All
        let thead = this.editTable.querySelector("thead");
      }

      async prepareSearch() {
        if (!this.container) return false;

        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        //if (!searchBtn) return false;
        this.searchBtn = searchBtn;

        //Filter Container (init)
        let filterContainer = this.container.querySelector(".filter");
        if (!filterContainer) return "No filter container";
        this.filterContainer = filterContainer;
        filterContainer.classList.add("hidden"); //Hide it if it loads

        //Filter Type Select (init)
        let chooseFilterTypeSelect = filterContainer.querySelector(
          "#chooseFilterTypeContainer #chooseFilter"
        );
        if (!chooseFilterTypeSelect) return false;
        this.chooseFilterTypeSelect = chooseFilterTypeSelect;

        //Toggle Search (init)
        let toggleSearchBtn = this.container.querySelector("#filterToggle");
        //if (!toggleSearchBtn) return false;
        toggleSearchBtn.addEventListener("click", () => {
          filterContainer.classList.toggle("hidden");
        });

        //Selection Filters (init) - Enable or disable filter
        console.log(this.filterContainer);
        let selectionFiltersContainer =
          this.filterContainer.querySelector(".selectionFilters");
        if (!selectionFiltersContainer) return "no selection filters container";
        this.selectionFiltersContainer = selectionFiltersContainer;

        //Initialize filters
        let nameSelectContainer =
          selectionFiltersContainer.querySelector("#name");
        let descriptionSelectContainer =
          selectionFiltersContainer.querySelector("#description");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        let valueSelectContainer =
          selectionFiltersContainer.querySelector("#value");
        if (
          !nameSelectContainer ||
          !descriptionSelectContainer ||
          !rankingSelectContainer ||
          !valueSelectContainer
        )
          return "Error in initializing Filters";
        this.nameSelectContainer = nameSelectContainer;
        this.descriptionSelectContainer = descriptionSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;
        this.valueSelectContainer = valueSelectContainer;

        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;

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

        //Result Table
        let resultTable = container.querySelector("#availablePermissionsTable");
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
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
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

        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
        //First shown mode automatically
        this.setFilterMode("all");
        this.search();
      }

      setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.nameSelectContainer.classList.add("hidden");
        this.descriptionSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
        this.valueSelectContainer.classList.add("hidden");

        if (value === "name") {
          this.enableFilter(this.nameSelectContainer);
        } else if (value === "description") {
          this.enableFilter(this.descriptionSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "value") {
          this.enableFilter(this.valueSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }

      listenToChanges(element, type) {
        if (!element || typeof element != "object") return false;

        let handleEvent = () => {
          let value = element.value;
          if (value.replace(/\s+/g, "") == "") {
            return false;
          }

          if (this.searchWhileTyping) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search();
            }, 650);
          }
        };
        let timeout;
        element.removeEventListener(type, handleEvent);
        element.addEventListener(type, handleEvent);
      }

      async enableFilter(filter) {
        if (!filter) return false;

        if (filter === this.nameSelectContainer) {
          //name
          let textInput = this.nameSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.nameSelectContainer.classList.remove("hidden");
        } else if (filter === this.descriptionSelectContainer) {
          //description
          let textInput =
            this.descriptionSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.descriptionSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //ranking
          let textInput =
            this.rankingSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.valueSelectContainer) {
          //value
          let textInput = this.valueSelectContainer.querySelector("#textInput");
          this.listenToChanges(textInput, "input");
          this.valueSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }

      async search() {
        console.log("Search...");
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");

        if (this.filterType === "name") {
          let input =
            this.nameSelectContainer.querySelector("#textInput").value;

          let res = await Utils.makeJSON(
            Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=name&name=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "description") {
          let input =
            this.descriptionSelectContainer.querySelector("#textInput").value;
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=description&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;

          let res = Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=ranking&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else if (this.filterType === "value") {
          let input =
            this.valueSelectContainer.querySelector("#textInput").value;

          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=value&input=" +
                input +
                "&limitResults=" +
                this.limiter.value,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
          console.log(res);
        } else if (this.filterType === "all") {
          let res = await Utils.makeJSON(
            Utils.sendXhrREQUEST(
              "POST",
              "GETaddPermission&filter=noFilter&limitResults=" +
                this.limiter.value +
                "&sendUserID=" +
                this.userID,
              "./includes/benutzerverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.showResults(res);
        } else {
          console.log("no input method");
          return false;
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
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
        results = Utils.makeJSON(results);

        if (!results.length > 0) {
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }
        results.forEach((result) => {
          if (!this.dontShowArray.includes(result["name"])) {
            //console.log(user);
            let tableRow = document.createElement("tr");
            tableRow.classList.add("result");
            tableRow.setAttribute("data-value", result["name"]);

            tableRow.innerHTML = `
            <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
            src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
            <td id="name">${result["name"]}</td>
            <td id="description">${result["description"]}</td>
            <td id="normalValue">${result["normalValue"]}</td>
            <td id="ranking">${result["ranking"]}</td>
            <td id="hinweis">${result["hinweis"]}</td>
            `;
            this.tableBody.append(tableRow);

            let checkBox = tableRow.querySelector(".select #select");
            if (!checkBox) return false;
            checkBox.addEventListener("change", (event) => {
              if (event.target.checked) {
                this.choosenArray = Utils.addToArray(
                  this.choosenArray,
                  result["name"],
                  false
                );
              } else {
                this.choosenArray = Utils.removeFromArray(
                  this.choosenArray,
                  result["name"]
                );
              }
            });

            let chooseThis = tableRow.querySelector(".select #chooseOnly");
            if (!chooseThis) return false;

            chooseThis.addEventListener("click", (event) => {
              let name = event.target
                .closest(".result")
                .getAttribute("data-value");
              if (!name) return;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["name"],
                false
              );
              goBackWithValue();
            });
          }
        });

        this.resultTable.classList.remove("hidden");
      }

      returnResultArray() {
        return this.choosenArray;
      }
    }

    let outerContainer = modal.querySelector("#programContainer");
    let container = outerContainer.querySelector(
      "#availablePermissionsContainer"
    );
    console.log(container);

    let addPermissionsVerwaltung = new AddPermissionsVerwaltung(container);

    if (hidePermissions.length > 0) {
      addPermissionsVerwaltung.dontShowArray = hidePermissions;
      console.log("To hide", hidePermissions);
    } else {
      addPermissionsVerwaltung.dontShowArray = new Array();
    }
    let res = await addPermissionsVerwaltung.prepareSearch();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      goBackWithValue();
    });

    function goBackWithValue() {
      let array = addPermissionsVerwaltung.returnResultArray();
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(array);
    }

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });
  });
}

export async function pickUsers(hideUsersIDS = false, typeToHide = false) {
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
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Berechtigungen ändern</h5>
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
</div>
    `;

    //Class
    class Benutzerverwaltung {
      constructor(container) {
        this.container = container;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;
    
        //Filters
        this.usernameSelectContainer = null;
        this.emailSelectContainer = null;
        this.userIDSelectContainer = null;
        this.klassenstufeSelectContainer = null;
        this.groupsSelectContainer = null;
        this.authenticatedSelectContainer = null;
        this.isOnlineSelectContainer = null;
        this.rankingSelectContainer = null;

        this.hideUsersIDS = null;
    
        this.permissionsAllowedSelectContainer = null;
        this.permissionsAllowedObject = new Object();
        this.permissionsForbiddenSelectContainer = null;
        this.permissionsForbiddenArray = new Array();
    
        this.groupsSearchArray = new Array();
        this.klassenstufenSearchArray = new Array();
    
        //Selection
        this.choosenArray = new Array();
        this.oldCheckedArray = new Array();
    
        //others
        this.searchWhileTyping = false;
        this.resultDescriptionContainer = null;
        this.resultBox = null;
    
        this.searchReloadBtn = null;
        this.editReloadBtn = null;
      }
    
      async prepareSearch() {
        if (!this.container) return "No container";
    
        //StartBtn
        let searchBtn = this.container.querySelector(".filter #search");
        console.log(searchBtn);
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
        let usernameSelectContainer =
          selectionFiltersContainer.querySelector("#username");
        let emailSelectContainer =
          selectionFiltersContainer.querySelector("#email");
        let userIDSelectContainer =
          selectionFiltersContainer.querySelector("#userID");
        let isOnlineSelectContainer =
          selectionFiltersContainer.querySelector("#isOnline");
        let klassenstufeSelectContainer =
          selectionFiltersContainer.querySelector("#klassenstufe");
        let groupsSelectContainer =
          selectionFiltersContainer.querySelector("#groups");
        let authenticatedSelectContainer =
          selectionFiltersContainer.querySelector("#authenticated");
        let permissionsAllowedSelectContainer =
          selectionFiltersContainer.querySelector("#permissionsAllowed");
        let permissionsForbiddenSelectContainer =
          selectionFiltersContainer.querySelector("#permissionsForbidden");
        let rankingSelectContainer =
          selectionFiltersContainer.querySelector("#ranking");
        if (
          !usernameSelectContainer ||
          !emailSelectContainer ||
          !userIDSelectContainer ||
          !klassenstufeSelectContainer ||
          !groupsSelectContainer ||
          !authenticatedSelectContainer ||
          !isOnlineSelectContainer ||
          !permissionsAllowedSelectContainer ||
          !permissionsForbiddenSelectContainer ||
          !rankingSelectContainer
        )
          return "Error in initializing Filters";
        this.usernameSelectContainer = usernameSelectContainer;
        this.emailSelectContainer = emailSelectContainer;
        this.userIDSelectContainer = userIDSelectContainer;
        this.isOnlineSelectContainer = isOnlineSelectContainer;
        this.klassenstufeSelectContainer = klassenstufeSelectContainer;
        this.groupsSelectContainer = groupsSelectContainer;
        this.permissionsAllowedSelectContainer = permissionsAllowedSelectContainer;
        this.permissionsForbiddenSelectContainer =
          permissionsForbiddenSelectContainer;
        this.authenticatedSelectContainer = authenticatedSelectContainer;
        this.rankingSelectContainer = rankingSelectContainer;
    
        //hide all
        this.usernameSelectContainer.classList.add("hidden");
        this.userIDSelectContainer.classList.add("hidden");
        this.emailSelectContainer.classList.add("hidden");
        this.isOnlineSelectContainer.classList.add("hidden");
        this.klassenstufeSelectContainer.classList.add("hidden");
        this.groupsSelectContainer.classList.add("hidden");
        this.permissionsAllowedSelectContainer.classList.add("hidden");
        this.authenticatedSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
    
        //Init limiter
        let limiter = selectionFiltersContainer.querySelector(
          "#limitResults #numberInput"
        );
        if (!limiter) return "no limiter";
        this.limiter = limiter;
    
        //Search While Typing
        let searchWhileTypingContainer = selectionFiltersContainer.querySelector(
          "#other #searchWhileTyping"
        );
        if (!searchWhileTypingContainer) return "no search while typin container";
        let searchWhileTypingCheckbox = searchWhileTypingContainer.querySelector(
          "#allowSearchWhileTyping"
        );
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
    
        ///ChooseAllBtn
        this.chooseAllBtn = this.resultTable.querySelector("thead #chooseall");
        if (!this.chooseAllBtn) return "No choose all btn";
        //Make Choose All -------
    
        this.chooseAllBtn.addEventListener("change", (event) => {
          if (event.target.checked) {
            console.log("checked");
            this.oldCheckedArray = Utils.copyArray(this.choosenArray);
            let allCheckBtns = this.resultTable.querySelectorAll(".result #select");
    
            allCheckBtns.forEach((element) => {
              let dataValue = element.closest(".result").getAttribute("data-value");
              element.checked = true;
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                dataValue,
                false
              );
            });
          } else {
            console.log("unchecked");
            let allCheckBtns = this.resultTable.querySelectorAll(".result #select");
    
            allCheckBtns.forEach((element) => {
              let dataValue = element.closest(".result").getAttribute("data-value");
    
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
          this.updateEditBtn();
        });
    
        //Result Desription
        let resultDescriptionContainer =
          this.container.querySelector(".resultDesciption");
        if (!resultDescriptionContainer) {
          return "no discription container";
        }
        this.resultDescriptionContainer = resultDescriptionContainer;
    
        let editBtn = this.container.querySelector("#editBtn");
        if (!editBtn) return "no editBtn";
        this.editBtn = editBtn;
        this.updateEditBtn();
        editBtn.addEventListener("click", () => {
          this.edit(this.choosenArray);
        });
    
        searchBtn.addEventListener("click", () => {
          this.search(this.arraySearch);
        });
    
        //Add that user can select type of filter and set normally to username
        this.chooseFilterTypeSelect.addEventListener("change", () => {
          let value =
            this.chooseFilterTypeSelect[
              chooseFilterTypeSelect.selectedIndex
            ].getAttribute("data-value");
          console.log(value);
          this.setFilterMode(value);
        });
    
        //First shown mode automatically
        this.setFilterMode("username");
    
        //Edit Container
        let editContainer = this.container.querySelector("#editContainer");
        if (!editContainer) return "no edit container";
        this.editContainer = editContainer;
        let editTable = editContainer.querySelector("#editTable");
        if (!editTable) return "no editTable";
        this.editTable = editTable;
        let editTableBody = editTable.querySelector("tbody");
        if (!editTableBody) return "no editTableBody";
        this.editTableBody = editTableBody;
      }
    
      updateEditBtn() {
        console.log(this.choosenArray.length);
        if (this.choosenArray.length > 0) {
          this.editBtn.disabled = false;
        } else {
          this.editBtn.disabled = true;
        }
      }
    
      async setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
        //Hide All and clear
        this.usernameSelectContainer.classList.add("hidden");
        this.emailSelectContainer.classList.add("hidden");
        this.userIDSelectContainer.classList.add("hidden");
        this.groupsSelectContainer.classList.add("hidden");
        this.klassenstufeSelectContainer.classList.add("hidden");
        this.permissionsAllowedSelectContainer.classList.add("hidden");
        this.permissionsForbiddenSelectContainer.classList.add("hidden");
        this.authenticatedSelectContainer.classList.add("hidden");
        this.isOnlineSelectContainer.classList.add("hidden");
        this.rankingSelectContainer.classList.add("hidden");
    
        if (value === "username") {
          this.enableFilter(this.usernameSelectContainer);
        } else if (value === "email") {
          this.enableFilter(this.emailSelectContainer);
        } else if (value === "userID") {
          this.enableFilter(this.userIDSelectContainer);
        } else if (value === "groups") {
          this.enableFilter(this.groupsSelectContainer);
        } else if (value === "klassenstufe") {
          this.enableFilter(this.klassenstufeSelectContainer);
        } else if (value === "permissionsAllowed") {
          this.enableFilter(this.permissionsAllowedSelectContainer);
        } else if (value === "permissionsForbidden") {
          this.enableFilter(this.permissionsForbiddenSelectContainer);
        } else if (value === "ranking") {
          this.enableFilter(this.rankingSelectContainer);
        } else if (value === "authenticated") {
          this.enableFilter(this.authenticatedSelectContainer);
        } else if (value === "isOnline") {
          this.enableFilter(this.isOnlineSelectContainer);
        } else if (value == "multiple") {
          this.enableFilter(this.usernameSelectContainer);
          this.enableFilter(this.emailSelectContainer);
          this.enableFilter(this.userIDSelectContainer);
          this.enableFilter(this.groupsSelectContainer);
          this.enableFilter(this.klassenstufeSelectContainer);
          this.enableFilter(this.permissionsSelectContainer);
          this.enableFilter(this.authenticatedSelectContainer);
          this.enableFilter(this.isOnlineSelectContainer);
          this.enableFilter(this.permissionsAllowedSelectContainer);
          this.enableFilter(this.permissionsForbiddenSelectContainer);
          this.enableFilter(this.rankingSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }
    
      async enableFilter(filter) {
        if (!filter) return false;
    
        if (filter === this.usernameSelectContainer) {
          let input = this.usernameSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.usernameSelectContainer.classList.remove("hidden");
        } else if (filter === this.emailSelectContainer) {
          //Email
          let input = this.emailSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.emailSelectContainer.classList.remove("hidden");
        } else if (filter === this.userIDSelectContainer) {
          //UserID
          let input = this.userIDSelectContainer.querySelector("#numberInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.userIDSelectContainer.classList.remove("hidden");
        } else if (filter === this.rankingSelectContainer) {
          //UserID
          let input = this.rankingSelectContainer.querySelector("#numberInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.rankingSelectContainer.classList.remove("hidden");
        } else if (filter === this.groupsSelectContainer) {
          //Groups
          this.groupsSearchArray = new Array(); //Reset old value
    
          let choosenContainer =
            this.groupsSelectContainer.querySelector("#choosen");
    
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.groupsSearchArray.length > 0) {
              this.groupsSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.groupsSearchArray = Utils.removeFromArray(
                    this.groupsSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };
    
          let addBtn = this.groupsSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableGroups = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAvailableGroups",
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await Utils.chooseFromArrayWithSearch(
              availableGroups,
              false,
              "Gruppen auswählen",
              this.groupsSearchArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.groupsSearchArray = Utils.addToArray(
                  this.groupsSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });
    
          this.groupsSelectContainer.classList.remove("hidden");
        } else if (filter === this.permissionsAllowedSelectContainer) {
          this.permissionsAllowedObject = new Object();
          console.log(this.permissionsAllowedObject);
          let choosenContainer =
            this.permissionsAllowedSelectContainer.querySelector("#choosen");
          choosenContainer.innerHTML = "";
          let addBtn =
            this.permissionsAllowedSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
    
          let add = async () => {
            let toAdd = await addPermission([]);
            if (toAdd && toAdd.length > 0) {
              for (const current of toAdd) {
                let input = await Utils.getUserInput(
                  "Eingabe",
                  `Welchen Wert soll die Berechtigung ${current} haben?`,
                  false,
                  "text",
                  1,
                  1,
                  false
                );
                if (!Utils.isEmptyInput(input, true)) {
                  this.permissionsAllowedObject[current] = input;
                  if (this.searchWhileTyping) {
                    this.search();
                  }
                }
              }
            }
            update();
          };
          addBtn.addEventListener("click", add);
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (Object.keys(this.permissionsAllowedObject).length > 0) {
              for (const [key, value] of Object.entries(
                this.permissionsAllowedObject
              )) {
                let listItem = document.createElement("li");
    
                listItem.setAttribute("data-value", key);
                listItem.innerHTML = `<span>${key} = ${value}</span><button type="button" id="remove">X</button><span></span>`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  delete this.permissionsAllowedObject[key];
                  update();
                  console.log("After", this.permissionsAllowedObject);
                });
              }
            }
          };
          this.permissionsAllowedSelectContainer.classList.remove("hidden");
        } else if (filter === this.permissionsForbiddenSelectContainer) {
          this.permissionsForbiddenArray = new Array();
          console.log(this.permissionsAllowedObject);
          let choosenContainer =
            this.permissionsForbiddenSelectContainer.querySelector("#choosen");
          choosenContainer.innerHTML = "";
          let addBtn =
            this.permissionsForbiddenSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
    
          let add = async () => {
            let toAdd = await addPermission([]);
            if (toAdd && toAdd.length > 0) {
              for (const current of toAdd) {
                this.permissionsForbiddenArray = Utils.addToArray(
                  this.permissionsForbiddenArray,
                  current,
                  false
                );
              }
            }
            update();
          };
          addBtn.addEventListener("click", add);
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.permissionsForbiddenArray.length > 0) {
              for (const current of this.permissionsForbiddenArray) {
                let listItem = document.createElement("li");
    
                listItem.setAttribute("data-value", current);
                listItem.innerHTML = `<span>${current}</span><button type="button" id="remove">X</button><span></span>`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.permissionsForbiddenArray = Utils.removeFromArray(
                    this.permissionsForbiddenArray,
                    current
                  );
                  update();
                  console.log("After", this.permissionsForbiddenArray);
                });
              }
            }
            if (this.searchWhileTyping) {
              this.search();
            }
          };
    
          this.permissionsForbiddenSelectContainer.classList.remove("hidden");
        } else if (filter === this.klassenstufeSelectContainer) {
          //Klassenstufen
    
          this.klassenstufenSearchArray = new Array(); //Reset old value
    
          let choosenContainer =
            this.klassenstufeSelectContainer.querySelector("#choosen");
    
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.klassenstufenSearchArray.length > 0) {
              this.klassenstufenSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.klassenstufenSearchArray = Utils.removeFromArray(
                    this.klassenstufenSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };
    
          let addBtn = this.klassenstufeSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableKlassenstufen = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "benutzerverwaltung&operation=other&type=getAllKlassenstufen",
                "./includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await Utils.chooseFromArrayWithSearch(
              availableKlassenstufen,
              false,
              "Klassenstufe auswählen",
              this.klassenstufenSearchArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.klassenstufenSearchArray = Utils.addToArray(
                  this.klassenstufenSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });
    
          this.klassenstufeSelectContainer.classList.remove("hidden");
        } else if (filter === this.authenticatedSelectContainer) {
          let select =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          Utils.listenToChanges(select, "change", 200, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.authenticatedSelectContainer.classList.remove("hidden");
        } else if (filter === this.isOnlineSelectContainer) {
          let select = this.isOnlineSelectContainer.querySelector("#selectInput");
          Utils.listenToChanges(select, "change", 200, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.isOnlineSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }
    
      async search() {
        this.searchReloadBtn.disabled = true;
        //Utils.toggleLodingAnimation(this.container)
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();
        this.editContainer.classList.add("hidden");
        this.clear(this.editTableBody);
    
        if (this.filterType === "username") {
          let input =
            this.usernameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=username&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "email") {
          let input = this.emailSelectContainer.querySelector("#textInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=email&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "userID") {
          let input =
            this.userIDSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=userID&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "groups") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=groups&input=" +
                    JSON.stringify(this.groupsSearchArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "klassenstufe") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=klassenstufe&input=" +
                    JSON.stringify(this.klassenstufenSearchArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "permissionsAllowed") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=permissionsAllowed&input=" +
                    JSON.stringify(this.permissionsAllowedObject) +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "permissionsForbidden") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=permissionsForbidden&input=" +
                    JSON.stringify(this.permissionsForbiddenArray) +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "ranking") {
          let input =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=ranking&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType == "authenticated") {
          let select =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=authenticated&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "isOnline") {
          let select = this.isOnlineSelectContainer.querySelector("#selectInput");
          let input = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=isOnline&input=" +
                    input +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "all") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=all&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType == "multiple") {
          //Username
          let username =
            this.usernameSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(username)) {
            username = false;
          }
    
          //Email
          let email = this.emailSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(email)) {
            email = false;
          }
    
          //userID
          let userID =
            this.userIDSelectContainer.querySelector("#numberInput").value;
          if (Utils.isEmptyInput(userID)) {
            userID = false;
          }
    
          //ranking
          let ranking =
            this.rankingSelectContainer.querySelector("#numberInput").value;
          if (Utils.isEmptyInput(ranking)) {
            ranking = false;
          }
    
          //Groups
          let groups = this.groupsSearchArray;
          if (!groups.length > 0) {
            groups = false;
          }
    
          //Klassenstufe
          let klassenstufen = this.klassenstufenSearchArray;
          if (!klassenstufen.length > 0) {
            klassenstufen = false;
          }
    
          //isOnline
          let isOnlineSelect =
            this.isOnlineSelectContainer.querySelector("#selectInput");
          let isOnline =
            isOnlineSelect[isOnlineSelect.selectedIndex].getAttribute("data-value");
          if (Utils.isEmptyInput(isOnline)) {
            isOnline = false;
          }
    
          //authenticated
          let authenticatedSelect =
            this.authenticatedSelectContainer.querySelector("#selectInput");
          let authenticated =
            authenticatedSelect[authenticatedSelect.selectedIndex].getAttribute(
              "data-value"
            );
          if (Utils.isEmptyInput(authenticated)) {
            authenticated = false;
          }
    
          //permissionsAllowed
          let permissionsAllowed = this.permissionsAllowedObject;
          if (!Object.keys(permissionsAllowed).length) {
            permissionsAllowed = false;
          }
    
          //permissionsForbidden
          let permissionsForbidden = this.permissionsForbiddenArray;
          if (!permissionsForbidden.length > 0) {
            permissionsForbidden = false;
          }
    
          console.log(
            username,
            email,
            userID,
            ranking,
            groups,
            klassenstufen,
            isOnline,
            authenticated,
            permissionsAllowed,
            permissionsForbidden
          );
    
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "benutzerverwaltung&operation=search&type=multiple&username=" +
                    username +
                    "&email=" +
                    email +
                    "&userID=" +
                    userID +
                    "&ranking=" +
                    ranking +
                    "&groups=" +
                    JSON.stringify(groups) +
                    "&klassenstufen=" +
                    klassenstufen +
                    "&isOnline=" +
                    isOnline +
                    "&authenticated=" +
                    authenticated +
                    "&permissionsAllowed=" +
                    JSON.stringify(permissionsAllowed) +
                    "&permissionsForbidden=" +
                    JSON.stringify(permissionsForbidden) +
                    "&limitResults=" +
                    this.limiter.value,
                  "./includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else {
          console.log("no input method");
          return false;
        }
      }
    
      showResults(results) {
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
        this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;
    
        let tableBody = this.resultTable.querySelector("tbody");
        if (!tableBody) return false;
        this.tableBody = tableBody;
    
        results = Utils.sortItems(results, "username"); //Just sort it to better overview
    
        for (const result of results) {
          if (this.hideUsersIDS && this.hideUsersIDS.length) {
            if (result[typeToHide] == result) {
              continue;
            }
          }
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-value", result["userID"]);
    
          let showPublicText = "Nein";
          if (Boolean(Utils.makeJSON(result["showPublic"]))) {
            showPublicText = "Ja";
          }
    
          tableRow.innerHTML = `
          <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
          <td id="username">${result["username"]}</td>
          <td id="email">${result["email"]}</td>
          <td id="klassenstufe">${result["klassenstufe"]}</td>
          <td id="authenticated">${result["authenticated"]}</td>
          <td id="isOnline">${result["isOnline"]}</td>
          <td id="lastActivity"><span class="first">Vor ${result["lastActivityString"]} </span><span class="second">(${result["lastActivity"]})</span></td>
          <td id="lastQuiz">${result["lastQuiz"]}</td>
          <td id="lastLogin"><span class="first">Vor ${result["lastLoginString"]} </span><span class="second">(${result["lastLogin"]})</span></td>
          <td id="groups">${result["groups"]}</td>
          <td id="permissionsAllowed">${result["permissionsAllowed"]}</td>
          <td id="permissionsForbidden">${result["permissionsForbidden"]}</td>
          <td id="created"><span class="first">Vor ${result["createdString"]} </span><span class="second">(${result["created"]})</span></td>
          <td id="lastPwdChange"><span class="first">Vor ${result["lastPwdChangeString"]} </span><span class="second">(${result["lastPwdChange"]})</span></td>
          <td id="userID">${result["userID"]}</td>
          <td id="nextMessages">${result["nextMessages"]}</td>
          <td id="ranking">${result["ranking"]}</td>
          <td id="showPublic">${showPublicText}</td>
          `;
          this.tableBody.append(tableRow);
    
          let groupsInner = tableRow.querySelector("#groups");
          let usersGroups = Utils.makeJSON(result["groups"]);
          Utils.listOfArrayToHTML(groupsInner, usersGroups, "Keine Gruppen");
    
          //Allowed Permissions
          let permissionsInner = tableRow.querySelector("#permissionsAllowed");
          Utils.objectKEYVALUEToHTML(
            permissionsInner,
            result["permissionsAllowed"],
            "Keine zusätzlichen"
          );
    
          //Forbidden Permissions
          let forbiddenPermissionsInner = tableRow.querySelector(
            "#permissionsForbidden"
          );
          Utils.listOfArrayToHTML(
            forbiddenPermissionsInner,
            result["permissionsForbidden"],
            "Keine zusätzlichen"
          );
    
          //Next Messages
          let nextMessagesInner = tableRow.querySelector("#nextMessages");
          Utils.listOfArrayToHTML(nextMessagesInner, result["nextMessages"]);
    
          let checkBox = tableRow.querySelector(".select #select");
          checkBox.addEventListener("change", (event) => {
            if (event.target.checked) {
              this.choosenArray = Utils.addToArray(
                this.choosenArray,
                result["userID"],
                false
              );
            } else {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                result["userID"]
              );
            }
            this.updateEditBtn();
          });
    
          let chooseThis = tableRow.querySelector(".select #chooseOnly");
          if (!chooseThis) continue;
    
          chooseThis.addEventListener("click", (event) => {
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              result["userID"],
              false
            );
           goBackWithValue();
          });
        }
        this.searchReloadBtn.disabled = false;
        this.resultTable.classList.remove("hidden");
      }
    
      clear(element) {
        element.innerHTML = "";
      }
    }
    

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
      goBackWithValue();
    });

    function goBackWithValue() {
      let array = benutzerverwaltung.choosenArray;
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(array);
    }

    no.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      Utils.hideAllModals(false);
      resolve(false);
    });

    //Create UserSearch
    let benutzerververwaltungContainer = modal.querySelector(
      "#benutzerverwaltung"
    );
    let benutzerverwaltung = new Benutzerverwaltung(benutzerververwaltungContainer);
    console.log(benutzerverwaltung.prepareSearch());
    benutzerverwaltung.hideUsersIDS = hideUsersIDS;
  });
}