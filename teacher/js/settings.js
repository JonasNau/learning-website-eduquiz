import * as Utils from "../../../includes/utils.js";

import { addPermission, changeUsedAt, changeType } from "./settngs.inc.js";

class SETTINGS {
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
    this.typeSelectContainer = null;
    this.descriptionSelectContainer = null;
    this.settingSelectContainer = null;
    this.normalValueSelectContainer = null;
    this.usedAtSelectContainer = null;
    this.usedAtArray = new Array();
    this.idSelectContainer = null;
    this.coustomIDSelectContainer = null;
    this.permissionNeededSelectContainer = null;
    this.limiter = null;

    this.permissionNeededChoice = false;

    //others
    this.searchWhileTyping = false;
    this.editBtn = null;

    this.editTable = null;
    this.editContainer = null;
    this.editTableBody = null;
    this.resultDescriptionContainer = null;
    // this.resultsDescription = null;
    // this.resultsFound = null;

    this.dontShowArray = null;

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });

    //Edit Btn
    this.editReloadBtn = reloadBtn;

    this.clear(this.editTableBody);
    //Change All
    let thead = this.editTable.querySelector("thead");
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
    filterContainer.classList.add("hidden"); //Hide it if it loads

    //Filter Type Select (init)
    let chooseFilterTypeSelect = filterContainer.querySelector(
      "#chooseFilterTypeContainer #chooseFilter"
    );
    if (!chooseFilterTypeSelect) return "no chooseFilterTypeSelect";
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

    this.settingSelectContainer = null;
    this.normalValueSelectContainer = null;
    this.usedAtSelectContainer = null;
    this.usedAtArray = new Array();
    this.idSelectContainer = null;
    this.coustomIDSelectContainer = null;
    this.permissionNeededSelectContainer = null;

    let nameSelectContainer = selectionFiltersContainer.querySelector("#name");
    let typeSelectContainer = selectionFiltersContainer.querySelector("#type");
    let descriptionSelectContainer =
      selectionFiltersContainer.querySelector("#description");
    let normalValueSelectContainer =
      selectionFiltersContainer.querySelector("#normalValue");
    let settingSelectContainer =
      selectionFiltersContainer.querySelector("#setting");
    let usedAtSelectContainer =
      selectionFiltersContainer.querySelector("#usedAt");
    let idSelectContainer = selectionFiltersContainer.querySelector("#id");
    let permissionNeededSelectContainer =
      selectionFiltersContainer.querySelector("#permissionNeeded");

    if (
      !nameSelectContainer ||
      !typeSelectContainer ||
      !descriptionSelectContainer ||
      !normalValueSelectContainer ||
      !usedAtSelectContainer ||
      !settingSelectContainer ||
      !idSelectContainer ||
      !permissionNeededSelectContainer
    ) {
      return "Error in initializing Filters";
    }

    this.nameSelectContainer = nameSelectContainer;
    this.typeSelectContainer = typeSelectContainer;
    this.descriptionSelectContainer = descriptionSelectContainer;
    this.normalValueSelectContainer = normalValueSelectContainer;
    this.usedAtSelectContainer = usedAtSelectContainer;
    this.idSelectContainer = idSelectContainer;
    this.settingSelectContainer = settingSelectContainer;
    this.permissionNeededSelectContainer = permissionNeededSelectContainer;
    //hide all
    this.nameSelectContainer.classList.add("hidden");
    this.typeSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.settingSelectContainer.classList.add("hidden");
    this.normalValueSelectContainer.classList.add("hidden");
    this.usedAtSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");
    this.permissionNeededSelectContainer.classList.add("hidden");

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
      console.log(this.searchReloadBtn);
      this.search();
    });
    this.searchReloadBtn = reloadBtn;
    this.searchReloadBtn.disabled = true;

    //Add that user can select type of filter and set normally to username
    this.chooseFilterTypeSelect.addEventListener("change", () => {
      let value =
        this.chooseFilterTypeSelect[
          chooseFilterTypeSelect.selectedIndex
        ].getAttribute("data-value");
      console.log(value);
      this.setFilterMode(value);
    });

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

    let addBtn = this.container.querySelector("#addBtn");
    if (!addBtn) return "no addBtn";
    addBtn.addEventListener("click", async () => {
      if (!(await Utils.userHasPermissions(["SettingsADDandREMOVE"]))) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Wie soll die Einstellung heißen?",
        false,
        "text"
      );
      if (Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Einstellung nicht erstellt.", false);
        return false;
      }
      let res = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "settings&operation=createSetting&&name=" + userInput,
          "./includes/settings.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true,
          true
        )
      );
      if (res["status"]) {
        let id = res["data"];
        this.choosenArray = Utils.addToArray(this.choosenArray, id, false);
        this.setFilterMode("id");
        this.idSelectContainer.querySelector("#numberInput").value = id;
        this.search();
      } else {
        this.search();
      }
    });

    searchBtn.addEventListener("click", () => {
      this.search();
    });
  }

  setFilterMode(value) {
    this.searchBtn.classList.remove("loading");
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.typeSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.normalValueSelectContainer.classList.add("hidden");
    this.usedAtSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");
    this.settingSelectContainer.classList.add("hidden");
    this.permissionNeededSelectContainer.classList.add("hidden");
    if (!value) return false;
    this.filterType = value;

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "type") {
      this.enableFilter(this.typeSelectContainer);
    } else if (value === "description") {
      this.enableFilter(this.descriptionSelectContainer);
    } else if (value === "setting") {
      this.enableFilter(this.settingSelectContainer);
    } else if (value === "normalValue") {
      this.enableFilter(this.normalValueSelectContainer);
    } else if (value === "usedAt") {
      this.enableFilter(this.usedAtSelectContainer);
    } else if (value === "permissionNeeded") {
      this.enableFilter(this.permissionNeededSelectContainer);
    } else if (value === "id") {
      this.enableFilter(this.idSelectContainer);
    } else if (value == "all") {
      //Nothing to show
    } else {
      console.log("no filter");
    }
  }

  async enableFilter(filter) {
    if (!filter) return false;

    if (filter === this.nameSelectContainer) {
      //name
      let textInput = this.nameSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.nameSelectContainer.classList.remove("hidden");
    } else if (filter === this.typeSelectContainer) {
      //type select
      let select = this.typeSelectContainer.querySelector("#selectInput");
      //Fill in values
      let types = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "settings&operation=other&type=getAllAvailableTypes",
          "./includes/settings.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          true,
          true
        )
      );
      Utils.fillListWithValues(select, types, true);
      Utils.listenToChanges(select, "change", 650, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.typeSelectContainer.classList.remove("hidden");
    } else if (filter === this.descriptionSelectContainer) {
      //description
      let textInput =
        this.descriptionSelectContainer.querySelector("#textInput");
        Utils.listenToChanges(textInput, "input", 650, () => {
          if (this.searchWhileTyping) {
            this.search();
          }
        });
      this.descriptionSelectContainer.classList.remove("hidden");
    } else if (filter === this.normalValueSelectContainer) {
      //Normal Value
      let textInput =
        this.normalValueSelectContainer.querySelector("#textInput");
        Utils.listenToChanges(textInput, "input", 650, () => {
          if (this.searchWhileTyping) {
            this.search();
          }
        });
      this.normalValueSelectContainer.classList.remove("hidden");
    } else if (filter === this.usedAtSelectContainer) {
      //Used At
      let select = this.usedAtSelectContainer.querySelector("#selectInput");
      if (!select) {
        console.log("no select");
        return "no select";
      }
      let choosenContainer =
        this.usedAtSelectContainer.querySelector("#choosen");
      if (!choosenContainer) {
        console.log("no choosen container");
        return "no choosen container";
      }
      let availableUsedAt = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "settings&operation=other&type=getAllAvailableUsedAt",
          "./includes/settings.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          true,
          true
        )
      );
      console.log("Value:", availableUsedAt);
      //Fill list
      Utils.fillListWithValues(select, availableUsedAt, true, true);
      this.usedAtArray = new Array(); //Reset old value

      let update = () => {
        //Update Choosen
        choosenContainer.innerHTML = "";
        if (this.usedAtArray.length > 0) {
          this.usedAtArray.forEach((element) => {
            let listItem = document.createElement("li");

            listItem.setAttribute("data-value", element);
            listItem.innerHTML = `<span>${element}</span><button type="button" id="remove">X</button>`;
            choosenContainer.appendChild(listItem);
            let removeBtn = listItem.querySelector("#remove");
            removeBtn.addEventListener("click", (event) => {
              this.usedAtArray = Utils.removeFromArray(
                this.usedAtArray,
                element
              );
              update();
              console.log("After", this.usedAtArray);
            });
          });
        }
        if (this.searchWhileTyping) {
          this.search();
        }
      };

      select.addEventListener("change", () => {
        let value =
          select.options[select.selectedIndex].getAttribute("data-value");
        console.log("data-value =", value);
        Utils.addToArray(this.usedAtArray, value, false);
        update();
      });
      this.usedAtSelectContainer.classList.remove("hidden");
    } else if (filter === this.idSelectContainer) {
      //id
      let numberInput = this.idSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, "input", 650, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.idSelectContainer.classList.remove("hidden");
    } else if (filter === this.permissionNeededSelectContainer) {
      let addPermissionBtn =
        this.permissionNeededSelectContainer.querySelector("#set");
      let selectedTextField =
        this.permissionNeededSelectContainer.querySelector(".selected");

      addPermissionBtn = Utils.removeAllEventlisteners(addPermissionBtn);
      addPermissionBtn.addEventListener("click", async () => {
        let permissionToAdd = await addPermission([]);
        if (permissionToAdd) {
          this.permissionNeededChoice = permissionToAdd[0];
          selectedTextField.innerText = permissionToAdd[0];
        }
      });
      this.permissionNeededSelectContainer.classList.remove("hidden");
    } else if (filter === this.settingSelectContainer) {
      //setting
      let textInput = this.settingSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.settingSelectContainer.classList.remove("hidden");
    }
  }

  async search() {
    console.log("Search...");
    //Utils.toggleLodingAnimation(this.container)
    this.searchReloadBtn.disabled = true;
    this.searchBtn.classList.add("loading");
    this.choosenArray = new Array();
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    if (this.filterType === "name") {
      let input = this.nameSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
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
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByDescription&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "normalValue") {
      let input =
        this.normalValueSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByNormalValue&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "type") {
      let select = this.typeSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByType&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "usedAt") {
      if (!this.usedAtArray.length > 0) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByUsedAt&input=" +
              JSON.stringify(this.usedAtArray) +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "id") {
      let input = this.idSelectContainer.querySelector("#numberInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByid&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "permissionNeeded") {
      if (Utils.isEmptyInput(this.permissionNeededChoice, true)) {
        return false;
      }
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByPermissionNeeded&input=" +
              this.permissionNeededChoice +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "all") {
      this.edit(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=all&limit=" + this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    }
  }

  clear(element) {
    element.innerHTML = "";
  }

  async edit(choosen, reloadOnlyOne = false) {
    this.searchReloadBtn.disabled = false;
    this.searchBtn.classList.remove("loading");
    if (!choosen || !choosen.length > 0) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
      return false;
    }
    console.log("Edit:", choosen);

    if (!reloadOnlyOne) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
    }

    for (let current of choosen) {
      if (reloadOnlyOne) {
        current = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "settings&operation=search&filter=filterByid&input=" +
              current +
              "&limit=" +
              this.limiter.value,
            "./includes/settings.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        );
        if (current && current.length > 0) {
          current = current[0];
        } else {
          this.edit();
        }
      }

      //Get Data
      console.log(current, current["id"]);

      if (current["id"]) {
        let tableRow;
        if (!reloadOnlyOne) {
          tableRow = document.createElement("tr");
          this.editTableBody.appendChild(tableRow);
        } else {
          try {
            tableRow = this.editTable.querySelector(
              `tbody .result[data-value="${current["id"]}"]`
            );
            console.log(tableRow);
          } catch {
            alert("Error");
            tableRow = document.createElement("tr");
            this.editTableBody.appendChild(tableRow);
          }
        }
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["id"]);

        if (current["userIsAllowed"]) {
          tableRow.innerHTML = `
          <td id="name"><span>${
            current["name"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="setting"><span id="changeValue"></span><span id="changeType" style="opacity: 0.02;"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></span></td>
          <td id="description"><span>${
            current["description"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="normalValue"><span>${
            current["normalValue"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="id">${current["id"]}</td>
          <td id="permissionNeeded"><span>${
            current["permissionNeeded"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="usedAt"><span id="list">${JSON.stringify(
            current["usedAt"]
          )}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="min"><span>${
            current["min"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="max"><span>${
            current["max"]
          }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
          <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
    `;

          //Insert Correct Type and make it usable

          const settingBox = tableRow.querySelector("#setting #changeValue");
          if (!settingBox) continue;
          if (current["type"] === "text") {
            settingBox.innerHTML = `
              <input type="text" class="form-control" id="textBox" value="${current["setting"]}">
              <button type="button" class="btn btn-secondary btn-sm" id="set">Ändern</button>
              `;

            let textBox = settingBox.querySelector("#textBox");
            let submitBtn = settingBox.querySelector("#set");
            submitBtn.disabled = true; //disable because nothing will have change since loading

            let updateChangeBtn = () => {
              let textInput = textBox.value;
              if (Utils.isEmptyInput(textInput)) {
                submitBtn.disabled = true;
                return true;
              }
              if (current["setting"] == textInput) {
                submitBtn.disabled = true;
                return true;
              }
              submitBtn.disabled = false;
              return true;
            };

            Utils.listenToChanges(textBox, "input", 0, updateChangeBtn);

            submitBtn.addEventListener("click", async () => {
              let textInput = textBox.value || false;
              if (Utils.isEmptyInput(textInput)) {
                textBox.value = current["setting"];
                return false;
              }
              if (current["setting"] == textInput) {
                await Utils.alertUser(
                  "Nachricht",
                  "Keine Veränderung vorgenommen."
                );
                return false;
              }

              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"] +
                    "&newValue=" +
                    textInput,
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            });
          } else if (current["type"] === "switch") {
            settingBox.innerHTML = `
            <label class="switch">
              <input type="checkbox" id="checkbox">
              <span class="slider round"></span>
            </label>
            `;

            let switchInput = settingBox.querySelector("#checkbox");
            switchInput.checked = Utils.makeJSON(current["setting"]);
            let changeValue = async () => {
              let value = switchInput.checked;
              console.log(value);
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"] +
                    "&newValue=" +
                    JSON.stringify(value),
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            };

            Utils.listenToChanges(switchInput, "change", 0, changeValue);
          } else if (current["type"] === "number") {
            settingBox.innerHTML = `
            <input type="number" id="numberInput" name="numberInput" min="${current["min"]}" max="${current["max"]}" autocomplete="off" value="${current["setting"]}">
              <button type="button" class="btn btn-secondary btn-sm" id="set">Ändern</button>
              `;

            let numberInput = settingBox.querySelector("#numberInput");
            let submitBtn = settingBox.querySelector("#set");
            submitBtn.disabled = true; //disable because nothing will have change since loading

            let updateChangeBtn = () => {
              let textInput = numberInput.value;
              if (Utils.isEmptyInput(textInput, true)) {
                submitBtn.disabled = true;
                return true;
              }
              if (current["setting"] == textInput) {
                submitBtn.disabled = true;
                return true;
              }
              submitBtn.disabled = false;
              return true;
            };

            Utils.listenToChanges(numberInput, "input", 0, updateChangeBtn);

            submitBtn.addEventListener("click", async () => {
              let textInput = numberInput.value || false;
              if (Utils.isEmptyInput(textInput, true)) {
                numberInput.value = current["setting"];
                return false;
              }
              if (current["setting"] == textInput) {
                await Utils.alertUser(
                  "Nachricht",
                  "Keine Veränderung vorgenommen."
                );
                return false;
              }

              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"] +
                    "&newValue=" +
                    textInput,
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            });
          } else if (current["type"] === "executeSystem") {
            settingBox.innerHTML = `
            <button type="button" class="btn btn-danger btn-sm" id="execute">Ausführen</button>
              `;

            let ececuteBtn = settingBox.querySelector("#execute");

            ececuteBtn.addEventListener("click", async () => {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"],
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            });
          } else if (current["type"] === "task") {
            settingBox.innerHTML = `
            <button type="button" class="btn btn-warning btn-sm" id="execute">Ausführen</button>
              `;

            let ececuteBtn = settingBox.querySelector("#execute");

            ececuteBtn.addEventListener("click", async () => {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"],
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            });
          } else if (current["type"] === "json") {
            settingBox.innerHTML = `
              <button type="button" class="btn btn-secondary btn-sm" id="set">Ändern</button>
              `;
            let changeBtn = settingBox.querySelector("#set");

            changeBtn.addEventListener("click", async () => {
              let setting = await Utils.getUserInput("Einstellung ändern", "JSON", false, "textArea", JSON.stringify(current["setting"], null, 2), JSON.stringify(current["setting"], null, 2), true, false, false, true, false);
              if (setting === false) {
                await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
                return;
              }
              if (current["setting"] == setting) {
                await Utils.alertUser(
                  "Nachricht",
                  "Keine Veränderung vorgenommen."
                );
                return false;
              }
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "settings&operation=changeValue&type=" +
                    current["type"] +
                    "&id=" +
                    current["id"] +
                    "&newValue=" +
                    JSON.stringify(setting),
                  "./includes/settings.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  true,
                  false,
                  true
                )
              );
              this.edit([current["id"]], true);
            });
          }else {
            let changeTypeBtn = tableRow.querySelector("#setting #changeType");
            changeTypeBtn.setAttribute("style", "opacity: 1;");
          }

          let changeNameBtn = tableRow.querySelector("#name #change");
          let changeDescriptionBtn = tableRow.querySelector(
            "#description #change"
          );
          let changeNormalValue = tableRow.querySelector(
            "#normalValue #change"
          );
          let changeNeededPermissionBtn = tableRow.querySelector(
            "#permissionNeeded #change"
          );
          let changeUsedAtBtn = tableRow.querySelector("#usedAt #change");
          let deleteSettingBtn = tableRow.querySelector("#remove .delete-btn");
          let changeTypeBtn = tableRow.querySelector("#setting #changeType");
          let changeMinBtn = tableRow.querySelector("#min #change");
          let changeMaxBtn = tableRow.querySelector("#max #change");

          changeNameBtn.addEventListener("click", async () => {
            let input = await Utils.getUserInput(
              "Namen ändern",
              "Beim ändern des Namens der Einstellungen können Fehler in der Anwendung entstehen. Nur ändern, wenn du dir auch wirklich sicher bist.",
              false,
              "text",
              current["name"],
              current["name"],
              false
            );
            if (Utils.isEmptyInput(input)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            let res = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeName&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            if (res["status"] == "success") {
              this.search();
            } else {
              this.edit([current["id"]], true);
            }
          });
          changeDescriptionBtn.addEventListener("click", async () => {
            let input = await Utils.getUserInput(
              "Beschreibung",
              "Ändern der Beschreibung:",
              false,
              "text",
              current["description"],
              current["description"],
              true
            );
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeDescription&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
          changeNormalValue.addEventListener("click", async () => {
            let input = await Utils.getUserInput(
              "Beschreibung",
              "Ändern des normalen Wertes:",
              false,
              "text",
              current["normalValue"],
              current["normalValue"],
              true
            );
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeNormalValue&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
          changeNeededPermissionBtn.addEventListener("click", async () => {
            let input = await addPermission([current["permissionNeeded"]]);
            if (input == false || !input.length > 0) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeNeededPermission&id=" +
                  current["id"] +
                  "&newValue=" +
                  input[0],
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
          changeUsedAtBtn.addEventListener("click", async () => {
            let input = await changeUsedAt(current["id"]);
            this.edit([current["id"]], true);
          });
          changeTypeBtn.addEventListener("click", async () => {
            let input = await changeType([current["id"]]);
            if (Utils.isEmptyInput(input)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeType&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
          deleteSettingBtn.addEventListener("click", async () => {
            if (
              !(await Utils.userHasPermissions(
                ["SettingsADDandREMOVE"]
              ))
            ) {
              return false;
            }
            let userInput = await Utils.askUser(
              "Warnumg",
              `Bist du dir sicher, dass du die Berechtigung <b>${current["name"]}</b> löschen möchtest? Dadurch können große Schäden und ein riesiger Wartungsaufwand entstehen.`,
              false,
              "text"
            );
            if (!userInput) {
              Utils.alertUser("Nachricht", "Einstellung gelöscht", false);
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=deleteSetting&id=" + current["id"],
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.search();
          });
          changeMinBtn.addEventListener("click", async () => {
            let input = await Utils.getUserInput(
              "Minimalwert ändern",
              "Minimalwert der Einstellung ändern.",
              false,
              "text",
              current["min"],
              current["min"],
              false
            );
            if (Utils.isEmptyInput(input)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeMin&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
          changeMaxBtn.addEventListener("click", async () => {
            let input = await Utils.getUserInput(
              "Maximalwert ändern",
              "Maximalwert der Einstellung ändern.",
              false,
              "text",
              current["max"],
              current["max"],
              false
            );
            if (Utils.isEmptyInput(input)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen.",
                false
              );
              return false;
            }
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "settings&operation=changeOtherValues&type=changeMax&id=" +
                  current["id"] +
                  "&newValue=" +
                  input,
                "./includes/settings.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true
              )
            );
            this.edit([current["id"]], true);
          });
        } else {
          tableRow.classList.add("forbidden");
          tableRow.innerHTML = `
          <td id="name"><span>${current["name"]}</span></td>
          <td id="setting"><span>${current["setting"]}</span></td>
          <td id="description"><span>${current["description"]}</span></td>
          <td id="normalValue"><span>${current["normalValue"]}</span></td>
          <td id="id">${current["id"]}</td>
          <td id="permissionNeeded"><span>${
            current["permissionNeeded"]
          }</span></button></td>
          <td id="usedAt"><span id="list">${JSON.stringify(
            current["usedAt"]
          )}</span></td>
          <td id="remove"></td>
    `;
        }

        let usedAtContainer = tableRow.querySelector("#usedAt #list");
        Utils.listOfArrayToHTML(
          usedAtContainer,
          Utils.makeJSON(current["usedAt"]),
          "Nirgendwo"
        );

        this.editContainer.classList.remove("hidden");
      }
    }
    this.searchReloadBtn.disabled = false;
  }
}

let SETTINGSContainer = document.querySelector("#einstellungen");
if (!SETTINGSContainer) {
  console.log("no SETTINGSContainer");
} else {
  //SETTINGS
  let settings = new SETTINGS(SETTINGSContainer);
  console.log(settings.prepareSearch());
  console.log(settings.prepareEdit());
  settings.setFilterMode("all");
  settings.search();
}
