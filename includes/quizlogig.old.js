import * as Utils from "./utils.js";

const outerContainer = document.querySelector(".outerContainer");

function sendBackChooseQuiz() {
  window.location = `/choosequiz.php?error`;
}

class QuizphpObj {
  constructor() {
    this.startQuizSite = null;
    this.quiz = null;
  }

  setQuizInformation() {
    let startQuizSiteObj = new StartQuizSite();
    startQuizSiteObj.checkQuizID();
    startQuizSiteObj.setEventlistener();
  }
}

/* Seite 1 - Start */
class StartQuizSite {
  constructor() {
    this.startQuizBtn = document.querySelector("#startQuizBtn");
    this.startQuizContainer = document.querySelector(".startQuizContainer");
    this.startQuizDescription = document.querySelector(".quizDescription");
  }
  setQuizId(quizId) {
    window.sessionStorage.setItem("quizId", quizId);
  }

  setEventlistener() {
    this.startQuizBtn.addEventListener("click", (e) => {
      this.startQuizContainer.remove();
      const quizObj = new QuizObj();
      quizphpObj.quiz = quizObj;
      quizphpObj.quiz.startQuiz();

      quizphpObj.quiz.sayHey();
    });
  }

  getQuizParameter(quizID) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getAllQuizParms&quizID=" +
              quizID +
              "&fach=" +
              this.ausgewaehltesFach +
              "&thema=" +
              this.ausgewaehltesThema,
            "./includes/choosequiz.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          resolve(response);
          return true;
        } else {
          reject("Error");
          return false;
        }
      } catch (e) {
        resolve(true);
      }
    });
  }

  setQuizInformation(klasse, fach, thema, quizname) {
    //Set to session storage

    const description = this.startQuizDescription;
    let klasseDescription = description.querySelector(".klasse span");
    let fachDescription = description.querySelector(".fach span");
    let themaDescription = description.querySelector(".thema span");
    let quiznameDescription = description.querySelector(".quizname span");

    klasseDescription.innerHTML = klasse;
    fachDescription.innerHTML = fach;
    themaDescription.innerHTML = thema;
    quiznameDescription.innerHTML = quizname;
  }

  async checkQuizID() {
    //Setzt Navigationsleiste auf quizId Parameter, wenn auf quiz.php (andernfalls redirect)
    const queryString = window.location.search;
    //dev - console.log("Query String: ", queryString);
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has("quizId")) {
      if (window.location.pathname != "/quiz.php") {
        window.location.href = `/quiz.php?quizId=${urlParams.get("quizId")}`;
      } else {
        if (
          urlParams.has("quizId") &&
          window.location.pathname == "/quiz.php"
        ) {
          let quizId = urlParams.get("quizId");
          let error = true;
          let quizParameter = null;

          try {
            quizParameter = await this.getQuizParameter(quizId);
            console.log(quizParameter);
            error = false;
          } catch {
            error = true;
            console.log("Error in getting data");
          }

          if (!error) {
            //If no error in getting Quizparams
            this.setQuizId(quizId);
            let klasse = quizParameter["klassenstufe"];
            let fach = quizParameter["fach"];
            let thema = quizParameter["thema"];
            let quizname = quizParameter["quizname"];
            this.setQuizInformation(klasse, fach, thema, quizname);
          } else {
            console.log("There was an error!");
          }
        }
      }
    } else {
      sendBackChooseQuiz();
    }
  }
}

class CurrentCard {
  constructor() {
    this.header = HTMLElement;
    this.body = HTMLElement;
    this.answersContainer = HTMLElement;

    this.choosenAnswers = Array();
  }
}

class QuizObj {
  constructor() {
    this.userCanChoose = false;
    this.userCanEnter = false;
    this.score = 0;
    this.grade = null;
    this.currentQuestion = null;
    this.totalQuestions = null;
    this.quizId = window.sessionStorage.getItem("quizId");
    this.data = null;
    this.questionData = null;
    quizphpObj.startQuizSite = null;
    this.quizContainer = null;
    this.currentCard = null;

    this.randomQuiz = false;
  }

  playSound(sound) {
    if (sound === "userCorrect") {
      var audio = new Audio("../audio/userCorrect.mp3");
      audio.play();
    }
    if (sound === "userWrong") {
      var audio = new Audio("../audio/userWrong.mp3");
      audio.play();
    }
  }

  questionNumberArray() {
    return this.currentQuestion - 1;
  }
  sayHey() {
    console.log("Hey");
    console.log("QuizID:", this.quizId);
  }
  startQuiz() {
    let quizContainer = document.createElement("div");
    quizContainer.classList.add("quizContainer");
    outerContainer.appendChild(quizContainer);
    this.quizContainer = quizContainer;

    this.getQuizData()
      .then((res) => {
        // console.log("Data:", JSON.parse(res));
        this.prepareQuiz(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  getQuizData() {
    return new Promise(async (resolve, reject) => {
      try {
        let response = Utils.makeJSON(
          await Utils.sendXhrREQUEST(
            "POST",
            "getQuizData&quizId=" + this.quizId,
            "./includes/quizlogik.inc.php",
            "application/x-www-form-urlencoded",
            true,
            false,
            false
          )
        );
        if (response) {
          resolve(response);
          return true;
        } else {
          reject("Error");
          return false;
        }
      } catch (e) {
        resolve(true);
      }
    });
  }

  prepareQuiz(quizData) {
    try {
      this.grade = 1;
      this.data = quizData;
      this.questionData = quizData["Quiz"];

      //Set Question Number
      this.currentQuestion = 0;

      //Load Properties
      this.isRandom = this.data["properties"].isRandom;
      if (this.isRandom === true) {
        console.log("random");
        //Randomize Quizarray (this.data)
        // Randomize Answers

        let questionData = this.questionData;
        let newQuesionData = Utils.shuffle(questionData);

        this.questionData = newQuesionData;

        //Cut array (this.data)
        let limitQuestions = this.data["properties"].limitQuestions;
        if (limitQuestions != false && limitQuestions > 0) {
          this.totalQuestions = limitQuestions;
        }
      } else {
        console.log("not random");
        this.isRandom = false;

        let totalQuestions = this.questionData.length;
        //All Quizzes in Total Questions
        this.totalQuestions = totalQuestions;
      }

      // Randomize Answers
      this.questionData.forEach((card) => {
        let questionType = card.questiontype;
        if (
          questionType === "multipleChoice" ||
          questionType === "multipleChoiceMulti"
        ) {
          let questions = card.answers;
          let newQuestions = Utils.shuffle(questions);
          card.answers = newQuestions;
        }
      });

      this.setNextQuestion();
    } catch (e) {
      alert(
        "Ein Fehler ist aufgetreten. Die Daten vom Server stimmen nicht mit der Logik überein"
      );
      window.location.href = `choosequiz.php?serverErrorNr1`;
    }
  }

  setNextQuestion() {
    this.currentQuestion++;
    if (this.currentQuestion > this.totalQuestions) {
      this.showResults();
      return;
    }
    console.log(this.currentQuestion + "|" + this.totalQuestions);

    window.scrollTo(0, 0);
    this.currentCard = new CurrentCard();

    this.currentCard.currentQuestion = this.currentQuestion;
    this.clear();
    let questionData = this.questionData[this.questionNumberArray()];
    console.log(questionData);

    let questionType = questionData["questiontype"];
    let task = questionData["task"];
    let question = questionData["question"];
    let answers;
    let submitBtn;
    //dev console.log("Type:", questionType, "Task:", task, "Qustion:", question);

    switch (questionType) {
      case "multipleChoice":
        this.quizContainer.innerHTML = `
                <div class="header">
                   
                </div>
                <div class="body">
                    <div class="task">${task}</div>
                    <div class="question">${question}</div>
                    <div class="answersContainer">
                        
                    </div
                </div>
                `;
        this.currentCard.header = this.quizContainer.querySelector(".header");
        this.currentCard.body = this.quizContainer.querySelector(".body");
        //Set Answers
        this.currentCard.answersContainer =
          this.quizContainer.querySelector(".answersContainer");
        answers = questionData["answers"];
        answers.forEach((answer) => {
          let type = answer.type;
          let answerElement;
          let answerID;
          let description = null;
          switch (type) {
            case "text":
              //Create this Element
              answerElement = document.createElement("button");
              answerElement.setAttribute("type", "button");
              answerID = answer.answerID;
              answerElement.setAttribute("data-id", answerID);
              answerElement.classList.add("answer");

              answerElement.innerHTML = `
                             <span class="text">${answer.text}</span>
                             `;

              this.currentCard.answersContainer.appendChild(answerElement);

              //Eventlistener
              answerElement.addEventListener("click", () => {
                this.validateAnswerMultipleChoice(answerID);
              });
              break;
            case "image":
              //Create this Element
              answerElement = document.createElement("button");
              answerElement.setAttribute("type", "button");

              let description = "";

              //If description set image description
              answerID = answer.answerID;
              if (answer.description != null) {
                description = `<div class="description">${answer.description}</div>`;
              }

              answerElement.setAttribute("data-id", answerID);
              answerElement.classList.add("answer");

              if (answer["imageUrl"]) {
                //If imageUrl
                answerElement.innerHTML = `
                                <span class="image">
                                    <img src='${answer["imageUrl"]}' alt="${answer["imageUrl"]}">
                                    ${description}
                                </span>
                                `;
              } else {
                let imagePath = `images/quizImages/`;
                answerElement.innerHTML = `
                                <span class="image">
                                    <img src='${imagePath}${answer["imageID"]}' alt="${imagePath}${answer["imageID"]}">
                                    ${description}
                                </span>
                                `;
              }

              this.currentCard.answersContainer.appendChild(answerElement);

              //Eventlistener
              answerElement.addEventListener("click", () => {
                this.validateAnswerMultipleChoice(answerID);
              });
              break;
            default:
              alert(
                "Ein Fehler ist aufgetreten. Die Daten vom Server stimmen nicht mit der Logik überein"
              );
              window.location.href = `choosequiz.php?serverErrorNr3`;
              break;
          }
        });

        this.setHeader();
        this.changeUserCanChoose(true);
        break;
      //--Text Input----------------------------------------------- Text Input
      case "textInput":
        this.quizContainer.innerHTML = `
                <div class="header">
                   
                </div>
                <div class="body">
                    <div class="task">${task}</div>
                    <div class="question">${question}</div>
                    <div class="answersContainer">
                        
                    </div
                </div>
                `;

        this.currentCard.header = this.quizContainer.querySelector(".header");
        this.currentCard.body = this.quizContainer.querySelector(".body");
        //Set Textbox
        this.currentCard.answersContainer =
          this.quizContainer.querySelector(".answersContainer");

        let textBoxInput = document.createElement("input");
        textBoxInput.classList.add("userInputTextBox");
        textBoxInput.setAttribute("type", "text");
        this.currentCard.answersContainer.appendChild(textBoxInput);

        const inputHandler = function (e) {
          console.log(e.target.value);
        };

        textBoxInput.addEventListener("input", inputHandler);
        textBoxInput.addEventListener("propertychange", inputHandler);

        submitBtn = document.createElement("button");
        submitBtn.innerText = `Fertig`;
        submitBtn.classList.add(`submitBtn`);
        submitBtn.setAttribute("type", "button");
        this.currentCard.answersContainer.appendChild(submitBtn);

        textBoxInput.addEventListener("keydown", (key) => {
          console.log(key);
          key = key.key;
          if (key === "Enter") {
            this.validateAnswerTextInput(textBoxInput.value);
          }
        });

        submitBtn.addEventListener("click", () => {
          this.validateAnswerTextInput(textBoxInput.value);
        });

        this.setHeader();
        this.changeUserCanEnter(true);
        break;
      case "multipleChoiceMulti":
        //Multiple Choice Multi --------------------------------------
        this.quizContainer.innerHTML = `
                    <div class="header">
                       
                    </div>
                    <div class="body">
                        <div class="task">${task}</div>
                        <div class="question">${question}</div>
                        <div class="answersContainer">
                            
                        </div
                    </div>
                    `;
        this.currentCard.header = this.quizContainer.querySelector(".header");
        this.currentCard.body = this.quizContainer.querySelector(".body");
        //Set Answers
        this.currentCard.answersContainer =
          this.quizContainer.querySelector(".answersContainer");
        answers = questionData["answers"];
        answers.forEach((answer) => {
          let type = answer.type;
          let answerElement;
          let answerID;
          switch (type) {
            case "text":
              //Create this Element
              answerElement = document.createElement("button");
              answerElement.setAttribute("type", "button");
              answerID = answer.answerID;
              answerElement.setAttribute("data-id", answerID);
              answerElement.classList.add("answer");

              answerElement.innerHTML = `
                                 <span class="text">${answer.text}</span>
                                 `;

              this.currentCard.answersContainer.appendChild(answerElement);

              //Eventlistener
              answerElement.addEventListener("click", () => {
                this.toggleAnswerMultiMultiChoice(answerID);
              });
              break;
            case "image":
              //Create this Element
              answerElement = document.createElement("button");
              answerElement.setAttribute("type", "button");
              answerID = answer.answerID;
              //If description set image description
              answerID = answer.answerID;

              let description = "";

              if (answer.description != null) {
                description = `<div class="description">${answer.description}</div>`;
              }

              answerElement.setAttribute("data-id", answerID);
              answerElement.classList.add("answer");

              if (answer["imageUrl"]) {
                //If imageUrl
                answerElement.innerHTML = `
                                    <span class="image">
                                        <img src='${answer["imageUrl"]}' alt="${answer["imageUrl"]}">
                                        ${description}
                                    </span>
                                    `;
              } else {
                let imagePath = `images/quizImages/`;
                answerElement.innerHTML = `
                                    <span class="image">
                                        <img src='${imagePath}${answer["imageID"]}' alt="${imagePath}${answer["imageID"]}">
                                        ${description}
                                    </span>
                                    `;
              }

              this.currentCard.answersContainer.appendChild(answerElement);

              //Eventlistener
              answerElement.addEventListener("click", () => {
                this.toggleAnswerMultiMultiChoice(answerID);
              });

              break;
            default:
              alert(
                "Ein Fehler ist aufgetreten. Die Daten vom Server stimmen nicht mit der Logik überein"
              );
              window.location.href = `choosequiz.php?serverErrorNr3`;
              break;
          }
        });

        submitBtn = document.createElement("button");
        submitBtn.setAttribute("type", "button");
        submitBtn.classList.add("submitBtn");
        this.currentCard.answersContainer.appendChild(submitBtn);
        submitBtn.innerText = `Bestätigen`;
        submitBtn.addEventListener("click", () => {
          this.validateAnswerMultipleChoiceMulti();
        });

        this.setHeader();
        this.changeUserCanChoose(true);

        break;
      default:
        alert(
          "Ein Fehler ist aufgetreten. Die Daten vom Server stimmen nicht mit der Logik überein"
        );
        window.location.href = `choosequiz.php?serverErrorNr4`;
        break;
    }
  }

  toggleAnswerMultiMultiChoice(answerID) {
    if (this.userCanChoose === false) return;
    //Select clicked Item
    let currentButton = this.currentCard.answersContainer.querySelector(
      `.answer[data-id="${answerID}"]`
    );
    console.log(currentButton);

    //Toggle in anwers Array
    let currentArray = this.currentCard.choosenAnswers;

    function toggleValueinArray(array, value) {
      var index = array.indexOf(value);
      if (index > -1) {
        array.splice(index, 1);
        currentButton.classList.remove("choosen");
      } else {
        array.push(value);
        currentButton.classList.add("choosen");
      }
      return array;
    }

    let newArray = toggleValueinArray(currentArray, answerID);
    this.currentCard.choosenAnswers = newArray;
    //Toggle with userFeedback (selected or not)
    console.log(this.currentCard.choosenAnswers);
  }

  validateAnswerMultipleChoiceMulti() {
    if (this.userCanChoose === false) return;
    this.userCanChoose = false;
    let correctAnswers =
      this.questionData[this.questionNumberArray()].correctAnswersID;
    let choosenAnswers = this.currentCard.choosenAnswers;

    console.log("Correct Answers:", correctAnswers);
    //Überpfüft, ob alle gewählten und die richtigen Antworten übereinstimmen
    let correctAnswersTest = Utils.copyArray(correctAnswers);
    let choosenAnswersTest = Utils.copyArray(this.currentCard.choosenAnswers);

    function test() {
      return new Promise((resolve, reject) => {
        correctAnswers.forEach((element) => {
          let index = choosenAnswersTest.indexOf(element);
          if (index > -1) {
            //Is inside UsersArray
            let indexCorrect = correctAnswersTest.indexOf(element);
            correctAnswersTest.splice(indexCorrect, 1);
            let indexChoosen = choosenAnswersTest.indexOf(element);
            choosenAnswersTest.splice(indexChoosen, 1);
          } else {
            //Is not inside UsersArray
            resolve(false);
          }
        });

        console.log(
          "CorrectAnswers:",
          correctAnswersTest,
          "ChoosenAnswers:",
          choosenAnswersTest
        );
        if (correctAnswersTest.length == 0 && choosenAnswersTest.length == 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }

    test().then((res) => {
      if (res === true) {
        //User is correct
        this.scoreAdd();
        this.playSound("userCorrect");
        this.userFeedbackMultipeChoiceMulti(
          res,
          correctAnswers,
          choosenAnswers
        );
      } else {
        //User is wrong
        this.playSound("userWrong");
        this.userFeedbackMultipeChoiceMulti(
          res,
          correctAnswers,
          choosenAnswers
        );
      }
    });
  }

  setHeader() {
    let header = this.currentCard.header;
    header.innerHTML = `
        <div class="description">
            <span class="questionNumber">Frage: <span class="bold text">${this.currentQuestion}/${this.totalQuestions}</span></span>
            <span class="points">Punkte: <span class="bold text">${this.score}</span></span>
            <span class="grade">Note: <span class="bold text">${this.grade}</span></span>   
        </div>
        
        `;

    this.setMediaAsTask();
  }

  //Current Project
  setMediaAsTask() {
    if (
      this.questionData[this.questionNumberArray()].questionImages != null ||
      this.questionData[this.questionNumberArray()].questionVideos != null
    ) {
      let mediaContainer = document.createElement("div");
      mediaContainer.classList.add("mediaContainer");
      let containerToAppend = this.currentCard.body.querySelector(".question");
      Utils.insertAfter(containerToAppend, mediaContainer);
      console.log(mediaContainer);

      if (
        this.questionData[this.questionNumberArray()].questionVideos != null
      ) {
        //Insert Videos into the mediaContainer
        let videos =
          this.questionData[this.questionNumberArray()].questionVideos;
        videos.forEach((element) => {
          console.log("Element", element);
          let videoContainer = document.createElement("div");
          videoContainer.classList.add("videosContainer");
          let innerHTML = null;
          if (element.description) {
            innerHTML = `<div class='description'>${element.description}</div>`;
          }
          if (element.ytvideohtml != null) {
            innerHTML += element.ytvideohtml;
          }
          if (innerHTML != null) {
            videoContainer.innerHTML = innerHTML;
            mediaContainer.appendChild(videoContainer);
            console.log(videoContainer);
            console.log("Video set");
          }
        });
      }

      if (
        this.questionData[this.questionNumberArray()].questionImages != null
      ) {
        //Insert Images into the mediaContainer
        let images =
          this.questionData[this.questionNumberArray()].questionImages;
        console.log(images);
        images.forEach((element) => {
          console.log("Element", element);
          let imageContainer = document.createElement("div");
          imageContainer.classList.add("imageContainer");
          let innerHTML = null;
          if (element.description) {
            innerHTML = `<div class='description'>${element.description}</div>`;
          }
          if (element.imageID != null) {
            let imagePath = `images/quizImages/`;

            innerHTML += `<img src="${imagePath}${element.imageID}" alt="${imagePath}${element.imageID}">`;
            console.log("imageID");
          } else {
            if (element.imageUrl) {
              innerHTML += `<img src="${element.imageUrl}"" alt="${element.imageUrl}">`;
              console.log("imageURL");
            }
          }
          if (innerHTML != null) {
            imageContainer.innerHTML = innerHTML;
            mediaContainer.appendChild(imageContainer);
            console.log(imageContainer);
          }
        });
      }
    }
  }

  changeUserCanChoose(setting) {
    this.userCanChoose = setting;
  }

  changeUserCanEnter(setting) {
    this.userCanEnter = setting;
  }

  validateAnswerMultipleChoice(userCoiceId) {
    if (!this.userCanChoose) return;
    //Deaktiviert das zweimal klicken
    this.changeUserCanChoose(false);

    console.log("Choice ID = " + userCoiceId);
    //Right answer
    //deactivated let correctAnswer = this.questionData[this.questionNumberArray()].correctAnswer;
    let correctAnswerID =
      this.questionData[this.questionNumberArray()].correctAnswerID;
    console.log(this.questionData[this.questionNumberArray()]);
    console.log("The correct answerID is:", correctAnswerID);
    let correct = false;

    if (correctAnswerID == userCoiceId) {
      correct = true;
      this.scoreAdd();
    }

    this.userFeedbackMultipeChoice(correct, correctAnswerID, userCoiceId);
  }

  validateAnswerTextInput(userInput) {
    if (this.userCanEnter === false) return;
    this.changeUserCanEnter(false);
    let correctAnswer =
      this.questionData[this.questionNumberArray()].correctAnswer;
    let correctAnswerElse =
      this.questionData[this.questionNumberArray()].correctAnswerElse;
    let correctAnswers = new Array();
    correctAnswers.push(correctAnswer);
    correctAnswerElse.forEach((element) => {
      correctAnswers.push(element);
    });
    console.log(correctAnswers);
    let correct = false;
    if (correctAnswers.includes(userInput)) {
      correct = true;
      this.scoreAdd();
    }
    this.userFeedbackTextInput(correct, userInput);
  }

  scoreAdd() {
    this.score++;
  }

  userFeedbackTextInput(userIsCorrect, userInput) {
    let body = this.currentCard.body;
    let answers = body.querySelectorAll(".answersContainer > .answer");
    let message = "";
    if (userIsCorrect) {
      //Färbt das richtige ein
      message = `Sehr gut!`;
    } else {
      message = `Leider Falsch.`;
    }

    let messageContainer = document.createElement("div");
    messageContainer.classList.add("messageContainer");
    messageContainer.innerHTML = `
        <div class="description">${message}</div>
        `;
    body.append(messageContainer);

    let continueBtn = document.createElement("button");
    continueBtn.classList.add("continueBtn");
    continueBtn.innerText = `Weiter`;
    messageContainer.appendChild(continueBtn);
    if (userIsCorrect) {
      this.playSound("userCorrect");
      messageContainer.classList.add("messageContainerCorrect");
    } else {
      this.playSound("userWrong");
      messageContainer.classList.add("messageContainerWrong");
    }
    continueBtn.addEventListener("click", () => {
      this.setNextQuestion();
    });
  }

  userFeedbackMultipeChoice(userIsCorrect, correctAnswerID, userCoiceId) {
    let body = this.currentCard.body;
    let answers = body.querySelectorAll(".answersContainer > .answer");
    let message = "";
    if (userIsCorrect) {
      //Färbt das richtige ein
      message = `Sehr gut!`;

      answers.forEach((answer) => {
        let answerID = answer.getAttribute("data-id");
        console.log(answerID);
        if (answerID == correctAnswerID) {
          answer.classList.add("correct");
        }
      });
    } else {
      answers.forEach((answer) => {
        message = `Leider Falsch!`;
        let answerID = answer.getAttribute("data-id");
        if (answerID == correctAnswerID) {
          answer.classList.add("correct");
        }
        if (answerID == userCoiceId) {
          answer.classList.add("wrong");
        }
      });
    }

    let messageContainer = document.createElement("div");
    messageContainer.classList.add("messageContainer");
    messageContainer.innerHTML = `
        <div class="description">${message}</div>
        `;
    body.append(messageContainer);

    let continueBtn = document.createElement("button");
    continueBtn.classList.add("continueBtn");
    continueBtn.innerText = `Weiter`;
    messageContainer.appendChild(continueBtn);
    if (userIsCorrect) {
      this.playSound("userCorrect");
      messageContainer.classList.add("messageContainerCorrect");
    } else {
      this.playSound("userWrong");
      messageContainer.classList.add("messageContainerWrong");
    }
    continueBtn.addEventListener("click", () => {
      this.setNextQuestion();
    });
  }

  userFeedbackMultipeChoiceMulti(
    userIsCorrect,
    correctAnswers,
    choosenAnswers
  ) {
    let body = this.currentCard.body;
    let answers = body.querySelectorAll(".answersContainer > .answer");
    console.log(answers);
    let message = "";
    if (userIsCorrect) {
      //Färbt die richtigen ein
      message = `Sehr gut!`;
      console.log(correctAnswers);
      answers.forEach((answer) => {
        answer.classList.remove("choosen");
        let answerID = answer.getAttribute("data-id");
        console.log("Answer ID:", answerID);
        console.log("Correct Answers:", correctAnswers);
        if (correctAnswers.indexOf(Number(answerID)) > -1) {
          answer.classList.add("correct");
        }
      });
    } else {
      answers.forEach((answer) => {
        let answerID = answer.getAttribute("data-id");
        message = `Leider Falsch!`;
        answer.classList.remove("choosen");

        //check if this.answer is in choosen list and correctList -> if yes add .correct else add .wrong
        if (choosenAnswers.indexOf(Number(answerID)) > -1) {
          if (correctAnswers.indexOf(Number(answerID)) > -1) {
            answer.classList.add("correct");
          } else {
            if (correctAnswers.indexOf(Number(answerID)) == -1) {
              answer.classList.add("wrong");
            }
          }
        } else {
          if (correctAnswers.indexOf(Number(answerID)) > -1) {
            answer.classList.add("acualCorrectAnswer");
          }
        }
        //check if this.answer is in choosen list and not correct List -> add .wrong

        //check if answer is in correct answerList -> add . .acualCorrectAnswer
      });
    }

    let messageContainer = document.createElement("div");
    messageContainer.classList.add("messageContainer");
    messageContainer.innerHTML = `
        <div class="description">${message}</div>
        `;
    body.append(messageContainer);

    let continueBtn = document.createElement("button");
    continueBtn.classList.add("continueBtn");
    continueBtn.innerText = `Weiter`;
    messageContainer.appendChild(continueBtn);
    if (userIsCorrect) {
      messageContainer.classList.add("messageContainerCorrect");
    } else {
      messageContainer.classList.add("messageContainerWrong");
    }
    continueBtn.addEventListener("click", () => {
      this.setNextQuestion();
    });
  }

  clear() {
    this.quizContainer.innerHTML = "";
  }

  showResults() {
    alert(this.score + " von " + this.totalQuestions + " erreicht.");
    window.location.href = `choosequiz.php`;
  }
}

const quizphpObj = new QuizphpObj();
quizphpObj.setQuizInformation();
