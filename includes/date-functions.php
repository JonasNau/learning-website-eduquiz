<?php

function getUnixTimestampFromStartOfTheDay($unixTimestamp) {
    if (empty($unixTimestamp)) {return false;}
    $date = date("d-m-Y", intval($unixTimestamp));
    $unixTimestamp = new DateTime($date);
    return $unixTimestamp->getTimestamp();
}

function getUnixTimestampFromDate($dateString) {
    if (empty($dateString)) {return false;}
    $unixTimestamp = new DateTime(date("d-m-Y", $dateString));
    $unixTimestamp = new DateTime($dateString);
    return $unixTimestamp->getTimestamp();
}