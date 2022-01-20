import * as Utils from "./utils.js";

export async function quizExists(quizId) {
  return await Utils.makeJSON(
    await Utils.sendXhrREQUEST(
      "POST",
      "quiz&operation=other&type=quizIsVisible&quizId=" + quizId,
      "./includes/quizlogic.php",
      "application/x-www-form-urlencoded",
      true,
      true,
      false,
      true
    )
  );
}

export async function getAllQuizInformation(quizId) {
    return await Utils.makeJSON(
      await Utils.sendXhrREQUEST(
        "POST",
        "quiz&operation=get&type=getQuizParameter&&secondOperation=getAllQuizInformation&quizId=" + quizId,
        "./includes/quizlogic.php",
        "application/x-www-form-urlencoded",
        true,
        true,
        false,
        true
      )
    );
  }
