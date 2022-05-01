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

    //description
    let changeDescriptionBtn = thead.querySelector("#description #changeAll");
    changeDescriptionBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
        Utils.permissionDENIED();
        return false;
      }

      let newValue = await Utils.getUserInput(
        "Beschreibung ändern",
        "Ändere hier die Beschreibung",
        false,
        "textArea",
        "",
        "",
        false,
        false,
        false,
        false
      );
      if (newValue === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=description&newValue=" +
              newValue +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //keywords
    let changeKeyWordsBtn = thead.querySelector("#keywords #changeAll");
    changeKeyWordsBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
        Utils.permissionDENIED();
        return false;
      }

      let newValue = Object.values(
        await Utils.editObject(
          {},
          {
            title: "Schlüsselwörter bearbeiten",
            fullscreen: true,
            modalType: "ok",
          },
          false,
          false
        )
      );
      if (!newValue) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=keywords&newValue=" +
              JSON.stringify(newValue) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
      }
      this.edit(this.choosenArray, false);
    });
    //isOnlineSource
    let onlineSourceBtn = thead.querySelector("#isOnlineSource #changeAll");
    onlineSourceBtn.addEventListener("click", async () => {
      let status = await Utils.getUserInput(
        "Onlinequelle ändern",
        "Ausgewählte Medieneinträge sind Onlinequellen.",
        false,
        "select",
        false,
        false,
        true,
        { Ja: 1, Nein: 0 },
        true,
        false
      );
      if (status === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }

      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=isOnlineSource&newValue=" +
              JSON.stringify(status) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //inMediaFolder
    let inMediaFolderBtn = thead.querySelector("#inMediaFolder #changeAll");
    inMediaFolderBtn.addEventListener("click", async () => {
      let status = await Utils.getUserInput(
        "In Media-Ordner ändern",
        "Ausgewählte Medieneinträge sind im Media-Ordner.",
        false,
        "select",
        false,
        false,
        true,
        { Ja: 1, Nein: 0 },
        true,
        false
      );
      if (status === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=inMediaFolder&newValue=" +
              JSON.stringify(status) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //path
    let changePathBtn = thead.querySelector("#path #changeAll");
    changePathBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
        Utils.permissionDENIED();
        return false;
      }
      let newValue = await Utils.getUserInput(
        "Pfad / URL ändern",
        "Ändere hier den Pfad / URL",
        false,
        "textArea",
        "",
        "",
        false,
        false,
        false,
        false
      );
      if (newValue === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=path&newValue=" +
              JSON.stringify({ path: newValue }) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
      }
      this.edit(this.choosenArray, false);
    });
    //thumbnailData
    let changeDataThumbanilBtn = thead.querySelector(
      "#thumbnailData #changeAll"
    );
    changeDataThumbanilBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
        Utils.permissionDENIED();
        return false;
      }
      let secondOperation = await Utils.getUserInput(
        "Aktion auswählen",
        "Wie willst du das Vorschaubild (Thumbnail) ändern? (alle ausgewählten) -> jeweils seperater Upload",
        false,
        "select",
        false,
        false,
        false,
        {
          "Datei hochladen (Dateisystem)": "uploadToFileSystem",
          "Datei geschützt in die Datenbank hochladen (BLOB, bis 1GB)":
            "uploadAsBlob",
          "Eine Onlinequelle hinzufügen": "addOnlineSource",
        },
        true,
        false
      );
      for (const current of this.choosenArray) {
        if (secondOperation === "uploadToFileSystem") {
          let choosenfile = await Utils.getUserInput(
            "Dateieingabe",
            "Füge hier deine gewünchte Datei ein (Bild)",
            false,
            "file",
            false,
            false,
            false,
            false,
            false,
            false,
            { multiple: false }
          );
          //Create FormData object
          let formData = new FormData();
          formData.append("file", choosenfile);
          formData.append(
            "request",
            "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=uploadToFileSystem"
          );
          formData.append("medienverwaltung", "selected");
          formData.append("operation", "changeValue");
          formData.append("type", "changeDataThumbnail");
          formData.append("secondOperation", "uploadToFileSystem");
          formData.append("id", current);
          console.log("CHOOSEN FILE =>", choosenfile);
          if (!choosenfile) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUESTCustomFormData(
              formData,
              "/teacher/includes/medienverwaltung.inc.php",
              true,
              false,
              true,
              false,
              true,
              "text",
              false
            )
          );
          this.edit([current], true);
        } else if (secondOperation === "uploadAsBlob") {
          let choosenfile = await Utils.getUserInput(
            "Dateieingabe",
            "Füge hier deine gewünchte Datei ein",
            false,
            "file",
            false,
            false,
            false,
            false,
            false,
            false,
            { multiple: false }
          );
          //Create FormData object
          let formData = new FormData();
          formData.append("file", choosenfile);
          formData.append(
            "request",
            "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=uploadAsBlob"
          );
          formData.append("medienverwaltung", "selected");
          formData.append("operation", "changeValue");
          formData.append("type", "changeDataThumbnail");
          formData.append("secondOperation", "uploadAsBlob");
          formData.append("id", current);
          console.log("CHOOSEN FILE =>", choosenfile);
          if (!choosenfile) {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUESTCustomFormData(
              formData,
              "/teacher/includes/medienverwaltung.inc.php",
              true,
              false,
              true,
              false,
              true,
              "text",
              false
            )
          );
          this.edit([current], true);
        } else if (secondOperation === "addOnlineSource") {
          let url = await Utils.getUserInput(
            "URL eingeben",
            "Füge hier die URL zu der Onlinequelle ein.",
            false,
            "text",
            false,
            false,
            false
          );
          if (!url || Utils.isEmptyInput(url)) {
            await Utils.alertUser(
              "Nachricht",
              "Keine Aktion unternommen",
              false
            );
            return false;
          }
          url = { url: url };
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=changeData&secondOperation=changeDataThumbnail&url=" +
                JSON.stringify(url) +
                "&id=" +
                current,
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
          this.edit([current], true);
        } else if (secondOperation === "remove") {
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=remove&id=" +
                current,
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
          this.edit([current], true);
        }
      }
    });
    //Thumbnailfilename
    let changethumbnailFilenameBtn = thead.querySelector(
      "#thumbnailFileName #changeAll"
    );
    changethumbnailFilenameBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
        Utils.permissionDENIED();
        return false;
      }
      let newValue = await Utils.getUserInput(
        "Dateinamen ändern",
        "Ändere hier den Dateinamen",
        false,
        "textArea",
        "",
        "",
        false,
        false,
        false,
        false
      );
      if (newValue === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=thumbnailFileName&newValue=" +
              JSON.stringify({ newValue: newValue }) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //thumbnailIsOnlineSourceBtn
    let thumbnailIsOnlineSourceBtn = thead.querySelector(
      "#thumbnailIsOnlineSource #changeAll"
    );
    thumbnailIsOnlineSourceBtn.addEventListener("click", async () => {
      let status = await Utils.getUserInput(
        "Onlinequellen ändern",
        "Ausgewählte Medieneinträge sind im Onlinequellen.",
        false,
        "select",
        false,
        false,
        true,
        { Ja: 1, Nein: 0 },
        true,
        false
      );
      if (status === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=thumbnailIsOnlineSource&newValue=" +
              JSON.stringify(status) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //thumbnailPath
    let changeThumbnailPathBtn = thead.querySelector(
      "#thumbnailPath #changeAll"
    );
    changeThumbnailPathBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
        Utils.permissionDENIED();
        return false;
      }
      let newValue = await Utils.getUserInput(
        "Pfad / URL ändern",
        "Ändere hier den Pfad / URL",
        false,
        "textArea",
        "",
        "",
        false,
        false,
        false,
        false
      );
      if (newValue === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=thumbnailPath&newValue=" +
              JSON.stringify({ path: newValue }) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //thumbnailInMediaFolder
    let thumbnailInMediaFolderBtn = thead.querySelector(
      "#thumbnailInMediaFolder #changeAll"
    );
    thumbnailInMediaFolderBtn.addEventListener("click", async () => {
      let status = await Utils.getUserInput(
        "In Media-Ordner ändern",
        "Ausgewählte Medieneinträge sind im Media-Ordner.",
        false,
        "select",
        false,
        false,
        true,
        { Ja: 1, Nein: 0 },
        true,
        false
      );
      if (status === false) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
      for (const current of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "medienverwaltung&operation=changeValue&type=thumbnailInMediaFolder&newValue=" +
              JSON.stringify(status) +
              "&id=" +
              current,
            "/teacher/includes/medienverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true,
            false
          )
        );
        this.edit([current], true);
      }
    });
    //removeAll
    let deleteBtn = thead.querySelector("#remove #removeAll");
    deleteBtn.addEventListener("click", async () => {
      if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
        Utils.permissionDENIED();
        return false;
      }
      if (
        (await Utils.askUser(
          "Medieneintrag löschen",
          `Möchtest du alle ausgewählten Medieneinträge wirklich löschen? (${this.choosenArray.length}) Alle verknüpften Dateien werden gelöscht. In Quizzen verknüpfte Inhalte funktionieren dann nicht mehr und müssen geändert werden.`
        )) !== false
      ) {
        for (const current of this.choosenArray) {
          let response = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=removeMedia&id=" + current,
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              false,
              false,
              true,
              false
            )
          );
          if (response["status"] == "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current
            );
          }
        }
        this.edit(this.choosenArray, false);
      } else {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
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
    this.chooseAllBtn = this.resultTable.querySelector(
      "thead #select #chooseall"
    );
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

    //Shrink media
    let shrinkToggleCheckboxes = this.container.querySelectorAll(
      "thead #data #checkbox"
    );

    for (const current of shrinkToggleCheckboxes) {
      current.addEventListener("click", () => {
        current.closest("table").classList.toggle("shrinkMedia");
      });
    }

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
      this.addMedia();
    });
  }

  async addMedia() {
    if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
      Utils.permissionDENIED();
      return false;
    }
    let type = await Utils.getUserInput(
      "Medieneintrag erstellen",
      "Wie willst du einen Medieneintrag erstellen?",
      false,
      "select",
      false,
      false,
      false,
      {
        "Datei hochladen (Dateisystem)": "uploadToFileSystem",
        "Datei geschützt in die Datenbank hochladen (BLOB, bis 1GB)":
          "uploadAsBlob",
        "Eine Onlinequelle hinzufügen": "addOnlineSource",
      },
      true,
      false
    );
    if (type === "uploadToFileSystem") {
      let choosenfile = await Utils.getUserInput(
        "Dateieingabe",
        "Füge hier deine gewünchte Datei ein",
        false,
        "file",
        false,
        false,
        false,
        false,
        false,
        false,
        { multiple: false }
      );
      //Create FormData object
      let formData = new FormData();
      formData.append("file", choosenfile);
      formData.append(
        "request",
        "medienverwaltung&operation=addMedia&type=uploadToFileSystem"
      );
      formData.append("medienverwaltung", "selected");
      formData.append("operation", "addMedia");
      formData.append("type", "uploadToFileSystem");
      console.log("CHOOSEN FILE =>", choosenfile);
      if (!choosenfile) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
      let response = await Utils.makeJSON(
        await Utils.sendXhrREQUESTCustomFormData(
          formData,
          "/teacher/includes/medienverwaltung.inc.php",
          true,
          true,
          true,
          true,
          true,
          "text",
          false
        )
      );
      if (response && response["status"] === "success") {
        let id = response["data"]?.["id"];
        if (id) {
          this.choosenArray = Utils.addToArray(this.choosenArray, id, false);
          this.edit(this.choosenArray, false);
          return;
        }
      } else {
        Utils.alertUser("Fehler", "Datei konnte nicht hochgeladen werden");
      }
    } else if (type === "uploadAsBlob") {
      let choosenfile = await Utils.getUserInput(
        "Dateieingabe",
        "Füge hier deine gewünchte Datei ein",
        false,
        "file",
        false,
        false,
        false,
        false,
        false,
        false,
        { multiple: false }
      );
      //Create FormData object
      let formData = new FormData();
      formData.append("file", choosenfile);
      formData.append(
        "request",
        "medienverwaltung&operation=addMedia&type=uploadAsBlob"
      );
      formData.append("medienverwaltung", "selected");
      formData.append("operation", "addMedia");
      formData.append("type", "uploadAsBlob");
      console.log("CHOOSEN FILE =>", choosenfile);
      if (!choosenfile) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
        return false;
      }
      let response = await Utils.makeJSON(
        await Utils.sendXhrREQUESTCustomFormData(
          formData,
          "/teacher/includes/medienverwaltung.inc.php",
          true,
          true,
          true,
          true,
          true,
          "text",
          false
        )
      );
      if (response && response["status"] === "success") {
        let id = response["data"]?.["id"];
        if (id) {
          this.choosenArray = Utils.addToArray(this.choosenArray, id, false);
          this.edit(this.choosenArray, false);
          return;
        }
      } else {
        Utils.alertUser("Fehler", "Datei konnte nicht hochgeladen werden");
      }
    } else if (type === "addOnlineSource") {
      let url = await Utils.getUserInput(
        "URL eingeben",
        "Füge hier die URL zu der Onlinequelle ein.",
        false,
        "text",
        false,
        false,
        false
      );
      if (!url || Utils.isEmptyInput(url)) {
        await Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      url = { url: url };
      let response = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "medienverwaltung&operation=addMedia&type=addOnlineSource&url=" +
            JSON.stringify(url),
          "/teacher/includes/medienverwaltung.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true,
          true
        )
      );
      if (response && response["status"] === "success") {
        let id = response["data"]?.["id"];
        if (id) {
          this.choosenArray = Utils.addToArray(this.choosenArray, id, false);
          this.edit(this.choosenArray, false);
          return;
        }
      } else {
        Utils.alertUser(
          "Fehler",
          "Medieneintrag konnte nicht erstellt werden."
        );
      }
    }
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
      let textInput = this.changedSelectContainer.querySelector("#textInput");
      Utils.listenToChanges(textInput, "input", 450, () => {
        if (this.searchWhileTyping) {
          this.search();
        }
      });
      this.changedSelectContainer.classList.remove("hidden");
    } else if (filter === this.changedBySelectContainer) {
      this.changedBySelectArray = new Array();
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
      let list = this.thumbnailSelectContainer.querySelector("#selectInput");
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

      this.thumbnailIsOnlineSourceSelectContainer.classList.remove("hidden");
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
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

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
      let input = this.pathSelectContainer.querySelector("#textInput").value;
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
      let input = this.idSelectContainer.querySelector("#numberInput").value;
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
      let input = this.mediaIDSelectContainer.querySelector("#textInput").value;
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
      console.log(this.uploadedBySelected);
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
      let input = this.changedSelectContainer.querySelector("#textInput").value;
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
      console.log(this.changedBySelectArray);
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
      let select = this.thumbnailSelectContainer.querySelector("#selectInput");
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
        this.thumbnailFileNameSelectContainer.querySelector("#textInput").value;
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
      if (!this.choosenMimeypesArray || !this.choosenMimeypesArray.length > 0)
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
        isOnlineSourceSelect[isOnlineSourceSelect.selectedIndex].getAttribute(
          "data-value"
        );
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
      if (!this.changedBySelectArray || !this.changedBySelectArray.length > 0)
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
        thumbnailIsBlobSelect[thumbnailIsBlobSelect.selectedIndex].getAttribute(
          "data-value"
        );
      if (Utils.isEmptyInput(thumbnailIsBlob, true)) thumbnailIsBlob = false;

      //thumbnailFileName
      let thumbnailFileName =
        this.thumbnailFileNameSelectContainer.querySelector("#textInput").value;
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
    this.resultDescriptionContainer.innerHTML = `${results.length} Ergebnisse`;

    results = Utils.sortItems(results, "id"); //Just sort it to better overview

    for (const result of results) {
      this.resultTable.classList.remove("hidden");
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["id"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button>
      <span class="loading-btn-wrapper copyMediaID-wrapper">
      <button class="loading-btn copyMediaID">
        <span class="loading-btn__text">
          MediaID kopieren
        </span>
      </button>
    </span>

      </td>
      <td id="data"></td>
      <td id="description" style="min-width: 300px;">${
        result["description"]
      }</td>
      <td id="keywords" style="min-width: 200px;">${JSON.stringify(
        Utils.makeJSON(result["keywords"], null, 2)
      )}</td>
      <td id="isOnlineSource">${Utils.valueToString(result["isOnlineSource"], {
        true: "Ja",
        false: "Nein",
      })}</td>
      <td id="type">${result["type"]}</td>
      <td id="mimeType">${result["mimeType"]}</td>
      <td id="isBlob">${result["isBlob"]}</td>
      <td id="path" style="min-width: 200px;">${result["path"]}</td>
      <td id="inMediaFolder">${Utils.valueToString(result["inMediaFolder"], {
        true: "Ja",
        false: "Nein",
      })}</td>
      <td id="uploaded">${result["uploaded"]}</td>
      <td id="changed">${result["changed"]}</td>
      <td id="filename" style="min-width: 200px;">${result["filename"]}</th>
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
      <td id="fileSize">${Math.round((Number(result["fileSize"]) / 1000000) * 100) / 100}</td>
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

      let copyMediaIDBtn = tableRow.querySelector(".copyMediaID-wrapper .copyMediaID");
      copyMediaIDBtn.addEventListener("click", () => {
        copyMediaIDBtn.classList.add("loading-btn--pending");
        if (Utils.copyTextToClipboard(result["mediaID"])) {
          copyMediaIDBtn.classList.remove("loading-btn--pending");
          copyMediaIDBtn.classList.add("loading-btn--success");
          window.setTimeout(() => {
            copyMediaIDBtn.classList.remove("loading-btn--success");
          }, 1300);
        } else {
          copyMediaIDBtn.classList.remove("loading-btn--pending");
          copyMediaIDBtn.classList.add("loading-btn--failed");
          window.setTimeout(() => {
            copyMediaIDBtn.classList.remove("loading-btn--failed");
          }, 1300);
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

      try {
        Utils.setMedia(
          { mediaID: result["mediaID"] },
          tableRow.querySelector("#data")
        );

        //Thumbnail
        //GET thumbnail data if enabled

        if (result["thumbnail"]) {
          let thumbnailData = await Utils.getThumbnailURL(result);
          console.log(thumbnailData);
          if (thumbnailData.url) {
            Utils.setMedia(
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
      } catch (e) {
        console.error(e);
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
        this.edit(this.choosenArray);
      });
    }
    this.searchReloadBtn.disabled = false;
  }

  updateEditBtn() {
    if (this.choosenArray.length > 0) {
      this.editBtn.disabled = false;
    } else {
      this.editBtn.disabled = true;
    }
  }

  async edit(choosen, reloadOnlyOne = false) {
    if (!choosen || !choosen.length > 0) {
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
      return false;
    }
    this.editReloadBtn.disabled = true;
    console.log("Edit:", choosen);

    if (!reloadOnlyOne) {
      this.resultTable.classList.add("hidden");
      this.clear(this.tableBody);
      this.editContainer.classList.add("hidden");
      this.clear(this.editTableBody);
    }

    for (const currentRaw of choosen) {
      //Get Data
      let current = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "medienverwaltung&operation=getFullInfromation&id=" + currentRaw,
          "./includes/medienverwaltung.inc.php",
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
            tableRow = document.createElement("tr");
            this.editTableBody.appendChild(tableRow);
          }
        }
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["id"]);
        tableRow.innerHTML = `
        <td id="data">
            <div class="content"></div>
            <div class="change"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></div>
            <span class="loading-btn-wrapper copyMediaID-wrapper">
            <button class="loading-btn copyMediaID">
              <span class="loading-btn__text">
                MediaID kopieren
              </span>
            </button>
          </span>
        </span>
        </td>
        <td id="description"><span>${
          current["description"] ?? "keine"
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="keywords" style="min-width: 200px;">
        <div class="content"></div>
        <div class="change"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></div>
        </td>
        <td id="isOnlineSource">
            <span>${Utils.valueToString(current["isOnlineSource"], {
              true: "Ja",
              false: "Nein",
            })}</span>
            <label class="switch">
                <input type="checkbox" id="checkbox">
                <span class="slider round"></span>
            </label>
        </td>
        <td id="type">${current["type"]}</td>
        <td id="mimeType">${current["mimeType"]}</td>
        <td id="isBlob">
            ${Utils.valueToString(current["isBlob"], {
              true: "Ja",
              false: "Nein",
            })}
        </td>
        <td id="path"><span>${
          current["path"] ?? ""
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="inMediaFolder">
            <span>${Utils.valueToString(current["inMediaFolder"], {
              true: "Ja",
              false: "Nein",
            })}</span>
            <label class="switch">
                <input type="checkbox" id="checkbox">
                <span class="slider round"></span>
            </label>
        </td>
        <td id="uploaded">${current["uploaded"]}</td>
        <td id="changed">${current["changed"]}</td>
        <td id="filename" style="min-width: 200px;">
            <span>${
              current["filename"]
            }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button>
        </td>
        <td id="id">${current["id"]}</td>
        <td id="mediaID"><span>${
          current["mediaID"]
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="thumbnail">
            <span>${Utils.valueToString(current["thumbnail"], {
              true: "Ja",
              false: "Nein",
            })}</span>
            <label class="switch">
                <input type="checkbox" id="checkbox">
                <span class="slider round"></span>
            </label>
        </td>
        <td id="thumbnailData">
            <div class="content"></div>
            <div class="change"><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></div>
        </td>
        <td id="thumbnailFileName"><span>${
          current["thumbnailFileName"] ?? ""
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="thumbnailMimeType">${current["thumbnailMimeType"] ?? ""}</td>
        <td id="thumbnailIsOnlineSource">
            <span>${Utils.valueToString(current["thumbnailIsOnlineSource"], {
              true: "Ja",
              false: "Nein",
            })}</span>
            <label class="switch">
                <input type="checkbox" id="checkbox">
                <span class="slider round"></span>
            </label>
        </td>
        <td id="thumbnailIsBlob">
          ${Utils.valueToString(current["thumbnailIsBlob"], {
            true: "Ja",
            false: "Nein",
          })}
        </td>
        <td id="thumbnailPath"><span>${
          current["thumbnailPath"] ?? ""
        }</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="thumbnailInMediaFolder">
            <span>${Utils.valueToString(current["thumbnailInMediaFolder"], {
              true: "Ja",
              false: "Nein",
            })}</span>
            <label class="switch">
                <input type="checkbox" id="checkbox">
                <span class="slider round"></span>
            </label>
        </td>
        <td id="fileSize">${Math.round((Number(current["fileSize"]) / 1000000) * 100) / 100}</td>
        <th id="remove"><button class="delete-btn"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
  let copyMediaIDBtn = tableRow.querySelector(".copyMediaID-wrapper .copyMediaID");
  copyMediaIDBtn.addEventListener("click", () => {
    copyMediaIDBtn.classList.add("loading-btn--pending");
    if (Utils.copyTextToClipboard(current["mediaID"])) {
      copyMediaIDBtn.classList.remove("loading-btn--pending");
      copyMediaIDBtn.classList.add("loading-btn--success");
      window.setTimeout(() => {
        copyMediaIDBtn.classList.remove("loading-btn--success");
      }, 1300);
    } else {
      copyMediaIDBtn.classList.remove("loading-btn--pending");
      copyMediaIDBtn.classList.add("loading-btn--failed");
      window.setTimeout(() => {
        copyMediaIDBtn.classList.remove("loading-btn--failed");
      }, 1300);
    }
  });
        //Keywords
        let keywordsContainer = tableRow.querySelector("#keywords .content");
        Utils.listOfArrayToHTML(
          keywordsContainer,
          current["keywords"],
          "keine"
        );
        //Disable cache for loading the newest version of media
        let oldCacheControl = window.localStorage.getItem("cacheControl");
        window.localStorage.setItem("cacheControl", "no-cache");

        //Data
        await Utils.setMedia(
          { mediaID: current["mediaID"] },
          tableRow.querySelector("#data .content")
        );
        //Thumbnail
        //GET thumbnail data if enabled
        if (current["thumbnail"]) {
          let thumbnailData = await Utils.getThumbnailURL(current);
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
              tableRow.querySelector("#thumbnailData .content"),
              true
            );
          }
        }
        //set cacheControl to old value
        window.localStorage.setItem("cacheControl", oldCacheControl);

        //data
        let changeDataBtn = tableRow.querySelector("#data .change #change");
        changeDataBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
            Utils.permissionDENIED();
            return false;
          }
          let secondOperation = await Utils.getUserInput(
            "Aktion auswählen",
            "Wie willst du die Mediendaten ändern?",
            false,
            "select",
            false,
            false,
            false,
            {
              "Datei hochladen (Dateisystem)": "uploadToFileSystem",
              "Datei geschützt in die Datenbank hochladen (BLOB, bis 1GB)":
                "uploadAsBlob",
              "Eine Onlinequelle hinzufügen": "addOnlineSource",
              Entfernen: "remove",
            },
            true,
            false
          );
          if (secondOperation === "uploadToFileSystem") {
            let choosenfile = await Utils.getUserInput(
              "Dateieingabe",
              "Füge hier deine gewünchte Datei ein",
              false,
              "file",
              false,
              false,
              false,
              false,
              false,
              false,
              { multiple: false }
            );
            //Create FormData object
            let formData = new FormData();
            formData.append("file", choosenfile);
            formData.append(
              "request",
              "medienverwaltung&operation=changeValue&type=changeData&secondOperation=uploadToFileSystem"
            );
            formData.append("medienverwaltung", "selected");
            formData.append("operation", "changeValue");
            formData.append("type", "changeData");
            formData.append("secondOperation", "uploadToFileSystem");
            formData.append("id", current["id"]);
            console.log("CHOOSEN FILE =>", choosenfile);
            if (!choosenfile) {
              await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUESTCustomFormData(
                formData,
                "/teacher/includes/medienverwaltung.inc.php",
                true,
                true,
                true,
                true,
                true,
                "text",
                false
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "uploadAsBlob") {
            let choosenfile = await Utils.getUserInput(
              "Dateieingabe",
              "Füge hier deine gewünchte Datei ein",
              false,
              "file",
              false,
              false,
              false,
              false,
              false,
              false,
              { multiple: false }
            );
            //Create FormData object
            let formData = new FormData();
            formData.append("file", choosenfile);
            formData.append(
              "request",
              "medienverwaltung&operation=changeValue&type=changeData&secondOperation=uploadAsBlob"
            );
            formData.append("medienverwaltung", "selected");
            formData.append("operation", "changeValue");
            formData.append("type", "changeData");
            formData.append("secondOperation", "uploadAsBlob");
            formData.append("id", current["id"]);
            console.log("CHOOSEN FILE =>", choosenfile);
            if (!choosenfile) {
              await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUESTCustomFormData(
                formData,
                "/teacher/includes/medienverwaltung.inc.php",
                true,
                true,
                true,
                true,
                true,
                "text",
                false
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "addOnlineSource") {
            let url = await Utils.getUserInput(
              "URL eingeben",
              "Füge hier die URL zu der Onlinequelle ein.",
              false,
              "text",
              false,
              false,
              false
            );
            if (!url || Utils.isEmptyInput(url)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen",
                false
              );
              return false;
            }
            url = { url: url };
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=changeValue&type=changeData&secondOperation=addOnlineSource&url=" +
                  JSON.stringify(url) +
                  "&id=" +
                  current["id"],
                "/teacher/includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                true
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "remove") {
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=changeValue&type=changeData&secondOperation=remove&id=" +
                  current["id"],
                "/teacher/includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                true
              )
            );
            this.edit([current["id"]], true);
          }
        });
        //description
        let changeDescriptionBtn = tableRow.querySelector(
          "#description #change"
        );
        changeDescriptionBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "Beschreibung ändern",
            "Ändere hier die Beschreibung",
            false,
            "textArea",
            current["description"],
            current["description"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=description&newValue=" +
                newValue +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //keywords
        let changeKeyWordsBtn = tableRow.querySelector("#keywords #change");
        changeKeyWordsBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = Object.values(
            await Utils.editObject(
              { ...Utils.makeJSON(current["keywords"]) },
              {
                title: "Schlüsselwörter bearbeiten",
                fullscreen: true,
                modalType: "ok",
              },
              false,
              false
            )
          );
          if (!newValue) {
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
              "medienverwaltung&operation=changeValue&type=keywords&newValue=" +
                JSON.stringify(newValue) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //isOnlineSource
        let onlineSourceSlider = tableRow.querySelector(
          "#isOnlineSource #checkbox"
        );
        onlineSourceSlider.checked = current["isOnlineSource"];
        onlineSourceSlider.addEventListener("click", async () => {
          let state = onlineSourceSlider.checked;
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=isOnlineSource&newValue=" +
                JSON.stringify(state) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //path
        let changePathBtn = tableRow.querySelector("#path #change");
        changePathBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "Pfad / URL ändern",
            "Ändere hier den Pfad / URL",
            false,
            "textArea",
            current["path"],
            current["path"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=path&newValue=" +
                JSON.stringify({ path: newValue }) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //inMediaFolder
        let inMediaFolderSlider = tableRow.querySelector(
          "#inMediaFolder #checkbox"
        );
        inMediaFolderSlider.checked = current["inMediaFolder"];
        inMediaFolderSlider.addEventListener("click", async () => {
          let state = inMediaFolderSlider.checked;

          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=inMediaFolder&newValue=" +
                JSON.stringify(state) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //filename
        let changeFileNameBtn = tableRow.querySelector("#filename #change");
        changeFileNameBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "Dateinamen ändern",
            "Ändere hier den Dateinamen",
            false,
            "textArea",
            current["filename"],
            current["filename"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=filename&newValue=" +
                JSON.stringify({ newValue: newValue }) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //mediaID
        let changeMediaIDBtn = tableRow.querySelector("#mediaID #change");
        changeMediaIDBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "MediaID ändern",
            "Ändere hier die MediaID",
            false,
            "textArea",
            current["mediaID"],
            current["mediaID"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=mediaID&newValue=" +
                JSON.stringify({ newValue: newValue }) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //thumbnail
        let thumbnailSlider = tableRow.querySelector("#thumbnail #checkbox");
        thumbnailSlider.checked = current["thumbnail"];
        thumbnailSlider.addEventListener("click", async () => {
          let state = thumbnailSlider.checked;
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=thumbnail&newValue=" +
                JSON.stringify(state) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );

          this.edit([current["id"]], true);
        });
        //change dataThumbnail
        let changeDataThumbanilBtn = tableRow.querySelector(
          "#thumbnailData .change #change"
        );
        changeDataThumbanilBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
            Utils.permissionDENIED();
            return false;
          }
          let secondOperation = await Utils.getUserInput(
            "Aktion auswählen",
            "Wie willst du das Vorschaubild (Thumbnail) ändern?",
            false,
            "select",
            false,
            false,
            false,
            {
              "Datei hochladen (Dateisystem)": "uploadToFileSystem",
              "Datei geschützt in die Datenbank hochladen (BLOB, bis 1GB)":
                "uploadAsBlob",
              "Eine Onlinequelle hinzufügen": "addOnlineSource",
            },
            true,
            false
          );
          if (secondOperation === "uploadToFileSystem") {
            let choosenfile = await Utils.getUserInput(
              "Dateieingabe",
              "Füge hier deine gewünchte Datei ein (Bild)",
              false,
              "file",
              false,
              false,
              false,
              false,
              false,
              false,
              { multiple: false }
            );
            //Create FormData object
            let formData = new FormData();
            formData.append("file", choosenfile);
            formData.append(
              "request",
              "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=uploadToFileSystem"
            );
            formData.append("medienverwaltung", "selected");
            formData.append("operation", "changeValue");
            formData.append("type", "changeDataThumbnail");
            formData.append("secondOperation", "uploadToFileSystem");
            formData.append("id", current["id"]);
            console.log("CHOOSEN FILE =>", choosenfile);
            if (!choosenfile) {
              await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUESTCustomFormData(
                formData,
                "/teacher/includes/medienverwaltung.inc.php",
                true,
                true,
                true,
                true,
                true,
                "text",
                false
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "uploadAsBlob") {
            let choosenfile = await Utils.getUserInput(
              "Dateieingabe",
              "Füge hier deine gewünchte Datei ein",
              false,
              "file",
              false,
              false,
              false,
              false,
              false,
              false,
              { multiple: false }
            );
            //Create FormData object
            let formData = new FormData();
            formData.append("file", choosenfile);
            formData.append(
              "request",
              "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=uploadAsBlob"
            );
            formData.append("medienverwaltung", "selected");
            formData.append("operation", "changeValue");
            formData.append("type", "changeDataThumbnail");
            formData.append("secondOperation", "uploadAsBlob");
            formData.append("id", current["id"]);
            console.log("CHOOSEN FILE =>", choosenfile);
            if (!choosenfile) {
              await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
              return false;
            }
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUESTCustomFormData(
                formData,
                "/teacher/includes/medienverwaltung.inc.php",
                true,
                true,
                true,
                true,
                true,
                "text",
                false
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "addOnlineSource") {
            let url = await Utils.getUserInput(
              "URL eingeben",
              "Füge hier die URL zu der Onlinequelle ein.",
              false,
              "text",
              false,
              false,
              false
            );
            if (!url || Utils.isEmptyInput(url)) {
              await Utils.alertUser(
                "Nachricht",
                "Keine Aktion unternommen",
                false
              );
              return false;
            }
            url = { url: url };
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=changeValue&type=changeData&secondOperation=changeDataThumbnail&url=" +
                  JSON.stringify(url) +
                  "&id=" +
                  current["id"],
                "/teacher/includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                true
              )
            );
            this.edit([current["id"]], true);
          } else if (secondOperation === "remove") {
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=changeValue&type=changeDataThumbnail&secondOperation=remove&id=" +
                  current["id"],
                "/teacher/includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                true
              )
            );
            this.edit([current["id"]], true);
          }
        });
        //thumbnailFilename
        let changethumbnailFilenameBtn = tableRow.querySelector(
          "#thumbnailFileName #change"
        );
        changethumbnailFilenameBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "Dateinamen ändern",
            "Ändere hier den Dateinamen",
            false,
            "textArea",
            current["thumbnailFileName"],
            current["thumbnailFileName"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=thumbnailFileName&newValue=" +
                JSON.stringify({ newValue: newValue }) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //thumbnailIsOnlineSource
        let thumbnailIsOnlineSourceSlider = tableRow.querySelector(
          "#thumbnailIsOnlineSource #checkbox"
        );
        thumbnailIsOnlineSourceSlider.checked =
          current["thumbnailIsOnlineSource"];
        thumbnailIsOnlineSourceSlider.addEventListener("click", async () => {
          let state = thumbnailIsOnlineSourceSlider.checked;

          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=thumbnailIsOnlineSource&newValue=" +
                JSON.stringify(state) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //thumbnailPath
        let changethumbnailPathBtn = tableRow.querySelector(
          "#thumbnailPath #change"
        );
        changethumbnailPathBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungChangeValues"])) {
            Utils.permissionDENIED();
            return false;
          }

          let newValue = await Utils.getUserInput(
            "Pfad / URL ändern",
            "Ändere hier den Pfad / URL",
            false,
            "textArea",
            current["thumbnailPath"],
            current["thumbnailPath"],
            false,
            false,
            false,
            false
          );
          if (newValue === false) {
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
              "medienverwaltung&operation=changeValue&type=thumbnailPath&newValue=" +
                JSON.stringify({ path: newValue }) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //thumbnailInMediaFolder
        let thumbnailInMediaFolderSlider = tableRow.querySelector(
          "#thumbnailInMediaFolder #checkbox"
        );
        thumbnailInMediaFolderSlider.checked =
          current["thumbnailInMediaFolder"];
        thumbnailInMediaFolderSlider.addEventListener("click", async () => {
          let state = thumbnailInMediaFolderSlider.checked;

          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "medienverwaltung&operation=changeValue&type=thumbnailInMediaFolder&newValue=" +
                JSON.stringify(state) +
                "&id=" +
                current["id"],
              "/teacher/includes/medienverwaltung.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true,
              false
            )
          );
          this.edit([current["id"]], true);
        });
        //delete
        let deleteBtn = tableRow.querySelector("#remove .delete-btn");
        deleteBtn.addEventListener("click", async () => {
          if (!Utils.userHasPermissions(["medienverwaltungADDandREMOVE"])) {
            Utils.permissionDENIED();
            return false;
          }
          if (
            (await Utils.askUser(
              "Medieneintrag löschen",
              "Möchtest du den Medieneintrag wirklich löschen? Alle verknüpften Dateien werden gelöscht. In Quiz verknüpfte Inhalte funktionieren dann nicht mehr und müssen geändert werden."
            )) !== false
          ) {
            let response = await Utils.makeJSON(
              await Utils.sendXhrREQUEST(
                "POST",
                "medienverwaltung&operation=removeMedia&id=" + current["id"],
                "/teacher/includes/medienverwaltung.inc.php",
                "application/x-www-form-urlencoded",
                true,
                true,
                false,
                true,
                false
              )
            );
            if (response["status"] == "success") {
              this.choosenArray = Utils.removeFromArray(
                this.choosenArray,
                current["id"]
              );
            }
            this.edit(this.choosenArray, false);
          } else {
            await Utils.alertUser("Nachricht", "Keine Aktion unternommen");
            return false;
          }
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
  medienverwaltung.limiter.value = 20;
  medienverwaltung.setFilterMode("all");

  let urlParams = Utils.getUrlParams();
  if (urlParams.has("action")) {
    let action = urlParams.get("action");

    if (action === "addMedia") {
      medienverwaltung.addMedia();
    }
  }
}
