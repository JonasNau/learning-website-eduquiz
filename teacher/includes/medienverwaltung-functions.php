<?php

function getAllKeywords($conn) {

    $allMediaIDs = getAllValuesFromDatabase($conn, "medienVerwaltung", "id", 0, true);
    if (!$allMediaIDs || !count($allMediaIDs) > 0) return array();
    $allKeywords = array();
    foreach ($allMediaIDs as $currentMediaID) {
        $keywords = json_validate(getValueFromDatabase($conn, "medienVerwaltung", "keywords", "id", $currentMediaID, 1, false));
        if (!$keywords || !count($keywords) > 0) continue;
        foreach ($keywords as $keyword) {
            $allKeywords = addToArray($allKeywords, $keyword, false);
        }
    }
    return $allKeywords;
}

function searchForKeywords($conn, $searchFor) {
    if (!$searchFor || empty($searchFor)) {
        return getAllKeywords($conn);
    } else {
        $allKeywords = getAllKeywords($conn);
        if (!$allKeywords || !count($allKeywords) > 0) return array();
        $resultArray = array();
        foreach ($allKeywords as $keyword) {
            if (str_contains(strtolower($keyword), strtolower($searchFor)) || str_contains(strtoupper($keyword), strtoupper($searchFor))) {
                $resultArray = addToArray($resultArray, $keyword, false);
            }
        }
        return $resultArray;
    }
}