import * as Utils from "/includes/utils.js";
import { pickMedia } from "/includes/chooseMedia.inc.js";

export async function editQuizdata(uniqueID) {
  return new Promise(async (resolve, reject) => {
    //Create Modal container if doesnt exist
    let modalContainer = document.querySelector("#modalContainer");

    if (modalContainer == null) {
      modalContainer = document.createElement("div");
      modalContainer.setAttribute("id", "modalContainer");
      document.body.appendChild(modalContainer);
    }
    if (document.querySelector("#modalContainer") == null) {
      alert("no modal cóntainer found");
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
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Quizdaten bearbeiten</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
        </div>
        <div class="modal-body">
          <div class="editQuizdata">
          <h2>Globale Einstellungen</h2>
           <div class="general">
           
           </div>
           <div class="editCards">
            <div class="options">
              <div id="toolbar">
                <button type="button" class="btn btn-success" id="createCard" data-action="createCard">Karte hinzufügen</button>
                <button type="button" class="btn btn-secondary" id="editChoosenCards" data-action="editChoosenCards" disabled>Ausgewählte Karten bearbeiten</button>
              </div>
              <div class="dropdown" id="furtherOptions">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="optionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    Weitere Optionen
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="optionsDropdown">
                    <li><a class="dropdown-item" data-action="createCard">Karte hinzufügen</a></li>
                    <li><a class="dropdown-item" data-action="recover">Änderungen rückgänging machen</a></li>
                    <li><a class="dropdown-item" data-action="removeAll">Alle Karten entfernen</a></li>
                    <li><a class="dropdown-item" data-action="copyQuizdata">Daten in die Zwischenablage kopieren (exportieren)</a></li>
                    <li><a class="dropdown-item" data-action="insertQuizdata">Daten einfügen (importieren)</a></li>
                  </ul>
              </div>
            </div>
            <h3>Karten bearbeiten</h3>
            <div class="cardList">
            
            </div>
           </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="ok">OK</button>
        </div>
      </div>
    </div>
    </div>
     `;

    modalOuter.innerHTML = modalHTML;
    let modal = modalOuter.querySelector(".modal");

    class EditQuizdata {
      constructor(container, uniqueID) {
        this.container = container;
        this.generalContainer = null;
        this.editCardsContainer = null;

        this.uniqueID = uniqueID;

        //Data
        this.quizJSON = {
          options: {
            shuffleCards: false,
            limitQuestions: false,
            showResultDirectly: true,
            showTimePassed: false,
            timeLimit: false,
          },
          quizCards: [],
        };
        this.originalData = false;

        this.choosenCardsArray = new Array();

        this.totalPoints = () => {
          let allCards = this.quizJSON["quizCards"] ?? new Array();
          let points = 0;
          for (const currentCard of allCards) {
            points += Number(currentCard["points"]) ?? 0;
          }
          return points;
        };
      }

      async prepare() {
        if (!this.container) {
          return "No container";
        }

        this.generalContainer = container.querySelector(".general");
        if (!this.generalContainer) {
          return "No generalContainer";
        }
        this.editCardsContainer = container.querySelector(".editCards");
        if (!this.generalContainer) {
          return "No editCardsContainer";
        }

        //Download quizdata
        let currentQuizdata = await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "quizverwaltung&operation=other&type=getQuizdata&uniqueID=" +
              this.uniqueID,
            "./includes/quizverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );

        if (currentQuizdata) {
          this.quizJSON = Utils.makeJSON(JSON.stringify(currentQuizdata));
          this.originalData = Utils.makeJSON(JSON.stringify(currentQuizdata));
          console.log("Original Data:", this.originalData);
        }

        console.log("Quizdata:", this.quizJSON);
        return "ready";
      }

      async refresh(refreshCards = true) {
        //Set general
        this.generalContainer.innerHTML = `
        <button type="button" class="btn btn-info" id="refreshBtn">Aktualisieren</button>
        <button type="button" class="btn btn-info" id="confirmBtn">Hochladen / Bestätigen</button>
        <div id="shuffleCards">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkBox">
                <label class="form-check-label" for="checkBox">
                    Karten durchmischen
                </label>
            </div>
        </div>
        <div id="limitCards">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkBox">
                <label class="form-check-label" for="checkBox">
                    Karten limitieren
                </label>
            </div>
            <div class="inner">
                <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
            </div>
        </div>
        <div id="showTimePassed">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkBox">
                <label class="form-check-label" for="checkBox">
                  Zeitzähler anzeigen
                </label>
            </div>
        </div>
        <div id="timeLimit">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="checkBox">
                <label class="form-check-label" for="checkBox">
                    Zeitlimit aktivieren
                </label>
            </div>
            <div class="inner">
                <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
                <label class="form-check-label" for="numberInput">Angabe in Sekunden</label>
            </div>
        </div>
        <div id="information">
          <div id="points"><b>Gesamtpunktzahl:</b> <span class="content">${this.totalPoints()}</span></div>
          <div id="amountOfCards"><b>Karten:</b> <span class="content">${
            this.quizJSON?.["quizCards"]?.length ?? 0
          }</span></div>
        </div>
        `;

        //Fill information
        let information = this.generalContainer.querySelector("#information");
        // let pointsTextBox = information.querySelector("#points .content");
        // let amountTextBox = information.querySelector("#amountOfCards .content");

        let options = this.quizJSON["options"];
        if (!options) options = {};

        let refreshBtn = this.generalContainer.querySelector("#refreshBtn");
        refreshBtn = Utils.removeAllEventlisteners(refreshBtn);
        refreshBtn.addEventListener("click", () => {
          this.refresh();
        });
        let confirmBtn = this.generalContainer.querySelector("#confirmBtn");
        confirmBtn = Utils.removeAllEventlisteners(confirmBtn);
        confirmBtn.addEventListener("click", () => {
          this.submitData();
        });

        //Shuffle Cards
        let shuffleCardsContainer =
          this.generalContainer.querySelector("#shuffleCards");
        let shuffleCardsCheckbox =
          shuffleCardsContainer.querySelector("#checkBox");

        //Limit Cards
        let limitCardsContainer =
          this.generalContainer.querySelector("#limitCards");
        let limitCardsCheckbox = limitCardsContainer.querySelector("#checkBox");
        limitCardsCheckbox = Utils.removeAllEventlisteners(limitCardsCheckbox);
        let limitCardsNumberInput = limitCardsContainer.querySelector(
          ".inner #numberInput"
        );
        //showTimePassed
        let showTimePassedCheckbox = this.generalContainer.querySelector(
          "#showTimePassed #checkBox"
        );
        showTimePassedCheckbox.checked = options["showTimePassed"];
        showTimePassedCheckbox.addEventListener("click", () => {
          options["showTimePassed"] = showTimePassedCheckbox.checked;
          this.logData();
        });
        //Timelimit
        let timeLimitContainer =
          this.generalContainer.querySelector("#timeLimit");
        let timeLimitCheckbox = timeLimitContainer.querySelector("#checkBox");

        let timeLimitNumberInput = timeLimitContainer.querySelector(
          ".inner #numberInput"
        );

        let toggleShuffleCards = (status = false) => {
          //set status in JSON
          options["shuffleCards"] = status;

          if (status) {
            //Activate LimitCards
            toggleLimitCards(true);
          } else {
            //Deactivate LimitCards
            toggleLimitCards(false);
          }
        };

        let toggleLimitCards = (status = false) => {
          if (status) {
            //Activate
            limitCardsCheckbox.disabled = false;
            limitCardsNumberInput = Utils.removeAllEventlisteners(
              limitCardsNumberInput
            );
            if (limitCardsCheckbox.checked) {
              if (options["limitQuestions"]) {
                limitCardsNumberInput.disabled = false;
                limitCardsNumberInput.addEventListener("input", () => {
                  let value = Number(limitCardsNumberInput.value);
                  if (value && value > 0) {
                    options["shuffleCards"] = value;
                  } else {
                    options["shuffleCards"] = false;
                  }
                });
              }
            }
          } else {
            //Deactivate
            limitCardsCheckbox.disabled = true;
            limitCardsNumberInput = Utils.removeAllEventlisteners(
              limitCardsNumberInput
            );
            limitCardsNumberInput.disabled = true;
          }
        };

        //Set Values from current data array
        //shuffle cards
        shuffleCardsCheckbox.checked = Boolean(options["shuffleCards"]);
        if (Boolean(options["shuffleCards"])) {
          toggleLimitCards(true);
        } else {
          toggleLimitCards(false);
        }
        shuffleCardsCheckbox.addEventListener("input", () => {
          let status = Boolean(shuffleCardsCheckbox.checked);
          //set status in JSON
          options["shuffleCards"] = status;
          toggleShuffleCards(status);
          this.logData();
        });
        //Limit cards
        limitCardsCheckbox.checked = Boolean(options["limitQuestions"]);
        if (Boolean(options["limitQuestions"])) {
          limitCardsNumberInput.value = Number(options["limitQuestions"]);
          limitCardsNumberInput = Utils.removeAllEventlisteners(
            limitCardsNumberInput
          );
          if (options["shuffleCards"]) {
            limitCardsNumberInput.disabled = false;
            limitCardsNumberInput.addEventListener("input", () => {
              let value = Number(limitCardsNumberInput.value);
              if (value && value > 0) {
                options["limitQuestions"] = value;
              } else {
                options["limitQuestions"] = false;
              }
            });
          }
        } else {
          options["limitQuestions"] = false;
          //Deactivate
          limitCardsNumberInput.disabled = true;
          limitCardsNumberInput = Utils.removeAllEventlisteners(
            limitCardsNumberInput
          );
        }
        limitCardsCheckbox.addEventListener("input", () => {
          let status = Boolean(limitCardsCheckbox.checked);
          //set status in JSON
          options["limitQuestions"] = status;
          if (!status) {
            //Deactivate
            limitCardsNumberInput.disabled = true;
            limitCardsNumberInput = Utils.removeAllEventlisteners(
              limitCardsNumberInput
            );
          } else {
            //Activate
            limitCardsNumberInput = Utils.removeAllEventlisteners(
              limitCardsNumberInput
            );
            limitCardsNumberInput.disabled = false;
            limitCardsNumberInput.addEventListener("input", () => {
              let value = Number(limitCardsNumberInput.value);
              if (value && value > 0) {
                options["limitQuestions"] = value;
              } else {
                options["limitQuestions"] = false;
              }
              this.logData();
            });
          }
          this.logData();
        });
        //timeLimit
        timeLimitCheckbox.checked = Boolean(options["timeLimit"]);
        if (Boolean(options["timeLimit"])) {
          timeLimitNumberInput.value = Number(options["timeLimit"]);
        } else {
          options["timeLimit"] = false;
        }
        timeLimitCheckbox.addEventListener("input", () => {
          let status = Boolean(timeLimitCheckbox.checked);
          //set status in JSON
          options["timeLimit"] = status;
          if (!status) {
            //Deactivate
            timeLimitNumberInput.disabled = true;
            timeLimitNumberInput =
              Utils.removeAllEventlisteners(timeLimitNumberInput);
          } else {
            //Activate
            timeLimitNumberInput =
              Utils.removeAllEventlisteners(timeLimitNumberInput);
            timeLimitNumberInput.disabled = false;
            timeLimitNumberInput.addEventListener("input", () => {
              let value = Number(timeLimitNumberInput.value);
              if (value && value > 0) {
                options["timeLimit"] = value;
              } else {
                options["timeLimit"] = false;
              }
              this.logData();
            });
          }
          this.logData();
        });
        if (Boolean(options["timeLimit"])) {
          //Activate
          timeLimitNumberInput =
            Utils.removeAllEventlisteners(timeLimitNumberInput);
          timeLimitNumberInput.disabled = false;
          timeLimitNumberInput.addEventListener("input", () => {
            let value = Number(timeLimitNumberInput.value);
            if (value && value > 0) {
              options["timeLimit"] = value;
            } else {
              options["timeLimit"] = false;
            }
          });
        } else {
          //Deactivate
          timeLimitNumberInput.disabled = true;
          timeLimitNumberInput =
            Utils.removeAllEventlisteners(timeLimitNumberInput);
        }
        //Set Quiz cards

        //Quiz Cards options
        let toolbar =
          this.editCardsContainer.querySelector(".options #toolbar");
        for (let currentBtn of toolbar.querySelectorAll("button")) {
          currentBtn = Utils.removeAllEventlisteners(currentBtn);
          currentBtn.addEventListener("click", () => {
            let action = currentBtn.getAttribute("data-action");

            if (action === "createCard") {
              this.createCard();
            } else if (action === "editChoosenCards") {
              console.log("Edit choosen:", this.choosenCardsArray);
            }
          });
        }

        let furtherOptions = this.editCardsContainer.querySelector(
          ".options #furtherOptions ul"
        );
        for (let currentBtn of furtherOptions.querySelectorAll("li a")) {
          currentBtn = Utils.removeAllEventlisteners(currentBtn);
          currentBtn.addEventListener("click", async () => {
            let action = currentBtn.getAttribute("data-action");
            if (action === "createCard") {
              this.createCard();
            } else if (action === "recover") {
              await this.prepare();
              this.refresh(true);
            } else if (action === "removeAll") {
              this.quizJSON["quizCards"] = new Array();
              this.refresh(true);
            } else if (action === "copyQuizdata") {
              if (
                await Utils.copyTextToClipboard(
                  JSON.stringify(this.quizJSON, null, 3)
                )
              ) {
                Utils.alertUser("Nachricht", "Erfolgreich kopiert.");
              }
            } else if (action === "insertQuizdata") {
              let usersJSON = Utils.makeJSON(
                await Utils.getUserInput(
                  "Daten einfügen",
                  "Hier kannst du im JSON Format den Text des Quizzes einfügen.",
                  false,
                  "textArea",
                  JSON.stringify(this.quizJSON, null, 3),
                  JSON.stringify(this.quizJSON, null, 3),
                  false,
                  false,
                  false,
                  true
                )
              );
              console.log("Insert:", usersJSON);
              console.log("JSON:", Utils.makeJSON(usersJSON));
              if (usersJSON && usersJSON["options"]) {
                this.quizJSON = Utils.makeJSON(JSON.stringify(usersJSON));
                await Utils.alertUser("Nachricht", "Erfolgreich gesetzt.");
                this.refresh();
              } else {
                await Utils.alertUser(
                  "Nachricht",
                  "Daten konnten nicht eingefügt werden."
                );
                this.refresh();
              }
            }
          });
        }

        if (refreshCards) {
          this.refreshCards(true);
        }

        this.logData();
        return true;
      }

      logData() {
        console.log("Current QuizJSON:", this.quizJSON);
        // alert(this.quizJSON["options"].showTime)
        console.log("Original Data:", this.originalData);
      }

      copyCard(card) {
        this.quizJSON["quizCards"] = Utils.addToArray(this.quizJSON["quizCards"], Utils.makeJSON(JSON.stringify(card)), true);
        return true;
      }

      moveCards(action, id) {
        if (action === "upwards") {
          //Previous
          let objecta = this.quizJSON["quizCards"].find(
            (quizCard) => quizCard.id == parseInt(id) - 1,
            false
          );
          if (!objecta) return false;
          //Current
          let objectb = this.quizJSON["quizCards"].find(
            (quizCard) => quizCard.id == id,
            false
          );
          let objectbID = objectb.id;
          let objectaID = objecta.id;
          objectb.id = objectaID;
          objecta.id = objectbID;

          console.log("previous Card =>", objecta, "currentCard =>", objectb);
          this.refreshCards(true);
        } else if (action === "downwards") {
          //Next
          let objecta = this.quizJSON["quizCards"].find(
            (quizCard) => quizCard.id == parseInt(id) + 1,
            false
          );
          if (!objecta) return false;
          //Current
          let objectb = this.quizJSON["quizCards"].find(
            (quizCard) => quizCard.id == id,
            false
          );
          let objectbID = objectb.id;
          let objectaID = objecta.id;
          objectb.id = objectaID;
          objecta.id = objectbID;

          console.log("next Card =>", objecta, "currentCard =>", objectb);
          this.refreshCards(true);
        }
      }

      async refreshCards(refreshAll = true, cardToRefresh = false) {
        let cardsContainer = this.editCardsContainer.querySelector(".cardList");
        let quizCards = new Array();

        if (refreshAll) {
          cardsContainer.innerHTML = ``;
          //repair
          if (!this.quizJSON["quizCards"]) {
            this.quizJSON["quizCards"] = [];
          }
          quizCards = this.quizJSON["quizCards"];
          //sort by id and points
          quizCards = quizCards.sort((a, b) => {
            if (!a.id) return 0;
            if (!b.id) return 0;
            if (a.id == b.id) {
              return 0;
            }
            if (a.id > b.id) {
              return 1;
            } else {
              return -1;
            }
          });
        } else {
          //Add card information from quizJSON to quizCards array
          quizCards = Utils.addToArray(
            quizCards,
            this.quizJSON["quizCards"].find(
              (quizCard) => quizCard.id == cardToRefresh,
              false
            )
          );
          console.log(quizCards);
        }

        let counter = 1;

        for (let currentCard of quizCards) {
          let id;
          let item;
          if (refreshAll) {
            id = counter;
            currentCard.id = counter;

            item = document.createElement("div");
            item.classList.add("collapse", "item");
            item.setAttribute("data-cardid", id);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
            cardsContainer.appendChild(item);
          } else {
            id = currentCard.id;
            item = this.editCardsContainer.querySelector(
              `div[data-cardid='${id}']`
            );
            item.classList.add("collapse", "item");
            item.setAttribute("data-cardid", id);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
          }

          let cardType = currentCard["type"];

          if (cardType === "mchoice") {
            item.innerHTML = `
            <div class="header">
            <div class="form-check" id="choose">
                <input class="form-check-input" type="checkbox" id="checkbox">
                <label class="form-check-label">
                    Karte auswählen
                </label>
            </div>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Kartenreihenfolge ändern</label>
            <div class="form-control">
              <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1">
              <label class="form-check-label">
                  Id der Karte (Für Sortierung genutzt)
              </label>
              </div> 

           
            <button type="button" class="btn btn-secondary" id="copyCard">Karte kopieren</button>
            <button type="button" class="btn btn-danger" id="deleteCard">Karte löschen</button>
        </div>
        <div class="body">
            <div id="cardType">Typ: Multiple Choice</div>
            <div id="options">
                <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                <ul class="collapse" id="optionsList">
                    <li id="shuffle">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox">
                        <label class="form-check-label">
                            Antworten durchmischen
                        </label>
                    </li>
                    <li id="showTimePassed">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                            Zeitzähler anzeigen
                          </label>
                      </div>
                  </li>
                    <li id="timeLimit">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="checkBox">
                        <label class="form-check-label" for="checkBox">
                            Zeitlimit aktivieren
                        </label>
                    </div>
                    <div class="inner">
                        <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
                        <label class="form-check-label" for="numberInput">Angabe in Sekunden</label>
                    </div> 
                  </li>
                </ul>
            </div>
            <div id="task">
              <h5>Aufgabe</h5>
                <div class="input-group mb-3">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Aufgabe eingeben" placeholder="Klicke die richtige Antwort an."></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Aufgaben</button>
                </div>
            </div>
            <div id="question">
            <h5>Frage</h5>
                <div class="input-group mb-3" id="task">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Frage eingeben" placeholder="Frage..." autocomplete="off"></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Fragen</button>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" id="changeMedia">Medien hinzufügen / bearbeiten</button>
            <div id="answers">
                <div class="change"><button type="button" class="btn btn-secondary" id="changeAnswers">Antwort hinzufügen / löschen</button></div>
            </div>
            <h5>Punkte</h5>
            <div id="points">
                <input type="number" class="form-control" aria-label="Punkte festlegen" id="numberInput" placeholder="z.B. 1 oder 4,5">
            </div>
        </div>
            `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                this.moveCards(action, id);
              });
            }

            //Choose logic
            let chooseCheckbox = itemHeader.querySelector("#choose #checkbox");
            chooseCheckbox.addEventListener("click", () => {
              if (chooseCheckbox.checked) {
                this.choosenCardsArray = Utils.addToArray(
                  this.choosenCardsArray,
                  id,
                  false
                );
              } else {
                this.choosenCardsArray = Utils.removeFromArray(
                  this.choosenCardsArray,
                  id
                );
              }
              console.log(this.choosenCardsArray);
            });

            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = id;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentCard["id"] = Number(idNumberInput.value);
              }
              this.logData();
            });

            let copyCardBtn = itemHeader.querySelector("#copyCard");
            copyCardBtn.addEventListener("click", () => {
              this.copyCard(currentCard);
              this.refreshCards(true);
            });
            let deleteCardBtn = itemHeader.querySelector("#deleteCard");
            deleteCardBtn.addEventListener("click", () => {
              this.quizJSON["quizCards"] = Utils.removeFromArray(
                this.quizJSON["quizCards"],
                currentCard
              );
              this.refresh(true);
            });

            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //Options
            let options = currentCard["options"];
            //shuffleCards
            let shuffleCardsCheckbox =
              optionsContainer.querySelector("#shuffle #checkbox");
            shuffleCardsCheckbox.checked = options["shuffle"];
            shuffleCardsCheckbox.addEventListener("click", () => {
              options["shuffle"] = shuffleCardsCheckbox.checked;
              this.logData();
            });
//showTimePassed
let showTimePassedCheckbox = optionsContainer.querySelector(
  "#showTimePassed #checkBox"
);
showTimePassedCheckbox.checked = options["showTimePassed"];
showTimePassedCheckbox.addEventListener("click", () => {
  options["showTimePassed"] = showTimePassedCheckbox.checked;
  this.logData();
});

            //Timelimit
            let timeLimitContainer =
              optionsContainer.querySelector("#timeLimit");
            let timeLimitCheckbox =
              timeLimitContainer.querySelector("#checkBox");

            let timeLimitNumberInput = timeLimitContainer.querySelector(
              ".inner #numberInput"
            );
            //timeLimit
            timeLimitCheckbox.checked = Boolean(options["timeLimit"]);
            if (Boolean(options["timeLimit"])) {
              timeLimitNumberInput.value = Number(options["timeLimit"]);
            } else {
              options["timeLimit"] = false;
            }
            timeLimitCheckbox.addEventListener("input", () => {
              let status = Boolean(timeLimitCheckbox.checked);
              //set status in JSON
              options["timeLimit"] = status;
              if (!status) {
                //Deactivate
                timeLimitNumberInput.disabled = true;
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
              } else {
                //Activate
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
                timeLimitNumberInput.disabled = false;
                timeLimitNumberInput.addEventListener("input", () => {
                  let value = Number(timeLimitNumberInput.value);
                  if (value && value > 0) {
                    options["timeLimit"] = value;
                  } else {
                    options["timeLimit"] = false;
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(options["timeLimit"])) {
              //Activate
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
              timeLimitNumberInput.disabled = false;
              timeLimitNumberInput.addEventListener("input", () => {
                let value = Number(timeLimitNumberInput.value);
                if (value && value > 0) {
                  options["timeLimit"] = value;
                } else {
                  options["timeLimit"] = false;
                }
              });
            } else {
              //Deactivate
              timeLimitNumberInput.disabled = true;
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
            }

            //Task
            let taskContainer = itemBody.querySelector("#task");
            let taskCheckbox = taskContainer.querySelector("#checkBox");
            let taskTextInput = taskContainer.querySelector("#textInput");
            let suggestTaskButton =
              taskContainer.querySelector("#getSuggestions");
            taskCheckbox.checked = Boolean(currentCard["task"]);
            if (Boolean(currentCard["task"])) {
              taskTextInput.value = String(currentCard["task"]);
            } else {
              currentCard["task"] = false;
            }
            taskCheckbox.addEventListener("input", () => {
              let status = Boolean(taskCheckbox.checked);
              //set status in JSON
              currentCard["task"] = status;
              if (!status) {
                //Deactivate
                taskTextInput.disabled = true;
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                suggestTaskButton.disabled = true;
                suggestTaskButton =
                  Utils.removeAllEventlisteners(suggestTaskButton);
              } else {
                //Activate
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                taskTextInput.disabled = false;
                taskTextInput.addEventListener("input", () => {
                  let value = String(taskTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["task"] = value;
                    taskTextInput.value = value;
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
                suggestTaskButton.disabled = false;
                suggestTaskButton.addEventListener("click", async () => {
                  let selectedTask = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Aufgabe auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getTasks&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedTask || selectedTask[0]) {
                    currentCard["task"] = selectedTask[0];
                    taskTextInput.value = selectedTask[0];
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["task"])) {
              //Activate
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              taskTextInput.disabled = false;
              taskTextInput.addEventListener("input", () => {
                let value = String(taskTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["task"] = value;
                  taskTextInput.value = value;
                } else {
                  currentCard["task"] = false;
                  taskTextInput.value = "";
                }
                this.logData();
              });
              suggestTaskButton.disabled = false;
              suggestTaskButton.addEventListener("click", async () => {
                let selectedTask = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Aufgabe auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getTasks&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedTask || selectedTask[0]) {
                  currentCard["task"] = selectedTask[0];
                  taskTextInput.value = selectedTask[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              taskTextInput.disabled = true;
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              suggestTaskButton.disabled = true;
              suggestTaskButton =
                Utils.removeAllEventlisteners(suggestTaskButton);
            }

            //Question
            let questionContainer = itemBody.querySelector("#question");
            let questionCheckbox = questionContainer.querySelector("#checkBox");
            let questionTextInput =
              questionContainer.querySelector("#textInput");
            let suggestQuestionButton =
              questionContainer.querySelector("#getSuggestions");
            questionCheckbox.checked = Boolean(currentCard["question"]);
            if (Boolean(currentCard["question"])) {
              questionTextInput.value = String(currentCard["question"]);
            } else {
              currentCard["question"] = false;
              questionTextInput.value = "";
            }
            questionCheckbox.addEventListener("input", () => {
              let status = Boolean(questionCheckbox.checked);
              //set status in JSON
              currentCard["question"] = status;
              if (!status) {
                //Deactivate
                questionTextInput.disabled = true;
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                suggestQuestionButton.disabled = true;
                suggestQuestionButton = Utils.removeAllEventlisteners(
                  suggestQuestionButton
                );
              } else {
                //Activate
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                questionTextInput.disabled = false;
                questionTextInput.addEventListener("input", () => {
                  let value = String(questionTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["question"] = value;
                    questionTextInput.value = value;
                  } else {
                    currentCard["question"] = false;
                    questionTextInput.value = "";
                  }
                  this.logData();
                });
                suggestQuestionButton.disabled = false;
                suggestQuestionButton.addEventListener("click", async () => {
                  let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Frage auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedQuestion || selectedQuestion[0]) {
                    currentCard["question"] = selectedQuestion[0];
                    questionTextInput.value = selectedQuestion[0];
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["question"])) {
              //Activate
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              questionTextInput.disabled = false;
              questionTextInput.addEventListener("input", () => {
                let value = String(questionTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["question"] = value;
                  questionTextInput.value = value;
                } else {
                  currentCard["question"] = false;
                }
                this.logData();
              });
              suggestQuestionButton.disabled = false;
              suggestQuestionButton.addEventListener("click", async () => {
                let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Frage auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedQuestion || selectedQuestion[0]) {
                  currentCard["question"] = selectedQuestion[0];
                  questionTextInput.value = selectedQuestion[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              questionTextInput.disabled = true;
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              suggestQuestionButton.disabled = true;
              suggestQuestionButton = Utils.removeAllEventlisteners(
                suggestQuestionButton
              );
            }

            //points
            let pointsNumberInput = itemBody.querySelector(
              "#points #numberInput"
            );
            pointsNumberInput.value = Number(currentCard["points"]);
            pointsNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(pointsNumberInput.value)) {
                let number = Number(pointsNumberInput.value);
                if (number < 0) {
                  pointsNumberInput.value = 0;
                  currentCard["points"] = 0;
                } else {
                  currentCard["points"] = number;
                }
              } else {
                currentCard["points"] = 0;
              }
              this.logData();
            });

            //Change Media
            let changeMediaBtn = itemBody.querySelector("#changeMedia");
            changeMediaBtn.addEventListener("click", async () => {
              let res = await editMedia(currentCard);
              currentCard = res;
              this.refreshCards(false, id);
            });

            //Answers
            let changeAnswersBtn = itemBody.querySelector("#changeAnswers");
            changeAnswersBtn.addEventListener("click", async () => {
              let res = await changeAnswersMulitpleChoice(currentCard);
              currentCard = res;
              this.refreshCards(false, id);
            });
          } else if (cardType === "mchoice-multi") {
            item.innerHTML = `
            <div class="header">
            <div class="form-check" id="choose">
                <input class="form-check-input" type="checkbox" id="checkbox">
                <label class="form-check-label">
                    Karte auswählen
                </label>
            </div>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Kartenreihenfolge ändern</label>
            <div class="form-control">
              <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1">
              <label class="form-check-label">
                  Id der Karte (Für Sortierung genutzt)
              </label>
              </div> 

           
            <button type="button" class="btn btn-secondary" id="copyCard">Karte kopieren</button>
            <button type="button" class="btn btn-danger" id="deleteCard">Karte löschen</button>
        </div>
        <div class="body">
            <div id="cardType">Typ: Multiple Choice Multi</div>
            <div id="options">
                <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                <ul class="collapse" id="optionsList">
                    <li id="shuffle">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox">
                        <label class="form-check-label">
                            Antworten durchmischen
                        </label>
                    </li>
                    <li id="showTimePassed">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                            Zeitzähler anzeigen
                          </label>
                      </div>
                    </li>
                    <li id="timeLimit">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                              Zeitlimit aktivieren
                          </label>
                      </div>
                      <div class="inner">
                          <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
                          <label class="form-check-label" for="numberInput">Angabe in Sekunden</label>
                      </div> 
                    </li>
                    <li id="allMustBeCorrect">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                              Alle Antworten müssen stimmen
                          </label>
                      </div>
                      <div class="inner">
                          <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
                          <label class="form-check-label" for="numberInput">Anzahl der maximalen falschen Antworten, um richtig zu gelten</label>
                      </div> 
                    </li>
                </ul>
            </div>
            <div id="task">
              <h5>Aufgabe</h5>
                <div class="input-group mb-3">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Aufgabe eingeben" placeholder="Klicke die richtige Antwort an."></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Aufgaben</button>
                </div>
            </div>
            <div id="question">
            <h5>Frage</h5>
                <div class="input-group mb-3" id="task">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Frage eingeben" placeholder="Frage..." autocomplete="off"></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Fragen</button>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" id="changeMedia">Medien hinzufügen / bearbeiten</button>
            <div id="answers">
                <div class="change"><button type="button" class="btn btn-secondary" id="changeAnswers">Antwort hinzufügen / löschen</button></div>
            </div>
            <h5>Punkte</h5>
            <div id="points">
                <input type="number" class="form-control" aria-label="Punkte festlegen" id="numberInput" placeholder="z.B. 1 oder 4,5">
            </div>
        </div>
            `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                this.moveCards(action, id);
              });
            }

            //Choose logic
            let chooseCheckbox = itemHeader.querySelector("#choose #checkbox");
            chooseCheckbox.addEventListener("click", () => {
              if (chooseCheckbox.checked) {
                this.choosenCardsArray = Utils.addToArray(
                  this.choosenCardsArray,
                  id,
                  false
                );
              } else {
                this.choosenCardsArray = Utils.removeFromArray(
                  this.choosenCardsArray,
                  id
                );
              }
              console.log(this.choosenCardsArray);
            });

            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = id;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentCard["id"] = Number(idNumberInput.value);
              }
              this.logData();
            });

            let copyCardBtn = itemHeader.querySelector("#copyCard");
            copyCardBtn.addEventListener("click", () => {
              this.copyCard(currentCard);
              this.refreshCards(true);
            });
            let deleteCardBtn = itemHeader.querySelector("#deleteCard");
            deleteCardBtn.addEventListener("click", () => {
              this.quizJSON["quizCards"] = Utils.removeFromArray(
                this.quizJSON["quizCards"],
                currentCard
              );
              this.refresh(true);
            });

            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //Options
            let options = currentCard["options"];
            //shuffleCards
            let shuffleCardsCheckbox =
              optionsContainer.querySelector("#shuffle #checkbox");
            shuffleCardsCheckbox.checked = options["shuffle"];
            shuffleCardsCheckbox.addEventListener("click", () => {
              options["shuffle"] = shuffleCardsCheckbox.checked;
              this.logData();
            });

            //Timelimit
            let timeLimitContainer =
              optionsContainer.querySelector("#timeLimit");
            let timeLimitCheckbox =
              timeLimitContainer.querySelector("#checkBox");

            let timeLimitNumberInput = timeLimitContainer.querySelector(
              ".inner #numberInput"
            );
            //timeLimit
            timeLimitCheckbox.checked = Boolean(options["timeLimit"]);
            if (Boolean(options["timeLimit"])) {
              timeLimitNumberInput.value = Number(options["timeLimit"]);
            } else {
              options["timeLimit"] = false;
            }
            timeLimitCheckbox.addEventListener("input", () => {
              let status = Boolean(timeLimitCheckbox.checked);
              //set status in JSON
              options["timeLimit"] = status;
              if (!status) {
                //Deactivate
                timeLimitNumberInput.disabled = true;
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
              } else {
                //Activate
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
                timeLimitNumberInput.disabled = false;
                timeLimitNumberInput.addEventListener("input", () => {
                  let value = Number(timeLimitNumberInput.value);
                  if (value && value > 0) {
                    options["timeLimit"] = value;
                  } else {
                    options["timeLimit"] = false;
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(options["timeLimit"])) {
              //Activate
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
              timeLimitNumberInput.disabled = false;
              timeLimitNumberInput.addEventListener("input", () => {
                let value = Number(timeLimitNumberInput.value);
                if (value && value > 0) {
                  options["timeLimit"] = value;
                } else {
                  options["timeLimit"] = false;
                }
              });
            } else {
              //Deactivate
              timeLimitNumberInput.disabled = true;
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
            }
            //showTimePassed
            let showTimePassedCheckbox = optionsContainer.querySelector(
              "#showTimePassed #checkBox"
            );
            showTimePassedCheckbox.checked = options["showTimePassed"];
            showTimePassedCheckbox.addEventListener("click", () => {
              options["showTimePassed"] = showTimePassedCheckbox.checked;
              this.logData();
            });

            //allMustBeCorrect --------------------

            //allMustBeCorrect
            let allMustBeCorrectContainer =
              optionsContainer.querySelector("#allMustBeCorrect");
            let allMustBeCorrectCheckbox =
              allMustBeCorrectContainer.querySelector("#checkBox");

            let maxWrongAnswersNumberInput =
              allMustBeCorrectContainer.querySelector(".inner #numberInput");
            allMustBeCorrectCheckbox.checked = Boolean(
              options["allMustBeCorrect"]
            );
            if (Boolean(options["allMustBeCorrect"])) {
              options["allMustBeCorrect"] = true;
            } else {
              maxWrongAnswersNumberInput.value = Number(
                options["maxWrongAnswers"]
              );
              options["allMustBeCorrect"] = false;
            }
            allMustBeCorrectCheckbox.addEventListener("input", () => {
              let status = Boolean(allMustBeCorrectCheckbox.checked);
              //set status in JSON
              options["allMustBeCorrect"] = status;
              if (!status) {
                //Activate
                maxWrongAnswersNumberInput = Utils.removeAllEventlisteners(
                  maxWrongAnswersNumberInput
                );
                maxWrongAnswersNumberInput.disabled = false;
                maxWrongAnswersNumberInput.addEventListener("input", () => {
                  let value = Number(maxWrongAnswersNumberInput.value);
                  if (value && value > 0) {
                    options["maxWrongAnswers"] = value;
                  } else {
                    options["maxWrongAnswers"] = false;
                  }
                  this.logData();
                });
              } else {
                //Deactivate
                maxWrongAnswersNumberInput.disabled = true;
                maxWrongAnswersNumberInput = Utils.removeAllEventlisteners(
                  maxWrongAnswersNumberInput
                );
              }
              this.logData();
            });
            if (Boolean(options["allMustBeCorrect"])) {
              //Deactivate
              maxWrongAnswersNumberInput.disabled = true;
              maxWrongAnswersNumberInput = Utils.removeAllEventlisteners(
                maxWrongAnswersNumberInput
              );
            } else {
              //Activate
              maxWrongAnswersNumberInput = Utils.removeAllEventlisteners(
                maxWrongAnswersNumberInput
              );
              maxWrongAnswersNumberInput.disabled = false;
              maxWrongAnswersNumberInput.addEventListener("input", () => {
                let value = Number(maxWrongAnswersNumberInput.value);
                if (value && value > 0) {
                  options["maxWrongAnswers"] = value;
                } else {
                  options["maxWrongAnswers"] = false;
                  options["allMustBeCorrect"] = true;
                }
                this.logData();
              });
            }

            //--------------------------------------

            //Task
            let taskContainer = itemBody.querySelector("#task");
            let taskCheckbox = taskContainer.querySelector("#checkBox");
            let taskTextInput = taskContainer.querySelector("#textInput");
            let suggestTaskButton =
              taskContainer.querySelector("#getSuggestions");
            taskCheckbox.checked = Boolean(currentCard["task"]);
            if (Boolean(currentCard["task"])) {
              taskTextInput.value = String(currentCard["task"]);
            } else {
              currentCard["task"] = false;
            }
            taskCheckbox.addEventListener("input", () => {
              let status = Boolean(taskCheckbox.checked);
              //set status in JSON
              currentCard["task"] = status;
              if (!status) {
                //Deactivate
                taskTextInput.disabled = true;
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                suggestTaskButton.disabled = true;
                suggestTaskButton =
                  Utils.removeAllEventlisteners(suggestTaskButton);
              } else {
                //Activate
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                taskTextInput.disabled = false;
                taskTextInput.addEventListener("input", () => {
                  let value = String(taskTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["task"] = value;
                    taskTextInput.value = value;
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
                suggestTaskButton.disabled = false;
                suggestTaskButton.addEventListener("click", async () => {
                  let selectedTask = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Aufgabe auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getTasks&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedTask || selectedTask[0]) {
                    currentCard["task"] = selectedTask[0];
                    taskTextInput.value = selectedTask[0];
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["task"])) {
              //Activate
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              taskTextInput.disabled = false;
              taskTextInput.addEventListener("input", () => {
                let value = String(taskTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["task"] = value;
                  taskTextInput.value = value;
                } else {
                  currentCard["task"] = false;
                  taskTextInput.value = "";
                }
                this.logData();
              });
              suggestTaskButton.disabled = false;
              suggestTaskButton.addEventListener("click", async () => {
                let selectedTask = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Aufgabe auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getTasks&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedTask || selectedTask[0]) {
                  currentCard["task"] = selectedTask[0];
                  taskTextInput.value = selectedTask[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              taskTextInput.disabled = true;
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              suggestTaskButton.disabled = true;
              suggestTaskButton =
                Utils.removeAllEventlisteners(suggestTaskButton);
            }

            //Question
            let questionContainer = itemBody.querySelector("#question");
            let questionCheckbox = questionContainer.querySelector("#checkBox");
            let questionTextInput =
              questionContainer.querySelector("#textInput");
            let suggestQuestionButton =
              questionContainer.querySelector("#getSuggestions");
            questionCheckbox.checked = Boolean(currentCard["question"]);
            if (Boolean(currentCard["question"])) {
              questionTextInput.value = String(currentCard["question"]);
            } else {
              currentCard["question"] = false;
              questionTextInput.value = "";
            }
            questionCheckbox.addEventListener("input", () => {
              let status = Boolean(questionCheckbox.checked);
              //set status in JSON
              currentCard["question"] = status;
              if (!status) {
                //Deactivate
                questionTextInput.disabled = true;
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                suggestQuestionButton.disabled = true;
                suggestQuestionButton = Utils.removeAllEventlisteners(
                  suggestQuestionButton
                );
              } else {
                //Activate
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                questionTextInput.disabled = false;
                questionTextInput.addEventListener("input", () => {
                  let value = String(questionTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["question"] = value;
                    questionTextInput.value = value;
                  } else {
                    currentCard["question"] = false;
                    questionTextInput.value = "";
                  }
                  this.logData();
                });
                suggestQuestionButton.disabled = false;
                suggestQuestionButton.addEventListener("click", async () => {
                  let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Frage auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedQuestion || selectedQuestion[0]) {
                    currentCard["question"] = selectedQuestion[0];
                    questionTextInput.value = selectedQuestion[0];
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["question"])) {
              //Activate
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              questionTextInput.disabled = false;
              questionTextInput.addEventListener("input", () => {
                let value = String(questionTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["question"] = value;
                  questionTextInput.value = value;
                } else {
                  currentCard["question"] = false;
                }
                this.logData();
              });
              suggestQuestionButton.disabled = false;
              suggestQuestionButton.addEventListener("click", async () => {
                let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Frage auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedQuestion || selectedQuestion[0]) {
                  currentCard["question"] = selectedQuestion[0];
                  questionTextInput.value = selectedQuestion[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              questionTextInput.disabled = true;
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              suggestQuestionButton.disabled = true;
              suggestQuestionButton = Utils.removeAllEventlisteners(
                suggestQuestionButton
              );
            }

            //points
            let pointsNumberInput = itemBody.querySelector(
              "#points #numberInput"
            );
            pointsNumberInput.value = Number(currentCard["points"]);
            pointsNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(pointsNumberInput.value)) {
                let number = Number(pointsNumberInput.value);
                if (number < 0) {
                  pointsNumberInput.value = 0;
                  currentCard["points"] = 0;
                } else {
                  currentCard["points"] = number;
                }
              } else {
                currentCard["points"] = 0;
              }
              this.logData();
            });

            //Change Media
            let changeMediaBtn = itemBody.querySelector("#changeMedia");
            changeMediaBtn.addEventListener("click", async () => {
              let res = await editMedia(currentCard);
              currentCard = res;
              this.refreshCards(false, id);
            });

            //Answers
            let changeAnswersBtn = itemBody.querySelector("#changeAnswers");
            changeAnswersBtn.addEventListener("click", async () => {
              let res = await changeAnswersMulitpleChoiceMulti(currentCard);
              currentCard = res;
              this.refreshCards(false, id);
            });
          } else if (cardType === "textInput") {
            item.innerHTML = `
            <div class="header">
            <div class="form-check" id="choose">
                <input class="form-check-input" type="checkbox" id="checkbox">
                <label class="form-check-label">
                    Karte auswählen
                </label>
            </div>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Kartenreihenfolge ändern</label>
            <div class="form-control">
              <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1">
              <label class="form-check-label">
                  Id der Karte (Für Sortierung genutzt)
              </label>
              </div> 

           
            <button type="button" class="btn btn-secondary" id="copyCard">Karte kopieren</button>
            <button type="button" class="btn btn-danger" id="deleteCard">Karte löschen</button>
        </div>
        <div class="body">
            <div id="cardType">Typ: Texteingabe</div>
            <div id="options">
                <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                <ul class="collapse" id="optionsList">
                    <li id="caseSensitive">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox">
                        <label class="form-check-label">
                            Groß- und Kleinschreibung wichtig
                        </label>
                    </li>
                    <li id="showTimePassed">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                            Zeitzähler anzeigen
                          </label>
                      </div>
                  </li>
                    <li id="timeLimit">
                      <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="checkBox">
                          <label class="form-check-label" for="checkBox">
                              Zeitlimit aktivieren
                          </label>
                      </div>
                      <div class="inner">
                          <input type="number" id="numberInput" name="numberInput" min="" max="" autocomplete="off" value="">
                          <label class="form-check-label" for="numberInput">Angabe in Sekunden</label>
                      </div> 
                    </li>
                    <li id="size">
                    <label for="selectInput" class="form-label">Größe auswählen</label>
                      <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                        <option data-value="large" selected="selected">groß</option>  
                        <option data-value="middle" selected="selected">mittel</option>
                        <option data-value="small" selected="selected">klein</option>
                      </select>
                  </li>
                  <li id="wordsJustNeedToBeIncluded">
                  <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="checkBox">
                      <label class="form-check-label" for="checkBox">
                          Enthaltene Wörter, um als richtig zu gelten
                      </label>
                  </div>
                  <div class="inner">
                      <button class="btn btn-primary btn-sm editBtn">bearbeiten</button>
                  </div> 
                </li>
                </ul>
            </div>
            <div id="task">
              <h5>Aufgabe</h5>
                <div class="input-group mb-3">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Aufgabe eingeben" placeholder="Klicke die richtige Antwort an."></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Aufgaben</button>
                </div>
            </div>
            <div id="question">
            <h5>Frage</h5>
                <div class="input-group mb-3" id="task">
                    <div class="input-group-text">
                        <input class="form-check-input mt-0" type="checkbox" id="checkBox"
                            aria-label="Checkbox für Texteingabe">
                    </div>
                    <textarea class="form-control" id="textInput" rows="3" aria-label="Frage eingeben" placeholder="Was ist die Hauptstadt von Brasilien?"></textarea>
                    <button type="button" class="btn btn-sm btn-primary" id="getSuggestions">Vorgefertigte
                        Fragen</button>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" id="changeMedia">Medien hinzufügen / bearbeiten</button>
            <div id="answers">
                <div class="change"><button type="button" class="btn btn-secondary" id="changeAnswers">Antwort hinzufügen / löschen</button></div>
            </div>
            <h5>Punkte</h5>
            <div id="points">
                <input type="number" class="form-control" aria-label="Punkte festlegen" id="numberInput" placeholder="z.B. 1 oder 4,5">
            </div>
        </div>
            `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                this.moveCards(action, id);
              });
            }

            //Choose logic
            let chooseCheckbox = itemHeader.querySelector("#choose #checkbox");
            chooseCheckbox.addEventListener("click", () => {
              if (chooseCheckbox.checked) {
                this.choosenCardsArray = Utils.addToArray(
                  this.choosenCardsArray,
                  id,
                  false
                );
              } else {
                this.choosenCardsArray = Utils.removeFromArray(
                  this.choosenCardsArray,
                  id
                );
              }
              console.log(this.choosenCardsArray);
            });

            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = id;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentCard["id"] = Number(idNumberInput.value);
              }
              this.logData();
            });

            let copyCardBtn = itemHeader.querySelector("#copyCard");
            copyCardBtn.addEventListener("click", () => {
              this.copyCard(currentCard);
              this.refreshCards(true);
            });
            let deleteCardBtn = itemHeader.querySelector("#deleteCard");
            deleteCardBtn.addEventListener("click", () => {
              this.quizJSON["quizCards"] = Utils.removeFromArray(
                this.quizJSON["quizCards"],
                currentCard
              );
              this.refresh(true);
            });

            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //Options
            let options = currentCard["options"];
            //caseSensitive
            let caseSensitiveCheckbox = optionsContainer.querySelector(
              "#caseSensitive #checkbox"
            );
            caseSensitiveCheckbox.checked = Boolean(options["caseSensitive"]);
            caseSensitiveCheckbox.addEventListener("click", () => {
              options["caseSensitive"] = caseSensitiveCheckbox.checked;
              this.logData();
            });
            //showTimePassed
            let showTimePassedCheckbox = optionsContainer.querySelector(
              "#showTimePassed #checkBox"
            );
            showTimePassedCheckbox.checked = options["showTimePassed"];
            showTimePassedCheckbox.addEventListener("click", () => {
              options["showTimePassed"] = showTimePassedCheckbox.checked;
              this.logData();
            });
            //Timelimit
            let timeLimitContainer =
              optionsContainer.querySelector("#timeLimit");
            let timeLimitCheckbox =
              timeLimitContainer.querySelector("#checkBox");

            let timeLimitNumberInput = timeLimitContainer.querySelector(
              ".inner #numberInput"
            );
            //timeLimit
            timeLimitCheckbox.checked = Boolean(options["timeLimit"]);
            if (Boolean(options["timeLimit"])) {
              timeLimitNumberInput.value = Number(options["timeLimit"]);
            } else {
              options["timeLimit"] = false;
            }
            timeLimitCheckbox.addEventListener("input", () => {
              let status = Boolean(timeLimitCheckbox.checked);
              //set status in JSON
              options["timeLimit"] = status;
              if (!status) {
                //Deactivate
                timeLimitNumberInput.disabled = true;
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
              } else {
                //Activate
                timeLimitNumberInput =
                  Utils.removeAllEventlisteners(timeLimitNumberInput);
                timeLimitNumberInput.disabled = false;
                timeLimitNumberInput.addEventListener("input", () => {
                  let value = Number(timeLimitNumberInput.value);
                  if (value && value > 0) {
                    options["timeLimit"] = value;
                  } else {
                    options["timeLimit"] = false;
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(options["timeLimit"])) {
              //Activate
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
              timeLimitNumberInput.disabled = false;
              timeLimitNumberInput.addEventListener("input", () => {
                let value = Number(timeLimitNumberInput.value);
                if (value && value > 0) {
                  options["timeLimit"] = value;
                } else {
                  options["timeLimit"] = false;
                }
              });
            } else {
              //Deactivate
              timeLimitNumberInput.disabled = true;
              timeLimitNumberInput =
                Utils.removeAllEventlisteners(timeLimitNumberInput);
            }
            //size
            let textSizeSelect =
              optionsContainer.querySelector("#size #selectInput");
            console.log(textSizeSelect);
            Utils.selectListSelectItemBySelector(
              textSizeSelect,
              "data-value",
              currentCard["size"]
            );
            
            textSizeSelect.addEventListener("change", () => {
              currentCard["size"] =
                textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                  "data-value"
                );
              this.logData();
            });

            //wordsJustNeedToBeIncluded
            let wordsJustNeedToBeIncludedContainer =
              optionsContainer.querySelector("#wordsJustNeedToBeIncluded");
            let wordsJustNeedToBeIncludedCheckbox =
              wordsJustNeedToBeIncludedContainer.querySelector("#checkBox");

            let wordsJustNeedToBeIncludedButton =
              wordsJustNeedToBeIncludedContainer.querySelector(
                ".inner .editBtn"
              );
            wordsJustNeedToBeIncludedCheckbox.checked = Boolean(
              options["wordsJustNeedToBeIncluded"]
            );
            if (
              !options["wordsJustNeedToBeIncluded"] ||
              !options["wordsJustNeedToBeIncluded"]?.length > 0
            ) {
              options["wordsJustNeedToBeIncluded"] = false;
            }
            wordsJustNeedToBeIncludedCheckbox.addEventListener("click", () => {
              let status = Boolean(wordsJustNeedToBeIncludedCheckbox.checked);
              //set status in JSON
              options["wordsJustNeedToBeIncluded"] = status;
              if (!status) {
                //Deactivate
                wordsJustNeedToBeIncludedButton.disabled = true;
                wordsJustNeedToBeIncludedButton = Utils.removeAllEventlisteners(
                  wordsJustNeedToBeIncludedButton
                );
              } else {
                //Activate
                wordsJustNeedToBeIncludedButton = Utils.removeAllEventlisteners(
                  wordsJustNeedToBeIncludedButton
                );
                wordsJustNeedToBeIncludedButton.disabled = false;
                wordsJustNeedToBeIncludedButton.addEventListener(
                  "click",
                  async () => {
                    options["wordsJustNeedToBeIncluded"] = Object.values(
                      await Utils.editObject(
                        { ...options["wordsJustNeedToBeIncluded"] },
                        {
                          fullscreen: true,
                          title: "Wörter, die enthalten sein müssen.",
                          scrollable: true,
                          modalType: "ok",
                        },
                        false,
                        false,
                        new Array(),
                        "Wörter, die enthalten sein müssen"
                      )
                    );
                    this.logData();
                  }
                );
              }
              this.logData();
            });
            if (options["wordsJustNeedToBeIncluded"]) {
              //Activate
              wordsJustNeedToBeIncludedButton = Utils.removeAllEventlisteners(
                wordsJustNeedToBeIncludedButton
              );
              wordsJustNeedToBeIncludedButton.disabled = false;
              wordsJustNeedToBeIncludedButton.addEventListener(
                "click",
                async () => {
                  options["wordsJustNeedToBeIncluded"] = Object.values(
                    await Utils.editObject(
                      { ...options["wordsJustNeedToBeIncluded"] },
                      {
                        fullscreen: true,
                        title: "Wörter, die enthalten sein müssen.",
                        scrollable: true,
                        modalType: "ok",
                      },
                      false,
                      false,
                      new Array(),
                      "Wörter, die enthalten sein müssen"
                    )
                  );
                  this.logData();
                }
              );
            } else {
              //Deactivate
              wordsJustNeedToBeIncludedButton.disabled = true;
              wordsJustNeedToBeIncludedButton = Utils.removeAllEventlisteners(
                wordsJustNeedToBeIncludedButton
              );
            }

            //Task
            let taskContainer = itemBody.querySelector("#task");
            let taskCheckbox = taskContainer.querySelector("#checkBox");
            let taskTextInput = taskContainer.querySelector("#textInput");
            let suggestTaskButton =
              taskContainer.querySelector("#getSuggestions");
            taskCheckbox.checked = Boolean(currentCard["task"]);
            if (Boolean(currentCard["task"])) {
              taskTextInput.value = String(currentCard["task"]);
            } else {
              currentCard["task"] = false;
            }
            taskCheckbox.addEventListener("input", () => {
              let status = Boolean(taskCheckbox.checked);
              //set status in JSON
              currentCard["task"] = status;
              if (!status) {
                //Deactivate
                taskTextInput.disabled = true;
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                suggestTaskButton.disabled = true;
                suggestTaskButton =
                  Utils.removeAllEventlisteners(suggestTaskButton);
              } else {
                //Activate
                taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
                taskTextInput.disabled = false;
                taskTextInput.addEventListener("input", () => {
                  let value = String(taskTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["task"] = value;
                    taskTextInput.value = value;
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
                suggestTaskButton.disabled = false;
                suggestTaskButton.addEventListener("click", async () => {
                  let selectedTask = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Aufgabe auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getTasks&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedTask || selectedTask[0]) {
                    currentCard["task"] = selectedTask[0];
                    taskTextInput.value = selectedTask[0];
                  } else {
                    currentCard["task"] = false;
                    taskTextInput.value = "";
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["task"])) {
              //Activate
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              taskTextInput.disabled = false;
              taskTextInput.addEventListener("input", () => {
                let value = String(taskTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["task"] = value;
                  taskTextInput.value = value;
                } else {
                  currentCard["task"] = false;
                  taskTextInput.value = "";
                }
                this.logData();
              });
              suggestTaskButton.disabled = false;
              suggestTaskButton.addEventListener("click", async () => {
                let selectedTask = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Aufgabe auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getTasks&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedTask || selectedTask[0]) {
                  currentCard["task"] = selectedTask[0];
                  taskTextInput.value = selectedTask[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              taskTextInput.disabled = true;
              taskTextInput = Utils.removeAllEventlisteners(taskTextInput);
              suggestTaskButton.disabled = true;
              suggestTaskButton =
                Utils.removeAllEventlisteners(suggestTaskButton);
            }

            //Question
            let questionContainer = itemBody.querySelector("#question");
            let questionCheckbox = questionContainer.querySelector("#checkBox");
            let questionTextInput =
              questionContainer.querySelector("#textInput");
            let suggestQuestionButton =
              questionContainer.querySelector("#getSuggestions");
            questionCheckbox.checked = Boolean(currentCard["question"]);
            if (Boolean(currentCard["question"])) {
              questionTextInput.value = String(currentCard["question"]);
            } else {
              currentCard["question"] = false;
              questionTextInput.value = "";
            }
            questionCheckbox.addEventListener("input", () => {
              let status = Boolean(questionCheckbox.checked);
              //set status in JSON
              currentCard["question"] = status;
              if (!status) {
                //Deactivate
                questionTextInput.disabled = true;
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                suggestQuestionButton.disabled = true;
                suggestQuestionButton = Utils.removeAllEventlisteners(
                  suggestQuestionButton
                );
              } else {
                //Activate
                questionTextInput =
                  Utils.removeAllEventlisteners(questionTextInput);
                questionTextInput.disabled = false;
                questionTextInput.addEventListener("input", () => {
                  let value = String(questionTextInput.value);
                  if (!Utils.isEmptyInput(value)) {
                    currentCard["question"] = value;
                    questionTextInput.value = value;
                  } else {
                    currentCard["question"] = false;
                    questionTextInput.value = "";
                  }
                  this.logData();
                });
                suggestQuestionButton.disabled = false;
                suggestQuestionButton.addEventListener("click", async () => {
                  let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                    this.questionsSelectArray,
                    true,
                    "Frage auswählen",
                    false,
                    false,
                    true,
                    "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                    "../teacher/includes/quizverwaltung.inc.php"
                  );
                  if (selectedQuestion || selectedQuestion[0]) {
                    currentCard["question"] = selectedQuestion[0];
                    questionTextInput.value = selectedQuestion[0];
                  }
                  this.logData();
                });
              }
              this.logData();
            });
            if (Boolean(currentCard["question"])) {
              //Activate
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              questionTextInput.disabled = false;
              questionTextInput.addEventListener("input", () => {
                let value = String(questionTextInput.value);
                if (!Utils.isEmptyInput(value)) {
                  currentCard["question"] = value;
                  questionTextInput.value = value;
                } else {
                  currentCard["question"] = false;
                }
                this.logData();
              });
              suggestQuestionButton.disabled = false;
              suggestQuestionButton.addEventListener("click", async () => {
                let selectedQuestion = await Utils.chooseFromArrayWithSearch(
                  this.questionsSelectArray,
                  true,
                  "Frage auswählen",
                  false,
                  false,
                  true,
                  "quizverwaltung&operation=other&type=getQuestions&searchFor=",
                  "../teacher/includes/quizverwaltung.inc.php"
                );
                if (selectedQuestion || selectedQuestion[0]) {
                  currentCard["question"] = selectedQuestion[0];
                  questionTextInput.value = selectedQuestion[0];
                }
                this.logData();
              });
            } else {
              //Deactivate
              questionTextInput.disabled = true;
              questionTextInput =
                Utils.removeAllEventlisteners(questionTextInput);
              suggestQuestionButton.disabled = true;
              suggestQuestionButton = Utils.removeAllEventlisteners(
                suggestQuestionButton
              );
            }

            //points
            let pointsNumberInput = itemBody.querySelector(
              "#points #numberInput"
            );
            pointsNumberInput.value = Number(currentCard["points"]);
            pointsNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(pointsNumberInput.value)) {
                let number = Number(pointsNumberInput.value);
                if (number < 0) {
                  pointsNumberInput.value = 0;
                  currentCard["points"] = 0;
                } else {
                  currentCard["points"] = number;
                }
              } else {
                currentCard["points"] = 0;
              }
              this.logData();
            });

            //Change Media
            let changeMediaBtn = itemBody.querySelector("#changeMedia");
            changeMediaBtn.addEventListener("click", async () => {
              let res = await editMedia(currentCard);
              currentCard = res;
              this.refreshCards(false, id);
            });

            //Answers
            let changeAnswersBtn = itemBody.querySelector("#changeAnswers");
            changeAnswersBtn.addEventListener("click", async () => {
              currentCard["correctAnswers"] = Object.values(
                await Utils.editObject(
                  { ...currentCard["correctAnswers"] },
                  {
                    fullscreen: true,
                    title: "Richtige Antworten",
                    scrollable: true,
                    modalType: "ok",
                  },
                  false,
                  false,
                  new Array()
                )
              );
              this.refreshCards(false, id);
            });
          } else {
            console.log("Unknown cardType:", currentCard);
          }

          counter++;
        }
        return true;
      }

      async createCard() {
        let type = await Utils.getUserInput(
          "Karte erstellen",
          "Welche Art von Karte möchtest du hinzufügen?",
          false,
          "select",
          false,
          false,
          true,
          {
            "Multiple Choice (1 richtig)": "mchoice",
            "Multiple Choice Multi (0-Alle richtig)": "mchoice-multi",
            Texteingabe: "textInput",
          },
          false,
          false
        );
        if (!type) return;
        if (type === "mchoice") {
          this.quizJSON["quizCards"] = Utils.addToArray(
            this.quizJSON["quizCards"],
            {
              type: "mchoice",
              options: {},
              task: "",
              question: "",
              media: [],
              answers: [],
              correctAnswerID: undefined,
              points: 1,
            }
          );
        } else if (type === "mchoice-multi") {
          this.quizJSON["quizCards"] = Utils.addToArray(
            this.quizJSON["quizCards"],
            {
              type: "mchoice-multi",
              options: {allMustBeCorrect: true},
              task: "",
              question: "",
              media: [],
              answers: [],
              correctAnswersIDs: [],
              points: 1,
            }
          );
        } else if (type === "textInput") {
          this.quizJSON["quizCards"] = Utils.addToArray(
            this.quizJSON["quizCards"],
            {
              type: "textInput",
              options: {},
              task: "",
              question: "",
              media: [],
              answers: [],
              correctAnswers: [],
              points: 1,
            }
          );
        }
        this.refresh(true);
      }

      async submitData() {
        console.log("Submit:", this.quizJSON);
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "quizverwaltung&operation=editQuizdata&uniqueID=" +
              this.uniqueID +
              "&quizdata=" +
              JSON.stringify(this.quizJSON),
            "./includes/quizverwaltung.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
        await this.prepare();
        this.refresh();
      }
    }

    let container = modal.querySelector(".editQuizdata");
    let editQuizdata = new EditQuizdata(container, uniqueID);
    console.log(await editQuizdata.prepare());
    console.log(await editQuizdata.refresh());

    let ok = modal.querySelector("#ok");
    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    ok.addEventListener("click", async (target) => {
      await myModal.hide();
      modalOuter.remove();
      resolve(true);
    });

    let close = modal.querySelector("#close");
    close.addEventListener("click", async (target) => {
      await myModal.hide();
      modalOuter.remove();
      resolve(false);
    });
  });
}

export async function changeAnswersMulitpleChoice(cardData) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
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
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">Antworten bearbeiten</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
            </div>
            <div class="modal-body">
              <div class="programContainer">
                <div class="header">
                
                </div>
                <div class="answersList">

                </div>
              </div>
             
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

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class EditAnswers {
      constructor(cardData, container) {
        this.cardData = cardData;
        this.answerArray = cardData["answers"];
        this.correctAnswerID;
        this.header;
        this.list;

        this.container = container;
      }

      async refresh(refreshAnswers = true) {
        //Set general
        this.answerArray = this.cardData["answers"];
        this.correctAnswerID = this.cardData["correctAnswerID"];

        this.header = this.container.querySelector(".header");
        this.list = this.container.querySelector(".answersList");

        this.header.innerHTML = `
              <button type="button" class="btn btn-info" id="addBtn">Antwort hinzufügen</button>
              <button type="button" class="btn btn-secondary" id="refreshBtn">Aktualisieren</button>
              `;

        console.log(this.header);

        let addBtn = this.header.querySelector("#addBtn");
        addBtn = Utils.removeAllEventlisteners(addBtn);
        addBtn.addEventListener("click", async () => {
          let type = await Utils.getUserInput(
            "Antwort hinzufügen",
            "Welche Art von Antwort möchtest du hinzufügen?",
            false,
            "select",
            false,
            false,
            true,
            { Text: "text", Medium: "media" },
            false,
            false
          );
          if (!type) return;
          if (type === "text") {
            this.answerArray = Utils.addToArray(this.answerArray, {
              type: "text",
              size: "middle",
            });
          } else if (type === "media") {
            this.answerArray = Utils.addToArray(this.answerArray, {
              type: "media",
              size: "middle",
            });
          }
          this.refresh(true);
        });

        let refreshBtn = this.header.querySelector("#refreshBtn");
        refreshBtn = Utils.removeAllEventlisteners(refreshBtn);
        refreshBtn.addEventListener("click", () => {
          this.refresh(true);
        });
        if (refreshAnswers) {
          this.refreshAnswers(true);
        }
        console.log("refreshed successfully");
        return true;
      }

      refreshAnswers(refreshAll = true, cardToRefresh = false) {
        let answerCards = new Array();
        console.log(
          "Card Data:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );

        if (refreshAll) {
          this.list.innerHTML = ``;
          answerCards = this.answerArray;
          //If broken set new array
          if (!answerCards || typeof answerCards != typeof new Array())
            answerCards = new Array();

          //sort by id and points
          answerCards = answerCards.sort((a, b) => {
            if (!a.answerID) return 0;
            if (!b.answerID) return 0;
            if (a.answerID == b.answerID) {
              return 0;
            }
            if (a.answerID > b.answerID) {
              return 1;
            } else {
              return -1;
            }
          });
        } else {
          //Get specific card to refresh
          let answerToRefresh = this.answerArray.find((answer) => {
            if (answer.answerID == cardToRefresh) {
              return answer;
            }
          }, false);
          answerCards = Utils.addToArray(answerCards, answerToRefresh);
          console.log(answerCards);
        }

        let counter = 1;

        for (const currentAnswer of answerCards) {
          let answerID;
          let item;
          if (refreshAll) {
            answerID = counter;
            currentAnswer.answerID = counter;

            item = document.createElement("div");
            item.classList.add("collapse", "item");
            item.setAttribute("data-answerID", answerID);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
            this.list.appendChild(item);
          } else {
            answerID = currentAnswer.answerID;
            item = this.list.querySelector(`div[data-answerID='${answerID}']`);
            item.classList.add("collapse", "item");
            item.setAttribute("data-cardid", answerID);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
          }

          console.log("current answer", currentAnswer, item);
          let answerType = currentAnswer["type"];
          console.log("answerType", answerType);
          if (answerType === "text") {
            item.innerHTML = `
                  <div class="header">
                  <div class="form-check" id="correctAnswer">
                      <input class="form-check-input" type="checkbox" id="checkbox">
                      <label class="form-check-label">
                          Richtige Antwort
                      </label>
                  </div>
                  <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
                    <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
                    <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
                  </div>
                  <label class="form-check-label" for="moveCard">Antwortrehenfolge ändern</label>
                  <div class="form-control">
                    <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1" value="${currentAnswer.answerID}">
                    <label class="form-check-label">
                        Id der Antwort (Für Sortierung genutzt)
                    </label>
                    </div>
                  <button type="button" class="btn btn-secondary" id="copyAnswer">Karte kopieren</button>
                  <button type="button" class="btn btn-danger" id="deleteAnswer">Antwort löschen</button>
              </div>
              <div class="body">
                  <div id="cardType">Typ: Text</div>
                  <div id="options">
                      <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                      <ul class="collapse" id="optionsList">
                          <li id="size">
                            <label for="selectInput" class="form-label">Größe der Schrift auswählen</label>
                              <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                                <option data-value="large" selected="selected">groß (wenig Text)</option>  
                                <option data-value="middle" selected="selected">mittel (Normal)</option>
                                <option data-value="small" selected="selected">klein (viel Text)</option>
                              </select>
                            
                          </li>
                      </ul>
                  </div>
                  <div id="text">
                  <h5>Antwortmöglichkeit (Text)</h5>
                      <div class="input-group mb-3" id="task">
                        <textarea class="form-control" id="textInput" rows="3" aria-label="Antwortmöglichkeit eingeben" placeholder="Antwort...">${currentAnswer.text}</textarea>
                      </div>
                  </div>
              </div>
                  `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Choose as correct answer
            let correctAnswerCheckbox = item.querySelector(
              ".header #correctAnswer #checkbox"
            );
            correctAnswerCheckbox.checked =
              currentAnswer.answerID == this.cardData["correctAnswerID"];
            correctAnswerCheckbox.addEventListener("click", () => {
              if (correctAnswerCheckbox.checked) {
                this.cardData["correctAnswerID"] = currentAnswer.answerID;
              }
              for (const current of this.answerArray) {
                this.refreshAnswers(false, current.answerID);
              }
            });

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                moveObject(
                  action,
                  this.answerArray,
                  "answerID",
                  currentAnswer.answerID
                );
                this.refreshAnswers(true);
              });
            }

            //answerID
            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = currentAnswer.answerID;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentAnswer.answerID = Number(idNumberInput.value);
              }
            });

            //copyCard
            let copyAnswerBtn = itemHeader.querySelector("#copyAnswer");
            copyAnswerBtn.addEventListener("click", () => {
              this.answerArray = Utils.addToArray(
                this.answerArray,
                Utils.makeJSON(JSON.stringify(currentAnswer))
              );
              this.cardData.answers = this.answerArray;
              this.refreshAnswers();
              this.logData();
            });

            //delete
            let deleteAnswerBtn = itemHeader.querySelector("#deleteAnswer");
            deleteAnswerBtn.addEventListener("click", () => {
              this.cardData["answers"] = Utils.removeFromArray(
                this.cardData["answers"],
                currentAnswer
              );
              this.logData();
              this.refresh(true);
            });

            //Options
            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //text size
            let textSizeSelect =
              optionsContainer.querySelector("#size #selectInput");
            console.log(textSizeSelect);
            //set
            Utils.selectListSelectItemBySelector(
              textSizeSelect,
              "data-value",
              currentAnswer["size"]
            );
            textSizeSelect.addEventListener("change", () => {
              currentAnswer["size"] =
                textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                  "data-value"
                );
              this.logData();
            });

            //Text input
            let textInput = itemBody.querySelector("#text #task #textInput");
            textInput.value = currentAnswer["text"] ?? "";
            textInput.addEventListener("input", () => {
              currentAnswer["text"] = textInput.value;
              this.logData();
            });
            this.logData();
          } else if (answerType === "media") {
            item.innerHTML = `
            <div class="header">
            <div class="form-check" id="correctAnswer">
                <input class="form-check-input" type="checkbox" id="checkbox">
                <label class="form-check-label">
                    Richtige Antwort
                </label>
            </div>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Antwortrehenfolge ändern</label>
            <div class="form-control">
              <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1" value="${currentAnswer.answerID}">
              <label class="form-check-label">
                  Id der Antwort (Für Sortierung genutzt)
              </label>
              </div>
            <button type="button" class="btn btn-secondary" id="copyAnswer">Karte kopieren</button>
            <button type="button" class="btn btn-danger" id="deleteAnswer">Antwort löschen</button>
        </div>
        <div class="body">
            <div id="cardType">Typ: Medien</div>
            <div id="options">
                <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                <ul class="collapse" id="optionsList">
                    <li id="size">
                      <label for="selectInput" class="form-label">Größe auswählen</label>
                        <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                          <option data-value="large" selected="selected">groß</option>  
                          <option data-value="middle" selected="selected">mittel</option>
                          <option data-value="small" selected="selected">klein</option>
                        </select>
                      
                    </li>
                    <li id="volume">
                      <label for="selectInput" class="form-label">Lautstärke (Standard) z.B. für zu laute Audios oder Videos</label>
                      <div class="slidecontainer">
                        <input type="range" min="1" max="100" value="100" step="1" id="rangeInput">
                        <span class="currentValue"></span> <span>%</span>
                      </div>
                      
                    </li>
                </ul>
            </div>
            <div id="media">
            <h5>Antwortmöglichkeit (Medien)</h5>
              <button class="btn btn-primary btn-sm addBtn">Medium auswählen</button>
              <h5>Vorschau</h5>
              <div class="previewContainer"></div>
            </div>
        </div>
            `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Choose as correct answer
            let correctAnswerCheckbox = item.querySelector(
              ".header #correctAnswer #checkbox"
            );
            correctAnswerCheckbox.checked =
              currentAnswer.answerID == this.cardData["correctAnswerID"];
            correctAnswerCheckbox.addEventListener("click", () => {
              if (correctAnswerCheckbox.checked) {
                this.cardData["correctAnswerID"] = currentAnswer.answerID;
              }
              for (const current of this.answerArray) {
                this.refreshAnswers(false, current.answerID);
              }
            });

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                moveObject(
                  action,
                  this.answerArray,
                  "answerID",
                  currentAnswer.answerID
                );
                this.refreshAnswers(true);
              });
            }

            //answerID
            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = currentAnswer.answerID;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentAnswer.answerID = Number(idNumberInput.value);
                console.log(idNumberInput.value);
              }
            });

            //copyCard
            let copyAnswerBtn = itemHeader.querySelector("#copyAnswer");
            copyAnswerBtn.addEventListener("click", () => {
              this.answerArray = Utils.addToArray(
                this.answerArray,
                Utils.makeJSON(JSON.stringify(currentAnswer))
              );
              this.cardData.answers = this.answerArray;
              this.refresh(true);
              this.logData();
            });

            //delete
            let deleteAnswerBtn = itemHeader.querySelector("#deleteAnswer");
            deleteAnswerBtn.addEventListener("click", () => {
              this.cardData["answers"] = Utils.removeFromArray(
                this.cardData["answers"],
                currentAnswer
              );
              this.logData();
              this.refresh(true);
            });

            //Options
            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //size
            let textSizeSelect =
              optionsContainer.querySelector("#size #selectInput");
            console.log(textSizeSelect);
            Utils.selectListSelectItemBySelector(
              textSizeSelect,
              "data-value",
              currentAnswer["size"]
            );
            textSizeSelect.addEventListener("change", () => {
              currentAnswer["size"] =
                textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                  "data-value"
                );
              this.logData();
            });

            //volume
            let volumeSlider = optionsContainer.querySelector(
              "#volume .slidecontainer #rangeInput"
            );
            let volumeSliderCurrentValue = optionsContainer.querySelector(
              "#volume .slidecontainer .currentValue"
            );
            if (currentAnswer["volume"]) {
              volumeSlider.value = currentAnswer["volume"];
              volumeSliderCurrentValue.innerText = currentAnswer["volume"];
            }
            volumeSliderCurrentValue.innerText = currentAnswer["volume"] ?? 100;
            console.log(volumeSlider);
            volumeSlider.addEventListener("input", () => {
              console.log("volume:", Number(volumeSlider.value));
              currentAnswer["volume"] = Number(volumeSlider.value);
              volumeSliderCurrentValue.innerText = volumeSlider.value;
            });

            //add / change media
            let previewContainer = itemBody.querySelector(
              "#media .previewContainer"
            );
            Utils.setMedia(currentAnswer, previewContainer, false);
            let changeMediaBtn = itemBody.querySelector("#media .addBtn");
            changeMediaBtn.addEventListener("click", async () => {
              let media = await pickMedia(false, false);
              console.log("Choosen Media:", media);
              delete currentAnswer["volume"];
              if (!media) {
                currentAnswer["mediaID"] = false;
              } else {
                currentAnswer["mediaID"] = media["mediaID"] ?? false;
                currentAnswer["volume"] = 100;
              }
              this.refreshAnswers(false, currentAnswer.mediaID);
            });

            this.logData();
          }
          counter++;
        }
        return true;
      }

      logData() {
        console.log(
          "Current cardData:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );
        // alert(this.quizJSON["options"].showTime)
        console.log(
          "Passed in and changed is the same reference:",
          Object.is(cardData, this.cardData)
        );
      }
    }

    let programContainer = modal.querySelector(".programContainer");
    let editAnswers = new EditAnswers(cardData, programContainer);
    editAnswers.refresh(true);

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      console.log(
        "before return:",
        Utils.makeJSON(JSON.stringify(editAnswers.cardData))
      );
      resolve(editAnswers.cardData);
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

export async function changeAnswersMulitpleChoiceMulti(cardData) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
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
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">Antworten bearbeiten</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
            </div>
            <div class="modal-body">
              <div class="programContainer">
                <div class="header">
                
                </div>
                <div class="answersList">

                </div>
              </div>
             
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

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class EditAnswers {
      constructor(cardData, container) {
        this.cardData = cardData;
        this.answerArray;
        this.header;
        this.list;

        this.container = container;
      }

      async refresh(refreshAnswers = true) {
        //Set general
        this.answerArray = this.cardData["answers"] ?? new Array();
        this.correctAnswersIDs =
          this.cardData["correctAnswersIDs"] ?? new Array();

        this.header = this.container.querySelector(".header");
        this.list = this.container.querySelector(".answersList");

        this.header.innerHTML = `
              <button type="button" class="btn btn-info" id="addBtn">Antwort hinzufügen</button>
              <button type="button" class="btn btn-secondary" id="refreshBtn">Aktualisieren</button>
              `;

        console.log(this.header);

        let addBtn = this.header.querySelector("#addBtn");
        addBtn = Utils.removeAllEventlisteners(addBtn);
        addBtn.addEventListener("click", async () => {
          let type = await Utils.getUserInput(
            "Antwort hinzufügen",
            "Welche Art von Antwort möchtest du hinzufügen?",
            false,
            "select",
            false,
            false,
            true,
            { Text: "text", Medium: "media" },
            false,
            false
          );
          if (!type) return;
          if (type === "text") {
            this.answerArray = Utils.addToArray(this.answerArray, {
              type: "text",
              size: "middle",
            });
          } else if (type === "media") {
            this.answerArray = Utils.addToArray(this.answerArray, {
              type: "media",
              size: "middle",
            });
          }
          this.refresh(true);
        });

        let refreshBtn = this.header.querySelector("#refreshBtn");
        refreshBtn = Utils.removeAllEventlisteners(refreshBtn);
        refreshBtn.addEventListener("click", () => {
          this.refresh(true);
        });
        if (refreshAnswers) {
          this.refreshAnswers(true);
        }
        console.log("refreshed successfully");
        return true;
      }

      refreshAnswers(refreshAll = true, cardToRefresh = false) {
        let answerCards = new Array();
        console.log(
          "Card Data:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );

        if (refreshAll) {
          this.list.innerHTML = ``;
          answerCards = this.answerArray;
          //If broken set new array
          if (!answerCards || typeof answerCards != typeof new Array())
            answerCards = new Array();

          //sort by id and points
          answerCards = answerCards.sort((a, b) => {
            if (!a.answerID) return 0;
            if (!b.answerID) return 0;
            if (a.answerID == b.answerID) {
              return 0;
            }
            if (a.answerID > b.answerID) {
              return 1;
            } else {
              return -1;
            }
          });
        } else {
          //Get specific card to refresh
          let answerToRefresh = this.answerArray.find((answer) => {
            if (answer.answerID == cardToRefresh) {
              return answer;
            }
          }, false);
          answerCards = Utils.addToArray(answerCards, answerToRefresh);
          console.log(answerCards);
        }

        let counter = 1;

        for (const currentAnswer of answerCards) {
          let answerID;
          let item;
          if (refreshAll) {
            answerID = counter;
            currentAnswer.answerID = counter;

            item = document.createElement("div");
            item.classList.add("collapse", "item");
            item.setAttribute("data-answerID", answerID);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
            this.list.appendChild(item);
          } else {
            answerID = currentAnswer.answerID;
            item = this.list.querySelector(`div[data-answerID='${answerID}']`);
            item.classList.add("collapse", "item");
            item.setAttribute("data-cardid", answerID);
            let collapse = bootstrap.Collapse.getOrCreateInstance(item);
            collapse.show();
            item.addEventListener("click", (event) => {
              if (event.target === item) {
                collapse.toggle();
              }
            });
          }

          console.log("current answer", currentAnswer, item);
          let answerType = currentAnswer["type"];
          console.log("answerType", answerType);
          if (answerType === "text") {
            item.innerHTML = `
                  <div class="header">
                  <div class="form-check" id="correctAnswer">
                      <input class="form-check-input" type="checkbox" id="checkbox">
                      <label class="form-check-label">
                          Richtige Antwort
                      </label>
                  </div>
                  <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
                    <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
                    <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
                  </div>
                  <label class="form-check-label" for="moveCard">Antwortrehenfolge ändern</label>
                  <div class="form-control">
                    <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1" value="${currentAnswer.answerID}">
                    <label class="form-check-label">
                        Id der Antwort (Für Sortierung genutzt)
                    </label>
                    </div>
                  <button type="button" class="btn btn-secondary" id="copyAnswer">Karte kopieren</button>
                  <button type="button" class="btn btn-danger" id="deleteAnswer">Antwort löschen</button>
              </div>
              <div class="body">
                  <div id="cardType">Typ: Text</div>
                  <div id="options">
                      <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                      <ul class="collapse" id="optionsList">
                          <li id="size">
                            <label for="selectInput" class="form-label">Größe der Schrift auswählen</label>
                              <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                                <option data-value="large" selected="selected">groß (wenig Text)</option>  
                                <option data-value="middle" selected="selected">mittel (Normal)</option>
                                <option data-value="small" selected="selected">klein (viel Text)</option>
                              </select>
                            
                          </li>
                      </ul>
                  </div>
                  <div id="text">
                  <h5>Antwortmöglichkeit (Text)</h5>
                      <div class="input-group mb-3" id="task">
                        <textarea class="form-control" id="textInput" rows="3" aria-label="Antwortmöglichkeit eingeben" placeholder="Antwort...">${currentAnswer.text}</textarea>
                      </div>
                  </div>
              </div>
                  `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Choose as correct answer
            let correctAnswerCheckbox = item.querySelector(
              ".header #correctAnswer #checkbox"
            );
            correctAnswerCheckbox.checked = this.cardData[
              "correctAnswersIDs"
            ]?.includes?.(currentAnswer.answerID);
            correctAnswerCheckbox.addEventListener("click", () => {
              if (correctAnswerCheckbox.checked) {
                this.cardData["correctAnswersIDs"] = Utils.addToArray(
                  this.cardData["correctAnswersIDs"],
                  currentAnswer.answerID,
                  false
                );
              } else {
                this.cardData["correctAnswersIDs"] = Utils.removeFromArray(
                  this.cardData["correctAnswersIDs"],
                  currentAnswer.answerID
                );
              }
              for (const current of this.answerArray) {
                this.refreshAnswers(false, current.answerID);
              }
            });

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                moveObject(
                  action,
                  this.answerArray,
                  "answerID",
                  currentAnswer.answerID
                );
                this.refreshAnswers(true);
              });
            }

            //answerID
            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = currentAnswer.answerID;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentAnswer.answerID = Number(idNumberInput.value);
              }
            });

            //copyCard
            let copyAnswerBtn = itemHeader.querySelector("#copyAnswer");
            copyAnswerBtn.addEventListener("click", () => {
              this.answerArray = Utils.addToArray(
                this.answerArray,
                Utils.makeJSON(JSON.stringify(currentAnswer))
              );
              this.cardData.answers = this.answerArray;
              this.refreshAnswers();
              this.logData();
            });

            //delete
            let deleteAnswerBtn = itemHeader.querySelector("#deleteAnswer");
            deleteAnswerBtn.addEventListener("click", () => {
              this.cardData["answers"] = Utils.removeFromArray(
                this.cardData["answers"],
                currentAnswer
              );
              this.logData();
              this.refresh(true);
            });

            //Options
            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //text size
            let textSizeSelect =
              optionsContainer.querySelector("#size #selectInput");
            console.log(textSizeSelect);
            //set
            Utils.selectListSelectItemBySelector(
              textSizeSelect,
              "data-value",
              currentAnswer["size"]
            );
            textSizeSelect.addEventListener("change", () => {
              currentAnswer["size"] =
                textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                  "data-value"
                );
              this.logData();
            });

            //Text input
            let textInput = itemBody.querySelector("#text #task #textInput");
            textInput.value = currentAnswer["text"] ?? "";
            textInput.addEventListener("input", () => {
              currentAnswer["text"] = textInput.value;
              this.logData();
            });
            this.logData();
          } else if (answerType === "media") {
            item.innerHTML = `
            <div class="header">
            <div class="form-check" id="correctAnswer">
                <input class="form-check-input" type="checkbox" id="checkbox">
                <label class="form-check-label">
                    Richtige Antwort
                </label>
            </div>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Antwortrehenfolge ändern</label>
            <div class="form-control">
              <input type="number" class="form-control col-3" aria-label="ID festlegen" id="id" placeholder="z.B. 1" value="${currentAnswer.answerID}">
              <label class="form-check-label">
                  Id der Antwort (Für Sortierung genutzt)
              </label>
              </div>
            <button type="button" class="btn btn-secondary" id="copyAnswer">Karte kopieren</button>
            <button type="button" class="btn btn-danger" id="deleteAnswer">Antwort löschen</button>
        </div>
        <div class="body">
            <div id="cardType">Typ: Medien</div>
            <div id="options">
                <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                <ul class="collapse" id="optionsList">
                    <li id="size">
                      <label for="selectInput" class="form-label">Größe auswählen</label>
                        <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                          <option data-value="large" selected="selected">groß</option>  
                          <option data-value="middle" selected="selected">mittel</option>
                          <option data-value="small" selected="selected">klein</option>
                        </select>
                      
                    </li>
                    <li id="volume">
                      <label for="selectInput" class="form-label">Lautstärke (Standard) z.B. für zu laute Audios oder Videos</label>
                      <div class="slidecontainer">
                        <input type="range" min="1" max="100" value="100" step="1" id="rangeInput">
                        <span class="currentValue"></span> <span>%</span>
                      </div>
                      
                    </li>
                </ul>
            </div>
            <div id="media">
            <h5>Antwortmöglichkeit (Medien)</h5>
              <button class="btn btn-primary btn-sm addBtn">Medium auswählen</button>
              <h5>Vorschau</h5>
              <div class="previewContainer"></div>
            </div>
        </div>
            `;
            let itemHeader = item.querySelector(".header");
            let itemBody = item.querySelector(".body");

            //Choose as correct answer
            let correctAnswerCheckbox = item.querySelector(
              ".header #correctAnswer #checkbox"
            );
            correctAnswerCheckbox.checked = this.cardData[
              "correctAnswersIDs"
            ]?.includes?.(currentAnswer.answerID);
            correctAnswerCheckbox.addEventListener("click", () => {
              if (correctAnswerCheckbox.checked) {
                this.cardData["correctAnswersIDs"] = Utils.addToArray(
                  this.cardData["correctAnswersIDs"],
                  currentAnswer.answerID,
                  false
                );
              } else {
                this.cardData["correctAnswersIDs"] = Utils.removeFromArray(
                  this.cardData["correctAnswersIDs"],
                  currentAnswer.answerID
                );
              }
              for (const current of this.answerArray) {
                this.refreshAnswers(false, current.answerID);
              }
            });

            //Move card
            let moveBtns = itemHeader.querySelectorAll("#moveCard button");
            for (const currentBtn of moveBtns) {
              currentBtn.addEventListener("click", () => {
                let action = currentBtn.getAttribute("data-action");
                moveObject(
                  action,
                  this.answerArray,
                  "answerID",
                  currentAnswer.answerID
                );
                this.refreshAnswers(true);
              });
            }

            //answerID
            let idNumberInput = itemHeader.querySelector("#id");
            idNumberInput.value = currentAnswer.answerID;
            idNumberInput.addEventListener("input", () => {
              if (!Utils.isEmptyInput(idNumberInput.value)) {
                currentAnswer.answerID = Number(idNumberInput.value);
                console.log(idNumberInput.value);
              }
            });

            //copyCard
            let copyAnswerBtn = itemHeader.querySelector("#copyAnswer");
            copyAnswerBtn.addEventListener("click", () => {
              this.answerArray = Utils.addToArray(
                this.answerArray,
                Utils.makeJSON(JSON.stringify(currentAnswer))
              );
              this.cardData.answers = this.answerArray;
              this.refresh(true);
              this.logData();
            });

            //delete
            let deleteAnswerBtn = itemHeader.querySelector("#deleteAnswer");
            deleteAnswerBtn.addEventListener("click", () => {
              this.cardData["answers"] = Utils.removeFromArray(
                this.cardData["answers"],
                currentAnswer
              );
              this.logData();
              this.refresh(true);
            });

            //Options
            let optionsContainer = itemBody.querySelector("#options");
            let toggleOptionsBtn =
              optionsContainer.querySelector("#toggleOptions");
            toggleOptionsBtn.addEventListener("click", () => {
              let collapse = bootstrap.Collapse.getOrCreateInstance(
                optionsContainer.querySelector("#optionsList")
              );
              collapse.toggle();
            });

            //size
            let textSizeSelect =
              optionsContainer.querySelector("#size #selectInput");
            console.log(textSizeSelect);
            Utils.selectListSelectItemBySelector(
              textSizeSelect,
              "data-value",
              currentAnswer["size"]
            );
            textSizeSelect.addEventListener("change", () => {
              currentAnswer["size"] =
                textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                  "data-value"
                );
              this.logData();
            });

            //volume
            let volumeSlider = optionsContainer.querySelector(
              "#volume .slidecontainer #rangeInput"
            );
            let volumeSliderCurrentValue = optionsContainer.querySelector(
              "#volume .slidecontainer .currentValue"
            );
            if (currentAnswer["volume"]) {
              volumeSlider.value = currentAnswer["volume"];
              volumeSliderCurrentValue.innerText = currentAnswer["volume"];
            }
            volumeSliderCurrentValue.innerText = currentAnswer["volume"] ?? 100;
            console.log(volumeSlider);
            volumeSlider.addEventListener("input", () => {
              console.log("volume:", Number(volumeSlider.value));
              currentAnswer["volume"] = Number(volumeSlider.value);
              volumeSliderCurrentValue.innerText = volumeSlider.value;
            });

            //add / change media
            let previewContainer = itemBody.querySelector(
              "#media .previewContainer"
            );
            Utils.setMedia(currentAnswer, previewContainer, false);
            let changeMediaBtn = itemBody.querySelector("#media .addBtn");
            changeMediaBtn.addEventListener("click", async () => {
              let media = await pickMedia(false, false);
              console.log("Choosen Media:", media);
              delete currentAnswer["volume"];
              if (!media) {
                currentAnswer["mediaID"] = false;
              } else {
                currentAnswer["mediaID"] = media["mediaID"] ?? false;
                currentAnswer["volume"] = 100;
              }
              this.refreshAnswers(false, currentAnswer.mediaID);
            });

            this.logData();
          }
          counter++;
        }
        return true;
      }

      logData() {
        console.log(
          "Current cardData:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );
        // alert(this.quizJSON["options"].showTime)
        console.log(
          "Passed in and changed is the same reference:",
          Object.is(cardData, this.cardData)
        );
      }
    }

    let programContainer = modal.querySelector(".programContainer");
    let editAnswers = new EditAnswers(cardData, programContainer);
    editAnswers.refresh(true);

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      console.log(
        "before return:",
        Utils.makeJSON(JSON.stringify(editAnswers.cardData))
      );
      resolve(editAnswers.cardData);
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

export async function editMedia(cardData) {
  return new Promise((resolve, reject) => {
    //Create Modal container if doesnt exist
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
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel">Medien bearbeiten</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
            </div>
            <div class="modal-body">
              <div class="programContainer">
                <div class="header">

                </div>
                <div class="sectionList">

                </div>
              </div>
             
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

    let close = modal.querySelector("#close");
    let yes = modal.querySelector("#yes");
    let no = modal.querySelector("#no");

    var myModal = new bootstrap.Modal(modal);
    myModal.show();

    class EditMedia {
      constructor(cardData, container) {
        this.cardData = cardData;
        this.mediaArray = cardData["media"];
        this.correctAnswerID;
        this.header;
        this.list;

        this.container = container;
      }

      async refresh(refreshSections = true) {
        //Set general
        this.mediaArray = this.cardData["media"];

        this.header = this.container.querySelector(".header");
        this.list = this.container.querySelector(".sectionList");

        this.header.innerHTML = `
              <button type="button" class="btn btn-info" id="addBtn">Gruppe hinzufügen</button>
              <button type="button" class="btn btn-secondary" id="refreshBtn">Aktualisieren</button>
              `;

        console.log(this.header);

        let addBtn = this.header.querySelector("#addBtn");
        addBtn = Utils.removeAllEventlisteners(addBtn);
        addBtn.addEventListener("click", async () => {
          this.cardData["media"] = Utils.addToArray(
            this.cardData["media"],
            [],
            true
          );
          this.refresh(true);
        });

        let refreshBtn = this.header.querySelector("#refreshBtn");
        refreshBtn = Utils.removeAllEventlisteners(refreshBtn);
        refreshBtn.addEventListener("click", () => {
          this.refresh();
        });
        if (refreshSections) {
          this.refreshSections(true, false, true, true, false);
        }
        console.log("refreshed successfully");
        return true;
      }

      refreshSections(
        refreshAllSections = true,
        sectionToRefresh = false,
        refreshAllItems = false,
        itemToRefresh = false
      ) {
        let mediaCards = new Array();
        console.log(
          "Card Data:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );

        if (refreshAllSections) {
          this.list.innerHTML = ``;
          mediaCards = this.mediaArray;
          //If broken set new array
          if (!mediaCards || typeof mediaCards != typeof new Array())
            mediaCards = new Array();
        } else {
          //Get specific card to refresh
          let section = this.mediaArray[sectionToRefresh];
          mediaCards = Utils.addToArray(mediaCards, section);
          console.log(mediaCards);
        }

        for (let [currentSectionKey, currentSection] of Object.entries(
          mediaCards
        )) {
          currentSectionKey = Number(currentSectionKey);
          console.log(
            "current section key: ",
            currentSectionKey,
            "current section value: ",
            currentSection
          );
          let sectionItem;
          if (refreshAllSections) {
            sectionItem = document.createElement("div");
            sectionItem.classList.add("collapse", "item");
            sectionItem.setAttribute("data-sectionid", currentSectionKey);
            let collapse = bootstrap.Collapse.getOrCreateInstance(sectionItem);
            collapse.show();
            sectionItem.addEventListener("click", (event) => {
              if (event.target === sectionItem) {
                collapse.toggle();
              }
            });
            this.list.appendChild(sectionItem);
          } else {
            sectionItem = this.list.querySelector(
              `div[data-sectionid='${sectionToRefresh}']`
            );
            sectionItem.classList.add("collapse", "item");
            sectionItem.setAttribute("data-sectionid", sectionToRefresh);
            let collapse = bootstrap.Collapse.getOrCreateInstance(sectionItem);
            collapse.show();
            sectionItem.addEventListener("click", (event) => {
              if (event.target === sectionItem) {
                collapse.toggle();
              }
            });
          }
          console.log("current section", currentSection, sectionItem);
          if (refreshAllItems) {
            sectionItem.innerHTML = `
            <div class="header">
            <button type="button" class="btn btn-success" id="addItem">Element erstellen</button>
            <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
              <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
              <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
            </div>
            <label class="form-check-label" for="moveCard">Gruppenreihenfolge ändern ändern</label>
            <button type="button" class="btn btn-danger" id="deleteSection">Gruppe löschen</button>
        </div>
        <div class="body">
            <div class="itemList">
              ${currentSectionKey}${JSON.stringify(currentSection, null, 2)}
            </div>
        </div>
            `;
          }
          let itemHeader = sectionItem.querySelector(".header");
          let itemBody = sectionItem.querySelector(".body");

          //Move card
          let moveBtns = itemHeader.querySelectorAll("#moveCard button");
          for (const currentBtn of moveBtns) {
            currentBtn.addEventListener("click", () => {
              let action = currentBtn.getAttribute("data-action");
              console.log(action);
              this.logData();
              if (action === "upwards") {
                if (!this.mediaArray[currentSectionKey - 1]) return;
                Utils.swapArrayElements(
                  this.mediaArray,
                  currentSectionKey,
                  currentSectionKey - 1
                );
              } else if (action === "downwards") {
                if (!this.mediaArray[currentSectionKey + 1]) return;
                Utils.swapArrayElements(
                  this.mediaArray,
                  currentSectionKey,
                  currentSectionKey + 1
                );
              }
              this.refreshSections(true, false, true, false);
            });
          }

          //create
          let createSectionBtn = itemHeader.querySelector("#addItem");
          createSectionBtn.addEventListener("click", async () => {
            let type = await Utils.getUserInput(
              "Antwort hinzufügen",
              "Welche Art von Antwort möchtest du hinzufügen?",
              false,
              "select",
              false,
              false,
              true,
              { Text: "text", "Bild / Video / Audio": "media" },
              false,
              false
            );
            if (!type) return;

            this.cardData["media"][currentSectionKey] = Utils.addToArray(
              this.cardData["media"][currentSectionKey],
              { type: type, size: "middle" }
            );
            this.logData();
            this.refresh(true);
          });

          //delete
          let deleteSectionBtn = itemHeader.querySelector("#deleteSection");
          deleteSectionBtn.addEventListener("click", () => {
            this.cardData["media"] = Utils.removeFromArray(
              this.cardData["media"],
              currentSection
            );
            this.logData();
            this.refresh(true);
          });

          // update items ---------------------------------------------------------------
          let itemCards = new Array();
          let itemList = itemBody.querySelector(".itemList");

          if (refreshAllItems) {
            itemList.innerHTML = ``;
            itemCards = this.mediaArray[currentSectionKey];
            //If broken set new array
            if (!itemCards || typeof itemCards != typeof new Array())
              itemCards = new Array();
          } else {
            //Get specific card to refresh
            let torefreshData =
              this.mediaArray?.[currentSectionKey]?.[itemToRefresh];
            itemCards = Utils.addToArray(itemCards, torefreshData);
            console.log("to refresh data =>", torefreshData);
          }

          console.log("item CARDS to refresh", itemCards);
          for (let [currentItemKey, currentItem] of Object.entries(itemCards)) {
            currentItemKey = Number(currentItemKey);
            if (!currentItem) continue;
            console.log(
              "current item key: ",
              currentItemKey,
              "current item value: ",
              currentItem
            );
            let item;
            if (refreshAllItems) {
              item = document.createElement("div");
              item.classList.add("collapse", "item");
              item.setAttribute("data-itemid", currentItemKey);
              let collapse = bootstrap.Collapse.getOrCreateInstance(item);
              collapse.show();
              item.addEventListener("click", (event) => {
                if (event.target === item) {
                  collapse.toggle();
                }
              });
              itemList.appendChild(item);
            } else {
              item = itemList.querySelector(
                `div[data-itemid='${itemToRefresh}']`
              );
              item.classList.add("collapse", "item");
              console.log("item =>", item);
              item.setAttribute("data-itemid", itemToRefresh);
              let collapse = bootstrap.Collapse.getOrCreateInstance(item);
              collapse.show();
              item.addEventListener("click", (event) => {
                if (event.target === item) {
                  collapse.toggle();
                }
              });
            }
            if (currentItem["type"] === "text") {
              console.log("current section", currentItem, item);
              item.innerHTML = `
                    <div class="header">
                    <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
                      <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
                      <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
                    </div>
                    <label class="form-check-label" for="moveCard">Reihenfolge ändern ändern</label>
                    <button type="button" class="btn btn-danger" id="deleteItem">entfernen</button>
                </div>
                <div class="body">
                    <div class="itemList">
                      <div id="type">Typ: Text</div>
                      <div id="options">
                          <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                          <ul class="collapse" id="optionsList">
                              <li id="size">
                                <label for="selectInput" class="form-label">Größe auswählen</label>
                                  <select class="form-select" aria-label="Größe der Schrift auswählen - Dropdown-Menü" id="selectInput">
                                    <option data-value="large" selected="selected">groß</option>  
                                    <option data-value="middle" selected="selected">mittel</option>
                                    <option data-value="small" selected="selected">klein</option>
                                  </select>
                                
                              </li>
                          </ul>
                      </div>
                      <div id="text">
                      <h5>Text</h5>
                        <textarea class="form-control" id="textInput" rows="3" aria-label="Text eingeben" placeholder="Text...">${
                          currentItem.text ?? ""
                        }</textarea>
                      </div>
                    </div>
                </div>
                    `;
              let itemHeader = item.querySelector(".header");
              let itemBody = item.querySelector(".body");

              //delete
              let deleteAnswerBtn = itemHeader.querySelector("#deleteItem");
              deleteAnswerBtn.addEventListener("click", () => {
                this.mediaArray[currentSectionKey] = Utils.removeFromArray(
                  this.mediaArray[currentSectionKey],
                  currentItem
                );
                this.logData();
                this.refresh(true);
              });

              //Move card
              let moveBtns = itemHeader.querySelectorAll("#moveCard button");
              for (const currentBtn of moveBtns) {
                currentBtn.addEventListener("click", () => {
                  let action = currentBtn.getAttribute("data-action");
                  console.log(action);
                  this.logData();
                  if (action === "upwards") {
                    if (
                      !this.mediaArray?.[currentSectionKey]?.[
                        currentItemKey - 1
                      ]
                    )
                      return;
                    Utils.swapArrayElements(
                      this.mediaArray[currentSectionKey],
                      currentItemKey,
                      currentItemKey - 1
                    );
                  } else if (action === "downwards") {
                    if (
                      !this.mediaArray?.[currentSectionKey]?.[
                        currentItemKey + 1
                      ]
                    )
                      return;
                    Utils.swapArrayElements(
                      this.mediaArray[currentSectionKey],
                      currentItemKey,
                      currentItemKey + 1
                    );
                  }
                  this.refreshSections(false, currentSectionKey, true, false);
                });
              }

              //Options
              let optionsContainer = itemBody.querySelector("#options");
              let toggleOptionsBtn =
                optionsContainer.querySelector("#toggleOptions");
              toggleOptionsBtn.addEventListener("click", () => {
                let collapse = bootstrap.Collapse.getOrCreateInstance(
                  optionsContainer.querySelector("#optionsList")
                );
                collapse.toggle();
              });
              //text size
              let textSizeSelect =
                optionsContainer.querySelector("#size #selectInput");
              Utils.selectListSelectItemBySelector(
                textSizeSelect,
                "data-value",
                currentItem["size"]
              );
              textSizeSelect.addEventListener("change", () => {
                currentItem["size"] =
                  textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                    "data-value"
                  );
                this.logData();
              });
              //Text input
              let textInput = itemBody.querySelector("#text #textInput");
              textInput.value = currentItem.text ?? "";
              textInput.addEventListener("input", () => {
                currentItem.text = textInput.value;
                this.logData();
              });
            } else {
              console.log("current section", currentItem, item);
              item.innerHTML = `
                    <div class="header">
                    <div class="btn-group-vertical " role="group" id="moveCard" aria-label="Kartenreihenfolge ändern">
                      <button type="button" class="btn btn-outline-primary" data-action="upwards">Hoch &#8593;</button>
                      <button type="button" class="btn btn-outline-primary" data-action="downwards">Runter &#8595;</button>
                    </div>
                    <label class="form-check-label" for="moveCard">Reihenfolge ändern ändern</label>
                    <button type="button" class="btn btn-danger" id="deleteItem">entfernen</button>
                </div>
                <div class="body">
                    <div class="itemList">
                      <div id="type">Typ: Medium</div>
                      <div id="options">
                          <button type="button" class="btn btn-secondary" id="toggleOptions"><img src="../images/icons/zahnrad.svg" alt="" class="icon-auto" style="position: relative; width: 20px;"><span>Optionen</span></button>
                          <ul class="collapse" id="optionsList">
                              <li id="size">
                                <label for="selectInput" class="form-label">Größe auswählen</label>
                                  <select class="form-select" aria-label="Größe auswählen - Dropdown-Menü" id="selectInput">
                                    <option data-value="large" selected="selected">groß</option>  
                                    <option data-value="middle" selected="selected">mittel</option>
                                    <option data-value="small" selected="selected">klein</option>
                                  </select>
                              </li>
                              <li id="volume">
                                <label for="selectInput" class="form-label">Lautstärke (Standard) z.B. für zu laute Audios oder Videos</label>
                                <div class="slidecontainer">
                                  <input type="range" min="1" max="100" value="100" step="1" id="rangeInput">
                                  <span class="currentValue"></span> <span>%</span>
                                </div>
                              </li>
                          </ul>
                      </div>
                      <div id="media">
                        <h5>Antwortmöglichkeit (Medien)</h5>
                        <button class="btn btn-primary btn-sm addBtn">Medium auswählen</button>
                        <h5>Vorschau</h5>
                        <div class="previewContainer"></div>
                    </div>
                    </div>
                </div>
                    `;
              let itemHeader = item.querySelector(".header");
              let itemBody = item.querySelector(".body");

              //delete
              let deleteAnswerBtn = itemHeader.querySelector("#deleteItem");
              deleteAnswerBtn.addEventListener("click", () => {
                this.mediaArray[currentSectionKey] = Utils.removeFromArray(
                  this.mediaArray[currentSectionKey],
                  currentItem
                );
                this.logData();
                this.refresh(true);
              });

              //Move card
              let moveBtns = itemHeader.querySelectorAll("#moveCard button");
              for (const currentBtn of moveBtns) {
                currentBtn.addEventListener("click", () => {
                  let action = currentBtn.getAttribute("data-action");
                  console.log(action);
                  this.logData();
                  if (action === "upwards") {
                    if (
                      !this.mediaArray?.[currentSectionKey]?.[
                        currentItemKey - 1
                      ]
                    )
                      return;
                    Utils.swapArrayElements(
                      this.mediaArray[currentSectionKey],
                      currentItemKey,
                      currentItemKey - 1
                    );
                  } else if (action === "downwards") {
                    if (
                      !this.mediaArray?.[currentSectionKey]?.[
                        currentItemKey + 1
                      ]
                    )
                      return;
                    Utils.swapArrayElements(
                      this.mediaArray[currentSectionKey],
                      currentItemKey,
                      currentItemKey + 1
                    );
                  }
                  this.refreshSections(false, currentSectionKey, true, false);
                });
              }

              //Options
              let optionsContainer = itemBody.querySelector("#options");
              let toggleOptionsBtn =
                optionsContainer.querySelector("#toggleOptions");
              toggleOptionsBtn.addEventListener("click", () => {
                let collapse = bootstrap.Collapse.getOrCreateInstance(
                  optionsContainer.querySelector("#optionsList")
                );
                collapse.toggle();
              });
              //text size
              let textSizeSelect =
                optionsContainer.querySelector("#size #selectInput");
              Utils.selectListSelectItemBySelector(
                textSizeSelect,
                "data-value",
                currentItem["size"]
              );
              textSizeSelect.addEventListener("change", () => {
                currentItem["size"] =
                  textSizeSelect[textSizeSelect.selectedIndex].getAttribute(
                    "data-value"
                  );
                this.logData();
              });

              //volume
              let volumeSlider = optionsContainer.querySelector(
                "#volume .slidecontainer #rangeInput"
              );
              let volumeSliderCurrentValue = optionsContainer.querySelector(
                "#volume .slidecontainer .currentValue"
              );
              if (currentItem["volume"]) {
                volumeSlider.value = currentItem["volume"];
                volumeSliderCurrentValue.innerText = currentItem["volume"];
              }
              volumeSliderCurrentValue.innerText = currentItem["volume"] ?? 100;
              console.log(volumeSlider);
              volumeSlider.addEventListener("input", () => {
                console.log("volume:", Number(volumeSlider.value));
                currentItem["volume"] = Number(volumeSlider.value);
                volumeSliderCurrentValue.innerText = volumeSlider.value;
              });

              //add / change media
              let previewContainer = itemBody.querySelector(
                "#media .previewContainer"
              );
              Utils.setMedia(currentItem, previewContainer, false);
              let changeMediaBtn = itemBody.querySelector("#media .addBtn");
              changeMediaBtn.addEventListener("click", async () => {
                let media = await pickMedia(false, false);
                console.log("Choosen Media:", media);
                delete currentItem["volume"];
                if (!media) {
                  currentItem["mediaID"] = false;
                } else {
                  currentItem["mediaID"] = media["mediaID"] ?? false;
                  currentItem["volume"] = 100;
                }
                this.refreshSections(
                  false,
                  currentSectionKey,
                  false,
                  currentItemKey
                );
              });
            }
          }
        }

        return true;
      }

      logData() {
        console.log(
          "Current cardData:",
          Utils.makeJSON(JSON.stringify(this.cardData))
        );
        // alert(this.quizJSON["options"].showTime)
        console.log(
          "Passed in and changed is the same reference:",
          Object.is(cardData, this.cardData)
        );
      }
    }

    let programContainer = modal.querySelector(".programContainer");
    let editMedia = new EditMedia(cardData, programContainer);
    editMedia.refresh(true);

    yes.addEventListener("click", (target) => {
      myModal.hide();
      modalOuter.remove();
      resolve(editMedia.cardData);
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

let moveObject = (action, outerArray, selectorString = "id", selectorID) => {
  if (action === "upwards") {
    //Previous
    let objecta = outerArray.find(
      (element) => element[selectorString] == parseInt(selectorID) - 1,
      false
    );
    if (!objecta) return false;
    //Current
    let objectb = outerArray.find(
      (element) => element[selectorString] == parseInt(selectorID),
      false
    );
    let objectbID = objectb[selectorString];
    let objectaID = objecta[selectorString];
    objectb[selectorString] = objectaID;
    objecta[selectorString] = objectbID;

    console.log("previous Card =>", objecta, "currentCard =>", objectb);
  } else if (action === "downwards") {
    //next
    let objecta = outerArray.find(
      (element) => element[selectorString] == parseInt(selectorID) + 1,
      false
    );
    if (!objecta) return false;
    //Current
    let objectb = outerArray.find(
      (element) => element[selectorString] == parseInt(selectorID),
      false
    );
    let objectbID = objectb[selectorString];
    let objectaID = objecta[selectorString];
    objectb[selectorString] = objectaID;
    objecta[selectorString] = objectbID;

    console.log("next Card =>", objecta, "currentCard =>", objectb);
  }
};

export async function getThemaFromUser() {
  return new Promise(async (resolve, reject) => {
    let customHTML = `
   
  <button type="button" class="btn btn-secondary" id="addThemaBtn">Thema hinufügen</button>
  <div id="programContainer">
        <button class="btn btn-secondary" id="filterToggle">Filtern</button>
        <div class="filter">
            <div class="selectionFilters">
                <div id="other">
                    <div id="searchWhileTyping">
                        <label for="allowSearchWhileTyping">Während des Tippens suchen</label>
                        <input type="checkbox" id="allowSearchWhileTyping">
                    </div>
                </div>
                <div class="mt-2" id="name">
                                <label for="textInput" class="form-label">Filtern nach Name</label>
                                <input type="text" id="textInput" class="form-control" autocomplete="off">
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
        <table class="styled-table" style="margin: auto !important;" id="results">
            <thead>
                <tr>
                    <th id="select">
                        <div class="heading">Auswählen</div>
                        <hr>
                        <div><input type="checkbox" id="chooseall"> Alle auswählen</div>
                    </th>
                    <th id="name">Auswahl</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="select"><input type="checkbox" id="select"><button id="chooseOnly"><img
                                src="../../images/icons/zahnrad.svg" alt="Auswahl"></button></td>
                    <td id="name">accessLeherpanel</td>
                </tr>
            </tbody>
        </table>


    </div>
 
    `;
  
    const createdModal = Utils.createModal({
      title: "Thema auswählen",
      fullscreen: true,
      verticallyCentered: false,
      modalType: "yes/no",
    });
    let modal = createdModal.modal;
    let bootstrapModal = createdModal.bootstrapModal;
    let modalBody = createdModal.modalBody;
    let modalOuter = createdModal.modalOuter;

    modalBody.innerHTML = customHTML;
  
    let customFunction = function () {
      let addBtn = modalBody.querySelector("#addThemaBtn");
      if (!addBtn) return "no addBtn";
      addBtn.addEventListener("click", async () => {
        if (
          !(await Utils.userHasPermissions([
            "themenverwaltungADDandRemove",
          ]))
        ) {
          return false;
        }
        let userInput = await Utils.getUserInput(
          "Eingabefeld",
          "Wie soll das neue Thema heißen?",
          false,
          "text"
        );
        if (
          userInput === false ||
          Utils.isEmptyInput(userInput, true)
        ) {
          Utils.alertUser(
            "Nachricht",
            "Keine Aktion unternommen",
            false
          );
          return false;
        }
        await Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "themenverwaltung&operation=createThema&thema=" + userInput,
            "/teacher/includes/organisation.inc.php",
            "application/x-www-form-urlencoded",
            true,
            true,
            false,
            true
          )
        );
      });
    };
    customFunction();
    let choosen = await Utils.chooseFromArrayWithSearch(
      [],
      true,
       false,
      false,
      true,
      true,
      "quizverwaltung&operation=other&type=searchThema&input=",
      "/teacher/includes/quizverwaltung.inc.php",
      {limitResults: 15}, true, createdModal
    );
    resolve(choosen);
  })
}