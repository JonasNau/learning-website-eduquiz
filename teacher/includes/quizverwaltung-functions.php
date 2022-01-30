<?php

function searchQuestionsAll($conn, $searchFor)
{
    $resultArray = array();
    $allquizze = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true, true);

    if ($allquizze) {
        foreach ($allquizze as $currentQuiz) {
            $quizData = json_validate(getValueFromDatabase($conn, "selectquiz", "quizdata", "uniqueID", $currentQuiz, 1, false));

            if (!$quizData) continue;
            $quizCards = $quizData?->{"quizCards"} ?? false;
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
        $quizCards = $quizData?->{"quizCards"} ?? false;
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

function searchTasksAll($conn, $searchFor, $questionType = false)
{
    $resultArray = array();
    $allquizze = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true, true);

    if ($allquizze) {
        foreach ($allquizze as $currentQuiz) {
            $quizData = json_validate(getValueFromDatabase($conn, "selectquiz", "quizdata", "uniqueID", $currentQuiz, 1, false));
            if (!$quizData) continue;
            $quizCards = $quizData?->{"quizCards"} ?? false;
            if (!$quizCards) continue;
            foreach ($quizCards as $currentQuizCard) {
                if ($questionType != false || !empty($questionType)) {
                    if ($questionType != $currentQuiz->{"type"}) continue;
                    $task = $currentQuizCard->{"task"};
                    if (!$searchFor) {
                        $resultArray = addToArray($resultArray, $task, false);
                    } else {
                        if (str_contains(strtoLower($task), strtoLower($searchFor)) || str_contains(strtoupper($task), strtoupper($searchFor))) {
                            $resultArray = addToArray($resultArray, $task, false);
                        }
                    }
                } else {
                    $task = $currentQuizCard->{"task"};
                    if (!$searchFor) {
                        $resultArray = addToArray($resultArray, $task, false);
                    } else {
                        if (str_contains(strtoLower($task), strtoLower($searchFor)) || str_contains(strtoupper($task), strtoupper($searchFor))) {
                            $resultArray = addToArray($resultArray, $task, false);
                        }
                    }
                }
               
            }
        }
    }
    return $resultArray;
}