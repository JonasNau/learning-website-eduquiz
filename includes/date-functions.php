<?php

function getUnixTimestampFromStartOfTheDay($unixTimestamp)
{
    if (empty($unixTimestamp)) {
        return false;
    }
    $unixTimestamp = intval($unixTimestamp);
    $day = date('d-m-Y', intval($unixTimestamp));
    $day = new DateTime($day);
    return $day->getTimestamp();
}

function getUnixTimestampFromDate($dateString)
{
    if (empty($dateString)) {
        return false;
    }
    $unixTimestamp = new DateTime($dateString);
    return $unixTimestamp->getTimestamp();
}
