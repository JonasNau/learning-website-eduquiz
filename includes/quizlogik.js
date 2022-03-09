import * as Utils from "./utils.js";
import * as Quizfunctions from "./quizlogik.inc.js";

var quizlogicPhpPath = "./includes/quizlogic.php";
var getAttributesPath = "./includes/getAttributes.php";

class Quiz {
  constructor(container, quizId) {
    this.container = container;
    this.quizId = quizId;
    this.isLoggedIn = false;

    this.quizparams = false;
    this.quizdata = false;
    this.quizCards = false;
    this.totalCards = 0;
    this.currentCardNumber = -1;
    this.currentCardData = false;
    this.currentCardType = false;

    this.preventScoreUpload = false; //If no error data is allowed to be passed in to the database

    this.totalPoints = () => {
      let allCards = this.quizdata["quizCards"] ?? new Array();
      let points = 0;
      for (const currentCard of allCards) {
        points += Number(currentCard["points"]) ?? 0;
      }
      return points;
    };

    this.currentTotalPoints = 0;

    //User Information and Scores
    this.usersMark = 1;
    this.correctCardsNumber = 0;
    this.correctCards = new Array();
    this.wrongCardsNumber = 0;
    this.wrongCards = new Array();
    this.usersChoice = new Array();
    this.usersPoints = 0;
    this.cardStartTime = false;
    this.startTime = false;

    this.choosenAnswers = new Array();

    this.resultObject = {
      quizCards: [],
      timeNeeded: 0,
    };

    //Other
    this.currentQuestionNumber = 0;
    this.userCanChoose = false;

    //QuizCard
    this.cardHeader = false;
    this.cardMain = false;
    this.cardFooter = false;

    this.playSounds = true;
  }

  async showStartSite() {
    return new Promise(async (resolve, reject) => {
      //Check existence of quiz or is not visible
      if (!(await this.getQuizdata())) {
        console.log("Data couldn't be found.");
        resolve(false);
      }

      let formatDescription = (input) => {
        if (
          input == false ||
          input == undefined ||
          input == null ||
          input == ""
        ) {
          return "Nicht vorhanden";
        }
        return input;
      };

      let startSite = `
  <div id="startQuiz">
  <div id="quizinformation">
      <div class="header">
          <div id="klassenstufe"><b>Klassenstufe:</b> <span class="description">${formatDescription(
            this.quizparams["klassenstufe"]
          )}</span></div>
          <div id="fach"><b>Fach:</b> ${formatDescription(
            this.quizparams["fach"]
          )}</div>
          <div id="thema"><b>Thema:</b> ${formatDescription(
            this.quizparams["thema"]
          )}</div>
          <div id="quizname"><b>Name:</b> ${formatDescription(
            this.quizparams["quizname"]
          )}</div>
          <div id="description"><b>Beschreibung:</b> ${formatDescription(
            this.quizparams["description"]
          )}</div>
      </div>
      <div class="footer">
          <div id="created"><b>Erstellt:</b> ${formatDescription(
            this.quizparams["created"]
          )}</div>
          <div id="createdBy"><span id="description"><b>Erstellt von:</b> </span><span id="content"></span></div>
          <div id="changed"><b>Geändert:</b> ${formatDescription(
            this.quizparams["changed"]
          )}</div>
          <div id="changedBy"><span id="description"><b>Geändert von:</b></span> <span id="content"></span></div>
      </div>
  </div>
  <button type="button" id="startQuizBtn" class="btn btn-info">Quiz starten</button>
</div>
  `;
      this.container.innerHTML = startSite;

      //CREATE CONTAINER FOR EASIER ACCESS
      let startQuizContainer = this.container.querySelector("#startQuiz");
      let quizinformationContainer =
        startQuizContainer.querySelector("#quizinformation");

      let createdBy =
        quizinformationContainer.querySelector(".footer #createdBy");
      if (!Utils.emptyVariable(this.quizparams["createdBy"])) {
        //Get username instead of UserID
        let username = await Utils.getAttributesFromServer(
          getAttributesPath,
          "userSystem",
          "GET_username_FROM_userID",
          "userID=" + this.quizparams["createdBy"]
        );
        createdBy.querySelector(
          "#content"
        ).innerHTML = `${username} (${this.quizparams["createdBy"]})`;
      }
      let changedByContainer = quizinformationContainer.querySelector(
        ".footer #changedBy #content"
      );

      if (
        Utils.emptyVariable(this.quizparams["createdBy"]) == false &&
        this.quizparams["changedBy"].length > 0
      ) {
        let lastEditor =
          this.quizparams["changedBy"]?.[
            this.quizparams["changedBy"].length - 1
          ];
        let username = await Utils.getAttributesFromServer(
          getAttributesPath,
          "userSystem",
          "GET_username_FROM_userID",
          "userID=" + lastEditor
        );
        if (!username || Utils.isEmptyInput(username)) {
          changedByContainer.innerHTML = `Benutzer mit der id: ${lastEditor}`;
        } else {
          changedByContainer.innerText = username;
        }
      } else {
        changedByContainer.querySelector("#content").innerHTML = "Noch nie";
      }

      let startBtn = startQuizContainer.querySelector("#startQuizBtn");
      startBtn.addEventListener(
        "click",
        () => {
          this.startQuiz();
        },
        { once: true }
      );
      resolve(true);
    });
  }

  async getQuizdata() {
    return new Promise(async (resolve, reject) => {
      if (!(await Quizfunctions.quizExists(this.quizId, quizlogicPhpPath))) {
        await Utils.alertUser(
          "Quiz existiert nicht",
          "Sorry, das Quiz ist nicht verfügbar.",
          false
        );
        window.location = "/choosequiz.php";
        resolve(false);
      }

      let quizparams = await Quizfunctions.getAllQuizInformation(this.quizId);
      if (quizparams == false) {
        await Utils.alertUser(
          "Fehler beim laden des Quizzes",
          "Sorry, der Server hat keine Daten für das Quiz zurückgesendet.",
          false
        );
        window.location = "/choosequiz.php";
        resolve(false);
      }
      this.quizparams = quizparams;

      console.log("Downloades Quizparams: ", this.quizparams); //Better overview

      //Check if no quizdata
      if (!this.quizparams["quizdata"]) {
        await Utils.alertUser(
          "Schlechte Nachricht",
          "Sorry, aber dieses Quiz hat noch keine Daten. Komme später wieder zurück.",
          false
        );
        window.location = "/choosequiz.php";
        resolve(false);
      }
      this.quizdata = this.quizparams["quizdata"];

      //Prepare Quiz

      this.quizCards = this.quizdata["quizCards"];
      if (!this.quizCards) {
        await Utils.alertUser(
          "Schlechte Nachricht",
          "Sorry, aber dieses Quiz hat noch keine Daten. Komme später wieder zurück. (2)",
          false
        );
        window.location = "/choosequiz.php";
        resolve(false);
      }
      resolve(true);
    });
  }

  async startQuiz() {
    if (!this.quizCards) {
      if (!(await this.getQuizdata())) {
        return false;
      }
    }

    console.log(
      "QuizCards:",
      await Utils.makeJSON(JSON.stringify(this.quizCards))
    );
    let options = this.quizdata["options"];
    if (options["shuffleCards"]) {
      this.quizCards = Utils.shuffle(this.quizCards);
      console.log(
        "Shuffled cards:",
        await Utils.makeJSON(JSON.stringify(this.quizCards))
      );

      console.log(
        "QuizCards2:",
        await Utils.makeJSON(JSON.stringify(this.quizCards))
      );
      //Limit questions here because if cords were not shuffled there will be no reachable cards
      if (options["limitQuestions"]) {
        this.quizCards = Utils.limitArray(
          this.quizCards,
          options["limitQuestions"]
        );
        console.log(
          "Limited Cards:",
          await Utils.makeJSON(JSON.stringify(this.quizCards))
        );
      }
    } else {
      console.log("no shuffle");
    }

    //Set Total
    this.totalCards = this.quizCards.length;

    //Set Containers - Reset Container
    this.container.innerHTML = `
     <div class="controls">
       <input type="checkbox" checked="checked" id="sounds">Sounds</button>
     </div>
     <div class="timeLimit">
     <div class="timePassedGlobal"></div>
     <div class="timePassedCard"></div>
      <div class="quiz"></div>
      <div class="cardTime"></div>
     </div>
     <div class="quizCard">
      
     </div>
     `;

    //Time Limit
    if (options?.["timeLimit"]) {
      //Show timer -> if timer is at 0 make cards left as wrong show Results
      let timerBox = this.container.querySelector(".timeLimit .quiz");
      let seconds = Number(options?.["timeLimit"]);
      let endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + seconds);
      console.log("Ende des Quizzes:", endTime, "Sekunden", seconds);

      let checkTimeLimit = (endDate) => {
        if (this.currentCardNumber >= this.totalCards) {
          console.log("Global timer stopped!");
          return;
        }
        if (endDate > new Date()) {
          setTimeout(() => {
            let secondsLeft = (endDate - new Date()) / 1000;
            let timeLeftArray = Utils.secondsToArrayOrString(
              secondsLeft,
              "Array"
            );
            timerBox.innerHTML = `Zeit verbleibend (Quiz): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
            checkTimeLimit(endDate);
          }, 1000);
          return;
        }
        this.preventScoreUpload = true;
        this.showResults();
      };
      checkTimeLimit(endTime);
    }
    this.controlsContainer = this.container.querySelector(".controls");
    this.quizCardContainer = this.container.querySelector(".quizCard");

    this.startTime = new Date();
    //Global Timer
    if (this.quizdata?.options["showTimePassed"]) {
      let timePassedBox = this.container.querySelector(
        ".timeLimit .timePassedGlobal"
      );
      let updateTimer = () => {
        if (this.currentCardNumber <= this.totalCards && this.startTime) {
          setTimeout(() => {
            //Show timer -> if timer is at 0 make cards left as wrong show Results
            if (!this.startTime) return;
            let now = new Date();
            console.log(this.startTime);
            let secondsPassed = (now - this.startTime) / 1000;
            let timeLeftArray = Utils.secondsToArrayOrString(
              secondsPassed,
              "Array"
            );
            console.log(secondsPassed);
            if (secondsPassed < 0) return;
            timePassedBox.innerHTML = `Zeit vergangen (gesamt): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
            updateTimer();
          }, 1000);
          return;
        }
        timePassedBox.innerHTML = "";
      };
      updateTimer();
    }

    this.loadNextQuestion();
  }

  calculateMarkByCurrentTotalPoints() {
    this.usersMark =
      Math.round((6 - 5 * (this.usersPoints / this.currentTotalPoints)) * 100) /
      100;
    if (!this.usersMark) {
      this.usersMark = 1;
    }
  }

  calculateMarkByTotalPoints() {
    this.usersMark =
      Math.round((6 - 5 * (this.usersPoints / this.totalPoints())) * 100) / 100;
  }

  playSound(type) {
    if (this.container.querySelector(".controls #sounds").checked) {
      soundManager.play(type);
    }
  }

  async loadNextQuestion() {
    //Check if there is a next question - If not showResults
    this.currentCardNumber++;
    if (this.currentCardNumber >= this.totalCards) {
      this.showResults();
      return true;
    }
    this.calculateMarkByCurrentTotalPoints();
    this.updateScore();
    this.choosenAnswers = new Array();

    this.quizCardContainer.innerHTML = `
    <div class="header">
           
    </div>
    <div class="main">
      
    </div>
    <div class="footer">
      
    </div>
    `;

    this.cardHeader = this.container.querySelector(".quizCard .header");
    this.cardMain = this.container.querySelector(".quizCard .main");
    this.cardFooter = this.container.querySelector(".quizCard .footer");

    let currentCardNumber = this.currentCardNumber;
    this.currentCardData = this.quizCards[this.currentCardNumber];
    this.currentCardType = this.currentCardData["type"];
    this.increaseCurrentTotalPoints();
    this.cardStartTime = new Date();

    if (!this.currentCardData) {
      console.error("The current card doesn't have any data.");
      //Logic for making the mark beeing fair calculated if there is no data
      this.loadNextQuestion();
      return false;
    }
    console.log("Current Card data: ", this.currentCardData);

    let cardType = this.currentCardData["type"];

    if (cardType === "mchoice") {
      let options = this.currentCardData["options"];
      let task = this.currentCardData["task"];
      let question = this.currentCardData["question"];
      let media = this.currentCardData["media"];
      let answers = this.currentCardData["answers"];

      if (Utils.emptyVariable(answers) || !answers.length > 0) {
        console.error("The current card doesn't have any answers.");
        this.preventScoreUpload = true;
        //Logic for making the mark beeing fair calculated if there is no data
        this.loadNextQuestion();
        return false;
      }

      // OPTIONS
      // Shuffle Answers
      if (options["shuffle"]) {
        //Shuffle answers
        answers = Utils.shuffle(answers);
        console.log(
          "Shuffled answers: ",
          Utils.makeJSON(JSON.stringify(answers))
        );
      }

      //Current card timer
      if (options["showTimePassed"]) {
        let timePassedBox = this.container.querySelector(
          ".timeLimit .timePassedCard"
        );
        let updateTimer = () => {
          if (
            currentCardNumber == this.currentCardNumber &&
            this.cardStartTime
          ) {
            setTimeout(() => {
              if (!this.cardStartTime) return;
              //Show timer -> if timer is at 0 make cards left as wrong show Results
              let now = new Date();
              let secondsPassed = (now - this.cardStartTime) / 1000;
              let timeLeftArray = Utils.secondsToArrayOrString(
                secondsPassed,
                "Array"
              );
              timePassedBox.innerHTML = `Zeit vergangen (Karte): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
              updateTimer();
            }, 1000);
            return;
          }
          timePassedBox.innerHTML = "";
        };
        updateTimer();
      }

      //Time Limit
      if (options?.["timeLimit"]) {
        let timerBox = this.container.querySelector(".timeLimit .cardTime");
        timerBox.innerHTML = "";
        let seconds = Number(options["timeLimit"]);
        let endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + seconds);
        console.log("Ende der Karte:", endTime, "Sekunden", seconds);

        let cardNumber = this.currentCardNumber;
        let checkTimeLimit = (endDate) => {
          if (cardNumber != this.currentCardNumber) {
            console.log("Timer Stoped!");
            return;
          }
          if (endDate > new Date()) {
            window.setTimeout(() => {
              let secondsLeft = (endDate - new Date()) / 1000;
              let timeLeftArray = Utils.secondsToArrayOrString(
                secondsLeft,
                "Array"
              );
              timerBox.innerHTML = `Zeit verbleibend (Karte): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
              checkTimeLimit(endDate);
            }, 1000);
            return;
          }
          this.preventScoreUpload = true;
          this.validateAnswer(cardType, false);
        };
        checkTimeLimit(endTime);
      }

      this.cardMain.innerHTML = `
          <div class="task">${task || ""}</div>
            <div class="question">${question || ""}</div>
            <div class="media">
               
            </div>
            <h3>Deine Antwort<h3>
            <div class="answerContainer">
               
            </div>
      `;
      let mediaContainer = this.cardMain.querySelector(".media");
      this.setMedia(media, mediaContainer);
      let answerContainer = this.cardMain.querySelector(".answerContainer");
      this.answerContainer = answerContainer;
      if (!answers || !answers.length > 0) {
        console.error("The current card doesn't provide any answers.");
        this.preventScoreUpload = true;
        this.loadNextQuestion();
      }
      //Set answers
      for (const answer of answers) {
        let currentAnswerContainer = document.createElement("button");
        currentAnswerContainer.setAttribute(
          "data-answerID",
          answer["answerID"]
        );
        currentAnswerContainer.classList.add("answer", answer["type"]); //Normally answer['type'] is 'text'
        if (answer["type"] === "text") {
          currentAnswerContainer.innerHTML = `<span>${answer["text"]}</span>`;
          currentAnswerContainer;
        } else {
          //Set Meida as answer
          await Utils.setMedia(answer, currentAnswerContainer);
        }
        currentAnswerContainer.setAttribute("data-size", answer["size"]);
        answerContainer.appendChild(currentAnswerContainer);

        //EventListener
        currentAnswerContainer.addEventListener("click", (event) => {
          if (!event.target) return false;
          console.log(event.target)
          if (event.target.closest("SETTING_lightDataUsage-warning") || event.target.closest("preventExternalMedia-warning")) {
            console.log("Clicked to load media");
            return false;
          }
          //If clicked directly on answer button
          if (event.target.classList.contains("answer") || (event.target.classList.contains("mediaContainer") && event.target.classList.contains("image") || (event.target.closest(".mediaContainer")?.classList.contains("image")))) {
            this.validateAnswer(cardType, answer["answerID"]);
            return;
          }
        });
      }

      this.userCanChoose = true;
      this.answerContainer.classList.add("userCanChoose"); //For making hover effects work
    } else if (cardType === "mchoice-multi") {
      let options = this.currentCardData["options"];
      let task = this.currentCardData["task"];
      let question = this.currentCardData["question"];
      let media = this.currentCardData["media"];
      let answers = this.currentCardData["answers"];

      if (Utils.emptyVariable(answers) || !answers.length > 0) {
        console.error("The current card doesn't have any answers.");
        //Logic for making the mark beeing fair calculated if there is no data
        this.preventScoreUpload = true;
        this.loadNextQuestion();
        return false;
      }

      // OPTIONS
      // Shuffle Answers
      if (options["shuffle"]) {
        //Shuffle answers
        answers = Utils.shuffle(answers);
        console.log(
          "Shuffled answers: ",
          Utils.makeJSON(JSON.stringify(answers))
        );
      }

      let timerBox = this.container.querySelector(".timeLimit .cardTime");
      timerBox.innerHTML = "";
      //Time Limit
      if (options?.["timeLimit"]) {
        //Show timer -> if timer is at 0 make cards left as wrong show Results

        let seconds = Number(options["timeLimit"]);

        let endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + seconds);
        console.log("Ende der Karte:", endTime, "Sekunden", seconds);

        let cardNumber = this.currentCardNumber;
        let checkTimeLimit = (endDate) => {
          if (cardNumber != this.currentCardNumber) {
            console.log("Timer Stoped!");
            return;
          }
          if (endDate > new Date()) {
            window.setTimeout(() => {
              let secondsLeft = (endDate - new Date()) / 1000;
              let timeLeftArray = Utils.secondsToArrayOrString(
                secondsLeft,
                "Array"
              );
              timerBox.innerHTML = `Zeit verbleibend (Karte): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
              checkTimeLimit(endDate);
            }, 1000);
            return;
          }
          this.preventScoreUpload = true;
          this.validateAnswer(cardType, this.choosenAnswers);
        };
        checkTimeLimit(endTime);
      }

      this.cardMain.innerHTML = `
          <div class="task">${task || ""}</div>
            <div class="question">${question || ""}</div>
            <div class="media">
               
            </div>
            <h3>Deine Antwort<h3>
            <div class="answerContainer">
               
            </div>
      `;

      this.cardFooter.innerHTML = `
      <button type="button" class="btn btn-secondary" id="submitBtn">Antwort bestätigen</button>
      `;

      let submitBtn = this.cardFooter?.querySelector("#submitBtn");
      submitBtn.addEventListener("click", () => {
        this.validateAnswer(cardType, this.choosenAnswers);
      });

      let mediaContainer = this.cardMain.querySelector(".media");
      this.setMedia(media, mediaContainer);
      let answerContainer = this.cardMain.querySelector(".answerContainer");
      this.answerContainer = answerContainer;
      //Set answers
      for (const answer of answers) {
        let currentAnswerContainer = document.createElement("button");
        currentAnswerContainer.setAttribute(
          "data-answerID",
          answer["answerID"]
        );
        currentAnswerContainer.classList.add("answer", answer["type"]); //Normally answer['type'] is 'text'
        if (answer["type"] === "text") {
          currentAnswerContainer.innerHTML = `<span>${answer["text"]}</span>`;
          currentAnswerContainer;
        } else {
          //Set Meida as answer
          await Utils.setMedia(answer, currentAnswerContainer);
        }
        currentAnswerContainer.setAttribute("data-size", answer["size"]);
        answerContainer.appendChild(currentAnswerContainer);

        //EventListener
        currentAnswerContainer.addEventListener("click", (event) => {
          if (!this.userCanChoose) return false;
          if (!event.target) return false;
          console.log(event.target)
          if (event.target.closest("SETTING_lightDataUsage-warning") || event.target.closest("preventExternalMedia-warning")) {
            console.log("Clicked to load media");
            return false;
          }
          //If clicked directly on answer button
          if (!(event.target.classList.contains("answer") || (event.target.classList.contains("mediaContainer") && event.target.classList.contains("image") || (event.target.closest(".mediaContainer")?.classList.contains("image"))))) return
          //Toggle in array
          this.choosenAnswers = Utils.toggleValuesInArray(
            this.choosenAnswers,
            answer["answerID"]
          );
          console.log("Choosen answers:", this.choosenAnswers);
          //Update colors
          let answers = this.answerContainer.querySelectorAll(".answer");
          for (const current of answers) {
            let currentAnswerID = Number(current.getAttribute("data-answerID"));
            if (
              Utils.arrayIncludesValue(this.choosenAnswers, currentAnswerID)
            ) {
              console.log("includes");
              current.classList.add("choosen");
            } else {
              console.log("doesn't include", currentAnswerID);
              current.classList.remove("choosen");
            }
          }
        });
      }

      this.userCanChoose = true;
      this.answerContainer.classList.add("userCanChoose"); //For making hover effects work
    } else if (cardType === "textInput") {
      let options = this.currentCardData["options"];
      let task = this.currentCardData["task"];
      let question = this.currentCardData["question"];
      let media = this.currentCardData["media"];

      this.cardMain.innerHTML = `
          <div class="task">${task || ""}</div>
            <div class="question">${question || ""}</div>
            <div class="media">
               
            </div>
            <h3>Deine Antwort<h3>
            <div class="answerContainer">
               
            </div>
      `;

      let mediaContainer = this.cardMain.querySelector(".media");
      this.setMedia(media, mediaContainer);
      let answerContainer = this.cardMain.querySelector(".answerContainer");
      this.answerContainer = answerContainer;

      if (options["size"] === "small") {
        //Just text input for a few numbers
        this.answerContainer.innerHTML = `
        <input type="text" id="textInput" data-size="small" autofocus autocomplete="off">
        `;
      } else if (options["size"] === "middle") {
        this.answerContainer.innerHTML = `
        <input type="text" id="textInput" data-size="middle" autofocus autocomplete="off">
        `;
      } else {
        this.answerContainer.innerHTML = `
        <textarea id="textInput" rows="4" cols="50" autofocus autocomplete="off" data-size="large"></textarea>
        `;
      }

      let timerBox = this.container.querySelector(".timeLimit .cardTime");
      timerBox.innerHTML = "";
      //Time Limit
      if (options?.["timeLimit"]) {
        //Show timer -> if timer is at 0 make cards left as wrong show Results

        let seconds = Number(options["timeLimit"]);
        let endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + seconds);
        console.log("Ende der Karte:", endTime, "Sekunden", seconds);

        let cardNumber = this.currentCardNumber;
        let checkTimeLimit = (endDate) => {
          if (cardNumber != this.currentCardNumber) {
            console.log("Timer Stoped!");
            return;
          }
          if (endDate > new Date()) {
            window.setTimeout(() => {
              let secondsLeft = (endDate - new Date()) / 1000;
              let timeLeftArray = Utils.secondsToArrayOrString(
                secondsLeft,
                "Array"
              );
              timerBox.innerHTML = `Zeit verbleibend (Karte): ${timeLeftArray.minutes}:${timeLeftArray.seconds}`;
              checkTimeLimit(endDate);
            }, 1000);
            return;
          }
          this.preventScoreUpload = true;
          let textInput =
            this.answerContainer.querySelector("#textInput").value;
          this.validateAnswer(cardType, textInput);
        };
        checkTimeLimit(endTime);
      }

      this.cardFooter.innerHTML = `
      <div>Groß- und Kleinscheibung beachten: <b>${Utils.valueToString(
        options["caseSensitive"],
        { true: "Ja", undefined: "Nein", false: "Nein" }
      )}</b></div>
      <button type="button" class="btn btn-secondary" id="submitBtn">Antwort bestätigen</button>
      `;

      let submitBtn = this.cardFooter.querySelector("#submitBtn");
      submitBtn.addEventListener("click", () => {
        let textInput = this.answerContainer.querySelector("#textInput").value;
        this.validateAnswer(cardType, textInput);
      });

      this.userCanChoose = true;
      this.answerContainer.classList.add("userCanChoose"); //For making hover effects work
    }
    this.updateScore();
  }

  updateHeader() {
    if (!this.cardHeader) return false;
    this.cardHeader.innerHTML = `
    <div id="questionNumber"><span class="descrition">Aufgabe:</span> <span class="content">${
      this.currentCardNumber + 1
    } / ${this.totalCards}</span></div>
    <div id="points"><span class="descrition">Punkte:</span> <span class="content">${
      this.usersPoints
    } / ${this.totalPoints()}</span><span> Diese Karte: ${
      this.currentCardData["points"] ?? 0
    }</span></div>
    <div id="correctCards"><span class="descrition">Richtig:</span> <span class="content">${
      this.correctCardsNumber
    }</span> | <span class="descrition">Falsch:</span> <span class="content">${
      this.wrongCardsNumber
    }</span></div>
    <div id="mark"><div id="score"><span class="descrition">Note:</span> <span class="content">${
      this.usersMark
    }</span></div></div>
    `;
  }

  async setMedia(media, mediaContainer) {
    if (Utils.emptyVariable(media) || !media.length > 0) {
      console.log("no media");
      return true;
    }
    console.log("Set Media:", media);
    for (const currentSection of media) {
      console.log("Media to ADd =>", currentSection);

      let section = document.createElement("div");
      section.classList.add("section");
      mediaContainer.appendChild(section);
      for (const itemData of currentSection) {
        let item = document.createElement("div");
        item.classList.add("item");
        section.appendChild(item);
        if (itemData.type === "text") {
          item.classList.add("text");
          item.setAttribute("data-size", itemData["size"]);
          item.innerText = itemData.text;
        } else {
          await Utils.setMedia(itemData, item);
          item.setAttribute("data-size", itemData["size"]);
        }
      }
    }
  }

  increaseCurrentTotalPoints() {
    //Increase currentTotalPoints
    let points = this.currentCardData["points"];
    if (Utils.emptyVariable(points)) {
      points = 0;
    }
    this.currentTotalPoints += points;
  }

  updateScore() {
    this.updateHeader();
    return true;
  }

  addPoints() {
    //Add Points
    let points = Number(this.currentCardData["points"]) ?? 0;
    this.usersPoints += points;
  }

  validateAnswer(type, choosen) {
    if (!this.userCanChoose) {
      console.log("You can't choose | It is disabled");
      return false;
    }
    //Disable user can choose
    this.userCanChoose = false;
    this.answerContainer.classList.remove("userCanChoose");

    if (type === "mchoice") {
      let correctAnswerID = this.currentCardData["correctAnswerID"];
      console.log(
        "Correct answerID:",
        correctAnswerID,
        "Users choice:",
        choosen
      );
      if (correctAnswerID == choosen) {
        this.playSound("userCorrect");
        //Add Points
        this.addPoints();

        //Add to correct Array
        this.correctCardsNumber++;
        let cardId = this.currentCardData["id"];
        this.correctCards = Utils.addToArray(this.correctCards, cardId, false);

        //Add to result object
        this.resultObject["quizCards"] = Utils.addToArray(
          this.resultObject["quizCards"],
          {
            id: cardId,
            type: this.currentCardType,
            usersAnswerID: choosen,
            state: "correct",
            cardStartTime: this.cardStartTime,
            cardEndTime: new Date(),
          }
        );

        //Colorize Answers
        let answers = this.cardMain.querySelectorAll(
          ".answerContainer .answer"
        );
        for (const currentAnswer of answers) {
          if (currentAnswer.getAttribute("data-answerid") == correctAnswerID) {
            currentAnswer.classList.add("correct");
          }
          let idContainer = document.createElement("div");
          idContainer.classList.add("showID");
          idContainer.innerText = `id: ${currentAnswer.getAttribute(
            "data-answerid"
          )}`;
          currentAnswer.appendChild(idContainer);
        }

        this.cardFooter.innerHTML = `
        <div class="description"><b>Richtig:</b> id: ${this.currentCardData["correctAnswerID"]}</div>
        <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
        `;
        this.cardFooter.classList.add("correct");

        let continueBtn = this.cardFooter.querySelector(".continueBtn");
        continueBtn.addEventListener(
          "click",
          () => {
            this.cardFooter.classList.remove("wrong");
            this.loadNextQuestion();
          },
          { once: true }
        );
      } else {
        this.playSound("userWrong");
        //Add to wrong Array
        this.wrongCardsNumber++;
        let cardId = this.currentCardData["id"];
        this.wrongCards = Utils.addToArray(this.wrongCards, cardId, false);

        //Add to result object
        this.resultObject["quizCards"] = Utils.addToArray(
          this.resultObject["quizCards"],
          {
            id: cardId,
            type: this.currentCardType,
            usersAnswerID: choosen,
            state: "wrong",
            cardStartTime: this.cardStartTime,
            cardEndTime: new Date(),
          }
        );

        //Colorize Answers
        let answers = this.cardMain.querySelectorAll(
          ".answerContainer .answer"
        );
        for (const currentAnswer of answers) {
          let currentAnswerID = currentAnswer.getAttribute("data-answerid");
          if (currentAnswerID == correctAnswerID) {
            currentAnswer.classList.add("correct");
          } else if (currentAnswerID == choosen) {
            currentAnswer.classList.add("wrong");
          }
          let idContainer = document.createElement("div");
          idContainer.classList.add("showID");
          idContainer.innerText = `id: ${currentAnswer.getAttribute(
            "data-answerid"
          )}`;
          currentAnswer.appendChild(idContainer);
        }

        this.cardFooter.innerHTML = `
        <div class="description"><b>Richtig:</b> id: ${this.currentCardData["correctAnswerID"]}</div>
        <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
        `;
        this.cardFooter.classList.add("wrong");

        let continueBtn = this.cardFooter.querySelector(".continueBtn");
        continueBtn.addEventListener(
          "click",
          () => {
            this.cardFooter.classList.remove("wrong");
            this.loadNextQuestion();
          },
          { once: true }
        );
      }
    } else if (type === "mchoice-multi") {
      let options = this.currentCardData["options"];
      console.log(options);
      let allMustBeCorrect = options["allMustBeCorrect"] ?? true;
      console.log("All must be correct:", allMustBeCorrect);

      if (allMustBeCorrect) {
        let correctAnswerIDs = this.currentCardData["correctAnswersIDs"];

        let notChoosen = Utils.copyArray(correctAnswerIDs);
        let correctAnswers = new Array();
        let wrongAnswers = new Array();

        for (const currentUsersChoice of choosen) {
          if (Utils.arrayIncludesValue(correctAnswerIDs, currentUsersChoice)) {
            correctAnswers = Utils.addToArray(
              correctAnswers,
              currentUsersChoice,
              true
            );
            //Correct answer
          } else {
            //Wrong answer
            wrongAnswers = Utils.addToArray(
              wrongAnswers,
              currentUsersChoice,
              true
            );
          }
          notChoosen = Utils.removeFromArray(notChoosen, currentUsersChoice);
        }

        console.log(
          "Correct:",
          correctAnswers,
          "Wrong:",
          wrongAnswers,
          "Not Choosen:",
          notChoosen
        );

        //Colorize Answers
        let answers = this.cardMain.querySelectorAll(
          ".answerContainer .answer"
        );

        for (const currentAnswer of answers) {
          console.log(currentAnswer);
          let currentAnswerID = Number(
            currentAnswer.getAttribute("data-answerid")
          );
          console.log(currentAnswerID);
          if (Utils.arrayIncludesValue(correctAnswers, currentAnswerID)) {
            currentAnswer.classList.add("correct");
          } else if (Utils.arrayIncludesValue(wrongAnswers, currentAnswerID)) {
            currentAnswer.classList.add("wrong");
          } else if (Utils.arrayIncludesValue(notChoosen, currentAnswerID)) {
            currentAnswer.classList.add("notChoosenButCorrect");
          } else {
            console.log("Nothing");
          }
          //Show IDs
          let idContainer = document.createElement("div");
          idContainer.classList.add("showID");
          idContainer.innerText = `id: ${currentAnswer.getAttribute(
            "data-answerid"
          )}`;
          currentAnswer.appendChild(idContainer);
        }

        if (
          wrongAnswers.length > 0 === false &&
          notChoosen.length > 0 === false &&
          correctAnswers.length === correctAnswerIDs.length
        ) {
          //User is correct
          this.playSound("userCorrect");
          //Add to correct Array
          this.correctCardsNumber++;
          let cardId = this.currentCardData["id"];
          this.correctCards = Utils.addToArray(
            this.correctCards,
            cardId,
            false
          );

          //Add Points
          this.addPoints();

          //Add to result object
          this.resultObject["quizCards"] = Utils.addToArray(
            this.resultObject["quizCards"],
            {
              id: cardId,
              type: this.currentCardType,
              usersAnswersIDs: {
                correct: correctAnswers,
                wrong: wrongAnswers,
                notChoosen: notChoosen,
              },
              state: "correct",
              cardStartTime: this.cardStartTime,
              cardEndTime: new Date(),
            }
          );

          this.cardFooter.classList.add("correct");
        } else {
          //User is wrong

          this.playSound("userWrong");
          //Add to wrong Array
          this.wrongCardsNumber++;
          let cardId = this.currentCardData["id"];
          this.wrongCards = Utils.addToArray(this.wrongCards, cardId, false);

          //Add to result object
          this.resultObject["quizCards"] = Utils.addToArray(
            this.resultObject["quizCards"],
            {
              id: cardId,
              type: this.currentCardType,
              usersAnswersIDs: {
                correct: correctAnswers,
                wrong: wrongAnswers,
                notChoosen: notChoosen,
              },
              state: "wrong",
              cardStartTime: this.cardStartTime,
              cardEndTime: new Date(),
            }
          );
          this.cardFooter.classList.add("wrong");
        }
      } else {
        let correctAnswerIDs = this.currentCardData["correctAnswersIDs"];

        let notChoosen = Utils.copyArray(correctAnswerIDs);
        let correctAnswers = new Array();
        let wrongAnswers = new Array();

        for (const currentUsersChoice of choosen) {
          if (Utils.arrayIncludesValue(correctAnswerIDs, currentUsersChoice)) {
            correctAnswers = Utils.addToArray(
              correctAnswers,
              currentUsersChoice,
              true
            );
            //Correct answer
          } else {
            //Wrong answer
            wrongAnswers = Utils.addToArray(
              wrongAnswers,
              currentUsersChoice,
              true
            );
          }
          notChoosen = Utils.removeFromArray(notChoosen, currentUsersChoice);
        }

        console.log(
          "Correct:",
          correctAnswers,
          "Wrong:",
          wrongAnswers,
          "Not Choosen:",
          notChoosen
        );

        //Colorize Answers
        let answers = this.cardMain.querySelectorAll(
          ".answerContainer .answer"
        );

        for (const currentAnswer of answers) {
          console.log(currentAnswer);
          let currentAnswerID = Number(
            currentAnswer.getAttribute("data-answerid")
          );
          console.log(currentAnswerID);
          if (Utils.arrayIncludesValue(correctAnswers, currentAnswerID)) {
            currentAnswer.classList.add("correct");
          } else if (Utils.arrayIncludesValue(wrongAnswers, currentAnswerID)) {
            currentAnswer.classList.add("wrong");
          } else if (Utils.arrayIncludesValue(notChoosen, currentAnswerID)) {
            currentAnswer.classList.add("notChoosenButCorrect");
          } else {
            console.log("Nothing");
          }
          //Show IDs
          let idContainer = document.createElement("div");
          idContainer.classList.add("showID");
          idContainer.innerText = `id: ${currentAnswer.getAttribute(
            "data-answerid"
          )}`;
          currentAnswer.appendChild(idContainer);
        }

        if (
          !(
            wrongAnswers.length + notChoosen.length >
            Number(options["maxWrongAnswers"])
          )
        ) {
          //User is correct
          this.playSound("userCorrect");
          //Add to correct Array
          this.correctCardsNumber++;
          let cardId = this.currentCardData["id"];
          this.correctCards = Utils.addToArray(
            this.correctCards,
            cardId,
            false
          );

          //Add Points
          this.addPoints();

          //Add to result object
          this.resultObject["quizCards"] = Utils.addToArray(
            this.resultObject["quizCards"],
            {
              id: cardId,
              type: this.currentCardType,
              usersAnswersIDs: {
                correct: correctAnswers,
                wrong: wrongAnswers,
                notChoosen: notChoosen,
                cardStartTime: this.cardStartTime,
                cardEndTime: new Date(),
              },
              state: "correct",
            }
          );
          this.cardFooter.classList.add("correct");
        } else {
          //User is wrong

          this.playSound("userWrong");
          //Add to wrong Array
          this.wrongCardsNumber++;
          let cardId = this.currentCardData["id"];
          this.wrongCards = Utils.addToArray(this.wrongCards, cardId, false);

          //Add to result object
          this.resultObject["quizCards"] = Utils.addToArray(
            this.resultObject["quizCards"],
            {
              id: cardId,
              type: this.currentCardType,
              usersAnswersIDs: {
                correct: correctAnswers,
                wrong: wrongAnswers,
                notChoosen: notChoosen,
                cardStartTime: this.cardStartTime,
                cardEndTime: new Date(),
              },
              state: "wrong",
            }
          );
          this.cardFooter.classList.add("wrong");
        }
      }
      //Continue
      this.cardFooter.innerHTML = `
       <div class="description"><b>Richtige ids:</b><span class="correctList"></span></div>
       <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
       `;
      this.cardFooter.classList.add("correct");

      let correctList = this.cardFooter.querySelector(
        ".description .correctList"
      );
      Utils.listOfArrayToHTML(
        correctList,
        this.currentCardData["correctAnswersIDs"],
        "keine Richtig"
      );
      let continueBtn = this.cardFooter.querySelector(".continueBtn");
      continueBtn.addEventListener(
        "click",
        () => {
          this.cardFooter.classList.remove("wrong");
          this.cardFooter.classList.remove("correct");
          this.loadNextQuestion();
        },
        { once: true }
      );
    } else if (type === "textInput") {
      if (Utils.isEmptyInput(choosen, true)) {
        console.log("Your choice is empty");
        Utils.alertUser("Nachricht", "Die Eingabe darf nicht leer sein.");
        this.answerContainer.classList.add("userCanChoose");
        this.userCanChoose = true;
        return false;
      }

      let options = this.currentCardData["options"];
      let caseSensitive = options["caseSensitive"];
      let wordsJustNeedToBeIncluded = options["wordsJustNeedToBeIncluded"];
      console.log(wordsJustNeedToBeIncluded);

      let checkCorrect = (choosen, correctAnswers, caseSensitive) => {
        console.log(
          "Words just needs to be includes:",
          wordsJustNeedToBeIncluded
        );
        if (caseSensitive) {
          let check2 = (correctAnswers, choosen) => {
            if (Utils.arrayIncludesValue(correctAnswers, choosen)) {
              return true;
            } else {
              return false;
            }
          };

          if (check2(correctAnswers, choosen)) {
            return true;
          } else {
            return false;
          }
        } else {
          let check2 = (correctAnswers, choosen) => {
            for (const currentCorrectAnswer of correctAnswers) {
              if (
                currentCorrectAnswer.toLowerCase() == choosen.toLowerCase() ||
                currentCorrectAnswer.toUpperCase() == choosen.toUpperCase()
              ) {
                return true;
              }
            }
            return false;
          };

          if (check2(correctAnswers, choosen)) {
            return true;
          } else {
            return false;
          }
        }
      };

      let checkWordsJustNeedToBeIncluded = (
        wordsJustNeedToBeIncluded,
        choosen
      ) => {
        if (
          Utils.emptyVariable(wordsJustNeedToBeIncluded) == false &&
          wordsJustNeedToBeIncluded !== false &&
          wordsJustNeedToBeIncluded.length > 0
        ) {
          if (caseSensitive) {
            if (
              Utils.string_contains_all_values(
                choosen,
                wordsJustNeedToBeIncluded
              )
            ) {
              return true;
            }
          } else {
            if (
              Utils.string_contains_all_values(
                choosen,
                wordsJustNeedToBeIncluded,
                false
              )
            ) {
              return true;
            }
          }
        }
        return false;
      };

      let correctAnswers = this.currentCardData["correctAnswers"];
      if (
        checkCorrect(choosen, correctAnswers, caseSensitive) ||
        checkWordsJustNeedToBeIncluded(wordsJustNeedToBeIncluded, choosen)
      ) {
        this.playSound("userCorrect");
        //Add Points
        this.addPoints();

        //Add to correct Array
        this.correctCardsNumber++;
        let cardId = this.currentCardData["id"];
        this.correctCards = Utils.addToArray(this.correctCards, cardId, false);

        //Add to result object
        this.resultObject["quizCards"] = Utils.addToArray(
          this.resultObject["quizCards"],
          {
            id: cardId,
            type: this.currentCardType,
            usersAnswer: choosen,
            state: "correct",
            cardStartTime: this.cardStartTime,
            cardEndTime: new Date(),
          }
        );
        this.cardFooter.classList.add("correct");
      } else {
        this.playSound("userWrong");
        //Add to wrong Array
        this.wrongCardsNumber++;
        let cardId = this.currentCardData["id"];
        this.wrongCards = Utils.addToArray(this.wrongCards, cardId, false);
        //Add to result object
        this.resultObject["quizCards"] = Utils.addToArray(
          this.resultObject["quizCards"],
          {
            id: cardId,
            type: this.currentCardType,
            usersAnswer: choosen,
            state: "wrong",
            cardStartTime: this.cardStartTime,
            cardEndTime: new Date(),
          }
        );
        this.cardFooter.classList.add("wrong");
      }
      this.cardFooter.innerHTML = `
      <div class="description">
        <b>Richtig:</b>
        <span class="correctList"></span>
      </div>
      <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
      `;

      //Alternative words
      let description = this.cardFooter.querySelector(".description");

      Utils.listOfArrayToHTML(
        description.querySelector(".correctList"),
        this.currentCardData["correctAnswers"],
        "Nichts (Fehler)"
      );
      if (
        Utils.emptyVariable(wordsJustNeedToBeIncluded) == false &&
        wordsJustNeedToBeIncluded !== false &&
        wordsJustNeedToBeIncluded.length > 0
      ) {
        let div = document.createElement("div");
        div.innerHTML = `<b>Oder Wörter, die enthalten sein müssen:</b><span class="alternativeWords"></span>`;
        description.appendChild(div);
        let alternativeWordsList = div.querySelector(".alternativeWords");
        Utils.listOfArrayToHTML(
          alternativeWordsList,
          wordsJustNeedToBeIncluded,
          "Nicht gesetzt"
        );
      }

      let continueBtn = this.cardFooter.querySelector(".continueBtn");
      continueBtn.addEventListener(
        "click",
        () => {
          this.cardFooter.classList.remove("wrong");
          this.cardFooter.classList.remove("correct");
          this.loadNextQuestion();
        },
        { once: true }
      );
    }
    this.updateScore();
    this.updateHeader();
    this.cardStartTime = false;
  }

  async showResults() {
    this.calculateMarkByCurrentTotalPoints();

    let now = new Date();

    let getTotalTime = () => {
      console.log(this.startTime);
      let secondsPassed = (now.getTime() - this.startTime.getTime()) / 1000;
      this.resultObject.timeNeeded = secondsPassed;
      this.startTime = false;
      return Utils.secondsToArrayOrString(secondsPassed, "String");
    };

    let getTimeNeededCard = (start, end) => {
      try {
        let secondsPassed = (end.getTime() - start.getTime()) / 1000;
        return Utils.secondsToArrayOrString(secondsPassed, "String");
      } catch (e) {
        console.error(e);
      }
      return "";
    };

    this.resultObject.totalPoints = this.totalPoints();
    this.calculateMarkByTotalPoints();
    this.resultObject.scoredPoints = this.usersPoints;
    this.resultObject.mark = this.usersMark;



    let resultPageHTML = `
    <h1 style="text-decoration: underline;">Dein Ergebnis</h1>
    <div class="resultContainer container">
        <div class="results">
            <div id="points"><b>Punkte:</b> ${
              this.usersPoints
            } / ${this.totalPoints()}</div>
            <div id="result"><b>Ergebnis:</b> ${this.correctCardsNumber} / ${
      this.totalCards
    }</div>
            <div id="mark"><b>Note:</b> ${this.usersMark}</div>
            <div class="details">
                <div class="totalCards">Gesamtanzahl von Karten: ${
                  this.totalCards
                }</div>
                <div class="correctCards">Richtige Karten: ${
                  this.correctCardsNumber
                }</div>
                <div class="wrongCards">Falsche Karten: ${
                  this.wrongCardsNumber
                }</div>
                <div class="timePassed">Zeit vergangen: ${getTotalTime()}</div>
            </div>
        </div>
        <div id="viewAnswers">
          <button type="button" class="btn btn-info" id="toggleChoosenAnswers">Genaueres anzeigen</button>
          <div class="choosenAnswers collapse" id="choosenAnswers">
            <div id="content" class="row justify-content-center">

            </div>
          </div>
        </div>
        <div class="options">
          <ul>
            <li> <a href="/quiz.php?quizId=${this.quizId}">Erneut</a></li>
            <li><a href="/choosequiz.php">Quiz auswählen</a></li>
          </ul>
         
          
        </div>
    </div>
    `;
    this.container.innerHTML = resultPageHTML;

    let resultContainer = this.container.querySelector(".resultContainer");
    let viewAnswersContainer = resultContainer.querySelector("#viewAnswers");
    let showUserAnswersContainer = viewAnswersContainer.querySelector(
      "#choosenAnswers #content"
    );
    let toggleInformationBtn = viewAnswersContainer.querySelector(
      "#toggleChoosenAnswers"
    );

    //Show furhter information
    toggleInformationBtn.addEventListener("click", () => {
      let collapse = bootstrap.Collapse.getOrCreateInstance(
        viewAnswersContainer.querySelector("#choosenAnswers")
      );
      collapse.toggle();
    });

    console.log(
      "Result Object",
      this.resultObject,
      "quizCards",
      this.resultObject["quizCards"]
    );
    for (const currentUsersChoice of this.resultObject["quizCards"]) {
      // if (!currentUsersChoice || !currentUsersChoice.length > 0) continue;
      console.log("currentUsersChoice", currentUsersChoice);
      let item = document.createElement("div");
      item.classList.add("item");

      let type = currentUsersChoice["type"];
      let status = currentUsersChoice["state"];
      let id = currentUsersChoice["id"];
      let quizCard = this.quizCards.find((item) => item.id == id);
      if (!quizCard) {
        console.log("QuizCard not found", quizCard, "id:", id);
        continue;
      }
      console.log("QuizCard:", quizCard);

      let appendAnswer = async (container, data, type, description = "") => {
        console.log(type);
        let div = document.createElement("div");
        div.classList.add("answer");
        if (type === "text") {
          div.innerHTML = `<span class="answer">${data}</span> <span>${description}</span>`;
        } else {
          div.innerHTML = `<span class="answer"></span> <span>${description}</span>`;
          Utils.setMedia(data, div.querySelector(".answer"), false);
        }
        container.appendChild(div);
      };
      if (type == "mchoice") {
        item.innerHTML = `
            <div id="id"><span class="description">id:</span> ${id}</div>
            <div id="status"><span class="description">Status:</span> ${Utils.valueToString(
              status, {"correct": "richtig &#10004;", "wrong": "falsch &#10060;"}
            )}</div>
            <div id="task"><span class="description">Aufgabe:</span> ${
              quizCard["task"]
            }</div>
            <div id="question"><span class="description">Frage:</span> ${
              quizCard["question"]
            }</div>
            <div id="answers"><span class="description">Antworten:</span> <span class="content"></span></div>
            <div id="usersAnswers"><span class="description">Deine Antwort:</span> <span class="content"></span></div>
            <div id="correctAnswer"><span class="description">Richtige Antwort:</span> <span class="content"></span></div>
            <div id="timeNeeded"><span class="description">Zeit benötigt:</span> ${getTimeNeededCard(
              currentUsersChoice["cardStartTime"],
              currentUsersChoice["cardEndTime"]
            )}</div>
            `;
        let answersContainer = item.querySelector("#answers .content");
        let usersAnswersContainer = item.querySelector(
          "#usersAnswers .content"
        );
        let correctAnswerContainer = item.querySelector(
          "#correctAnswer .content"
        );

        //Fill answers
        let answers = quizCard["answers"];
        let ul = document.createElement("ul");
        for (let answer of answers) {
          console.log(answer);
          let li = document.createElement("li");
          console.log(answer);
          let type = answer["type"];
          if (type == "text") {
            appendAnswer(
              li,
              answer["text"],
              "text",
              `(id: ${answer["answerID"]})`
            );
          } else {
            appendAnswer(li, answer, "media", `(id: ${answer["answerID"]})`);
          }
          ul.appendChild(li);
        }
        answersContainer.appendChild(ul);

        //Fill choosen
        let choosenID = currentUsersChoice["usersAnswerID"];
        appendAnswer(usersAnswersContainer, `(id: ${choosenID})`, "text");

        //Fill Correct Answer
        let correctAnswerID = quizCard["correctAnswerID"];
        appendAnswer(
          correctAnswerContainer,
          `(id: ${correctAnswerID})`,
          "text"
        );
      } else if (type == "mchoice-multi") {
        item.innerHTML = `
        <div id="id"><span class="description">id:</span> ${id}</div>
        <div id="status"><span class="description">Status:</span> ${Utils.valueToString(
          status, {"correct": "richtig &#10004;", "wrong": "falsch &#10060;"}
        )}</div>
        <div id="task"><span class="description">Aufgabe:</span> ${
          quizCard["task"]
        }</div>
        <div id="question"><span class="description">Frage:</span> ${
          quizCard["question"]
        }</div>
        <div id="answers"><span class="description">Mögliche Antworten:</span> <span class="content"></span></div>
        <div id="usersAnswers">
          <div><span class="description">Korrekt ausgewählt:</span><span id="correct"></span></div>
          <div><span class="description">Falsch ausgewählt:</span><span id="wrong"></span></div>
          <div><span class="description">Nicht ausgewählt:</span><span id="notChoosen"></span></div>
        </div>
        <div id="correctAnswers"><span class="description">Richtige Antwort(en):</span> <span class="content"></span></div>
        <div id="timeNeeded"><span class="description">Zeit benötigt:</span> ${getTimeNeededCard(
          currentUsersChoice["cardStartTime"],
          currentUsersChoice["cardEndTime"]
        )}</div>
        `;

        let answersContainer = item.querySelector("#answers .content");
        let usersCorrectAnswersContainer = item.querySelector(
          "#usersAnswers #correct"
        );
        let usersWrongAnswersContainer = item.querySelector(
          "#usersAnswers #wrong"
        );
        let usersNotChoosenAnswersContainer = item.querySelector(
          "#usersAnswers #notChoosen"
        );
        let correctAnswersContainer = item.querySelector(
          "#correctAnswers .content"
        );

        //Fill answers
        let answers = quizCard["answers"];
        let ul = document.createElement("ul");
        for (let answer of answers) {
          let li = document.createElement("li");
          console.log(answer);
          let type = answer["type"];
          if (type == "text") {
            appendAnswer(
              li,
              answer["text"],
              "text",
              `(id: ${answer["answerID"]})`
            );
          } else {
            appendAnswer(li, answer, "media", `(id: ${answer["answerID"]})`);
          }
          ul.appendChild(li);
        }
        answersContainer.appendChild(ul);


        console.log(currentUsersChoice);
        //Fill choosen
        let choosenAnswerIDs = currentUsersChoice["usersAnswersIDs"];
        let usersCorrectAnswerIDs = choosenAnswerIDs["correct"];
        let usersWrongAnswerIDs = choosenAnswerIDs["wrong"];
        let usersNotChoosenAnswerIDs = choosenAnswerIDs["notChoosen"];

        if (usersCorrectAnswerIDs && usersCorrectAnswerIDs.length > 0) {
          let ul = document.createElement("ul");
          for (const current of usersCorrectAnswerIDs) {
            let li = document.createElement("li");
            appendAnswer(li, `(id: ${current})`, "text");
            ul.appendChild(li);
          }
          usersCorrectAnswersContainer.appendChild(ul);
        }
        if (usersWrongAnswerIDs && usersWrongAnswerIDs.length > 0) {
          let ul = document.createElement("ul");
          for (const current of usersWrongAnswerIDs) {
            let li = document.createElement("li");
            appendAnswer(li, `(id: ${current})`, "text");
            ul.appendChild(li);
          }
          usersWrongAnswersContainer.appendChild(ul);
        }

        if (usersNotChoosenAnswerIDs && usersNotChoosenAnswerIDs.length > 0) {
          let ul = document.createElement("ul");
          for (const current of usersNotChoosenAnswerIDs) {
            let li = document.createElement("li");
            appendAnswer(li, `(id: ${current})`, "text");
            ul.appendChild(li);
          }
          usersNotChoosenAnswersContainer.appendChild(ul);
        }

        let correctAnswerIDs = quizCard["correctAnswersIDs"];
        if (correctAnswerIDs && correctAnswerIDs.length > 0) {
          let ul = document.createElement("ul");
          for (const current of correctAnswerIDs) {
            let li = document.createElement("li");
            appendAnswer(li, `(id: ${current})`, "text");
            ul.appendChild(li);
          }
          correctAnswersContainer.appendChild(ul);
        }
      } else if (type == "textInput") {
        item.innerHTML = `
        <div id="id"><span class="description">id:</span> ${id}</div>
        <div id="status"><span class="description">Status:</span> ${Utils.valueToString(
          status, {"correct": "richtig &#10004;", "wrong": "falsch &#10060;"}
        )}</div>
        <div id="caseSensitive"><span class="description">Groß und Kleinschreibung beachten:</span> ${Utils.boolToString(
          quizCard["options"]["caseSensitive"]
        )}</div>
        <div id="task"><span class="description">Aufgabe:</span> ${
          quizCard["task"]
        }</div>
        <div id="question"><span class="description">Frage:</span> ${
          quizCard["question"]
        }</div>
        <div id="usersAnswers"><span class="description">Deine Antwort:</span> <span class="content"></span></div>
        <div id="correctAnswers"></div>
          <span class="description">Richtige Antworten:</span>
          <div class="correctList"></div>
        </div>
        <div id="timeNeeded"><span class="description">Zeit benötigt:</span> ${getTimeNeededCard(
          currentUsersChoice["cardStartTime"],
          currentUsersChoice["cardEndTime"]
        )}</div>
      
        `;

        let usersAnswersContainer = item.querySelector(
          "#usersAnswers .content"
        );

        //Fill choosen
        let userInput = currentUsersChoice["usersAnswer"];
        appendAnswer(usersAnswersContainer, userInput, "text");

        let wordsJustNeedToBeIncluded =
          quizCard["options"]?.["wordsJustNeedToBeIncluded"];
        let correctList = item.querySelector(".correctList");
        Utils.listOfArrayToHTML(
          correctList,
          quizCard["correctAnswers"],
          "Nichts (Fehler)"
        );
        if (
          Utils.emptyVariable(wordsJustNeedToBeIncluded) == false &&
          wordsJustNeedToBeIncluded !== false &&
          wordsJustNeedToBeIncluded.length > 0
        ) {
          let div = document.createElement("div");
          div.innerHTML = `<b>Oder Wörter, die enthalten sein müssen:</b><span class="alternativeWords"></span>`;
          correctList.appendChild(div);
          let alternativeWordsList = div.querySelector(".alternativeWords");
          Utils.listOfArrayToHTML(
            alternativeWordsList,
            wordsJustNeedToBeIncluded,
            "Nicht gesetzt"
          );
        }
      }
      showUserAnswersContainer.appendChild(item);
      item.classList = `${currentUsersChoice["state"]} col-11 col-sm-6 col-md-4 col-lg-4 item col-centered`;
    }

    //Insert result into database if logged in
    if (Utils.makeJSON(window.sessionStorage.getItem("loggedIn"))) {
      if (this.preventScoreUpload) {
        await Utils.alertUser("Hochladen fehlgeschlagen", "Dein Ergebnis konnte nicht in die Datenbank eingetragen werden, da das Quiz nicht korrekt abgeschlossen wurde. Dies liegt wahrscheinlch an fehlenden Quizdaten. Informiere einen Administrator.", fasle);
        return;
      }
      console.log("INSERT result into database:", this.resultObject);

      let response = await Utils.makeJSON(
        await Utils.sendXhrREQUEST(
          "POST",
          "quiz&operation=insertNewResult&quizID=" + this.quizId + "&resultObject=" + JSON.stringify(this.resultObject),
          "/includes/quizlogic.php",
          "application/x-www-form-urlencoded",
          true,
          true,
          false,
          true
        )
      );
    }
  }
}

let container = document.querySelector("#mainContainer");
if (!container) {
  window.location = "/choosequiz.php";
}

let urlParams = Utils.getUrlParams(window.location.search);

if (!urlParams.has("quizId")) {
  window.location = "/choosequiz.php";
}
let quizId = urlParams.get("quizId");
let quiz = new Quiz(container, quizId);
await quiz.showStartSite();
if (urlParams.has("autostart") && urlParams.get("autostart") == "1") {
  quiz.startQuiz();
}
