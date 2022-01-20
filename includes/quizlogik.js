import * as Utils from "./utils.js";
import * as Quizfunctions from "./quizlogik.inc.js";

let quizlogicPhpPath = "./includes/quizlogic.php";

class Quiz{
    constructor(container, quizId, quizlogicPhpPath){
      this.container = container;
      this.quizId = quizId;
      this.quizlogicPhpPath = quizlogicPhpPath;
      this.isLoggedIn = false;
    }

    async showStartSite() {
      //Check existence of quiz or is not visible
      if (!await Quizfunctions.quizExists(this.quizId, this.quizlogicPhpPath)) {
        await Utils.alertUser("Quiz existiert nicht", "Sorry, das Quiz existiert nicht.", false);
        window.location = "/choosequiz.php";
        return false;
      }
      
      let quizInformation = await Quizfunctions.getAllQuizInformation(this.quizId);
      if (quizInformation == false || quizInformation["quizdata"] == false) {
        await Utils.alertUser("Fehler beim laden des Quizzes", "Sorry, der Server hat keine Daten für das Quiz zurückgesendet.", false);
        window.location = "/choosequiz.php";
        return false;
      }
      this.quizInformation = quizInformation;



    }

    startQuiz() {

    }

    showResults() {

    }
}

let container = document.querySelector("#quizContainer");
if (!container) {window.location = "/choosequiz.php";}

let urlParams = Utils.getUrlParams(window.location.search);

if (!urlParams.has("quizId")) {
  window.location = "/choosequiz.php";
}
let quizId = urlParams.get("quizId");
let isLoggedIn = await Utils.getAttributesFromServer("./includes/getAttributes.php", "userSystem", "userIsLoggedIn");
let quiz = new Quiz(container, quizId, quizlogicPhpPath, isLoggedIn);
quiz.showStartSite();

