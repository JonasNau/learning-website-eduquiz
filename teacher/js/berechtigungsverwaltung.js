import * as Utils from "../../../includes/utils.js";
import {
  changeType,
  changeUsedAt,
  changeUsedAtAll,
  changeTypeAll,
  addPermission,
  changePermissions,
  changePermissionsAllChooseMethod,
} from "../js/berechtigungsverwaltung.inc.js";

class Berechtigungsverwaltung {
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
    this.rankingSelectContainer = null;
    this.normalValueSelectContainer = null;
    this.usedAtSelectContainer = null;
    this.usedAtArray = new Array();
    this.hinweisSelectContainer = null;
    this.idSelectContainer = null;
    this.coustomIDSelectContainer = null;
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
    let changeAllType = thead.querySelector("#type #changeAll");
    changeAllType.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsVerwaltungEditPermissions"]
        ))
      ) {
        return false;
      }
      let userInput = await changeTypeAll();
      for (const current of this.choosenArray) {
        if (!Utils.isEmptyInput(userInput, false)) {
          let res = await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=changeValue&type=changeType&id=" +
              current +
              "&input=" +
              userInput,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          );
        }
      }

      this.edit(this.choosenArray);
    });
    let changeAllRanking = thead.querySelector("#ranking #changeAll");
    changeAllRanking.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsVerwaltungEditPermissions"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Beschreibung ändern",
        `Welchen Rang soll die Berechtigung <b>${current["name"]}</b> haben?`,
        false,
        "number",
        current["ranking"],
        current["ranking"],
        true
      );
      console.log(userInput);
      for (const current of this.choosenArray) {
        if (!Utils.isEmptyInput(userInput, true)) {
          let res = await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=changeValue&type=changeRank&id=" +
              current +
              "&rank=" +
              userInput,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          );
        }
      }

      this.edit(this.choosenArray);
    });
    let changeAllNormalValue = thead.querySelector("#normalValue #changeAll");
    changeAllNormalValue.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsVerwaltungEditPermissions"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Normaler Wert für alle?",
        false,
        "text"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=changeValue&type=changeNormalValue&id=" +
              current +
              "&input=" +
              userInput,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false
          )
        );
      }

      this.edit(this.choosenArray);
    });
    let changeAllusedAt = thead.querySelector("#usedAt #changeAll");
    changeAllusedAt.addEventListener("click", async () => {
      let { toChange, method } = await changeUsedAtAll();
      if (!method) {
        return false;
      }
      for (const currentPermission of this.choosenArray) {
        if (toChange && method) {
          if (method === "overwrite") {
            //Remove All
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeUsedAt&secondOperation=removeAll&&id=" +
                currentPermission,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            );
            method = "add";
          }
          for (const current of toChange) {
            if (method === "add") {
              await Utils.sendXhrREQUEST(
                "POST",
                "berechtigungsverwaltung&operation=changeValue&type=changeUsedAt&secondOperation=add&toAdd=" +
                  current +
                  "&id=" +
                  currentPermission,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true,
                false
              );
            } else if (method === "remove") {
              await Utils.sendXhrREQUEST(
                "POST",
                "berechtigungsverwaltung&operation=changeValue&type=changeUsedAt&secondOperation=remove&toRemove=" +
                  current +
                  "&id=" +
                  currentPermission,
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                true,
                false
              );
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                toChange
              );
            }
          }
        }
      }

      this.edit(this.choosenArray);
    });

    let removeAll = thead.querySelector("#remove #changeAll");
    removeAll.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsVerwaltungEditPermissions"]
        ))
      ) {
        return false;
      }
      if (
        !(await Utils.askUser(
          "Warnung",
          "Beim Löschen der Berechtigungen könnte die Webseite nicht mehr richtig funktionieren. Bist du dir wirklich sicher? (Wenn nicht frage einen Administrator)",
          false
        ))
      ) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=changeValue&type=deletePermission&id=" +
              current,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false
          )
        );
        this.choosenArray = Utils.removeFromArray(this.choosenArray, current);
      }
      this.edit(this.choosenArray);
    });
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
    let nameSelectContainer = selectionFiltersContainer.querySelector("#name");
    let typeSelectContainer = selectionFiltersContainer.querySelector("#type");
    let descriptionSelectContainer =
      selectionFiltersContainer.querySelector("#description");
    let rankingSelectContainer =
      selectionFiltersContainer.querySelector("#ranking");
    let normalValueSelectContainer =
      selectionFiltersContainer.querySelector("#normalValue");
    let usedAtSelectContainer =
      selectionFiltersContainer.querySelector("#usedAt");
    let hinweisSelectContainer =
      selectionFiltersContainer.querySelector("#hinweis");
    let idSelectContainer = selectionFiltersContainer.querySelector("#id");
    let customIDSelectContainer =
      selectionFiltersContainer.querySelector("#customID");

    if (
      !nameSelectContainer ||
      !typeSelectContainer ||
      !descriptionSelectContainer ||
      !rankingSelectContainer ||
      !normalValueSelectContainer ||
      !usedAtSelectContainer ||
      !hinweisSelectContainer ||
      !idSelectContainer ||
      !customIDSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.typeSelectContainer = typeSelectContainer;
    this.descriptionSelectContainer = descriptionSelectContainer;
    this.rankingSelectContainer = rankingSelectContainer;
    this.normalValueSelectContainer = normalValueSelectContainer;
    this.usedAtSelectContainer = usedAtSelectContainer;
    this.hinweisSelectContainer = hinweisSelectContainer;
    this.idSelectContainer = idSelectContainer;
    this.customIDSelectContainer = customIDSelectContainer;
    //hide all
    this.nameSelectContainer.classList.add("hidden");
    this.typeSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.rankingSelectContainer.classList.add("hidden");
    this.normalValueSelectContainer.classList.add("hidden");
    this.usedAtSelectContainer.classList.add("hidden");
    this.hinweisSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");
    this.customIDSelectContainer.classList.add("hidden");

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

    //ChooseAllBtn
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

    let editBtn = this.container.querySelector("#edit");
    if (!editBtn) return "no editBtn";
    this.editBtn = editBtn;
    this.updateEditBtn();
    editBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
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
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsVerwaltungEditPermissions"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Wie soll die Berechtigung heißen?",
        false,
        "text"
      );
      if (Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Berechtigung nicht erstellt.", false);
        return false;
      }
      let res = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=createPermission&&name=" +
            userInput,
          "./includes/berechtigungsverwaltung.inc.php",
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
        this.edit(this.choosenArray);
      } else {
        this.search();
      }
    });
  }

  setFilterMode(value) {
    this.searchBtn.classList.remove("loading");
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.typeSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.rankingSelectContainer.classList.add("hidden");
    this.normalValueSelectContainer.classList.add("hidden");
    this.usedAtSelectContainer.classList.add("hidden");
    this.hinweisSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");
    this.customIDSelectContainer.classList.add("hidden");
    if (!value) return false;
    this.filterType = value;

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "type") {
      this.enableFilter(this.typeSelectContainer);
    } else if (value === "description") {
      this.enableFilter(this.descriptionSelectContainer);
    } else if (value === "ranking") {
      this.enableFilter(this.rankingSelectContainer);
    } else if (value === "normalValue") {
      this.enableFilter(this.normalValueSelectContainer);
    } else if (value === "usedAt") {
      this.enableFilter(this.usedAtSelectContainer);
    } else if (value === "hinweis") {
      this.enableFilter(this.hinweisSelectContainer);
    } else if (value === "id") {
      this.enableFilter(this.idSelectContainer);
    } else if (value === "customID") {
      this.enableFilter(this.customIDSelectContainer);
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
      Utils.listenToChanges(textInput, "input", 650, this.search);
      this.nameSelectContainer.classList.remove("hidden");
    } else if (filter === this.typeSelectContainer) {
      //type select
      let select = this.typeSelectContainer.querySelector("#selectInput");
      //Fill in values
      let types = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=other&type=getAllAvailableTypes",
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          true,
          true
        )
      );
      Utils.fillListWithValues(select, types, true);
      Utils.listenToChanges(select, 650, "change", this.search());
      this.typeSelectContainer.classList.remove("hidden");
    } else if (filter === this.descriptionSelectContainer) {
      //description
      let textInput =
        this.descriptionSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.descriptionSelectContainer.classList.remove("hidden");
    } else if (filter === this.rankingSelectContainer) {
      //Ranking
      let numberInput =
        this.rankingSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, 200, "input", this.search());
      this.rankingSelectContainer.classList.remove("hidden");
    } else if (filter === this.normalValueSelectContainer) {
      //Normal Value
      let textInput =
        this.normalValueSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
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
          "berechtigungsverwaltung&operation=other&type=getAllAvailableUsedAt",
          "./includes/berechtigungsverwaltung.inc.php",
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
      };

      select.addEventListener("change", () => {
        let value =
          select.options[select.selectedIndex].getAttribute("data-value");
        console.log("data-value =", value);
        Utils.addToArray(this.usedAtArray, value, false);
        update();
      });
      this.usedAtSelectContainer.classList.remove("hidden");
    } else if (filter === this.hinweisSelectContainer) {
      //Hinweis
      let textInput = this.hinweisSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.hinweisSelectContainer.classList.remove("hidden");
    } else if (filter === this.idSelectContainer) {
      //id
      let numberInput = this.idSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, 200, "input", this.search());
      this.idSelectContainer.classList.remove("hidden");
    } else if (filter === this.customIDSelectContainer) {
      //customID
      let textInput = this.customIDSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.customIDSelectContainer.classList.remove("hidden");
    }
  }

  async search() {
    console.log("Search...");
    this.searchReloadBtn.disabled = true;
    //Utils.toggleLodingAnimation(this.container)
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByDescription&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "hinweis") {
      let input = this.hinweisSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByHinweis&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByType&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "ranking") {
      let input =
        this.rankingSelectContainer.querySelector("#numberInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByRanking&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByUsedAt&input=" +
              JSON.stringify(this.usedAtArray) +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterByid&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "customID") {
      let input =
        this.customIDSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "berechtigungsverwaltung&operation=search&filter=filterBycustomID&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
            "berechtigungsverwaltung&operation=search&filter=all&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
    this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

    results = Utils.sortItems(results, "name"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["id"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["name"]}</td>
      <td id="type">${result["type"]}</td>
      <td id="description">${result["description"]}</td>
      <td id="ranking">${result["ranking"]}</td>
      <td id="normalValue">${result["normalValue"]}</td>
      <td id="usedAt">${Utils.makeJSON(result["usedAt"])}</td>
      <td id="hinweis">${result["hinweis"]}</td>
      <td id="id">${result["id"]}</td>
      <td id="customID">${result["customID"]}</td>
          `;
      this.tableBody.append(tableRow);

      let checkBox = tableRow.querySelector(".select #select");
      if (!checkBox) return false;
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["id"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["id"]
          );
        }
        this.updateEditBtn();
      });

      let usedAtContainer = tableRow.querySelector("#usedAt");
      Utils.listOfArrayToHTML(
        usedAtContainer,
        Utils.makeJSON(result["usedAt"]),
        "Nirgendwo"
      );

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) return false;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["id"],
          false
        );
        this.edit(this.choosenArray);
      });
    }
    this.searchReloadBtn.disabled = false;

    this.resultTable.classList.remove("hidden");
  }

  updateEditBtn() {
    if (this.choosenArray.length > 0) {
      this.editBtn.disabled = false;
    } else {
      this.editBtn.disabled = true;
    }
  }

  async edit(choosen) {
    if (!choosen || !choosen.length > 0) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
      return false;
    }
    this.editReloadBtn.disabled = true;
    this.editContainer.classList.add("hidden");
    console.log("Edit:", choosen);

    this.resultTable.classList.add("hidden");
    this.clear(this.tableBody);

    this.clear(this.editTableBody);

    for (const currentRaw of choosen) {
      //Get Data
      let current = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "berechtigungsverwaltung&operation=getFullInfromation&id=" +
            currentRaw,
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false
        )
      );
      if (!current) {
        console.log("No data for:", currentRaw);
        continue;
      }

      console.log(current);

      if (current["id"]) {
        let tableRow = document.createElement("tr");
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["id"]);

        tableRow.innerHTML = `
        <td id="name"><span>${
          current["name"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="type"><span>${
          current["type"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="description"><span>${
          current["description"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="ranking"><span>${
          current["ranking"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="normalValue"><span>${
          current["normalValue"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="usedAt"><span id="list">${JSON.stringify(
          current["usedAt"]
        )}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="hinweis"><span>${
          current["hinweis"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="id">${current["id"]}</td>
        <td id="customID"><span>${
          current["customID"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let usedAtContainer = tableRow.querySelector("#usedAt #list");
        Utils.listOfArrayToHTML(
          usedAtContainer,
          Utils.makeJSON(current["usedAt"]),
          "Nirgendwo"
        );
        //Name
        let changeNameBtn = tableRow.querySelector("#name #change");
        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          if (
            !(await Utils.askUser(
              "Warnung",
              "Beim ändern des Namens der Berechtigung funktioniert die Seite möglicherweise nicht mehr richtig, da im Programmcode mit den Namen getestet wird, ob der Benutzer die Berechtigung hat. Bist du dir wirklich sicher?",
              false
            ))
          ) {
            await Utils.alertUser(
              "Nachricht",
              "Keine Aktion unternommen",
              false
            );
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für die Berechtigung " + current["name"] + "?",
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeName&id=" +
                currentRaw +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          this.edit(this.choosenArray);
        });
        //Type
        let changeTypeBtn = tableRow.querySelector("#type #change");
        changeTypeBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await changeType(current["id"]);
          if (!Utils.isEmptyInput(userInput, false)) {
            let res = await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeType&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            );
          }
          this.edit(this.choosenArray);
        });
        //Description
        let changeDescriptionBtn = tableRow.querySelector(
          "#description #change"
        );
        changeDescriptionBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Beschreibung ändern",
            `Ändere hier die Beschreibung der Berechtigung <b>${current["name"]}</b>.`,
            false,
            "text",
            "Wird benötigt, um ....",
            current["description"],
            true
          );
          console.log(userInput);
          if (userInput !== false) {
            let res = await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeDescription&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            );
          }

          this.edit(this.choosenArray);
        });
        //Ranking
        let changeRankingBtn = tableRow.querySelector("#ranking #change");
        changeRankingBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Beschreibung ändern",
            `Welchen Rang soll die Berechtigung <b>${current["name"]}</b> haben?`,
            false,
            "number",
            current["ranking"],
            current["ranking"],
            true
          );
          console.log(userInput);

          if (!Utils.isEmptyInput(userInput, true)) {
            let res = await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeRank&id=" +
                current["id"] +
                "&rank=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            );
          }
          this.edit(this.choosenArray);
        });
        //Normal Value
        let changeNormalValueBtn = tableRow.querySelector(
          "#normalValue #change"
        );
        changeNormalValueBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Normaler Wert für die Berechtigung " + current["name"] + "?",
            false,
            "text",
            current["normalValue"],
            current["normalValue"],
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeNormalValue&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          this.edit(this.choosenArray);
        });
        //Used at
        let changeUsedAtBtn = tableRow.querySelector("#usedAt #change");
        changeUsedAtBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let res = await changeUsedAt(current["id"]);
          this.edit(this.choosenArray);
        });

        //Hinweis
        let changeHinweisBtn = tableRow.querySelector("#hinweis #change");
        changeHinweisBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Hinweis ändern",
            `Gebe ändere hier den Hinweis der Berechtigung <b>${current["name"]}</b>.`,
            false,
            "text",
            "Nur mit Bedacht...",
            current["hinweis"],
            true
          );
          console.log(userInput);
          if (userInput !== false) {
            let res = await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changeHinweis&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            );
          }

          this.edit(this.choosenArray);
        });

        //Change customID
        let changeCustomID = tableRow.querySelector("#customID #change");
        changeCustomID.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neue customID für die Berechtigung " + current["name"] + "?",
            false,
            "text",
            current["customID"],
            current["customID"],
            true
          );
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=changecustomID&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          this.edit(this.choosenArray);
        });

        //Delete Permission - If delete it will not be deletet from users until repair process
        let deletePermissionBtn = tableRow.querySelector("#remove .delete-btn");
        deletePermissionBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditPermissions"]
            ))
          ) {
            return false;
          }
          if (
            !(await Utils.askUser(
              "Warnung",
              "Beim Löschen der Berechtigung könnte die Webseite nicht mehr richtig funktionieren. Bist du dir wirklich sicher? (Wenn nicht frage einen Administrator)",
              false
            ))
          ) {
            await Utils.alertUser(
              "Nachricht",
              "Keine Aktion unternommen",
              false
            );
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "berechtigungsverwaltung&operation=changeValue&type=deletePermission&id=" +
                current["id"],
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            current["id"]
          );
          this.edit(this.choosenArray);
        });

        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class Gruppenverwaltung {
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
    this.idSelectContainer = null;
    this.permissionsAllowedSelectContainer = null;
    this.permissionsAllowedObject = new Object();
    this.permissionsForbiddenSelectContainer = null;
    this.permissionsForbiddenArray = new Array();
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

    let thead = this.editTable.querySelector("thead");

    let changeAllPermissions = async () => {
      //Change All Permissions
      const { method, art } = await changePermissionsAllChooseMethod();
      if (art === "ableto") {
        if (method === "add") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            let type = await Utils.askUser(
              "Nachricht",
              "Für alle Berechtigungen den gleichen Wert?",
              false
            );
            if (type) {
              let value = await Utils.getUserInput(
                "Nachricht",
                `Welchen Wert sollen die Berechtigungen haben?`,
                false
              );
              for (const currentPermission of addPermissionsArray) {
                for (const currentGroup of this.choosenArray) {
                  await Utils.makeJSON(
                    await Utils.sendXhrREQUEST(
                      "POST",
                      "gruppenverwaltung&operation=changePermissions&id=" +
                        currentGroup +
                        "&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                        currentPermission +
                        "&value=" +
                        value,
                      "./includes/berechtigungsverwaltung.inc.php",
                      "application/x-www-form-urlencoded",
                      true,
                      false,
                      false,
                      false
                    )
                  );
                }
              }
            } else {
              for (const currentPermission of addPermissionsArray) {
                let value = await Utils.getUserInput(
                  "Nachricht",
                  `Welchen Wert soll die Berechtigunge ${currentPermission} haben?`,
                  false
                );
                for (const currentGroup of this.choosenArray) {
                  await Utils.makeJSON(
                    await Utils.sendXhrREQUEST(
                      "POST",
                      "gruppenverwaltung&operation=changePermissions&id=" +
                        currentGroup +
                        "&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                        currentPermission +
                        "&value=" +
                        value,
                      "./includes/berechtigungsverwaltung.inc.php",
                      "application/x-www-form-urlencoded",
                      true,
                      false,
                      false,
                      false
                    )
                  );
                }
              }
            }
          }
        } else if (method === "remove") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            for (const currentPermission of addPermissionsArray) {
              for (const currentGroup of this.choosenArray) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&id=" +
                      currentGroup +
                      "&type=allowedPermissions&secondOperation=removePermission&permissionName=" +
                      currentPermission,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    false,
                    false,
                    false
                  )
                );
              }
            }
          }
        } else if (method === "overwrite") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            //Delete All Permissions From all choosen Users
            for (const currentGroup of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&id=" +
                    currentGroup +
                    "&type=allowedPermissions&secondOperation=removeAllPermissions",
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }

            let type = await Utils.askUser(
              "Nachricht",
              "Für alle Berechtigungen den gleichen Wert?",
              false
            );
            if (type) {
              let value = await Utils.getUserInput(
                "Nachricht",
                `Welchen Wert sollen die Berechtigungen haben?`,
                false
              );
              for (const currentPermission of addPermissionsArray) {
                for (const currentGroup of this.choosenArray) {
                  await Utils.makeJSON(
                    await Utils.sendXhrREQUEST(
                      "POST",
                      "gruppenverwaltung&operation=changePermissions&id=" +
                        currentGroup +
                        "&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                        currentPermission +
                        "&value=" +
                        value,
                      "./includes/berechtigungsverwaltung.inc.php",
                      "application/x-www-form-urlencoded",
                      true,
                      false,
                      false,
                      false
                    )
                  );
                }
              }
            } else {
              for (const currentPermission of addPermissionsArray) {
                let value = await Utils.getUserInput(
                  "Nachricht",
                  `Welchen Wert soll die Berechtigunge ${currentPermission} haben?`,
                  false
                );
                for (const currentGroup of this.choosenArray) {
                  await Utils.makeJSON(
                    await Utils.sendXhrREQUEST(
                      "POST",
                      "gruppenverwaltung&operation=changePermissions&id=" +
                        currentGroup +
                        "&type=allowedPermissions&secondOperation=addPermission&permissionName=" +
                        currentPermission +
                        "&value=" +
                        value,
                      "./includes/berechtigungsverwaltung.inc.php",
                      "application/x-www-form-urlencoded",
                      true,
                      false,
                      false,
                      false
                    )
                  );
                }
              }
            }
          }
        } else if (method === "removeAll") {
          this.choosenUsersArray.forEach(async (user) => {
            for (const currentGroup of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&id=" +
                    currentGroup +
                    "&type=allowedPermissions&secondOperation=removeAllPermissions",
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }
          });
        }
      } else if (art === "forbidden") {
        if (method === "add") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            for (const currentPermission of addPermissionsArray) {
              for (const currentGroup of this.choosenArray) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&id=" +
                      currentGroup +
                      "&type=forbiddenPermissions&secondOperation=addPermission&permissionName=" +
                      currentPermission,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    false,
                    false,
                    false
                  )
                );
              }
            }
          }
        } else if (method === "remove") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            for (const currentPermission of addPermissionsArray) {
              for (const currentGroup of this.choosenArray) {
                await Utils.makeJSON(
                  await Utils.sendXhrREQUEST(
                    "POST",
                    "gruppenverwaltung&operation=changePermissions&id=" +
                      currentGroup +
                      "&type=forbiddenPermissions&secondOperation=removePermission&permissionName=" +
                      currentPermission,
                    "./includes/berechtigungsverwaltung.inc.php",
                    "application/x-www-form-urlencoded",
                    true,
                    false,
                    false,
                    false
                  )
                );
              }
            }
          }
        } else if (method === "overwrite") {
          //Ask user for permissions
          let addPermissionsArray = await addPermission(new Array());
          console.log(addPermissionsArray);

          if (addPermissionsArray && addPermissionsArray.length > 0) {
            //Delete All Permissions From all choosen Users
            for (const currentGroup of this.choosenArray) {
              await Utils.makeJSON(
                await Utils.sendXhrREQUEST(
                  "POST",
                  "gruppenverwaltung&operation=changePermissions&id=" +
                    currentGroup +
                    "&type=forbiddenPermissions&secondOperation=removeAllPermissions",
                  "./includes/berechtigungsverwaltung.inc.php",
                  "application/x-www-form-urlencoded",
                  true,
                  false,
                  false,
                  false
                )
              );
            }

            if (addPermissionsArray && addPermissionsArray.length > 0) {
              for (const currentPermission of addPermissionsArray) {
                for (const currentGroup of this.choosenArray) {
                  await Utils.makeJSON(
                    await Utils.sendXhrREQUEST(
                      "POST",
                      "gruppenverwaltung&operation=changePermissions&id=" +
                        currentGroup +
                        "&type=forbiddenPermissions&secondOperation=addPermission&permissionName=" +
                        currentPermission,
                      "./includes/berechtigungsverwaltung.inc.php",
                      "application/x-www-form-urlencoded",
                      true,
                      false,
                      false,
                      false
                    )
                  );
                }
              }
            }
          }
        } else if (method === "removeAll") {
          for (const currentGroup of this.choosenArray) {
            await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "gruppenverwaltung&operation=changePermissions&id=" +
                  currentGroup +
                  "&type=forbiddenPermissions&secondOperation=removeAllPermissions",
                "./includes/berechtigungsverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                false,
                false,
                false
              )
            );
          }
        }
      }
      this.edit(this.choosenArray);
    };

    let changeAllpermissionsBtn1 = thead.querySelector(
      "#permissionsAllowed #changeAll"
    );
    changeAllpermissionsBtn1.addEventListener("click", changeAllPermissions);
    let changeAllpermissionsBtn2 = thead.querySelector(
      "#permissionsForbidden #changeAll"
    );
    changeAllpermissionsBtn2.addEventListener("click", changeAllPermissions);

    let deleteAllChoosenGroupsBtn = thead.querySelector("#remove #changeAll");
    deleteAllChoosenGroupsBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsverwaltungADDandRemove"]
        ))
      ) {
        return false;
      }
      if (
        !(await Utils.askUser(
          "Warnung",
          "Beim Löschen der Gruppe kann große Wiederherstellungsarbeit entstehen. Sei dir auch wirklich sicher.",
          false
        ))
      ) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const currentGroup of this.choosenArray) {
        let res = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=deleteGroup&id=" + currentGroup,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false
          )
        );
        if (res["status"] === "success") {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            current["id"]
          );
        }
      }

      this.edit(this.choosenArray);
    });

    this.clear(this.editTableBody);
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
    let nameSelectContainer = selectionFiltersContainer.querySelector("#name");
    let descriptionSelectContainer =
      selectionFiltersContainer.querySelector("#description");
    let rankingSelectContainer =
      selectionFiltersContainer.querySelector("#ranking");
    let permissionsAllowedSelectContainer =
      selectionFiltersContainer.querySelector("#permissionsAllowed");
    let permissionsForbiddenSelectContainer =
      selectionFiltersContainer.querySelector("#permissionsForbidden");
    let idSelectContainer = selectionFiltersContainer.querySelector("#id");

    if (
      !nameSelectContainer ||
      !descriptionSelectContainer ||
      !rankingSelectContainer ||
      !permissionsAllowedSelectContainer ||
      !permissionsForbiddenSelectContainer ||
      !idSelectContainer
    ) {
      return "Error in initializing Filters";
    }

    this.nameSelectContainer = nameSelectContainer;
    this.descriptionSelectContainer = descriptionSelectContainer;
    this.rankingSelectContainer = rankingSelectContainer;
    this.permissionsAllowedSelectContainer = permissionsAllowedSelectContainer;
    this.permissionsForbiddenSelectContainer =
      permissionsForbiddenSelectContainer;
    this.idSelectContainer = idSelectContainer;

    //hide all
    this.nameSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.rankingSelectContainer.classList.add("hidden");
    this.permissionsAllowedSelectContainer.classList.add("hidden");
    this.permissionsForbiddenSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");

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

    //ChooseAllBtn
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

    let editBtn = this.container.querySelector("#edit");
    if (!editBtn) return "no editBtn";
    this.editBtn = editBtn;
    this.updateEditBtn();
    editBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
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

    //Create Group
    let createGroupBtn = this.container.querySelector("#addBtn");
    createGroupBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["berechtigungsverwaltungADDandRemove"]
        ))
      ) {
        return false;
      }

      let name = await Utils.getUserInput(
        "Gruppe erstellen",
        "Wie soll die neue Gruppe heißen?",
        false,
        "text"
      );
      if (Utils.isEmptyInput(name)) {
        await Utils.alertUser("Nachricht", "Nichts unternommen.", false);
        return false;
      }

      let res = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "gruppenverwaltung&operation=createGroup&name=" + name,
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );

      if (res["data"]) {
        Utils.addToArray(this.choosenArray, res["data"], false);
      }

      this.edit(this.choosenArray);
    });
  }

  setFilterMode(value) {
    this.searchBtn.classList.remove("loading");
    //hide all
    this.nameSelectContainer.classList.add("hidden");
    this.descriptionSelectContainer.classList.add("hidden");
    this.rankingSelectContainer.classList.add("hidden");
    this.permissionsAllowedSelectContainer.classList.add("hidden");
    this.permissionsForbiddenSelectContainer.classList.add("hidden");
    this.idSelectContainer.classList.add("hidden");
    if (!value) return false;
    this.filterType = value;

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "description") {
      this.enableFilter(this.descriptionSelectContainer);
    } else if (value === "ranking") {
      this.enableFilter(this.rankingSelectContainer);
    } else if (value === "id") {
      this.enableFilter(this.idSelectContainer);
    } else if (value === "permissionsAllowed") {
      this.enableFilter(this.permissionsAllowedSelectContainer);
    } else if (value === "permissionsForbidden") {
      this.enableFilter(this.permissionsForbiddenSelectContainer);
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
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.nameSelectContainer.classList.remove("hidden");
    } else if (filter === this.descriptionSelectContainer) {
      //description
      let textInput =
        this.descriptionSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.descriptionSelectContainer.classList.remove("hidden");
    } else if (filter === this.rankingSelectContainer) {
      //Ranking
      let numberInput =
        this.rankingSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, 200, "input", this.search());
      this.rankingSelectContainer.classList.remove("hidden");
    } else if (filter === this.idSelectContainer) {
      //id
      let numberInput = this.idSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, 200, "input", this.search());
      this.idSelectContainer.classList.remove("hidden");
    } else if (filter === this.customIDSelectContainer) {
      //customID
      let textInput = this.customIDSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 650, this.search());
      this.customIDSelectContainer.classList.remove("hidden");
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
            if (!Utils.isEmptyInput(input)) {
              this.permissionsAllowedObject[current] = input;
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
      };

      this.permissionsForbiddenSelectContainer.classList.remove("hidden");
    }
  }

  async search() {
    console.log("Search...");
    this.searchReloadBtn.disabled = true;
    //Utils.toggleLodingAnimation(this.container)
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByDescription&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "ranking") {
      let input =
        this.rankingSelectContainer.querySelector("#numberInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByRanking&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByid&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "permissionsAllowed") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByPermissionsAllowed&input=" +
              JSON.stringify(this.permissionsAllowedObject) +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            true,
            true
          )
        )
      );
    } else if (this.filterType === "permissionsForbidden") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "gruppenverwaltung&operation=search&filter=filterByPermissionsForbidden&input=" +
              JSON.stringify(this.permissionsForbiddenArray) +
              "&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
            "gruppenverwaltung&operation=search&filter=all&limit=" +
              this.limiter.value,
            "./includes/berechtigungsverwaltung.inc.php",
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
    this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

    results = Utils.sortItems(results, "name"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["id"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["name"]}</td>
      <td id="description">${result["description"]}</td>
      <td id="ranking">${result["ranking"]}</td>
      <td id="permissionsAllowed">${JSON.stringify(
        result["permissionsAllowed"]
      )}</td>
      <td id="permissionsForbidden">${JSON.stringify(
        result["permissionsForbidden"]
      )}</td>
      <td id="id">${result["id"]}</td>
          `;
      this.tableBody.append(tableRow);

      let checkBox = tableRow.querySelector(".select #select");
      if (!checkBox) return false;
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["id"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["id"]
          );
        }
        this.updateEditBtn();
      });

      let permissionsAllowedContainer = tableRow.querySelector(
        "#permissionsAllowed"
      );
      Utils.objectKEYVALUEToHTML(
        permissionsAllowedContainer,
        result["permissionsAllowed"],
        "Keine"
      );

      let permissionsForbiddenContainer = tableRow.querySelector(
        "#permissionsForbidden"
      );
      Utils.listOfArrayToHTML(
        permissionsForbiddenContainer,
        result["permissionsForbidden"],
        "Keine"
      );

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) return false;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["id"],
          false
        );
        this.edit(this.choosenArray);
      });
    }
    this.searchReloadBtn.disabled = false;

    this.resultTable.classList.remove("hidden");
  }

  updateEditBtn() {
    if (this.choosenArray.length > 0) {
      this.editBtn.disabled = false;
    } else {
      this.editBtn.disabled = true;
    }
  }

  async edit(choosen) {
    if (!choosen || !choosen.length > 0) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
      return false;
    }
    this.editReloadBtn.disabled = true;
    this.editContainer.classList.add("hidden");
    console.log("Edit:", choosen);

    this.resultTable.classList.add("hidden");
    this.clear(this.tableBody);

    this.clear(this.editTableBody);

    for (const currentRaw of choosen) {
      //Get Data
      let current = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "gruppenverwaltung&operation=getFullInfromation&id=" + currentRaw,
          "./includes/berechtigungsverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false
        )
      );
      if (!current) {
        console.log("No data for:", currentRaw);
        continue;
      }

      console.log(current);

      if (current["id"]) {
        let tableRow = document.createElement("tr");
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["id"]);

        tableRow.innerHTML = `
        <td id="name"><span>${
          current["name"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="description"><span>${
          current["description"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="ranking">${current["ranking"]}</td>
        <td id="permissionsAllowed"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button><span id="list">${JSON.stringify(
          current["permissionsAllowed"]
        )}</span></td>
        <td id="permissionsForbidden"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button><span id="list">${JSON.stringify(
          current["permissionsForbidden"]
        )}</span></td>
        <td id="id">${current["id"]}</td>
        <td id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let permissionsAllowedContainer = tableRow.querySelector(
          "#permissionsAllowed #list"
        );
        Utils.objectKEYVALUEToHTML(
          permissionsAllowedContainer,
          current["permissionsAllowed"],
          "Keine"
        );

        let permissionsForbiddenContainer = tableRow.querySelector(
          "#permissionsForbidden #list"
        );
        Utils.listOfArrayToHTML(
          permissionsForbiddenContainer,
          current["permissionsForbidden"],
          "Keine"
        );

        //Name - fertig
        let changeNameBtn = tableRow.querySelector("#name #change");
        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditGroups"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Gruppe umbenennen",
            `Wie soll die Gruppe ${current["name"]} heißen?`,
            false,
            "text",
            current["name"],
            current["name"],
            false
          );
          if (Utils.isEmptyInput(userInput)) {
            await Utils.alertUser(
              "Nachricht",
              "Keine Aktion unternommen",
              false
            );
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changeValue&type=changeName&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          this.edit(this.choosenArray);
        });
        //Description
        let changeDescriptionBtn = tableRow.querySelector(
          "#description #change"
        );
        changeDescriptionBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsVerwaltungEditGroups"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Beschreibung ändern",
            `Ändere hier die Beschreibung der Gruppe <b>${current["name"]}</b>.`,
            false,
            "text",
            "Wird benötigt, um ....",
            current["description"],
            true
          );
          console.log(userInput);
          if (userInput !== false) {
            let res = await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=changeValue&type=changeDescription&id=" +
                current["id"] +
                "&input=" +
                userInput,
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            );
          }

          this.edit(this.choosenArray);
        });

        let editPermissions = async () => {
          let res = await changePermissions(current["id"]);
          this.edit(this.choosenArray);
        };

        //Edit Permissions - Copy from "Benutzerverwaltung"
        let editPermissionsBtn1 = tableRow.querySelector(
          "#permissionsAllowed #change"
        );
        editPermissionsBtn1.addEventListener("click", editPermissions);

        let editPermissionsBtn12 = tableRow.querySelector(
          "#permissionsForbidden #change"
        );
        editPermissionsBtn12.addEventListener("click", editPermissions);

        //Delete Permission - If delete it will not be deletet from users until repair process
        let deleteBtn = tableRow.querySelector("#remove .delete-btn");
        deleteBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["berechtigungsverwaltungADDandRemove"]
            ))
          ) {
            return false;
          }
          if (
            !(await Utils.askUser(
              "Warnung",
              "Beim Löschen der Gruppe kann große Wiederherstellungsarbeit entstehen. Sei dir auch wirklich sicher.",
              false
            ))
          ) {
            await Utils.alertUser(
              "Nachricht",
              "Keine Aktion unternommen",
              false
            );
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "gruppenverwaltung&operation=deleteGroup&id=" + current["id"],
              "./includes/berechtigungsverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false
            )
          );
          if (res["status"] === "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["id"]
            );
          }

          this.edit(this.choosenArray);
        });

        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

let berechtigungsverwaltungsContainer = document.querySelector(
  "#berechtigungsverwaltungContainer"
);
if (!berechtigungsverwaltungsContainer) {
  console.log("no berechtigungsverwaltungsContainer");
} else {
  //Berechtigungsverwaltung
  let berechtigungsVerwContainer =
    berechtigungsverwaltungsContainer.querySelector("#berechtigungsVerwaltung");
  let berechtigungsVerwaltung = new Berechtigungsverwaltung(
    berechtigungsVerwContainer
  );
  console.log(berechtigungsVerwaltung.prepareSearch());
  console.log(berechtigungsVerwaltung.prepareEdit());
  berechtigungsVerwaltung.setFilterMode("all");
  berechtigungsVerwaltung.search();

  //Gruppenverwaltung
  let gruppenverwaltungsContainer =
    berechtigungsverwaltungsContainer.querySelector("#gruppenVerwaltung");
  let gruppenverwaltung = new Gruppenverwaltung(gruppenverwaltungsContainer);
  console.log(gruppenverwaltung.prepareSearch());
  console.log(gruppenverwaltung.prepareEdit());
  gruppenverwaltung.setFilterMode("all");
  gruppenverwaltung.search();
}
