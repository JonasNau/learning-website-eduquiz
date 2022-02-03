<?php
function processRoute($route, $conn, $userID)
{
    $route = strtolower($route);
    $routeArray = explode("/", $route);
    $routeArray = removeEmptyValuesFromArray($routeArray);
    $count = count($routeArray);
    // echo "<br>$count<br>";
    // print_r($routeArray);
    $site = "";
    if (array_key_exists(0, $routeArray)) {
        $site = $routeArray[0];
    }
    $_SESSION["open"] = "yes";
    switch ($site) {
        case ("home"):
            #Permission already checked by accessing sites
            include_once("./sites/home.php");
            return;
            break;
        case ("benutzerverwaltung"):
            if (userHasPermissions($conn, $userID, ["accessBenutzerverwaltung" => gnVP($conn, "accessBenutzerverwaltung")])) {
                include_once("./sites/benutzerverwaltung.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        case ("organisation"):
            if (userHasPermissions($conn, $userID, ["accessOrganisation" => gnVP($conn, "accessOrganisation")])) {
                include_once("./sites/organisation.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        case ("berechtigungsverwaltung"):
            if (userHasPermissions($conn, $userID, ["accessBerechtigungsverwaltung" => gnVP($conn, "accessBerechtigungsverwaltung")])) {
                include_once("./sites/berechtigungsverwaltung.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        case ("settings"):
            if (userHasPermissions($conn, $userID, ["accessSettings" => gnVP($conn, "accessSettings")])) {
                include_once("./sites/settings.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        case ("quizverwaltung"):
            if (userHasPermissions($conn, $userID, ["accessQuizverwaltung" => gnVP($conn, "accessQuizverwaltung")])) {
                include_once("./sites/quizverwaltung.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        case ("medienverwaltung"):
            if (userHasPermissions($conn, $userID, ["accessMediaVerwaltung" => gnVP($conn, "accessMediaVerwaltung")])) {
                include_once("./sites/medienverwaltung.php");
                return;
            }
            echo "Keine Berechtigung";
            break;
        default:

            include_once("./sites/home.php");
    }
}



function getTotal($conn, $sql)
{
    try {
        $stmt = $conn->prepare($sql);
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                return $data["total"];
                die();
            } else {
                echo "Nichts gemacht.";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
}
