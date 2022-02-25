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
      if (usersGroups?.length > 0) {
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
          if (!Utils.isEmptyInput(value, true)) {
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
              if (!Utils.isEmptyInput(value, true)) {
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

export async function editScores(userID) {
  return new Promise(async(resolve, reject) => {
    const [modal, bootstrapModal, modalBody, modalOuter] = Utils.createModal({
      title: "Scores bearbeiten",
      fullscreen: true,
      verticallyCentered: false,
      modalType: "yes/no",
    });
    modalBody.innerHTML = 
    `
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
    `;
    bootstrapModal.show();

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    yes.addEventListener("click", (target) => {
          modalOuter.remove();
          resolve(true);
    });

    no.addEventListener("click", (target) => {
      modalOuter.remove();
      resolve(false);
    });

    close.addEventListener("click", (target) => {
      modalOuter.remove();
      resolve(false);
    });
   
    class EditScores {
      constructor(container, userID) {
        this.container = container;
        this.userID = userID;
        this.searchBtn = null;
        this.chooseFilterTypeSelect = null;
        this.filterContainer = null;
        this.selectionFiltersContainer = null;
        this.limiter = null;
    
        //Filters
        this.dateSelectContainer = null;
        this.klassenstufenSelectContainer = null;
        this.klassenstufenSearchArray = new Array();
        this.fachSelectContainer = null;
        this.fachSearchArray = new Array();
        this.themaSelectContainer = null;
        this.themaSearchArray = new Array();
        this.quiznameSelectContainer = null;
        this.quizIDSelectContainer = null;
        this.timeNeededSelectContainer = null;
        this.resultSelectContainer = null;
    
        //Selection
    
        //others
        this.searchWhileTyping = false;
        this.resultDescriptionContainer = null;
        this.resultBox = null;
    
        this.searchReloadBtn = null;
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
        let dateSelectContainer = selectionFiltersContainer.querySelector("#date");
        let klassenstufenSelectContainer =
          selectionFiltersContainer.querySelector("#klassenstufe");
        let fachSelectContainer = selectionFiltersContainer.querySelector("#fach");
        let themaSelectContainer =
          selectionFiltersContainer.querySelector("#thema");
        let quiznameSelectContainer =
          selectionFiltersContainer.querySelector("#quizname");
        let quizIDSelectContainer =
          selectionFiltersContainer.querySelector("#quizID");
        let timeNeededSelectContainer =
          selectionFiltersContainer.querySelector("#timeNeeded");
        let resultSelectContainer =
          selectionFiltersContainer.querySelector("#result");
    
        if (
          !dateSelectContainer ||
          !klassenstufenSelectContainer ||
          !fachSelectContainer ||
          !quiznameSelectContainer ||
          !quizIDSelectContainer ||
          !timeNeededSelectContainer ||
          !resultSelectContainer
        )
          return "Error in initializing Filters";
    
        this.dateSelectContainer = dateSelectContainer;
        this.klassenstufenSelectContainer = klassenstufenSelectContainer;
        this.fachSelectContainer = fachSelectContainer;
        this.themaSelectContainer = themaSelectContainer;
        this.quiznameSelectContainer = quiznameSelectContainer;
        this.quizIDSelectContainer = quizIDSelectContainer;
        this.timeNeededSelectContainer = timeNeededSelectContainer;
        this.resultSelectContainer = resultSelectContainer;
    
        //hide all
        this.dateSelectContainer.classList.add("hidden");
        this.klassenstufenSelectContainer.classList.add("hidden");
        this.fachSelectContainer.classList.add("hidden");
        this.themaSelectContainer.classList.add("hidden");
        this.quiznameSelectContainer.classList.add("hidden");
        this.quizIDSelectContainer.classList.add("hidden");
        this.timeNeededSelectContainer.classList.add("hidden");
        this.resultSelectContainer.classList.add("hidden");
    
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
      }
    
      async setFilterMode(value) {
        if (!value) return false;
        this.filterType = value;
    
        Utils.selectListSelectItemBySelector(
          this.container.querySelector("#chooseFilter"),
          "data-value",
          value
        );
        //hide all
        this.dateSelectContainer.classList.add("hidden");
        this.klassenstufenSelectContainer.classList.add("hidden");
        this.fachSelectContainer.classList.add("hidden");
        this.themaSelectContainer.classList.add("hidden");
        this.quiznameSelectContainer.classList.add("hidden");
        this.quizIDSelectContainer.classList.add("hidden");
        this.timeNeededSelectContainer.classList.add("hidden");
        this.resultSelectContainer.classList.add("hidden");
    
        if (value === "all") {
          //No filter to enable
        } else if (value === "date") {
          this.enableFilter(this.dateSelectContainer);
        } else if (value === "klassenstufe") {
          this.enableFilter(this.klassenstufenSelectContainer);
        } else if (value === "fach") {
          this.enableFilter(this.fachSelectContainer);
        } else if (value === "thema") {
          this.enableFilter(this.themaSelectContainer);
        } else if (value === "quizname") {
          this.enableFilter(this.quiznameSelectContainer);
        } else if (value === "quizID") {
          this.enableFilter(this.quizIDSelectContainer);
        } else if (value === "timeNeeded") {
          this.enableFilter(this.timeNeededSelectContainer);
        } else if (value === "result") {
          this.enableFilter(this.resultSelectContainer);
        } else if (value == "multiple") {
          this.enableFilter(this.dateSelectContainer);
          this.enableFilter(this.klassenstufenSelectContainer);
          this.enableFilter(this.fachSelectContainer);
          this.enableFilter(this.themaSelectContainer);
          this.enableFilter(this.quiznameSelectContainer);
          this.enableFilter(this.quizIDSelectContainer);
          this.enableFilter(this.timeNeededSelectContainer);
          this.enableFilter(this.resultSelectContainer);
        } else if (value == "all") {
          //Nothing to show
        }
      }
    
      async enableFilter(filter) {
        if (!filter) return false;
    
        if (filter === this.dateSelectContainer) {
          let startDateInput = this.dateSelectContainer.querySelector("#startDate");
          startDateInput.addEventListener("change", () => {
            console.log(new Date(startDateInput.value).getTime());
          });
          Utils.listenToChanges(startDateInput, "change", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          let endDateInput = this.dateSelectContainer.querySelector("#endDate");
          endDateInput.addEventListener("change", () => {
            console.log(new Date(endDateInput.value).getTime());
          });
          Utils.listenToChanges(endDateInput, "change", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
    
    
          this.dateSelectContainer.classList.remove("hidden");
        } else if (filter === this.resultSelectContainer) {
          let select = this.resultSelectContainer.querySelector("#selectInput");
          Utils.listenToChanges(select, "change", 200, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.resultSelectContainer.classList.remove("hidden");
        } else if (filter === this.klassenstufenSelectContainer) {
          this.klassenstufenSearchArray = new Array(); //Reset old value
          let choosenContainer =
            this.klassenstufenSelectContainer.querySelector("#choosen");
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
    
          let addBtn = this.klassenstufenSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableKlassenstufen = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "scoreverwaltung&operation=other&type=getKlassenstufen",
                "/teacher/includes/benutzerverwaltung.inc.php",
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
    
          this.klassenstufenSelectContainer.classList.remove("hidden");
        } else if (filter === this.fachSelectContainer) {
          this.fachSearchArray = new Array(); //Reset old value
          let choosenContainer = this.fachSelectContainer.querySelector("#choosen");
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.fachSearchArray.length > 0) {
              this.fachSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.fachSearchArray = Utils.removeFromArray(
                    this.fachSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };
    
          let addBtn = this.fachSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let availableFaecher = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "scoreverwaltung&operation=other&type=getFaecher",
                "/teacher/includes/benutzerverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            let choosen = await Utils.chooseFromArrayWithSearch(
              availableFaecher,
              false,
              "Fach auswählen",
              this.fachSearchArray,
              true
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.fachSearchArray = Utils.addToArray(
                  this.fachSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });
    
          this.fachSelectContainer.classList.remove("hidden");
        } else if (filter === this.themaSelectContainer) {
          this.themaSearchArray = new Array(); //Reset old value
          let choosenContainer =
            this.themaSelectContainer.querySelector("#choosen");
          let update = () => {
            //Update Choosen
            choosenContainer.innerHTML = "";
            if (this.themaSearchArray.length > 0) {
              this.themaSearchArray.forEach((element) => {
                let listItem = document.createElement("li");
                listItem.setAttribute("data-value", element);
                listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button><span></span`;
                choosenContainer.appendChild(listItem);
    
                let removeBtn = listItem.querySelector("#remove");
                removeBtn.addEventListener("click", (event) => {
                  this.themaSearchArray = Utils.removeFromArray(
                    this.themaSearchArray,
                    element
                  );
                  update();
                });
              });
            }
          };
    
          let addBtn = this.themaSelectContainer.querySelector("#addBtn");
          addBtn = Utils.removeAllEventlisteners(addBtn);
          addBtn.addEventListener("click", async () => {
            let choosen = await Utils.chooseFromArrayWithSearch(
              [],
              true,
              "Thema auswählen",
              false,
              false,
              true,
              "scoreverwaltung&operation=other&type=searchThema&input=",
              "/teacher/includes/benutzerverwaltung.inc.php"
            );
            if (choosen && choosen.length > 0) {
              for (const current of choosen) {
                this.themaSearchArray = Utils.addToArray(
                  this.themaSearchArray,
                  current,
                  false
                );
              }
            }
            update();
          });
    
          this.themaSelectContainer.classList.remove("hidden");
        } else if (filter === this.quiznameSelectContainer) {
          let input = this.quiznameSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.quiznameSelectContainer.classList.remove("hidden");
        } else if (filter === this.quizIDSelectContainer) {
          let input = this.quizIDSelectContainer.querySelector("#textInput");
          Utils.listenToChanges(input, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.quizIDSelectContainer.classList.remove("hidden");
        } else if (filter === this.timeNeededSelectContainer) {
          let fromNumberInput =
            this.timeNeededSelectContainer.querySelector("#from");
          let toNumberInput = this.timeNeededSelectContainer.querySelector("#to");
    
          Utils.listenToChanges(fromNumberInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          Utils.listenToChanges(toNumberInput, "input", 450, () => {
            if (this.searchWhileTyping) {
              this.search();
            }
          });
          this.timeNeededSelectContainer.classList.remove("hidden");
        } else {
          return false;
        }
      }
    
      async search() {
        this.searchReloadBtn.disabled = true;
        this.searchBtn.classList.add("loading");
        this.choosenArray = new Array();
    
        if (this.filterType === "result") {
          let select = this.resultSelectContainer.querySelector("#selectInput");
          let filterBy = select[select.selectedIndex].getAttribute("data-value");
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=result&filterBy=" +
                    filterBy +
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "date") {
          let startDateInput = this.dateSelectContainer.querySelector("#startDate");
          let startDate = false;
          if (!Utils.isEmptyInput(startDateInput.value)) {
            startDate = new Date(startDateInput.value).getTime() / 1000; 
          }
          let endDateInput = this.dateSelectContainer.querySelector("#endDate");
          let endDate = false;
          if (!Utils.isEmptyInput(endDateInput.value)) {
            endDate = new Date(endDateInput.value).getTime() / 1000; 
          }
    
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=date&startDate=" +
                    startDate + "&endDate=" + endDate + 
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
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
                  "scoreverwaltung&operation=search&type=klassenstufe&klassenstufen=" +
                    JSON.stringify(this.klassenstufenSearchArray)+
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "fach") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=fach&faecher=" +
                    JSON.stringify(this.fachSearchArray)+
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "thema") {
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=thema&themen=" +
                    JSON.stringify(this.themaSearchArray)+
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "quizname") {
          let input = this.quiznameSelectContainer.querySelector("#textInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=quizname&input=" +
                    JSON.stringify({input}) +
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        } else if (this.filterType === "quizID") {
          let input = this.quizIDSelectContainer.querySelector("#textInput").value;
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=quizID&input=" +
                    JSON.stringify({input}) +
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              )
            )
          );
        }  else if (this.filterType === "timeNeeded") {
          let minTime =
            this.timeNeededSelectContainer.querySelector("#from").value;
          let maxTime = this.timeNeededSelectContainer.querySelector("#to").value;
    
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=timeNeeded&minTime=" +
                    Number(minTime) + "&maxTime=" + Number(maxTime) + 
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
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
                  "scoreverwaltung&operation=search&type=all&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
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
          //result
          let resultSelect =
            this.resultSelectContainer.querySelector("#selectInput");
          let result =
          resultSelect[resultSelect.selectedIndex].getAttribute("data-value");
          if (Utils.isEmptyInput(result)) {
            result = false;
          }
    
          //date
          let startDateInput = this.dateSelectContainer.querySelector("#startDate");
          let startDate = false;
          if (!Utils.isEmptyInput(startDateInput.value)) {
            startDate = new Date(startDateInput.value).getTime() / 1000; 
          }
          let endDateInput = this.dateSelectContainer.querySelector("#endDate");
          let endDate = false;
          if (!Utils.isEmptyInput(endDateInput.value)) {
            endDate = new Date(endDateInput.value).getTime() / 1000; 
          }
          //klassenstufe
          let klassenstufen = this.klassenstufenSearchArray;
          if (!klassenstufen.length > 0) klassenstufen = false;
          //fach
          let faecher = this.fachSearchArray;
          if (!faecher.length > 0) faecher = false;
          //thema
          let themen = this.themaSearchArray;
          if (!themen.length > 0) themen = false;
          //quizname
          let quizname = this.quiznameSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(quizname)) quizname = false;
          //quizID
          let quizID = this.quizIDSelectContainer.querySelector("#textInput").value;
          if (Utils.isEmptyInput(quizID)) quizID = false;
          //timeNeeded
          let minTime =
          this.timeNeededSelectContainer.querySelector("#from").value;
          if (Utils.isEmptyInput(minTime)) minTime = false;
          let maxTime = this.timeNeededSelectContainer.querySelector("#to").value;
          if (Utils.isEmptyInput(maxTime)) maxTime = false;
    
          console.log(
            {result, startDate, endDate, klassenstufen, faecher, themen, quizname, quizID, minTime, maxTime}
          );
    
          this.showResults(
            Utils.makeJSON(
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "scoreverwaltung&operation=search&type=multiple&result=" +
                    result +
                    "&startDate=" +
                    startDate +
                    "&endDate=" +
                    endDate +
                    "&klassenstufen=" +
                    JSON.stringify(klassenstufen) +
                    "&faecher=" +
                    JSON.stringify(faecher) +
                    "&themen=" +
                    JSON.stringify(themen) +
                    "&quizname=" +
                    JSON.stringify({quizname}) +
                    "&quizID=" +
                    JSON.stringify({quizID}) +
                    "&minTime=" +
                    minTime +
                    "&maxTime=" +
                    maxTime +
                    "&limitResults=" +
                    this.limiter.value + "&userID=" + this.userID,
                  "/teacher/includes/benutzerverwaltung.inc.php",
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
        this.resultDescriptionContainer.classList.remove("hidden");
    
        let tableBody = this.resultTable.querySelector("tbody");
        if (!tableBody) return false;
        this.tableBody = tableBody;
        this.clear(this.tableBody);
    
        if (!results) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return true;
        }
    
        if (!results.length > 0) {
          this.resultTable.classList.add("hidden");
          this.resultDescriptionContainer.innerHTML = "Keine Ergebnisse...";
          return false;
        }
        this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;
    
        for (const result of results) {
          //console.log(user);
          let tableRow = document.createElement("tr");
          tableRow.classList.add("result");
          tableRow.setAttribute("data-quizID", result["quizID"]);
    
          tableRow.innerHTML = `
          <td id="date" style="min-width: 150px;">${result["date"]}</td>
          <td id="results" style="min-width: 190px;"></td>
          <td id="klassenstufe">${result["klassenstufe"] ?? "nicht zugewiesen"}</td>
          <td id="fach">${result["fach"] ?? "nicht zugewiesen"}</td>
          <td id="thema">${result["thema"] ?? "nicht zugewiesen"}</td>
          <td id="quizname">${result["quizname"] ?? "nicht zugewiesen"}</td>
          <td id="quizID">
            
          </td>
          <td id="actions"></td>
          <td id="information"></td>
          `;
          this.tableBody.append(tableRow);
    
          let information = tableRow.querySelector("#information");
          if (!result["exists"]) {
            information.innerHTML = "<b>Quiz existiert nicht mehr</b>";
            continue;
          }
    
          let quizIDContainer = tableRow.querySelector("#quizID");
          quizIDContainer.innerHTML = `<div class="content">${
            result["quizID"] ?? "nicht zugewiesen"
          }</div>
          <span class="loading-btn-wrapper copyQuizID-wrapper">
              <button class="loading-btn copyQuizID">
                <span class="loading-btn__text">
                  QuizID kopieren
                </span>
              </button>
            </span>
          </span>`;
          //Copy quizID
          let copyQuizIDBtn = tableRow.querySelector(
            "#quizID .copyQuizID-wrapper .copyQuizID"
          );
          copyQuizIDBtn.addEventListener("click", () => {
            copyQuizIDBtn.classList.add("loading-btn--pending");
            if (Utils.copyTextToClipboard(result["quizID"])) {
              copyQuizIDBtn.classList.remove("loading-btn--pending");
              copyQuizIDBtn.classList.add("loading-btn--success");
              window.setTimeout(() => {
                copyQuizIDBtn.classList.remove("loading-btn--success");
              }, 1300);
            } else {
              copyQuizIDBtn.classList.remove("loading-btn--pending");
              copyQuizIDBtn.classList.add("loading-btn--failed");
              window.setTimeout(() => {
                copyQuizIDBtn.classList.remove("loading-btn--failed");
              }, 1300);
            }
          });
    
          //Actions
          let actions = tableRow.querySelector("#actions");
          actions.innerHTML = `
          <ul>
            <li><a href="/quiz.php?quizId=${result["quizID"]}">Zum Quiz</a></li>
            <li><button type="button" class="btn btn-danger btn-sm" id="delete">löschen</button></li>
            <li><button type="button" class="btn btn-info btn-sm" id="showData">JSON-Daten anzeigen</button></li>
          </ul>
          `;

          let deleteThisScoreBtn = actions.querySelector("#delete");
          deleteThisScoreBtn.addEventListener("click", async() => {
            if (!Utils.userHasPermissions(["benutzerverwaltungDeleteEntries"])) {
              return false;
            }

            if (await Utils.askUser("Score-Eintrag löschen", "Bist du dir sicher, dass du diesen Score-Eintrag löschen möchtest?", false)) {
              await Utils.makeJSON(
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "scoreverwaltung&operation=removeScore&scoreID=" + result["id"] + "&userID=" + this.userID,
                    "/teacher/includes/benutzerverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    true,
                    false,
                    true
                  )
                )
              )
              this.search();
            }
          });

          let showJSONDataBtn = actions.querySelector("#showData");
          showJSONDataBtn.addEventListener("click", () => {
            Utils.getUserInput("Quizdaten", "Hier sind genauere Informationen über die Antworten des Nutzers", false, "textArea", "", JSON.stringify(result["results"], null, 3), true, false, false, true);
          });
    
          //information
    
          //Result data
          let results = result["results"];
          let resultContainer = tableRow.querySelector("#results");
          if (results) {
            resultContainer.innerHTML = 
            `
            <ul>
              <li id="mark"><b>Note</b>:${results["mark"]}</li>
              <li id="points"><b>Punkte</b>: ${results["scoredPoints"]} / ${results["totalPoints"]}</li>
              <li id="timeNeeded"><b>Zeit benötigt</b>: ${Utils.secondsToArrayOrString(results["timeNeeded"], "String")}</li>
            </ul>
            `;
          } else {
            resultContainer.innerHTML `Keine Daten`;
          }
          
    
          this.resultTable.classList.remove("hidden");
        }
        this.searchReloadBtn.disabled = false;
        this.resultTable.classList.remove("hidden");
      }
    
      clear(element) {
        element.innerHTML = "";
      }
    }
    
    let editScoresContainer = modalBody.querySelector("#scoreVerwaltung");
    let editScores = new EditScores(editScoresContainer, userID);
    console.log(await editScores.prepareSearch());
    console.log(editScores.setFilterMode("all"));
    editScores.search();
  });
}

