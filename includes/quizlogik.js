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

    this.totalPoints = 0;
    this.currentTotalPoints = 0;

    //User Information and Scores
    this.usersMark = 1;
    this.correctCardsNumber = 0;
    this.correctCards = new Array();
    this.wrongCardsNumber = 0;
    this.wrongCards = new Array();
    this.usersChoice = new Array();
    this.usersPoints = 0;

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
            this.quizparams["createdReadable"]
          )}</div>
          <div id="createdBy"><span id="description"><b>Erstellt von:</b> </span><span id="content"></span></div>
          <div id="changed"><b>Geändert:</b> ${formatDescription(
            this.quizparams["changedReadable"]
          )}</div>
          <div id="changedBy"><span id="description"><b>Geändert von:</b> </span><span id="content"></span></div>
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
      let changedBy =
        quizinformationContainer.querySelector(".footer #changedBy");
      if (
        Utils.emptyVariable(this.quizparams["createdBy"]) == false &&
        this.quizparams["changedBy"].length > 0
      ) {
        //Get usernames instead of UserID
        let currentArray = new Array();
        for (const current of this.quizparams["changedBy"]) {
          let username = await Utils.getAttributesFromServer(
            getAttributesPath,
            "userSystem",
            "GET_username_FROM_userID",
            "userID=" + current
          );
          if (!Utils.emptyVariable(username)) {
            currentArray = Utils.addToArray(currentArray, username, false);
          }
        }
        Utils.listOfArrayToHTML(
          changedBy.querySelector("#content"),
          currentArray,
          "Noch nie"
        );
      } else {
        changedBy.querySelector("#content").innerHTML = "Noch nie";
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

    //Calculate Total Points
    for (const currentCard of this.quizCards) {
      let points = currentCard["points"];
      if (Utils.emptyVariable(points)) {
        points = 0;
      }
      this.totalPoints += points;
    }

    //Set Containers - Reset Container
    this.container.innerHTML = `
     <div class="controls">
       <input type="checkbox" checked="checked" id="sounds">Sounds</button>
     </div>
     <div class="quizCard">
      
     </div>
     `;

    this.controlsContainer = this.container.querySelector(".controls");
    this.quizCardContainer = this.container.querySelector(".quizCard");

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
      Math.round((6 - 5 * (this.usersPoints / this.totalPoints)) * 100) / 100;
  }

  playSound(type) {
    if (this.container.querySelector(".controls #sounds").checked) {
      soundManager.play(type);
    }
  }

  loadNextQuestion() {
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

    //Check if there is a next question - If not showResults
    this.currentCardNumber++;
    if (this.currentCardNumber >= this.totalCards) {
      this.showResults();
      return true;
    }

    this.currentCardData = this.quizCards[this.currentCardNumber];
    this.currentCardType = this.currentCardData["type"];
    this.increaseCurrentTotalPoints();

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

      this.cardMain.innerHTML = `
          <div class="task">${task}</div>
            <div class="question">${question}</div>
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
      //Set answers
      for (const answer of answers) {
        let currentAnswerContainer = document.createElement("button");
        currentAnswerContainer.setAttribute(
          "data-answerID",
          answer["answerID"]
        );
        currentAnswerContainer.classList.add("answer", answer["type"]); //Normally answer['type'] is 'text'

        if (answer["type"] === "text") {
          let size = answer["size"];
          currentAnswerContainer.innerHTML = `<span class="${size}">${answer["text"]}</span>`;
        } else if (answer["type"] === "image") {
          currentAnswerContainer.innerHTML = `<img src="${answer["source"]}" alt="${answer["alt"]}" class="${answer["size"]}">`;
        } else {
          console.log("Answer type is not known: ", answer["type"]);
        }

        answerContainer.appendChild(currentAnswerContainer);

        //EventListener
        currentAnswerContainer.addEventListener("click", () => {
          this.validateAnswer(cardType, answer["answerID"]);
        });
      }

      this.userCanChoose = true;
      this.answerContainer.classList.add("userCanChoose"); //For making hover effects work
      // this.cardFooter.innerHTML =
      // `
      // <button type="button" class="btn btn-secondary continueBtn" disabled>Weiter</button>
      // `;
    } else if (cardType === "mchoice-multi") {
      let options = this.currentCardData["options"];
      let task = this.currentCardData["task"];
      let question = this.currentCardData["question"];
      let media = this.currentCardData["media"];
      let answers = this.currentCardData["answers"];

      if (Utils.emptyVariable(answers) || !answers.length > 0) {
        console.error("The current card doesn't have any answers.");
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

      this.cardMain.innerHTML = `
          <div class="task">${task}</div>
            <div class="question">${question}</div>
            <div class="media">
               
            </div>
            <h3>Deine Antwort<h3>
            <div class="answerContainer">
               
            </div>
      `;

      this.cardFooter.innerHTML = `
      <button type="button" class="btn btn-secondary" id="submitBtn">Antwort bestätigen</button>
      `;

      let submitBtn = this.cardFooter.querySelector("#submitBtn");
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
          let size = answer["size"];
          currentAnswerContainer.innerHTML = `<span class="${size}">${answer["text"]}</span>`;
        } else if (answer["type"] === "image") {
          currentAnswerContainer.innerHTML = `<img src="${answer["source"]}" alt="${answer["alt"]}" class="${answer["size"]}">`;
        } else {
          console.log("Answer type is not known: ", answer["type"]);
        }

        answerContainer.appendChild(currentAnswerContainer);

        //EventListener
        currentAnswerContainer.addEventListener("click", () => {
          if (!this.userCanChoose) return false;
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
          <div class="task">${task}</div>
            <div class="question">${question}</div>
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
        <input type="text" id="textInput" class="small" autofocus autocomplete="off">
        `;
      } else if (options["size"] === "middle") {
        this.answerContainer.innerHTML = `
        <input type="text" id="textInput" class="middle" autofocus autocomplete="off">
        `;
      } else if (options["size"] === "large") {
        this.answerContainer.innerHTML = `
        <textarea id="textInput" rows="4" cols="50" autofocus autocomplete="off" class="large"></textarea>
        `;
      }

      this.cardFooter.innerHTML = `
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
    <div id="questionNumber"><span class="descrition">Aufgabe:</span> <span class="content">${this.currentQuestionNumber} / ${this.totalCards}</span></div>
    <div id="score"><span class="descrition">Punkte:</span> <span class="content">${this.usersPoints} / ${this.totalPoints}</span></div>
    <div id="score"><span class="descrition">Richtig:</span> <span class="content">${this.correctCardsNumber}</span> | <span class="descrition">Falsch:</span> <span class="content">${this.wrongCardsNumber}</span></div>
    <div id="mark"><div id="score"><span class="descrition">Note:</span> <span class="content">${this.usersMark}</span></div></div>
    `;
  }

  setMedia(media, mediaContainer) {
    if (Utils.emptyVariable(media) || !media.length > 0) {
      console.log("no media");
      return true;
    }
    console.log("Set Media:", media);

    for (const currentMedia of media) {
      console.log("current media:", currentMedia);
      let item = document.createElement("div");
      item.classList.add("item");

      for (const currentItemMedia of currentMedia) {
        let type = currentItemMedia["type"];
        if (type === "video") {
          console.log("Video");
          let path = currentItemMedia["path"];
          let sourceType = currentItemMedia["sourceType"];
          let size = currentItemMedia["size"];

          let videoContainer = document.createElement("div");
          videoContainer.classList.add("video");

          if (currentItemMedia["isOnlineSource"] === true) {
            videoContainer.classList.add("onlineSource");
            videoContainer.innerHTML = `
            <video controls preload="none" class="${size}">
              <source src="${path}" type="${sourceType}"/>
            Das Video-Element wird in deinem Browser nicht unterstützt. Lade es stattdessen herunter: <a href="${path}">here</a>
            <video>
            `;
          } else {
            videoContainer.innerHTML = `
            <video controls preload="metadata" class="${size}">
              <source src="${path}" type="${sourceType}"/>
            Das Video-Element wird in deinem Browser nicht unterstützt. Lade es stattdessen herunter: <a href="${path}">here</a>
            <video>
            `;
          }

          if (currentItemMedia["hidden"] === true) {
            videoContainer.classList.add("spoiler");
          }

          item.appendChild(videoContainer);
        } else if (type === "image") {
          console.log("Image");
          let path = currentItemMedia["path"];
          let sourceType = currentItemMedia["sourceType"];
          let size = currentItemMedia["size"];
          let alt = currentItemMedia["alt"];

          let imageContainer = document.createElement("div");
          imageContainer.classList.add("image");

          if (currentItemMedia["isOnlineSource"] === true) {
            imageContainer.classList.add("onlineSource");
            imageContainer.innerHTML = `
          <img data-source="${path}" alt="${alt}" class="${size}">
          `;
          } else {
            imageContainer.innerHTML = `
          <img src="${path}" alt="${alt}" class="${size}">
          `;
          }

          if (currentItemMedia["hidden"] === true) {
            imageContainer.classList.add("spoiler");
          }

          item.appendChild(imageContainer);
        } else if (type === "text") {
          console.log("Text");

          let text = currentItemMedia["text"];
          let size = currentItemMedia["size"];

          let textContainer = document.createElement("div");
          textContainer.classList.add("text");
          textContainer.innerHTML = `
      <span class="${size}">${text}</span>
      `;

          item.appendChild(textContainer);
        } else if (type === "audio") {
          console.log("audio");

          let path = currentItemMedia["path"];
          let sourceType = currentItemMedia["sourceType"];
          let volume = currentItemMedia["volume"];
          if (Utils.emptyVariable(volume)) {
            volume = 100;
          }
          let alt = currentItemMedia["alt"];

          let audioContainer = document.createElement("div");
          audioContainer.classList.add("audio");

          if (currentItemMedia["isOnlineSource"] === true) {
            audioContainer.classList.add("onlineSource");
            audioContainer.innerHTML = `
    <audio controls volume="${volume / 100}" preload="none">
      <source src="${path}" type="${sourceType}" alt="${alt}">
      Dein Browser unterstützt das Audio-Element nicht.  Lade sie stattdessen herunter: <a href="${path}">here</a>
    </audio>
    `;
          } else {
            audioContainer.innerHTML = `
      <audio controls volume="${volume / 100}" preload="metadata">
      <source src="${path}" type="${sourceType}" alt="${alt}">
      Dein Browser unterstützt das Audio-Element nicht.  Lade sie stattdessen herunter: <a href="${path}">here</a>
      </audio>
    `;
          }

          if (currentItemMedia["hidden"] === true) {
            audioContainer.classList.add("spoiler");
          }

          // Divided by 100 because range is from 1 to 100
          item.appendChild(audioContainer);
        }
      }

      mediaContainer.appendChild(item);
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
    let points = this.currentCardData["points"];
    if (Utils.emptyVariable(points)) {
      points = 0;
    }
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
      if (!choosen) {
        console.log("Your choice is empty");
        return false;
      }

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
        }

        this.cardFooter.innerHTML = `
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
        }

        this.cardFooter.innerHTML = `
        <div class="description"><b>Richtig:</b> ${this.currentCardData["correctAnswer"]}</div>
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
      let allMustBeCorrect = options["allMustBeCorrect"];
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
            }
          );
          //Continue
          this.cardFooter.innerHTML = `
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
            }
          );
          //Continue
          this.cardFooter.innerHTML = `
            <div class="description"><b>Richtig:</b> ${this.currentCardData[
              "correctAnswers"
            ].join(" <b>;</b>  ")}</div>
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
              },
              state: "correct",
            }
          );
          //Continue
          this.cardFooter.innerHTML = `
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
            }
          );
          //Continue
          this.cardFooter.innerHTML = `
            <div class="description"><b>Richtig:</b> ${this.currentCardData[
              "correctAnswers"
            ].join(" <b>;</b>  ")}</div>
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
      }
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
          }
        );

        this.cardFooter.innerHTML = `
        <div class="description"><b>Richtig:</b><span class="correctList"></span></div>
        <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
        `;
        this.cardFooter.classList.add("correct");

        let correctList = this.cardFooter.querySelector(
          ".description .correctList"
        );
        Utils.listOfArrayToHTML(
          correctList,
          this.currentCardData["correctAnswers"],
          "keine"
        );

        if (
          Utils.emptyVariable(wordsJustNeedToBeIncluded) == false &&
          wordsJustNeedToBeIncluded !== false &&
          wordsJustNeedToBeIncluded.length > 0
        ) {
          let description = this.cardFooter.querySelector(".description");
          let div = document.createElement("div");
          div.innerHTML = `<b>Oder Wörter, die enthalten sein müssen:</b><span class="alternativeWords"></span>`;
          description.appendChild(div);
          let alternativeWordsList = div.querySelector(".alternativeWords");
          Utils.listOfArrayToHTML(
            alternativeWordsList,
            wordsJustNeedToBeIncluded,
            "Keins"
          );
        }

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
            usersAnswer: choosen,
            state: "wrong",
          }
        );

        this.cardFooter.innerHTML = `
        <div class="description"><b>Richtig:</b><span class="correctList"></span></div>
        <button type="button" class="btn btn-secondary continueBtn">Weiter</button>
        `;
        this.cardFooter.classList.add("wrong");

        let correctList = this.cardFooter.querySelector(
          ".description .correctList"
        );
        Utils.listOfArrayToHTML(
          correctList,
          this.currentCardData["correctAnswers"],
          "keine"
        );

        if (
          Utils.emptyVariable(wordsJustNeedToBeIncluded) == false &&
          wordsJustNeedToBeIncluded !== false &&
          wordsJustNeedToBeIncluded.length > 0
        ) {
          let description = this.cardFooter.querySelector(".description");
          let div = document.createElement("div");
          div.innerHTML = `<b>Oder Wörter, die enthalten sein müssen:</b><span class="alternativeWords"></span>`;
          description.appendChild(div);
          let alternativeWordsList = div.querySelector(".alternativeWords");
          Utils.listOfArrayToHTML(
            alternativeWordsList,
            wordsJustNeedToBeIncluded,
            "Keins"
          );
        }

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
    }
    this.updateScore();
    this.updateHeader();
  }

  showResults() {
    this.calculateMarkByCurrentTotalPoints();
    let resultPageHTML = `
    <h1 style="text-decoration: underline;">Dein Ergebnis</h1>
    <div class="resultContainer container">
        <div class="results">
            <div id="points"><b>Punkte:</b> ${this.usersPoints} / ${this.totalPoints}</div>
            <div id="result"><b>Ergebnis:</b> ${this.correctCardsNumber} / ${this.totalCards}</div>
            <div id="mark"><b>Note:</b> ${this.usersMark}</div>
            <div class="details">
                <div class="totalCards">Gesamtanzahl von Karten: ${this.totalCards}</div>
                <div class="correctCards">Richtige Karten: ${this.correctCardsNumber}</div>
                <div class="wrongCards">Falsche Karten: ${this.wrongCardsNumber}</div>
            </div>
        </div>
        <div id="viewAnswers">
          <button class="btn btn-info" id="toggleChoosenAnswers" type="button" data-bs-toggle="collapse" data-bs-target="#choosenAnswers" aria-expanded="false" aria-controls="choosenAnswers">Genaueres anzeigen</button>
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

    console.log("Result Object", this.resultObject);
    for (const currentUsersChoice of this.resultObject["quizCards"]) {
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

      let appendAnswer = (container, data, type, description = "") => {
        let div = document.createElement("div");
        div.classList.add("answer");
        if (type === "text") {
          div.innerHTML = `<span class="answer">${data}</span> <span>${description}</span>`;
        } else if (type === "image") {
          let src = data["src"];
          let alt = data["alt"];
          div.innerHTML = `<img src="${src}" alt="${alt}" style="width: 50px; height: auto;"><span>${description}</span>`;
        }
        container.appendChild(div);
      };

      let correctOrWrongToRichtigOrFalsch = (input) => {
        if (input === "correct") {
          return "Richtig";
        } else {
          return "Falsch";
        }
      };

      if (type == "mchoice") {
        item.innerHTML = `
            <div id="id"><span class="description">id:</span> ${id}</div>
            <div id="status">Status: ${correctOrWrongToRichtigOrFalsch(
              status
            )}</div>
            <div id="task"><span class="description">Aufgabe:</span> ${quizCard["task"]}</div>
            <div id="question"><span class="description">Frage:</span> ${quizCard["question"]}</div>
            <div id="answers"><span class="description">Antworten:</span> <span class="content"></span></div>
            <div id="usersAnswers"><span class="description">Deine Antwort:</span> <span class="content"></span></div>
            <div id="correctAnswer"><span class="description">Richtige Antwort:</span> <span class="content"></span></div>
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
          } else if (type == "image") {
            appendAnswer(
              li,
              { src: answer["source"], alt: answer["alt"] },
              "image",
              `(id: ${answer["answerID"]})`
            );
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
        <div id="status"><span class="description">Status:</span> ${status}</div>
        <div id="task"><span class="description">Aufgabe:</span> ${quizCard["task"]}</div>
        <div id="question"><span class="description">Frage:</span> ${quizCard["question"]}</div>
        <div id="answers"><span class="description">Antworten:</span> <span class="content"></span></div>
        <div id="usersAnswers">
          <div class="description" id="correct">Korrekt:<span class="content"></span></div>
          <div class="description" id="wrong">Falsch:<span class="content"></span></div>
          <div class="description" id="notChoosen">Nicht ausgewählt:<span class="content"></span></div>
        </div>
        <div id="correctAnswers"><span class="description">Richtige Antwort(en):</span> <span class="content"></span></div>
        `;

        let answersContainer = item.querySelector("#answers .content");
        let usersCorrectAnswersContainer = item.querySelector(
          "#usersAnswers #correct .content"
        );
        let usersWrongAnswersContainer = item.querySelector(
          "#usersAnswers #wrong .content"
        );
        let usersNotChoosenAnswersContainer = item.querySelector(
          "#usersAnswers #notChoosen .content"
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
          } else if (type == "image") {
            appendAnswer(
              li,
              { src: answer["source"], alt: answer["alt"] },
              "image",
              `(id: ${answer["answerID"]})`
            );
          }
          ul.appendChild(li);
        }
        answersContainer.appendChild(ul);

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

        if (usersWrongAnswerIDs && usersWrongAnswerIDs.length > 0) {
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
        <div id="id">id: ${id}</div>
        <div id="status"><span class="description">Status:</span> ${correctOrWrongToRichtigOrFalsch(
          status
        )}</div>
        <div id="caseSensitive"><span class="description">Groß und Kleinschreibung missachen:</span> ${Utils.boolToJaOrNein(
          quizCard["options"]["caseSensitive"]
        )}</div>
        <div id="task"><span class="description">Aufgabe:</span> ${quizCard["task"]}</div>
        <div id="question"><span class="description">Frage:</span> ${quizCard["question"]}</div>
        <div id="usersAnswers"><span class="description">Deine Antwort:</span> <span class="content"></span></div>
        <div id="correctAnswers"><span class="description"><span>Richtige Antworten:<span> </span><span id="correctAnswersList"></span><span> Oder Wörter, die Enthalten sein müssen, um richtig zu sein:<span> </span><span id="wordsJustNeedToBeIncluded"></span></span></div>
        `;

        let usersAnswersContainer = item.querySelector(
          "#usersAnswers .content"
        );
        let correctAnswersContainer = item.querySelector("#correctAnswers #correctAnswersList");
        let wordsJustNeedToBeIncludedContainer = item.querySelector(
          "#correctAnswers #wordsJustNeedToBeIncluded"
        );

        //Fill choosen
        let userInput = currentUsersChoice["usersAnswer"];
        appendAnswer(usersAnswersContainer, userInput, "text");

        //Fill Correct Answers
        let correctAnswers = quizCard["correctAnswers"];
        if (correctAnswers && correctAnswers.length > 0) {
          let ul = document.createElement("ul");
          for (const answer of correctAnswers) {
            let li = document.createElement("li");
            appendAnswer(li, answer, "text");
            ul.appendChild(li)
          }
          correctAnswersContainer.appendChild(ul);
        }
        //Fill wordsJustNeedToBeIncluded
         let wordsJustNeedToBeeIncluded = quizCard["options"]["wordJustNeedsToBeIncluded"];
         if (wordsJustNeedToBeeIncluded && wordsJustNeedToBeeIncluded.length > 0) {
          let ul = document.createElement("ul");
           for (const word of wordsJustNeedToBeeIncluded) {
            let li = document.createElement("li");
             appendAnswer(li, word, "text");
             ul.appendChild(li)
           }
           wordsJustNeedToBeIncludedContainer.appendChild(ul);
         }
      }
      showUserAnswersContainer.appendChild(item);
      item.classList = `${currentUsersChoice["state"]} col-11 col-sm-6 col-md-4 col-lg-4 item col-centered`;
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

// Spoiler show

document.addEventListener("click", (event) => {
  try {
    let target = event.target;
    if (target == null) return;
    //Remove Spoiler
    if (target.classList.contains("spoiler")) {
      target.classList.remove("spoiler");
    } else if (target.parentElement.classList.contains("spoiler")) {
      target.parentElement.classList.remove("spoiler");
    }

    if (
      target.nodeName == "IMG" &&
      target.parentElement.classList.contains("onlineSource")
    ) {
      target.setAttribute("src", target.getAttribute("data-source"));
    }
  } catch (e) {
    console.log("Error:", e);
  }

  //console.log("Target: ", target, "Node name:", target.nodeName);
});
