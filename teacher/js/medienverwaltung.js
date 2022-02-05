import * as Utils from "../../includes/utils.js";
import {} from "./medienverwaltung.inc.js";

class Medienverwaltung {
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

    this.limiter = null;

    //others
    this.searchWhileTyping = false;
    this.editBtn = null;

    this.choosenArray = new Array();
    this.oldCheckedArray = new Array();

    this.resultTable = null;
    this.editTable = null;
    this.editContainer = null;
    this.editTableBody = null;
    this.resultDescriptionContainer = null;

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

    //ChangeAllKeywords

    //DeleteAll
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
    let typeSelectContainer = selectionFiltersContainer.querySelector("#type");
    let mimeTypeSelectContainer =
      selectionFiltersContainer.querySelector("#mimeType");
    let pathSelectContainer = selectionFiltersContainer.querySelector("#path");
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
    this.thumbnailFileNameSelectContainer = thumbnailFileNameSelectContainer;
    this.thumbnailMimeTypeSelectContainer = thumbnailMimeTypeSelectContainer;
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

    //ADD Media
    addBtn.addEventListener("click", async () => {
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["medienverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }

      //User Input

      if (Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Berechtigung nicht erstellt.", false);
        return false;
      }
      let res = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "medienverwaltung&operation=uploadNewMedia",
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
      let textInput = this.filenameSelectContainer.querySelector("#textInput");
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
      let choosenContainer = this.typeSelectContainer.querySelector("#choosen");

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
      let numberInput = this.idSelectContainer.querySelector("#numberInput");
      Utils.listenToChanges(numberInput, 200, "input", this.search());
      this.idSelectContainer.classList.remove("hidden");
    } else if (filter === this.mediaIDSelectContainer) {
      //mediaID
      let textInput = this.mediaIDSelectContainer.querySelector("#textInput");
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
      let textInput = this.uploadedSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.uploadedSelectContainer.classList.remove("hidden");
    } else if (filter === this.uploadedBySelectContainer) {
      let choosen = this.uploadedBySelectContainer.querySelector("#choosen");
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
      let textInput = this.uploadedSelectContainer.querySelector("#textInput");
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
        if (this.changedBySelectArray && this.changedBySelectArray.length > 0) {
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
      let removeBtn = this.changedBySelectContainer.querySelector("#removeBtn");
      removeBtn.addEventListener("click", async () => {
        this.changedBySelectArray = new Array();
        choosen.innerHTML = "";
      });

      this.changedBySelectContainer.classList.remove("hidden");
    } else if (filter == this.isBlobSelectContainer) {
      let list = this.isBlobSelectContainer.querySelector("#selectInput");
      list = Utils.removeAllEventlisteners(list);
      list.addEventListener("change", () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });

      this.isBlobSelectContainer.classList.remove("hidden");
    } else if (filter == this.thumbnailSelectContainer) {
      let list = this.thumbnailSelectContainer.querySelector("#selectInput");
      list = Utils.removeAllEventlisteners(list);
      list.addEventListener("change", () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });

      this.thumbnailSelectContainer.classList.remove("hidden");
    } else if (filter == this.thumbnailIsBlobSelectContainer) {
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
      let textInput = this.thumbnailFileNameSelectContainer.querySelector("#textInput");
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

      let addBtn = this.thumbnailMimeTypeSelectContainer.querySelector("#addBtn");
      addBtn = Utils.removeAllEventlisteners(addBtn);
      addBtn.addEventListener("click", () => {
        add();
      });
      this.thumbnailMimeTypeSelectContainer.classList.remove("hidden");
    } else if (filter === this.thumbnailIsOnlineSourceSelectContainer) {
      let list =
        this.thumbnailIsOnlineSourceSelectContainer.querySelector("#selectInput");
      list = Utils.removeAllEventlisteners(list);
      list.addEventListener("change", () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });

      this.thumbnailIsOnlineSourceSelectContainer.classList.remove("hidden");
    } else if (filter === this.thumbnailPathSelectContainer) {
      //name
      let textInput = this.thumbnailPathSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.thumbnailPathSelectContainer.classList.remove("hidden");
    } else if (filter === this.thumbnailInMediaFolderSelectContainer) {
      let list =
        this.thumbnailInMediaFolderSelectContainer.querySelector("#selectInput");
      list = Utils.removeAllEventlisteners(list);
      list.addEventListener("change", () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });

      this.thumbnailInMediaFolderSelectContainer.classList.remove("hidden");
    }

    console.log(filter)
  }

  async search() {
    console.log("Search...");
    this.searchReloadBtn.disabled = true;
    //Utils.toggleLodingAnimation(this.container)
    this.searchBtn.classList.add("loading");
    this.choosenArray = new Array();
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    if (this.filterType === "filename") {
      let input =
        this.fileNameSelectContainer.querySelector("#textInput").value;
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=search&filter=filename&filename=" +
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

    results = Utils.sortItems(results, "id"); //Just sort it to better overview

    for (const result of results) {
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["id"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="data"></td>
      <td id="fileName">${result["filename"]}</td>
      <td id="description">${result["description"]}</td>
      <td id="type">${result["type"]}</td>
      <td id="mimeType">${result["mimeType"]}</td>
      <td id="id">${result["id"]}</td>
      <td id="mediaID">${result["mediaID"]}</td>
      <td id="keywords">${JSON.stringify(result["keywords"], null, 2)}</td>
      <td id="thumbnail"></td>
      <td id="thumbnailFileName"></td>
      <td id="thumbnailMimeType"></td>
      <td id="onFilesystem">${Utils.boolToString(result["onFilesystem"], {
        true: "Ja",
        false: "Nein",
      })}</td>
      <td id="fileSize">${result["fileSize"]}</td>
      <td id="uploaded">${result["uploaded"]}</td>
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

      let keywordsContainer = tableRow.querySelector("#keywords");
      Utils.listOfArrayToHTML(
        keywordsContainer,
        Utils.makeJSON(result["keywords"]),
        "keine"
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

let medienverwaltungsContainer = document.querySelector(
  "#medienverwaltungsContainer"
);
if (!medienverwaltungsContainer) {
  console.log("no medienverwaltungsContainer");
} else {
  let medienverwaltungCon =
    medienverwaltungsContainer.querySelector("#medienverwaltung");
  //Medienverwaltung
  let medienverwaltung = new Medienverwaltung(medienverwaltungCon);
  console.log(medienverwaltung.prepareSearch());
  console.log(medienverwaltung.prepareEdit());
}
