//Setzt die Klassenstufenauswahl
import * as Utils from "./utils.js";

class KLlassenstufenAuswahlbox {
  constructor(outerElement) {
    this.outerElement = outerElement;
    this.availableGrades = null;
    this.usersGrade = null;
  }

  getAvailableGrades() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("getKlassenstufenUsersCanTake");
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          if (Utils.IsJsonString(xhr.response)) {
            var parsed = JSON.parse(xhr.response);
            if (parsed.length > 0) {
              this.availableGrades = Utils.sortItems(parsed, false);
            }
          }
          resolve();
        }
      };
    });
  }

  getUsersGrade() {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("getSelectedKlassenstufeFromUser");
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          console.log(xhr.response);
          this.usersGrade = xhr.response;
          resolve();
        }
      };
    });
  }

  sendGradeToServer(selectedGrade) {
    console.log("Send grade to server:", selectedGrade);
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "includes/changeGrade.inc.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("setKlassenstufeToUserInDatabase&grade=" + selectedGrade);
      //Wenn Antwort
      xhr.onload = () => {
        if (xhr.status == 200) {
          //Check if valid response
          console.log(xhr.response);
        }
        resolve();
      };
    });
  }

  setChoosebox() {
    return new Promise((resolve, reject) => {
      let selectElement = document.createElement("select");
      selectElement.classList.add("selectGrade");
      this.outerElement.appendChild(selectElement);

      selectElement.addEventListener("change", () => {
        this.sendGradeToServer(
          selectElement[selectElement.selectedIndex].getAttribute("data-value")
        );
      });

      //Create option for "keine Angabe"
      let notSpecified = document.createElement("option");
      notSpecified.innerHTML = "keine Angabe";
      notSpecified.setAttribute("data-value", "");

      selectElement.appendChild(notSpecified);
      //Create Option Element for users Selected
      if (this.usersGrade) {
        let optionElement = document.createElement("option");
        optionElement.setAttribute("selected", "selected");
        optionElement.setAttribute("data-value", this.usersGrade);

        selectElement.appendChild(optionElement);
        optionElement.innerText = this.usersGrade;
      }

      //Set Option Elements from Available
      if (this.availableGrades == null) return;
      this.availableGrades.forEach((element) => {
        if (element == this.usersGrade) {
          console.log(
            "Der Benutzer hat die Klassenstufe",
            this.usersGrade,
            "ausgewählt. Deshalb muss es nicht zwei Mal auftauchen."
          );
        } else {
          let optionElement2 = document.createElement("option");
          optionElement2.setAttribute("data-value", element);
          selectElement.appendChild(optionElement2);
          optionElement2.innerText = element;
        }
      });
    });
  }
}

const usersGradeBox = document.querySelector(".usersGrade");
console.log(usersGradeBox);

let klassenstufenAuswahlbox = new KLlassenstufenAuswahlbox(usersGradeBox);

klassenstufenAuswahlbox.getUsersGrade().then((res) => {
  klassenstufenAuswahlbox.getAvailableGrades().then((res) => {
    klassenstufenAuswahlbox.setChoosebox();
  });
});

//Toggle content "userdata" <-> "scores"

let accountContainer = document.querySelector(".accountContainer");

let accountDetailsContainer = accountContainer.querySelector(
  ".content #accountDetails"
);
let scoresContainer = accountContainer.querySelector(".content #scores");

let toggleContent = (content) => {
  accountDetailsContainer.classList.add("hidden");
  scoresContainer.classList.add("hidden");

  if (content === "userdata") {
    accountDetailsContainer.classList.remove("hidden");
  } else if (content === "scores") {
    scoresContainer.classList.remove("hidden");
  }
};

let toggleBtns = accountContainer.querySelectorAll(".nav [data-toggle]");
for (const currentBtn of toggleBtns) {
  currentBtn.addEventListener("click", () => {
    let action = currentBtn.getAttribute("data-toggle");
    toggleContent(action);
  });
}
scoresContainer.classList.add("hidden");

let urlParams = Utils.getUrlParams();
if (urlParams.has("content")) {
  let content = urlParams.get("content");
  toggleContent(content);
}

class ShowScores {
  constructor(container) {
    this.container = container;
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
            "/includes/account.inc.php",
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
            "/includes/account.inc.php",
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
          "/includes/account.inc.php"
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
                this.limiter.value,
              "/includes/account.inc.php",
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
      let endDateInput = this.dateSelectContainer.querySelector("#endDate");

      this.showResults(
        Utils.makeJSON(
          await Utils.makeJSON(
            await Utils.sendXhrREQUEST(
              "POST",
              "scoreverwaltung&operation=search&type=date&startDate=" +
                new Date(startDateInput.value).getTime() + "&endDate=" + new Date(endDateInput.value).getTime() + 
                "&limitResults=" +
                this.limiter.value,
              "/includes/account.inc.php",
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
              "scoreverwaltung&operation=search&type=all&limitResults=" +
                this.limiter.value,
              "/includes/account.inc.php",
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
                JSON.stringify(klassenstufen) +
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
      <td id="information">Weitere Information</td>
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
        <li><a href="quiz.php?quizId=${result["quizID"]}">Zum Quiz</a></li>
      </ul>
      `;

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

let showScoresContainer = scoresContainer.querySelector("#scoreVerwaltung");
let showScores = new ShowScores(showScoresContainer);
console.log(await showScores.prepareSearch());
console.log(showScores.setFilterMode("all"));
showScores.limiter.value = 20;
showScores.search();
