<?php

function searchQuestionsAll($conn, $searchFor)
{
    $resultArray = array();
    $allquizze = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true, true);

    if ($allquizze) {
        foreach ($allquizze as $currentQuiz) {
            $quizData = json_validate(getValueFromDatabase($conn, "selectquiz", "quizdata", "uniqueID", $currentQuiz, 1, false));

            if (!$quizData) continue;
            $quizCards = $quizData->{"Quiz"};
            if (!$quizCards) continue;
            foreach ($quizCards as $currentQuizCard) {
                $question = $currentQuizCard->{"question"};
                if (!$searchFor) {
                    $resultArray = addToArray($resultArray, $question, false);
                } else {
                    if (str_contains(strtoLower($question), strtoLower($searchFor)) || str_contains(strtoupper($question), strtoupper($searchFor))) {
                        $resultArray = addToArray($resultArray, $question, false);
                    }
                }
            }
        }
    }
    return $resultArray;
}

function searchQuestionsOneQuiz($conn, $searchFor, $quizUniqueID)
{
    if ($quizUniqueID) {
        $resultArray = array();
        $quizData = json_validate(getValueFromDatabase($conn, "selectquiz", "quizdata", "uniqueID", $quizUniqueID, 1, false));

        if (!$quizData) return false;
        $quizCards = $quizData->{"Quiz"};
        if (!$quizCards) return false;
        foreach ($quizCards as $currentQuizCard) {
            $question = $currentQuizCard->{"question"};
            if (!$searchFor) {
                $resultArray = addToArray($resultArray, $question, false);
            } else {
                if (str_contains(strtoLower($question), strtoLower($searchFor)) || str_contains(strtoupper($question), strtoupper($searchFor))) {
                    $resultArray = addToArray($resultArray, $question, false);
                }
            }
        }
        return $resultArray;
    }
}
