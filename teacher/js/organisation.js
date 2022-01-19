import * as Utils from "../../includes/utils.js";

class Overview {
  constructor(navigationsleiste) {
    this.navigationsleiste = navigationsleiste;
    this.ausgewaehlteKlasse = null;
    this.ausgewaehltesFach = null;
    this.ausgewaehltesThema = null;
    this.ausgewaehltesQuiz = null;

    this.klassenDropdown = null;
    this.dropDownLinkContainerKlassen = null;

    this.faecherDropdown = null;
    this.dropDownLinkContainerFaecher = null;

    this.themenDropdown = null;
    this.dropDownLinkContainerThemen = null;

    this.quizzeDropdown = null;
    this.dropDownLinkContainerQuizze = null;
  }

  resetChoice(afterContent) {
    //dev console.log(this.ausgewaehlteKlasse, this.ausgewaehltesFach, this.ausgewaehltesThema, this.ausgewaehltesQuiz);
    let klassen = this.navigationsleiste.querySelectorAll(".klassenDropdown");
    let faecher = this.navigationsleiste.querySelectorAll(".faecherDropdown");
    let themen = this.navigationsleiste.querySelectorAll(".themenDropdown");
    let quizze = this.navigationsleiste.querySelectorAll(".quizzeDropdown");

    switch (afterContent) {
      case "Reload":
        klassen.forEach((element) => {
          element.remove();
        });
        faecher.forEach((element) => {
          element.remove();
        });
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.klassenDropdown = null;
        this.faecherDropdown = null;
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Klasse":
        faecher.forEach((element) => {
          element.remove();
        });
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.faecherDropdown = null;
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Fach":
        themen.forEach((element) => {
          element.remove();
        });
        quizze.forEach((element) => {
          element.remove();
        });
        this.themenDropdown = null;
        this.quizDropdown = null;
        break;
      case "Thema":
        quizze.forEach((element) => {
          element.remove();
        });
        this.quizDropdown = null;
        break;
    }
  }

  //Klassenstufen
  getKlassenstufen() {
    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "overview&operation=getKlassenstufen",
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          this.setKlassenstufen(false, response);
          resolve(true);
          return true;
        } else {
          this.selectKlassenstufen(true, false);
          return false;
        }
      } catch (e) {
        this.setKlassenstufen(true, false);
        resolve(true);
      }
    });
  }

  setKlassenstufen(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Reload");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "dropdown klassenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);
      //dev console.log(this.navigationsleiste)

      //Nimmt .klassenDropdown aus dem DOM
      this.klassenDropdown =
        this.navigationsleiste.querySelector(".klassenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren

        this.klassenDropdown.innerHTML = `
        <h4>Klasse auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="klassenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-klassenDropdown'>Keine Klasse gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="klassenDropdown2">
                        <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                        <p>Keine Daten</p>
                    </ul>
                </div>

                `;
        resolve("Keine Klassen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, "klassenstufe");
        // console.log("Diese Klassenstufen sind sortiert verfügbar: ", sorted);

        this.klassenDropdown.innerHTML = `
        <h4>Klasse auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="klassenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-klassenDropdown'>Klasse auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="klassenDropdown">
                        <h6 class="dropdown-header">Klassenstufe auswählen</h6>
                        <div class="dropdown-divider"></div>
                    </ul>
                </div>
               `;

        let dropDownLinkContainerKlassen = this.navigationsleiste.querySelector(
          ".klassenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerKlassen = dropDownLinkContainerKlassen;
        // console.log(dropDownLinkContainerKlassen);

        sorted.forEach((element) => {
          let klassenstufe = element["klassenstufe"];
          let showUser = element["showUser"];

          let link = document.createElement("li");
          if (showUser) {
            link.innerHTML = `<a class="dropdown-item selectKlasseItem" data-value="${klassenstufe}">${klassenstufe}</a>`;
          } else {
            link.innerHTML = `<a class="dropdown-item selectKlasseItem hideUser" data-value="${klassenstufe}">${klassenstufe} (versteckt)</a>`;
          }
          this.dropDownLinkContainerKlassen.appendChild(link);
        });

        //Add Eventlistener
        let selectKlasseItem =
          this.navigationsleiste.querySelectorAll(".selectKlasseItem");
        selectKlasseItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectKlassenstufe(element.getAttribute("data-value"));
            this.getFaecher();
          });
        });
        resolve("Klassen gesetzt");
      }
    });
  }

  setKlassenstufenCustomName(customName) {
    if (this.klassenDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-klassenDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectKlassenstufe(klassenstufe) {
    this.ausgewaehlteKlasse = klassenstufe;
  }

  // Fächer
  getFaecher() {
    this.setKlassenstufenCustomName(this.ausgewaehlteKlasse);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "overview&operation=getFaecher&selectedKlassenstufe=" +
              this.ausgewaehlteKlasse,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          this.setFaecher(false, response);
          resolve(true);
          return true;
        } else {
          this.setFaecher(true, false);
          return false;
        }
      } catch (e) {
        this.setFaecher(true, false);
        resolve(true);
      }
    });
  }

  setFaecher(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Klasse");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "faecherDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.faecherDropdown =
        this.navigationsleiste.querySelector(".faecherDropdown");
      // console.log(this.klassenDropdown);

      if (error || !data.length > 0) {
        //Sollte nicht passieren
        this.faecherDropdown.innerHTML = `
        <h4>Fach auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="faecherDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-faecherDropdown'>Keine Fächer gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                        <h6 class="dropdown-header">Fach auswählen</h6>
                        <p>Keine Klassenstufen gefunden.</p>
                    </ul>
                </div>
                `;
        resolve("Keine Fächer gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, "fach");
        // console.log("Diese Klassenstufen sind sortiert verfügbar: ", sorted);

        this.faecherDropdown.innerHTML = `
        <h4>Fach auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="faecherDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-faecherDropdown'>Fach auswählen</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="faecherDropdown">
                        <h6 class="dropdown-header">Fach auswählen</h6>
                    </ul>
                </div>
               `;

        let dropDownLinkContainerFaecher = this.navigationsleiste.querySelector(
          ".faecherDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerFaecher = dropDownLinkContainerFaecher;
        // console.log(dropDownLinkContainerFaecher);

        sorted.forEach((element) => {
          let fach = element["fach"];
          let showUser = element["showUser"];

          let link = document.createElement("li");
          if (showUser) {
            link.innerHTML = `<a class="dropdown-item selectFachItem" data-value="${fach}">${fach}</a>`;
          } else {
            link.innerHTML = `<a class="dropdown-item selectFachItem hideUser" data-value="${fach}">${fach} (versteckt)</a>`;
          }
          this.dropDownLinkContainerFaecher.appendChild(link);
        });

        //Add Eventlistener
        let selectFachItem =
          this.navigationsleiste.querySelectorAll(".selectFachItem");
        selectFachItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectFach(element.getAttribute("data-value"));
            this.getThemen();
          });
        });
        resolve("Fächer gesetzt");
      }
    });
  }

  setFaecherCustomName(customName) {
    if (this.faecherDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-faecherDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectFach(fach) {
    this.ausgewaehltesFach = fach;
  }

  // Themen
  getThemen() {
    this.setFaecherCustomName(this.ausgewaehltesFach);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "overview&operation=getThemen&selectedKlassenstufe=" +
              this.ausgewaehlteKlasse +
              "&selectedFach=" +
              this.ausgewaehltesFach,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          this.setThemen(false, response);
          resolve(true);
          return true;
        } else {
          this.setThemen(true, false);
          return false;
        }
      } catch (e) {
        this.setThemen(true, false);
        resolve(true);
      }
    });
  }

  setThemen(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Fach");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "themenDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.themenDropdown =
        this.navigationsleiste.querySelector(".themenDropdown");
      // console.log(this.klassenDropdown);

      if (error) {
        //Sollte nicht passieren
        this.themenDropdown.innerHTML = `
        <h4>Thema auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="themenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-themenDropdown'>Keine Themen gefunden</span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                        <h6 class="dropdown-header">Thema auswählen</h6>
                        <p>Keine Daten</p>
                    </ul>
                </div>
                 `;
        resolve("Keine Themen gefunden.");
      } else {
        //Normal execution --- normal

        let sorted = Utils.sortItems(data, "thema");
        // console.log("Diese Themen sind sortiert verfügbar: ", sorted);

        this.themenDropdown.innerHTML = `
        <h4>Thema auswählen</h4>
                <div class="dropdown">
                    <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="themenDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class='dropdown-description-themenDropdown'>Thema auswählen <span class="badge bg-secondary">${sorted.length}</span></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="themenDropdown">
                        <h6 class="dropdown-header">Thema auswählen</h6>
                    </ul>
                </div>
                `;

        let dropDownLinkContainerThemen = this.navigationsleiste.querySelector(
          ".themenDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerThemen = dropDownLinkContainerThemen;
        // console.log(dropDownLinkContainerThemen);

        sorted.forEach((element) => {
          console.log(element);
          let thema = element["thema"];
          let showUser = element["showUser"];

          let link = document.createElement("li");
          if (showUser) {
            link.innerHTML = `<a class="dropdown-item selectThemaItem" data-value="${thema}">${thema}</a>`;
          } else {
            link.innerHTML = `<a class="dropdown-item selectThemaItem hideUser" data-value="${thema}">${thema} (versteckt)</a>`;
          }
          this.dropDownLinkContainerThemen.appendChild(link);
        });

        //Add Eventlistener
        let selectFachItem =
          this.navigationsleiste.querySelectorAll(".selectThemaItem");
        selectFachItem.forEach((element) => {
          element.addEventListener("click", () => {
            this.selectThema(element.getAttribute("data-value"));
            this.getQuizze();
          });
        });
        resolve("Themen gesetzt");
      }
    });
  }

  setThemenCustomName(customName) {
    if (this.themenDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-themenDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectThema(thema) {
    this.ausgewaehltesThema = thema;
  }

  // Quizze
  getQuizze() {
    this.setThemenCustomName(this.ausgewaehltesThema);

    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "overview&operation=getQuizze&selectedKlassenstufe=" +
              this.ausgewaehlteKlasse +
              "&selectedFach=" +
              this.ausgewaehltesFach +
              "&selectedThema=" +
              this.ausgewaehltesThema,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          this.setQuizze(false, response);
          resolve(true);
          return true;
        } else {
          this.setQuizze(true, false);
          return false;
        }
      } catch (e) {
        this.setQuizze(true, false);
        resolve(true);
      }
    });
  }

  //Set Quizze
  setQuizze(error, data) {
    return new Promise((resolve, reject) => {
      this.resetChoice("Thema");

      let DropdownCreate = document.createElement("div");
      DropdownCreate.className = "quizzeDropdown";
      this.navigationsleiste.appendChild(DropdownCreate);

      //Nimmt .klassenDropdown aus dem DOM
      this.quizzeDropdown =
        this.navigationsleiste.querySelector(".quizzeDropdown");
      // console.log(this.quizzeDropdown);

      if (error || !data.length > 0) {
        //Sollte nicht passieren
        this.quizzeDropdown.innerHTML = `
        <h4>Quiz auswählen</h4>
                  <div class="dropdown">
                  <button class="btn btn-danger dropdown-toggle btn-lg" type="button" id="quizzeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <span class='dropdown-description-quizzeDropdown'>Keine Fächer gefunden</span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="quizzeDropdown">
                      <h6 class="dropdown-header">Fach auswählen</h6>
                      <p>Keine Quizze gefunden</p>
                  </ul>
              </div>
              `;
        resolve("Keine Quizze gefunden.");
      } else {
        //Normal execution --- normal
        let sorted = Utils.sortItems(data, "quizname");

        // console.log("Diese Quizze sind sortiert verfügbar: ", sorted);

        this.quizzeDropdown.innerHTML = `
        <h4>Quiz auswählen</h4>
                  <div class="dropdown">
                  <button class="btn btn-info dropdown-toggle btn-lg" type="button" id="quizzeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <span class='dropdown-description-quizzeDropdown'>Quiz auswählen<span class="badge bg-secondary">${sorted.length}</span></span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="quizzeDropdown">
                      <h6 class="dropdown-header">Quiz auswählen</h6>
                  </ul>
              </div>
             `;

        let dropDownLinkContainerQuizze = this.navigationsleiste.querySelector(
          ".quizzeDropdown .dropdown-menu"
        );
        this.dropDownLinkContainerQuizze = dropDownLinkContainerQuizze;
        // console.log(dropDownLinkContainerThemen);

        sorted.forEach((element) => {
          let name = element["quizname"];
          let showUser = element["showUser"];

          let link = document.createElement("li");
          if (showUser) {
            link.innerHTML = `<a class="dropdown-item" data-value="${name}"><span>${name}</span> <span class="information">quizID: ${element["quizId"]} uniqueID: ${element["uniqueID"]}</span></a>`;
          } else {
            link.innerHTML = `<a class="dropdown-item hideUser" data-value="${name}"><span>${name}</span> <span class="information">quizID: ${element["quizId"]} uniqueID: ${element["uniqueID"]}</span>(versteckt)</a>`;
          }
          this.dropDownLinkContainerQuizze.appendChild(link);

          link.addEventListener("click", () => {
            window.location.href = "/teacher/?route=/quizverwaltung&uniqueID=" + element["uniqueID"] + "&quizId=" + element["quizId"];
          })
        });
        resolve("Quizze gesetzt");
      }
    });
  }

  setQuizzeCustomName(customName) {
    if (this.quizzeDropdown != null) {
      let dropdownDescription = this.navigationsleiste.querySelector(
        ".dropdown-description-quizzeDropdown"
      );
      if (dropdownDescription != null) {
        dropdownDescription.innerText = customName;
      } else {
        console.log("Couldn't set the name of this dropdown");
      }
    }
  }

  selectQuiz(quiz) {
    this.ausgewaehltesQuiz = quiz;
  }
}

class Klassenstufenverwaltung {
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
    this.showQuizauswahlSelectContainer = null;
    this.userCanBeSelectContainer = null;
    this.quizCanBeCreatedSelectContainer = null;
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
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");
    let changeAllShowQuizauswahl = thead.querySelector(
      "#showQuizauswahl #changeAll"
    );
    let changeAlluserCanBe = thead.querySelector("#userCanBe #changeAll");
    let changeAllquizCanBeCreated = thead.querySelector(
      "#quizCanBeCreated #changeAll"
    );
    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    changeAllShowQuizauswahl.addEventListener("click", async () => {
      //Change All Show Quizauswahl
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=changeValue&type=changeShowQuizAuswahl&klassenstufe=" +
              klassenstufe +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    changeAlluserCanBe.addEventListener("click", async () => {
      //Change All userCanBe
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=changeValue&type=changeUserCanBe&klassenstufe=" +
              klassenstufe +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    changeAllquizCanBeCreated.addEventListener("click", async () => {
      //Change All userCanBe
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=changeValue&type=changeQuizCanBeCreated&klassenstufe=" +
              klassenstufe +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Klassenstufen löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Klassenstufen zu löschen? Alle verfügbaren Quizze werden dadurch in Backup-Klassenstufen verschoben (also nicht gelöscht). Es wird lediglich die Verknüpfung aufgehoben.`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }

      for (const klassenstufe of this.choosenArray) {
        console.log(this.choosenArray);
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=deleteKlassenstufe&klassenstufe=" +
              klassenstufe,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(
          this.choosenArray,
          klassenstufe
        );
      }

      this.edit(this.choosenArray);

      console.log(this.choosenArray);
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
    let showQuizauswahlSelectContainer =
      selectionFiltersContainer.querySelector("#showQuizauswahl");
    let userCanBeSelectContainer =
      selectionFiltersContainer.querySelector("#userCanBe");
    let quizCanBeCreatedSelectContainer =
      selectionFiltersContainer.querySelector("#quizCanBeCreated");
    if (
      !nameSelectContainer ||
      !showQuizauswahlSelectContainer ||
      !userCanBeSelectContainer ||
      !quizCanBeCreatedSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.showQuizauswahlSelectContainer = showQuizauswahlSelectContainer;
    this.userCanBeSelectContainer = userCanBeSelectContainer;
    this.quizCanBeCreatedSelectContainer = quizCanBeCreatedSelectContainer;

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
          ["klassenstufenverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Wie soll die Klassenstufe heißen?",
        false,
        "text"
      );
      if (userInput === false || Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "klassenstufenverwaltung&operation=createKlassenstufe&klassenstufe=" +
            userInput,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      this.search();
    });
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.showQuizauswahlSelectContainer.classList.add("hidden");
    this.userCanBeSelectContainer.classList.add("hidden");
    this.quizCanBeCreatedSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "showQuizauswahl") {
      this.enableFilter(this.showQuizauswahlSelectContainer);
    } else if (value === "userCanBe") {
      this.enableFilter(this.userCanBeSelectContainer);
    } else if (value === "quizCanBeCreated") {
      this.enableFilter(this.quizCanBeCreatedSelectContainer);
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
    } else if (filter === this.showQuizauswahlSelectContainer) {
      //showQuizAuswahl
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.showQuizauswahlSelectContainer.classList.remove("hidden");
    } else if (filter === this.userCanBeSelectContainer) {
      //userCanBe
      let select = this.userCanBeSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.userCanBeSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizCanBeCreatedSelectContainer) {
      //userCanBe
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizCanBeCreatedSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "showQuizauswahl") {
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=search&filter=filterByShowQuizAuswahl&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "userCanBe") {
      let select = this.userCanBeSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=search&filter=filterByUserCanBe&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizCanBeCreated") {
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=search&filter=filterByQuizCanBeCreated&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "klassenstufe"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["klassenstufe"]);

      let showQuizauswahl = result["showQuizauswahl"];
      if (showQuizauswahl == true) {
        showQuizauswahl = "Ja";
      } else {
        showQuizauswahl = "Nein";
      }
      let userCanBe = result["userCanBe"];
      if (userCanBe == true) {
        userCanBe = "Ja";
      } else {
        userCanBe = "Nein";
      }
      let quizCanBeCreated = result["quizCanBeCreated"];
      if (quizCanBeCreated == true) {
        quizCanBeCreated = "Ja";
      } else {
        quizCanBeCreated = "Nein";
      }

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["klassenstufe"]}</td>
      <td id="showQuizauswahl" class="${showQuizauswahl}">${showQuizauswahl}</td>
      <td id="userCanBe" class="${userCanBe}">${userCanBe}</td>
      <td id="quizCanBeCreated" class="${quizCanBeCreated}">${quizCanBeCreated}</td>
          `;
      this.tableBody.append(tableRow);

      let checkBox = tableRow.querySelector(".select #select");
      if (!checkBox) return false;
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["klassenstufe"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["klassenstufe"]
          );
        }
        this.updateEditBtn();
      });

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) return false;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["klassenstufe"],
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
    choosen = Utils.sortItems(choosen, false); //Just sort it to better overview
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
          "klassenstufenverwaltung&operation=get&type=getFullInformation&klassenstufe=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
        )
      );
      if (!current) {
        return "no current";
      }

      console.log(current);

      if (current["klassenstufe"]) {
        let tableRow = document.createElement("tr");
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["klassenstufe"]);

        let showQuizauswahl = current["showQuizauswahl"];
        if (showQuizauswahl == true) {
          showQuizauswahl = "Ja";
        } else {
          showQuizauswahl = "Nein";
        }
        let userCanBe = current["userCanBe"];
        if (userCanBe == true) {
          userCanBe = "Ja";
        } else {
          userCanBe = "Nein";
        }
        let quizCanBeCreated = current["quizCanBeCreated"];
        if (quizCanBeCreated == true) {
          quizCanBeCreated = "Ja";
        } else {
          quizCanBeCreated = "Nein";
        }

        tableRow.innerHTML = `
        <td id="name"><span>${current["klassenstufe"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="showQuizauswahl" class="${showQuizauswahl}"><span>${showQuizauswahl}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="userCanBe" class="${userCanBe}"><span>${userCanBe}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="quizCanBeCreated" class="${quizCanBeCreated}"><span>${quizCanBeCreated}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        let changeShowQuizAuswahl = tableRow.querySelector(
          "#showQuizauswahl #change"
        );
        let changeUserCanBe = tableRow.querySelector("#userCanBe #change");
        let changeQuizCanBeCreated = tableRow.querySelector(
          "#quizCanBeCreated #change"
        );

        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für die Klassenstufe " + current["klassenstufe"] + "?",
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "klassenstufenverwaltung&operation=changeValue&type=changeNameFromKlassenstufe&klassenstufe=" +
                current["klassenstufe"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeShowQuizAuswahl.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für die Klassenstufe " + current["klassenstufe"] + "?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "klassenstufenverwaltung&operation=changeValue&type=changeShowQuizAuswahl&klassenstufe=" +
                current["klassenstufe"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeUserCanBe.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für die Klassenstufe " + current["klassenstufe"] + "?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "klassenstufenverwaltung&operation=changeValue&type=changeUserCanBe&klassenstufe=" +
                current["klassenstufe"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeQuizCanBeCreated.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für die Klassenstufe " + current["klassenstufe"] + "?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "klassenstufenverwaltung&operation=changeValue&type=changeQuizCanBeCreated&klassenstufe=" +
                current["klassenstufe"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `${current["klassenstufe"]} wirklich löschen?`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Klassenstufe ${current["klassenstufe"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "klassenstufenverwaltung&operation=deleteKlassenstufe&klassenstufe=" +
                current["klassenstufe"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);

          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            current["klassenstufe"]
          );
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class KlassenstufenBackupverwaltung {
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
    this.klassenstufeBeforeSelectContainer = null;
    this.quizzesAvailableSelectContainer = null;
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

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");

    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Klassenstufen löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Klassenstufen zu löschen? Alle verfügbaren Quizze werden dadurch in Backup-Klassenstufen verschoben (also nicht gelöscht). Es wird lediglich die Verknüpfung aufgehoben.`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupKlassenstufenverwaltung&operation=changeValue&type=deleteBackupKlassenstufe&klassenstufe=" +
              klassenstufe,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(
          this.choosenArray,
          klassenstufe
        );
      }

      this.edit(this.choosenArray);
      console.log(this.choosenArray);
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
    let klassenstufeBeforeSelectContainer =
      selectionFiltersContainer.querySelector("#klassenstufeBefore");
    let quizzesAvailableSelectContainer =
      selectionFiltersContainer.querySelector("#quizzesAvailable");
    if (
      !nameSelectContainer ||
      !klassenstufeBeforeSelectContainer ||
      !quizzesAvailableSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.klassenstufeBeforeSelectContainer = klassenstufeBeforeSelectContainer;
    this.quizzesAvailableSelectContainer = quizzesAvailableSelectContainer;

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
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.klassenstufeBeforeSelectContainer.classList.add("hidden");
    this.quizzesAvailableSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "klassenstufeBefore") {
      this.enableFilter(this.klassenstufeBeforeSelectContainer);
    } else if (value === "quizzesAvailable") {
      this.enableFilter(this.quizzesAvailableSelectContainer);
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
    } else if (filter === this.klassenstufeBeforeSelectContainer) {
      //klassenstufe before
      let textInput =
        this.klassenstufeBeforeSelectContainer.querySelector("#textInput");
      this.listenToChanges(textInput, "input");
      this.klassenstufeBeforeSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizzesAvailableSelectContainer) {
      //quizzes available
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizzesAvailableSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupKlassenstufenverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "klassenstufeBefore") {
      let input =
        this.klassenstufeBeforeSelectContainer.querySelector(
          "#textInput"
        ).value;
      console.log(input);
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupKlassenstufenverwaltung&operation=search&filter=filterByKlassenstufeBefore&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizzesAvailable") {
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupKlassenstufenverwaltung&operation=search&filter=quizzesAvailable&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupKlassenstufenverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "name"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["name"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["name"]}</td>
      <td id="klassenstufeBefore">${result["klassenstufeBefore"]}</td>
      <td id="deletedAt">${result["deletedAt"]}</td>
      <td id="quizzesAvailable">${result["quizzesAvailableNum"]}</td>
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
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["name"],
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
          "backupKlassenstufenverwaltung&operation=get&type=getFullInformation&klassenstufe=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
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
        <td id="name"><span>${current["name"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="klassenstufeBefore"><span>${current["klassenstufeBefore"]}</span></td>
        <td id="deletedAt"><span>${current["deletedAt"]}</span></td>
        <td id="quizzesAvailable">${current["quizzesAvailableIDs"]}</td>
        <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für die Backup-Klassenstufe <br><b>${current["name"]}</b>`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupKlassenstufenverwaltung&operation=changeValue&type=changeNameFromBackupKlassenstufe&klassenstufe=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"] === "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              userInput,
              false
            );
            this.edit(this.choosenArray);
          } else {
            this.edit(this.choosenArray);
          }
        });

        let recoverBtn = tableRow.querySelector("#recover #change");

        recoverBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für die Klassenstufe, die du wiederherstellen möchtest(${current["name"]})?`,
            false,
            "text"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupKlassenstufenverwaltung&operation=changeValue&type=recoverBackupKlassenstufe&klassenstufe=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["klassenstufenverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `<b>${current["name"]}</b> wirklich löschen?`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Klassenstufe ${current["name"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupKlassenstufenverwaltung&operation=changeValue&type=deleteBackupKlassenstufe&klassenstufe=" +
                current["name"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"]) {
            this.edit(this.choosenArray);

            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            console.log(this.choosenArray);
            this.edit(this.choosenArray);
          }
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class Faecherverwaltung {
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
    this.showQuizauswahlSelectContainer = null;
    this.quizCanBeCreatedSelectContainer = null;
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

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");
    let changeAllShowQuizauswahl = thead.querySelector(
      "#showQuizauswahl #changeAll"
    );
    let changeAllquizCanBeCreated = thead.querySelector(
      "#quizCanBeCreated #changeAll"
    );
    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    changeAllShowQuizauswahl.addEventListener("click", async () => {
      //Change All Show Quizauswahl
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["faecherverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=changeValue&type=changeShowQuizAuswahl&fach=" +
              klassenstufe +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    changeAllquizCanBeCreated.addEventListener("click", async () => {
      //Change All userCanBe
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["klassenstufenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const klassenstufe of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "klassenstufenverwaltung&operation=changeValue&type=changeQuizCanBeCreated&klassenstufe=" +
              klassenstufe +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["faecherverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Klassenstufen löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Klassenstufen zu löschen? Alle verfügbaren Quizze werden dadurch in Backup-Klassenstufen verschoben (also nicht gelöscht). Es wird lediglich die Verknüpfung aufgehoben.`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const fach of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=deleteFach&fach=" + fach,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(this.choosenArray, fach);
        console.log(this.choosenArray);
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
    let showQuizauswahlSelectContainer =
      selectionFiltersContainer.querySelector("#showQuizauswahl");
    let quizCanBeCreatedSelectContainer =
      selectionFiltersContainer.querySelector("#quizCanBeCreated");
    if (
      !nameSelectContainer ||
      !showQuizauswahlSelectContainer ||
      !quizCanBeCreatedSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.showQuizauswahlSelectContainer = showQuizauswahlSelectContainer;
    this.quizCanBeCreatedSelectContainer = quizCanBeCreatedSelectContainer;

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
          ["faecherverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Wie soll das Fach heißen?",
        false,
        "text"
      );
      if (userInput === false || Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "faecherverwaltung&operation=createFach&fach=" + userInput,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      this.search();
    });
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.showQuizauswahlSelectContainer.classList.add("hidden");
    this.quizCanBeCreatedSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "showQuizauswahl") {
      this.enableFilter(this.showQuizauswahlSelectContainer);
    } else if (value === "quizCanBeCreated") {
      this.enableFilter(this.quizCanBeCreatedSelectContainer);
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
    } else if (filter === this.showQuizauswahlSelectContainer) {
      //showQuizAuswahl
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.showQuizauswahlSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizCanBeCreatedSelectContainer) {
      //userCanBe
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizCanBeCreatedSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "showQuizauswahl") {
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=search&filter=filterByShowQuizAuswahl&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizCanBeCreated") {
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=search&filter=filterByQuizCanBeCreated&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "faecherverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "fach"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["fach"]);

      let showQuizauswahl = result["showQuizauswahl"];
      if (showQuizauswahl == true) {
        showQuizauswahl = "Ja";
      } else {
        showQuizauswahl = "Nein";
      }
      let quizCanBeCreated = result["quizCanBeCreated"];
      if (quizCanBeCreated == true) {
        quizCanBeCreated = "Ja";
      } else {
        quizCanBeCreated = "Nein";
      }

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["fach"]}</td>
      <td id="showQuizauswahl" class="${showQuizauswahl}">${showQuizauswahl}</td>
      <td id="quizCanBeCreated" class="${quizCanBeCreated}">${quizCanBeCreated}</td>
          `;
      this.tableBody.append(tableRow);

      let checkBox = tableRow.querySelector(".select #select");
      if (!checkBox) return false;
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["fach"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["fach"]
          );
        }
        this.updateEditBtn();
      });

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) return false;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["fach"],
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
    choosen = Utils.sortItems(choosen, false); //Just sort it to better overview
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
          "faecherverwaltung&operation=get&type=getFullInformation&fach=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
        )
      );
      if (!current) {
        return "no current";
      }

      console.log(current);

      if (current["name"]) {
        let tableRow = document.createElement("tr");
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["name"]);

        let showQuizauswahl = current["showQuizauswahl"];
        if (showQuizauswahl == true) {
          showQuizauswahl = "Ja";
        } else {
          showQuizauswahl = "Nein";
        }
        let quizCanBeCreated = current["quizCanBeCreated"];
        if (quizCanBeCreated == true) {
          quizCanBeCreated = "Ja";
        } else {
          quizCanBeCreated = "Nein";
        }

        tableRow.innerHTML = `
        <td id="name"><span>${current["name"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="showQuizauswahl" class="${showQuizauswahl}"><span>${showQuizauswahl}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="quizCanBeCreated" class="${quizCanBeCreated}"><span>${quizCanBeCreated}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        let changeShowQuizAuswahl = tableRow.querySelector(
          "#showQuizauswahl #change"
        );
        let changeQuizCanBeCreated = tableRow.querySelector(
          "#quizCanBeCreated #change"
        );

        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für das Fach " + current["name"] + "?",
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "faecherverwaltung&operation=changeValue&type=changeName&fach=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeShowQuizAuswahl.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Soll das Fach dem Nutzer angezeigt werden?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "faecherverwaltung&operation=changeValue&type=changeShowQuizAuswahl&fach=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeQuizCanBeCreated.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Sollen Quizze mit dem Fach erstellt werden können?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "faecherverwaltung&operation=changeValue&type=changeQuizCanBeCreated&fach=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `${current["name"]} wirklich löschen?`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Klassenstufe ${current["name"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "faecherverwaltung&operation=deleteFach&fach=" + current["name"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);

          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            current["name"]
          );
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class FaecherBackupverwaltung {
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
    this.fachBeforeSelectContainer = null;
    this.quizzesAvailableSelectContainer = null;
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

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");

    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["faecherverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Fächer löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Backup-Fächer zu löschen? (nur möglich, wenn keine Quizze mehr verknüpft sind)`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const fach of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupFaecherverwaltung&operation=changeValue&type=deleteBackupFach&fach=" +
              fach,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(this.choosenArray, fach);
      }

      this.edit(this.choosenArray);
      console.log(this.choosenArray);
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
    let fachBeforeSelectContainer =
      selectionFiltersContainer.querySelector("#fachBefore");
    let quizzesAvailableSelectContainer =
      selectionFiltersContainer.querySelector("#quizzesAvailable");
    if (
      !nameSelectContainer ||
      !fachBeforeSelectContainer ||
      !quizzesAvailableSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.fachBeforeSelectContainer = fachBeforeSelectContainer;
    this.quizzesAvailableSelectContainer = quizzesAvailableSelectContainer;

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
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.fachBeforeSelectContainer.classList.add("hidden");
    this.quizzesAvailableSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "klassenstufeBefore") {
      this.enableFilter(this.fachBeforeSelectContainer);
    } else if (value === "quizzesAvailable") {
      this.enableFilter(this.quizzesAvailableSelectContainer);
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
    } else if (filter === this.fachBeforeSelectContainer) {
      //fach before
      let textInput =
        this.fachBeforeSelectContainer.querySelector("#textInput");
      this.listenToChanges(textInput, "input");
      this.fachBeforeSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizzesAvailableSelectContainer) {
      //quizzes available
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizzesAvailableSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupFaecherverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "fachBefore") {
      let input =
        this.fachBeforeSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupFaecherverwaltung&operation=search&filter=filterByFachBefore&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizzesAvailable") {
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupFaecherverwaltung&operation=search&filter=quizzesAvailable&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupFaecherverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "name"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["name"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["name"]}</td>
      <td id="fachBefore">${result["fachBefore"]}</td>
      <td id="deletedAt">${result["deletedAt"]}</td>
      <td id="quizzesAvailable">${result["quizzesAvailableNum"]}</td>
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
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["name"],
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
          "backupFaecherverwaltung&operation=get&type=getFullInformation&fach=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
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
        <td id="name"><span>${current["name"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="fachBefore"><span>${current["fachBefore"]}</span></td>
        <td id="deletedAt"><span>${current["deletedAt"]}</span></td>
        <td id="quizzesAvailable">${current["quizzesAvailableIDs"]}</td>
        <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für das Backup-Fach <br><b>${current["name"]}</b>`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupFaecherverwaltung&operation=changeValue&type=changeNameFromBackupFach&fach=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"] === "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              userInput,
              false
            );
            this.edit(this.choosenArray);
          } else {
            this.edit(this.choosenArray);
          }
        });

        let recoverBtn = tableRow.querySelector("#recover #change");

        recoverBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für das Backup-Fach, das du wiederherstellen möchtest(${current["name"]})?`,
            false,
            "text"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupFaecherverwaltung&operation=changeValue&type=recoverBackupFach&fach=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `<b>${current["name"]}</b> wirklich löschen?`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Fach ${current["name"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupFaecherverwaltung&operation=changeValue&type=deleteBackupKlassenstufe&fach=" +
                current["name"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"]) {
            this.edit(this.choosenArray);

            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            console.log(this.choosenArray);
            this.edit(this.choosenArray);
          }
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class Themenverwaltung {
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
    this.showQuizauswahlSelectContainer = null;
    this.quizCanBeCreatedSelectContainer = null;
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

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");
    let changeAllShowQuizauswahl = thead.querySelector(
      "#showQuizauswahl #changeAll"
    );
    let changeAllquizCanBeCreated = thead.querySelector(
      "#quizCanBeCreated #changeAll"
    );
    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    changeAllShowQuizauswahl.addEventListener("click", async () => {
      //Change All Show Quizauswahl
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["themenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const thema of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=changeValue&type=changeShowQuizAuswahl&thema=" +
              thema +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    changeAllquizCanBeCreated.addEventListener("click", async () => {
      //Change All userCanBe
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["themenverwaltungChangeValues"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Welchen Wert für alle?",
        false,
        "yes/no"
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const thema of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=changeValue&type=changeQuizCanBeCreated&thema=" +
              thema +
              "&input=" +
              userInput,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false,
            true
          )
        );
      }
      this.edit(this.choosenArray);
    });

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["themenverwaltungADDandRemove"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Themen löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Themen zu löschen? Alle verfügbaren Quizze werden dadurch in Backup-Themen verschoben (also nicht gelöscht). Es wird lediglich die Verknüpfung aufgehoben.`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const thema of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=deleteThema&thema=" + thema,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(this.choosenArray, thema);
        console.log(this.choosenArray);
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
    let showQuizauswahlSelectContainer =
      selectionFiltersContainer.querySelector("#showQuizauswahl");
    let quizCanBeCreatedSelectContainer =
      selectionFiltersContainer.querySelector("#quizCanBeCreated");
    if (
      !nameSelectContainer ||
      !showQuizauswahlSelectContainer ||
      !quizCanBeCreatedSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.showQuizauswahlSelectContainer = showQuizauswahlSelectContainer;
    this.quizCanBeCreatedSelectContainer = quizCanBeCreatedSelectContainer;

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
          ["themenverwaltungADDandRemove"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.getUserInput(
        "Eingabefeld",
        "Wie soll das neue Thema heißen?",
        false,
        "text"
      );
      if (userInput === false || Utils.isEmptyInput(userInput, true)) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "themenverwaltung&operation=createThema&thema=" + userInput,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
      this.search();
    });
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.showQuizauswahlSelectContainer.classList.add("hidden");
    this.quizCanBeCreatedSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "showQuizauswahl") {
      this.enableFilter(this.showQuizauswahlSelectContainer);
    } else if (value === "quizCanBeCreated") {
      this.enableFilter(this.quizCanBeCreatedSelectContainer);
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
    } else if (filter === this.showQuizauswahlSelectContainer) {
      //showQuizAuswahl
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.showQuizauswahlSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizCanBeCreatedSelectContainer) {
      //quiz can be created
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizCanBeCreatedSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "showQuizauswahl") {
      let select =
        this.showQuizauswahlSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=search&filter=filterByShowQuizAuswahl&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizCanBeCreated") {
      let select =
        this.quizCanBeCreatedSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=search&filter=filterByQuizCanBeCreated&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "thema"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["thema"]);

      let showQuizauswahl = result["showQuizauswahl"];
      if (showQuizauswahl == true) {
        showQuizauswahl = "Ja";
      } else {
        showQuizauswahl = "Nein";
      }
      let quizCanBeCreated = result["quizCanBeCreated"];
      if (quizCanBeCreated == true) {
        quizCanBeCreated = "Ja";
      } else {
        quizCanBeCreated = "Nein";
      }

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["thema"]}</td>
      <td id="showQuizauswahl" class="${showQuizauswahl}">${showQuizauswahl}</td>
      <td id="quizCanBeCreated" class="${quizCanBeCreated}">${quizCanBeCreated}</td>
          `;
      this.tableBody.append(tableRow);

      let checkBox = tableRow.querySelector(".select #select");
      if (!checkBox) return false;
      checkBox.addEventListener("change", (event) => {
        if (event.target.checked) {
          this.choosenArray = Utils.addToArray(
            this.choosenArray,
            result["thema"],
            false
          );
        } else {
          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            result["thema"]
          );
        }
        this.updateEditBtn();
      });

      let chooseThis = tableRow.querySelector(".select #chooseOnly");
      if (!chooseThis) return false;

      chooseThis.addEventListener("click", (event) => {
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["thema"],
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
    choosen = Utils.sortItems(choosen, false); //Just sort it to better overview
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
          "themenverwaltung&operation=get&type=getFullInformation&thema=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
        )
      );
      if (!current) {
        return "no current";
      }

      console.log(current);

      if (current["name"]) {
        let tableRow = document.createElement("tr");
        tableRow.classList.add("result");
        tableRow.setAttribute("data-value", current["name"]);

        let showQuizauswahl = current["showQuizauswahl"];
        if (showQuizauswahl == true) {
          showQuizauswahl = "Ja";
        } else {
          showQuizauswahl = "Nein";
        }
        let quizCanBeCreated = current["quizCanBeCreated"];
        if (quizCanBeCreated == true) {
          quizCanBeCreated = "Ja";
        } else {
          quizCanBeCreated = "Nein";
        }

        tableRow.innerHTML = `
        <td id="name"><span>${current["name"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="showQuizauswahl" class="${showQuizauswahl}"><span>${showQuizauswahl}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="quizCanBeCreated" class="${quizCanBeCreated}"><span>${quizCanBeCreated}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        let changeShowQuizAuswahl = tableRow.querySelector(
          "#showQuizauswahl #change"
        );
        let changeQuizCanBeCreated = tableRow.querySelector(
          "#quizCanBeCreated #change"
        );

        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Neuer Name für das Thema " + current["name"] + "?",
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "themenverwaltung&operation=changeValue&type=changeName&thema=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeShowQuizAuswahl.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungChangeValues"]
            ))
          ) {
            Utils.permissionDENIED();
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Soll das Thema dem Nutzer angezeigt werden?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "themenverwaltung&operation=changeValue&type=changeShowQuizAuswahl&thema=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        changeQuizCanBeCreated.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            "Sollen Quizze mit dem Thema erstellt werden können?",
            false,
            "yes/no"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "themenverwaltung&operation=changeValue&type=changeQuizCanBeCreated&thema=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `Thema ${current["name"]} wirklich löschen? (Quizze, die mit dem Thema verknüpft sind werden in ein Backup-Thema verschoben.)`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Klassenstufe ${current["name"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "themenverwaltung&operation=deleteThema&thema=" + current["name"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);

          this.choosenArray = Utils.removeFromArray(
            this.choosenArray,
            current["name"]
          );
          console.log(this.choosenArray);
          this.edit(this.choosenArray);
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

class ThemenBackupverwaltung {
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
    this.themaBeforeSelectContainer = null;
    this.quizzesAvailableSelectContainer = null;
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

    this.searchReloadBtn = null;
    this.editReloadBtn = null;
  }

  prepareEdit() {
    if (!this.editContainer) return "no edit container";
    this.editContainer.classList.add("hidden");
    this.clear(this.editTableBody);

    //Change All
    let thead = this.editTable.querySelector("thead");

    let removeAllBtn = thead.querySelector("#remove #changeAll");

    let reloadBtn = this.editContainer.querySelector("#reload");
    if (!reloadBtn) return "no reload button";
    reloadBtn.addEventListener("click", () => {
      this.edit(this.choosenArray);
    });
    this.editReloadBtn = reloadBtn;

    removeAllBtn.addEventListener("click", async () => {
      //Change All authenticated
      if (
        !(await Utils.userHasPermissions(
          "../../includes/userSystem/checkPermissionsFromFrontend.php",
          ["themenverwaltungADDandREMOVE"]
        ))
      ) {
        return false;
      }
      let userInput = await Utils.askUser(
        "Eingabefeld",
        `Wirklich <b>alle</b> Backup-Themen löschen?`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      userInput = await Utils.askUser(
        "Eingabefeld",
        `Bist du dir wirklich sicher, alle Backup-Themen zu löschen? (nur möglich, wenn keine Quizze mehr verknüpft sind)`,
        false
      );
      if (userInput === false) {
        Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
        return false;
      }
      for (const thema of this.choosenArray) {
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupThemenverwaltung&operation=changeValue&type=deleteBackupFach&thema=" +
              thema,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        this.choosenArray = Utils.removeFromArray(this.choosenArray, thema);
      }

      this.edit(this.choosenArray);
      console.log(this.choosenArray);
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
    let themaBeforeSelectContainer =
      selectionFiltersContainer.querySelector("#themaBefore");
    let quizzesAvailableSelectContainer =
      selectionFiltersContainer.querySelector("#quizzesAvailable");
    if (
      !nameSelectContainer ||
      !themaBeforeSelectContainer ||
      !quizzesAvailableSelectContainer
    )
      return "Error in initializing Filters";
    this.nameSelectContainer = nameSelectContainer;
    this.themaBeforeSelectContainer = themaBeforeSelectContainer;
    this.quizzesAvailableSelectContainer = quizzesAvailableSelectContainer;

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
  }

  setFilterMode(value) {
    if (!value) return false;
    this.filterType = value;
    //Hide All and clear
    this.nameSelectContainer.classList.add("hidden");
    this.themaBeforeSelectContainer.classList.add("hidden");
    this.quizzesAvailableSelectContainer.classList.add("hidden");

    if (value === "name") {
      this.enableFilter(this.nameSelectContainer);
    } else if (value === "klassenstufeBefore") {
      this.enableFilter(this.themaBeforeSelectContainer);
    } else if (value === "quizzesAvailable") {
      this.enableFilter(this.quizzesAvailableSelectContainer);
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
    } else if (filter === this.themaBeforeSelectContainer) {
      //thema before
      let textInput =
        this.themaBeforeSelectContainer.querySelector("#textInput");
      this.listenToChanges(textInput, "input");
      this.themaBeforeSelectContainer.classList.remove("hidden");
    } else if (filter === this.quizzesAvailableSelectContainer) {
      //quizzes available
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      this.listenToChanges(select, "change");
      this.quizzesAvailableSelectContainer.classList.remove("hidden");
    } else {
      return false;
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
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupThemenverwaltung&operation=search&filter=filterByName&name=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "themaBefore") {
      let input =
        this.themaBeforeSelectContainer.querySelector("#textInput").value;
      console.log(input);
      if (Utils.isEmptyInput(input)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupThemenverwaltung&operation=search&filter=filterByThemaBefore&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "quizzesAvailable") {
      let select =
        this.quizzesAvailableSelectContainer.querySelector("#selectInput");
      let input = select[select.selectedIndex].getAttribute("data-value");
      if (Utils.isEmptyInput(input, true)) {
        this.searchBtn.classList.remove("loading");
        return false;
      }
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupThemenverwaltung&operation=search&filter=quizzesAvailable&input=" +
              input +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        )
      );
    } else if (this.filterType === "all") {
      this.showResults(
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "backupThemenverwaltung&operation=search&filter=all&input=" +
              "&limit=" +
              this.limiter.value,
            "./includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
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

    results = Utils.sortItems(results, "name"); //Just sort it to better overview

    for (const result of results) {
      //console.log(user);
      let tableRow = document.createElement("tr");
      tableRow.classList.add("result");
      tableRow.setAttribute("data-value", result["name"]);

      tableRow.innerHTML = `
      <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img src="../../images/icons/stift.svg" alt="Auswahl"></button></td>
      <td id="name">${result["name"]}</td>
      <td id="themaBefore">${result["themaBefore"]}</td>
      <td id="deletedAt">${result["deletedAt"]}</td>
      <td id="quizzesAvailable">${result["quizzesAvailableNum"]}</td>
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
        this.choosenArray = Utils.addToArray(
          this.choosenArray,
          result["name"],
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
          "backupThemenverwaltung&operation=get&type=getFullInformation&thema=" +
            currentRaw,
          "./includes/organisation.inc.php",
          "application/x-www-form-urlencoded",
          true,
          false,
          false
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
        <td id="name"><span>${current["name"]}</span><button class="changeBtn" id="change"><img src="../../images/icons/stift.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="themaBefore"><span>${current["themaBefore"]}</span></td>
        <td id="deletedAt"><span>${current["deletedAt"]}</span></td>
        <td id="quizzesAvailable">${current["quizzesAvailableIDs"]}</td>
        <td id="recover"><button class="changeBtn" id="change"><img src="../../images/icons/recover.svg" alt="ändern" class="changeIcon"></button></td>
        <td id="remove"><button class="delete-btn" id="delete"><img src="../../images/icons/delete.svg" alt="Löschen"></button></td>
  `;
        this.editTableBody.appendChild(tableRow);

        let changeNameBtn = tableRow.querySelector("#name #change");
        changeNameBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für das Backup-Thema <br><b>${current["name"]}</b>`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupThemenverwaltung&operation=changeValue&type=changeName&thema=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"] === "success") {
            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            this.choosenArray = Utils.addToArray(
              this.choosenArray,
              userInput,
              false
            );
            this.edit(this.choosenArray);
          } else {
            this.edit(this.choosenArray);
          }
        });

        let recoverBtn = tableRow.querySelector("#recover #change");

        recoverBtn.addEventListener("click", async () => {
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["themenverwaltungChangeValues"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.getUserInput(
            "Eingabefeld",
            `Neuer Name für das Backup-Thema, das du wiederherstellen möchtest(${current["name"]})?`,
            false,
            "text"
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupThemenverwaltung&operation=changeValue&type=recoverBackupThema&thema=" +
                current["name"] +
                "&input=" +
                userInput,
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          this.edit(this.choosenArray);
        });

        let removeBtn = tableRow.querySelector("#remove #delete");
        removeBtn.addEventListener("click", async () => {
          //Ask User
          if (
            !(await Utils.userHasPermissions(
              "../../includes/userSystem/checkPermissionsFromFrontend.php",
              ["faecherverwaltungADDandREMOVE"]
            ))
          ) {
            return false;
          }
          let userInput = await Utils.askUser(
            "Eingabefeld",
            `<b>${current["name"]}</b> wirklich löschen?`,
            false
          );
          if (userInput === false) {
            Utils.alertUser("Nachricht", "Keine Aktion unternommen", false);
            return false;
          }
          if (!userInput) {
            await Utils.alertUser(
              "Nachricht",
              `Thema ${current["name"]}wurde <b>nicht</b> gelöscht.`
            );
            return false;
          }
          let res = await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "backupThemenverwaltung&operation=changeValue&type=deleteBackupThema&thema=" +
                current["name"],
              "./includes/organisation.inc.php",
              "application/x-www-form-urlencoded",
              true,
              true,
              false,
              true
            )
          );
          if (res["status"]) {
            this.edit(this.choosenArray);

            this.choosenArray = Utils.removeFromArray(
              this.choosenArray,
              current["name"]
            );
            console.log(this.choosenArray);
            this.edit(this.choosenArray);
          }
        });
        this.editContainer.classList.remove("hidden");
      }
    }
    this.editReloadBtn.disabled = false;
  }
}

let organisationContainer = document.querySelector("#organisationContainer");
if (!organisationContainer) {
  console.log("no organisationContainer");
} else {
  //Hierachie für Übersicht
  let overwiewContainer =
    organisationContainer.querySelector("#overwiewContainer");

  let listContainer = overwiewContainer.querySelector("#listContainer");
  let overwiew = new Overview(listContainer);
  overwiew.getKlassenstufen();
  let reloadOverviewBtn = overwiewContainer.querySelector("#reloadOverview");
  console.log(reloadOverviewBtn.onclick);
  reloadOverviewBtn.addEventListener("click", () => {
    overwiew.getKlassenstufen();
  })
  //Klassenstufenverwaltung
  let klassenstufenverwaltungContainer = organisationContainer.querySelector(
    "#klassenstufenVerwaltung"
  );
  let klassenstufenverwaltung = new Klassenstufenverwaltung(
    klassenstufenverwaltungContainer
  );
  console.log(klassenstufenverwaltung.prepareSearch());
  console.log(klassenstufenverwaltung.prepareEdit());
  klassenstufenverwaltung.setFilterMode("all");
  klassenstufenverwaltung.search();

  let klassenstufenBackupverwaltungContainer =
    organisationContainer.querySelector("#klassenstufenBackupVerwaltung");
  let klassenstufenBackupverwaltung = new KlassenstufenBackupverwaltung(
    klassenstufenBackupverwaltungContainer
  );
  console.log(klassenstufenBackupverwaltung.prepareSearch());
  console.log(klassenstufenBackupverwaltung.prepareEdit());
  klassenstufenBackupverwaltung.setFilterMode("all");
  klassenstufenBackupverwaltung.search();

  //Faecherverwaltung
  let faecherverwaltungContainer =
    organisationContainer.querySelector("#faecherVerwaltung");
  let faecherverwaltung = new Faecherverwaltung(faecherverwaltungContainer);
  console.log(faecherverwaltung.prepareSearch());
  console.log(faecherverwaltung.prepareEdit());
  faecherverwaltung.setFilterMode("all");
  faecherverwaltung.search();

  let faecherBackupverwaltungContainer = organisationContainer.querySelector(
    "#faecherBackupVerwaltung"
  );
  let faecherBackupverwaltung = new FaecherBackupverwaltung(
    faecherBackupverwaltungContainer
  );
  console.log(faecherBackupverwaltung.prepareSearch());
  console.log(faecherBackupverwaltung.prepareEdit());
  faecherBackupverwaltung.setFilterMode("all");
  faecherBackupverwaltung.search();

  //Themenverwatlung
  let themenverwaltungContainer =
    organisationContainer.querySelector("#themenVerwaltung");
  let themenverwaltung = new Themenverwaltung(themenverwaltungContainer);
  console.log(themenverwaltung.prepareSearch());
  console.log(themenverwaltung.prepareEdit());
  themenverwaltung.setFilterMode("all");
  themenverwaltung.search();

  let themenBackupverwaltungContainer = organisationContainer.querySelector(
    "#themenBackupVerwaltung"
  );
  let themenBackupverwaltung = new ThemenBackupverwaltung(
    themenBackupverwaltungContainer
  );
  console.log(themenBackupverwaltung.prepareSearch());
  console.log(themenBackupverwaltung.prepareEdit());
  themenBackupverwaltung.setFilterMode("all");
  themenBackupverwaltung.search();
}
