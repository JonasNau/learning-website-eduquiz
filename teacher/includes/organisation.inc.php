<?php
require_once("../../includes/dbh.incPDO.php");
require_once("../../includes/getSettings.php");
require_once("../../includes/userSystem/functions/permission-functions.php");
require_once("../../includes/generalFunctions.php");
require_once("../../includes/userSystem/functions/generalFunctions.php");
require_once("../../includes/userSystem/autologin.php");
require_once("../../includes/userSystem/functions/login-functions.php");
require_once("./lehrerpanel.inc.php");

require_once("../../global.php");

mustBeLoggedIn();

$userID = $_SESSION['userID'];

$database = new dbh();
$conn = $database->connect();


if (isset($_POST["klassenstufenverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessKlassenstufenverwaltung" => gnVP($conn, "accessKlassenstufenverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }
            $results = limitArray($results, $limitResults);
            $resultArray = array();

            foreach ($results as $result) {
                $showQuizAuswahl = getValueFromKlassenstufenInDatabase($conn, $result, "showQuizauswahl");
                $userCanBe = getValueFromKlassenstufenInDatabase($conn, $result, "userCanBe");
                $quizCanBeCreated = getValueFromKlassenstufenInDatabase($conn, $result, "quizCanBeCreated");
                $resultArray[] = array("klassenstufe" => $result, "showQuizauswahl" => $showQuizAuswahl, "userCanBe" => $userCanBe, "quizCanBeCreated" => $quizCanBeCreated);
            }
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $klassenstufen = getAllKlassenstufenFromDatabase($conn);
            if (!$klassenstufen) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($klassenstufen as $klassenstufe) {
                if (str_contains(strtolower($klassenstufe), strtolower($input))) {
                    $resultArray[] = $klassenstufe;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByShowQuizAuswahl") {
            $input = $_POST["input"];
            returnResults($conn, getKlassenstufenFromDatabaseWhere($conn, "showQuizAuswahl", $input), $limitResults);
            die();
        } else if ($filter === "filterByUserCanBe") {
            $input = $_POST["input"];
            returnResults($conn, getKlassenstufenFromDatabaseWhere($conn, "userCanBe", $input), $limitResults);
            die();
        } else if ($filter === "filterByQuizCanBeCreated") {
            $input = $_POST["input"];
            returnResults($conn, getKlassenstufenFromDatabaseWhere($conn, "quizCanBeCreated", $input), $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllKlassenstufenFromDatabase($conn), $limitResults);
            die();
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $klassenstufe = $_POST["klassenstufe"];
        if (!klassenstufeExistsInDatabase($conn, $klassenstufe)) {
            $returnArray = array();
            $returnArray["message"] = "Die Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {

            if (empty($klassenstufe)) {
                echo "no results";
                die();
            }

            $showQuizAuswahl = getValueFromKlassenstufenInDatabase($conn, $klassenstufe, "showQuizauswahl");
            $userCanBe = getValueFromKlassenstufenInDatabase($conn, $klassenstufe, "userCanBe");
            $quizCanBeCreated = getValueFromKlassenstufenInDatabase($conn, $klassenstufe, "quizCanBeCreated");
            echo json_encode(array("klassenstufe" => $klassenstufe, "showQuizauswahl" => $showQuizAuswahl, "userCanBe" => $userCanBe, "quizCanBeCreated" => $quizCanBeCreated));
        }
    } else if ($operation === "changeValue") {
        $klassenstufe = $_POST["klassenstufe"];
        if (!klassenstufeExistsInDatabase($conn, $klassenstufe)) {
            $returnArray = array();
            $returnArray["message"] = "Die Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }
        $type = $_POST["type"];

        if ($type === "changeNameFromKlassenstufe") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für die Klassenstufe darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (klassenstufeExistsInDatabase($conn, $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits eine Klassenstufe mit dem Namen $newName";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameKlassenstueInDatabase($conn, $klassenstufe, $newName)) {
                $changedQuizzes = $returnArray["changedQuizzes"];
                $success = $returnArray["success"];
                if ($success) {
                    $returnArray = array();
                    $returnArray["message"] = "Der Name der Klassenstufe wurde von $klassenstufe zu $newName umbenannt. Alle Quiz ($changedQuizzes), die die Klassenstufe hatten wurden automatisch mit verschoben.";
                    echo json_encode($returnArray);
                    die();
                } else {
                    $returnArray = array();
                    $returnArray["message"] = "Der Name der Klassenstufe konnte nicht geändert werden.";
                    echo json_encode($returnArray);
                    die();
                }
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Der Name der Klassenstufe konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeShowQuizAuswahl") {
            $newValue = intval($_POST["input"]);

            if (setValueFromKlassenstufenInDatabase($conn, $klassenstufe, "showQuizauswahl", $newValue)) {
                $returnArray = array();
                $returnArray["message"] = "Klassenstufe $klassenstufe erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeUserCanBe") {
            $newValue = intval($_POST["input"]);


            if (setValueFromKlassenstufenInDatabase($conn, $klassenstufe, "userCanBe", $newValue)) {
                $returnArray = array();
                $returnArray["message"] = "Klassenstufe $klassenstufe erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeQuizCanBeCreated") {
            $newValue = intval($_POST["input"]);

            if (setValueFromKlassenstufenInDatabase($conn, $klassenstufe, "quizCanBeCreated", $newValue)) {
                $returnArray = array();
                $returnArray["message"] = "Klassenstufe $klassenstufe erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        }
    } else if ($operation === "deleteKlassenstufe") {
        $klassenstufe = $_POST["klassenstufe"];
        if (!klassenstufeExistsInDatabase($conn, $klassenstufe)) {
            $returnArray = array();
            $returnArray["message"] = "Die Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }

        if ($returnArray = deleteKlassenstufeFromDatabase($conn, $klassenstufe)) {
            $verschobeneQuizze = intval($returnArray["verschobeneQuizze"]);
            $backupKlassenstufe = $returnArray["backupKlassenstufe"];

            echo json_encode($returnArray);
        }
    } else if ($operation === "createKlassenstufe") {
        $klassenstufe = $_POST["klassenstufe"];

        $returnArray = createKlassenstufeInDatabase($conn, $klassenstufe);
        if ($returnArray) {
            echo json_encode($returnArray);
            die();
        } else {
            $returnArray = array();
            $returnArray["message"] = "Klassenstufe $klassenstufe konnte nicht erstellt werden. Ein Fehler ist aufgetreten.";
            echo json_encode($returnArray);
            die();
        }
    }
}


if (isset($_POST["backupKlassenstufenverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    if (!userHasPermissions($conn, $userID, ["accessKlassenstufenverwaltung" => gnVP($conn, "accessKlassenstufenverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $klassenstufeBefore = getValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBefore", "klassenstufeBackup", $result, 1, false);
                $deletedAt = getValueFromDatabase($conn, "backupKlassenstufen", "deletedAt", "klassenstufeBackup", $result, 1, false);
                $quizzesAvailable = getAllQuizzesWhichHasBackupKlassenstufe($conn, $result);
                if ($quizzesAvailable == false) {
                    $quizzesAvailable = 0;
                } else {
                    $quizzesAvailable = count($quizzesAvailable);
                }

                $resultArray[] = array("name" => $result, "klassenstufeBefore" => $klassenstufeBefore, "deletedAt" => $deletedAt, "quizzesAvailableNum" => $quizzesAvailable);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $backupKlassenstufen = getAllBackupKlassenstufenByNameFromDatabase($conn);
            if (!$backupKlassenstufen) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($backupKlassenstufen as $backupKlassenstufe) {
                if (str_contains(strtolower($backupKlassenstufe), strtolower($input))) {
                    $resultArray[] = $backupKlassenstufe;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByKlassenstufeBefore") {
            $input = $_POST["input"];

            $availableBackupKlassenstufen = getAllBackupKlassenstufenByNameFromDatabase($conn);
            if ($availableBackupKlassenstufen == false) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($availableBackupKlassenstufen as $current) {
                $klassenstufeBefore = getValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBefore", "klassenstufeBackup", $current, 1, false);
                if (str_contains(strtolower($klassenstufeBefore), strtolower($input))) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "quizzesAvailable") {
            $input = $_POST["input"];

            $availableBackupKlassenstufen = getAllBackupKlassenstufenByNameFromDatabase($conn);
            if ($availableBackupKlassenstufen == false) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($availableBackupKlassenstufen as $current) {
                $hasQuizzes = getAllQuizzesWhichHasBackupKlassenstufe($conn, $current);
                if ($hasQuizzes == boolval($input)) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            $availableBackupKlassenstufen = getAllBackupKlassenstufenByNameFromDatabase($conn);
            if ($availableBackupKlassenstufen == false) {
                returnResults($conn, false, $limitResults);
                die();
            } else {
                returnResults($conn, $availableBackupKlassenstufen, $limitResults);
            }
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }

        $klassenstufe = $_POST["klassenstufe"];
        if (!valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufe)) {
            $returnArray = array();
            $returnArray["message"] = "Die Backup-Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {
            if (empty($klassenstufe)) {
                $resultArray = array();
                $resultArray["message"] = "Die Klassenstufe darf nicht leer sein";
                echo json_encode($returnArray);
                die();
            }

            $klassenstufeBefore = getValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBefore", "klassenstufeBackup", $klassenstufe, 1, false);
            $deletedAt = getValueFromDatabase($conn, "backupKlassenstufen", "deletedAt", "klassenstufeBackup", $klassenstufe, 1, false);
            $quizzesAvailable = getAllQuizzesWhichHasBackupKlassenstufe($conn, $klassenstufe);
            if ($quizzesAvailable == false) {
                $quizzesAvailable = 0;
            } else {
                $quizzesAvailable = count($quizzesAvailable);
            }
            $resultArray = array();
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode(array("name" => $klassenstufe, "klassenstufeBefore" => $klassenstufeBefore, "deletedAt" => $deletedAt, "quizzesAvailableIDs" => $quizzesAvailable));
            die();
        }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["klassenstufenverwaltungChangeValues" => gnVP($conn, "klassenstufenverwaltungChangeValues")])) {
            $returnArray = array();
            $returnArray["permissionDenied"] = true;
            echo json_encode($returnArray);
            die();
        }
        $klassenstufe = $_POST["klassenstufe"];
        if (!valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufe)) {
            $returnArray = array();
            $returnArray["message"] = "Die Backup-Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }

        $type = $_POST["type"];

        if ($type === "changeNameFromBackupKlassenstufe") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für die Klassenstufe darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits eine Backup-Klassenstufe mit dem Namen $newName. Gib einen anderen ein.";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameBackupKlassenstueInDatabase($conn, $klassenstufe, $newName)) {
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Der Name der Backup-Klassenstufe konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "recoverBackupKlassenstufe") {
            $returnArray = array();
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für die Klassenstufe darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (valueInDatabaseExists($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits eine Klassenstufe mit dem Namen $newName. Gib einen anderen ein.";
                echo json_encode($returnArray);
                die();
            }

            //Create new Klassenstufe
            if (createKlassenstufeInDatabase($conn, $newName)) {
                //Move quizzes
                $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "klassenstufe", $klassenstufe, 0, true);

                logWrite($conn, "organisationLOG", "Zu verschiebende Quiz von $klassenstufe zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
                $verschobeneQuizze = 0;
                if ($zuVerschiebendeQuizze) {
                    foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                        //Set all Quizzes that have the grade to backupGrade -> check again
                        logWrite($conn, "organisationLOG", "Aktuelles Quiz von $klassenstufe zu $newName verschieben: " . $currentQuizUniqueID, true);
                        if (!setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                        } else {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach $newName verschoben.", true);
                        }
                    }
                    $verschobeneQuizze = count($zuVerschiebendeQuizze);
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Backup-Klassenstufe umbenannt und $verschobeneQuizze zu $newName verschoben.";
                } else {
                    $verschobeneQuizze = 0;
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Backup-Klassenstufe umbenannt Keine Quiz verschoben. (bereit zum löschen)";
                }

                //Delete Old form backupklassenstufe
                if ($returnArray = deleteBackupKlassenstufeFromDatabase($conn, $klassenstufe)) {
                    if ($returnArray["status"]) {
                        $returnArray["message"] = "Klassenstufe $klassenstufe wurde erfolgreich wiederhergestellt. Der Name ist $newName. Es wurden darurch $verschobeneQuizze Quiz verschoben.";
                        echo json_encode($returnArray);
                    } else {
                        echo json_encode($returnArray);
                    }
                }
            }
        } else if ($type === "deleteBackupKlassenstufe") {
            if ($returnArray = deleteBackupKlassenstufeFromDatabase($conn, $klassenstufe)) {
                echo json_encode($returnArray);
            }
        }
    }
}


if (isset($_POST["faecherverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessFaecherverwaltung" => gnVP($conn, "accessKlassenstufenverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $showQuizAuswahl = getValueFromDatabase($conn, "faecherVerwaltung", "showQuizAuswahl", "fach", $result, 1, false);
                $quizCanBeCreated = getValueFromDatabase($conn, "faecherVerwaltung", "quizCanBeCreated", "fach", $result, 1, false);
                $resultArray[] = array("fach" => $result, "showQuizauswahl" => $showQuizAuswahl, "quizCanBeCreated" => $quizCanBeCreated);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $faecher = getAllFaecherFromDatabase($conn);
            if (!$faecher) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($faecher as $fach) {
                if (str_contains(strtolower($fach), strtolower($input))) {
                    $resultArray[] = $fach;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByShowQuizAuswahl") {
            $input = $_POST["input"];
            returnResults($conn, getValueFromDatabase($conn, "faecherVerwaltung", "fach", "showQuizAuswahl", $input, 0, true), $limitResults);
            die();
        } else if ($filter === "filterByQuizCanBeCreated") {
            $input = $_POST["input"];
            returnResults($conn, getValueFromDatabase($conn, "faecherVerwaltung", "fach", "quizCanBeCreated", $input, 0, true), $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllFaecherFromDatabase($conn), $limitResults);
            die();
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $fach = $_POST["fach"];
        if (!valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fach)) {
            $returnArray = array();
            $returnArray["message"] = "Die Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {

            if (empty($fach)) {
                echo "no results";
                die();
            }

            $showQuizAuswahl = getValueFromDatabase($conn, "faecherVerwaltung", "showQuizAuswahl", "fach", $fach, 1, false);
            $quizCanBeCreated = getValueFromDatabase($conn, "faecherVerwaltung", "quizCanBeCreated", "fach", $fach, 1, false);

            echo json_encode(array("name" => $fach, "showQuizauswahl" => $showQuizAuswahl, "quizCanBeCreated" => $quizCanBeCreated));
        }
    } else if ($operation === "changeValue") {
        $fach = $_POST["fach"];
        if (!valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fach)) {
            $returnArray = array();
            $returnArray["message"] = "Die Klassenstufe, die du bearbeiten möchtest gibt es nicht. ($klassenstufe)";
            echo json_encode($returnArray);
            die();
        }
        $type = $_POST["type"];

        if ($type === "changeName") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Fach darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits ein Fach mit dem Namen $newName";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameFachInDatabase($conn, $fach, $newName)) {
                $changedQuizzes = $returnArray["verschobeneQuizze"];
                $success = $returnArray["success"];
                if ($success) {
                    $returnArray = array();
                    $returnArray["message"] = "Der Name des Faches wurde von $fach zu $newName umbenannt. Alle Quiz ($changedQuizzes), die die Klassenstufe hatten wurden automatisch mit verschoben.";
                    echo json_encode($returnArray);
                    die();
                } else {
                    $returnArray = array();
                    $returnArray["message"] = "Der Name des Faches konnte nicht geändert werden.";
                    echo json_encode($returnArray);
                    die();
                }
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Der Name der Klassenstufe konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeShowQuizAuswahl") {
            $newValue = intval($_POST["input"]);

            if (setValueFromDatabase($conn, "faecherVerwaltung", "showQuizAuswahl", "fach", $fach, $newValue, false)) {
                $returnArray = array();
                $returnArray["message"] = "Fach $fach erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeQuizCanBeCreated") {
            $newValue = intval($_POST["input"]);

            if (setValueFromDatabase($conn, "faecherVerwaltung", "quizCanBeCreated", "fach", $fach, $newValue, false)) {
                $returnArray = array();
                $returnArray["message"] = "Fach $fach erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        }
    } else if ($operation === "deleteFach") {
        $fach = $_POST["fach"];
        if (!valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fach)) {
            $returnArray = array();
            $returnArray["message"] = "Das Fach, das du bearbeiten möchtest gibt es nicht. ($fach)";
            echo json_encode($returnArray);
            die();
        }

        if ($returnArray = deleteFachFromDatabase($conn, $fach)) {
            $verschobeneQuizze = intval($returnArray["verschobeneQuizze"]);
            $backupKlassenstufe = $returnArray["backupFach"];

            echo json_encode($returnArray);
        }
    } else if ($operation === "createFach") {
        $fach = $_POST["fach"];

        $returnArray = createFachInDatabase($conn, $fach);
        if ($returnArray) {
            echo json_encode($returnArray);
            die();
        } else {
            $returnArray = array();
            $returnArray["message"] = "Fach $fach konnte nicht erstellt werden. Ein Fehler ist aufgetreten.";
            echo json_encode($returnArray);
            die();
        }
    }
}

if (isset($_POST["backupFaecherverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    if (!userHasPermissions($conn, $userID, ["accessFaecherverwaltung" => gnVP($conn, "accessFaecherverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $fachBefore = getValueFromDatabase($conn, "backupFaecher", "fachBefore", "fachBackup", $result, 1, false);
                $deletedAt = getValueFromDatabase($conn, "backupFaecher", "deletedAt", "fachBackup", $result, 1, false);
                $quizzesAvailable = getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $result, 0, true);
                if ($quizzesAvailable == false) {
                    $quizzesAvailable = 0;
                } else {
                    $quizzesAvailable = count($quizzesAvailable);
                }

                $resultArray[] = array("name" => $result, "fachBefore" => $fachBefore, "deletedAt" => $deletedAt, "quizzesAvailableNum" => $quizzesAvailable);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $backupFaecher = getAllBackupFaecherFromDatabase($conn);
            if (!$backupFaecher) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($backupFaecher as $backupFach) {
                if (str_contains(strtolower($backupFach), strtolower($input))) {
                    $resultArray[] = $backupFach;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByFachBefore") {
            $input = $_POST["input"];

            $backupFaecher = getAllBackupFaecherFromDatabase($conn);
            if (!$backupFaecher) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($backupFaecher as $backupFach) {
                $fachBefore = getValueFromDatabase($conn, "backupFaecher", "fachBefore", "fachBackup", $current, 1, false);
                if (str_contains(strtolower($fachBefore), strtolower($input))) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "quizzesAvailable") {
            $input = $_POST["input"];

            $backupFaecher = getAllBackupFaecherFromDatabase($conn);
            if ($backupFaecher == false) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($backupFaecher as $current) {
                $hasQuizzes = getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $current, 0, true);
                if ($hasQuizzes == boolval($input)) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            $backupFaecher = getAllBackupFaecherFromDatabase($conn);
            if ($backupFaecher == false) {
                returnResults($conn, false, $limitResults);
                die();
            } else {
                returnResults($conn, $backupFaecher, $limitResults);
            }
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }

        $fach = $_POST["fach"];
        if (!valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $fach)) {
            $returnArray = array();
            $returnArray["message"] = "Das Backup-Fach, das du bearbeiten möchtest gibt es nicht. ($fach)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {
            if (empty($fach)) {
                $resultArray = array();
                $resultArray["message"] = "Das Fach darf nicht leer sein";
                echo json_encode($returnArray);
                die();
            }

            $fachBefore = getValueFromDatabase($conn, "backupFaecher", "fachBefore", "fachBackup", $fach, 1, false);
            $deletedAt = getValueFromDatabase($conn, "backupFaecher", "deletedAt", "fachBackup", $fach, 1, false);
            $quizzesAvailable = getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $fach, 0, true);
            if ($quizzesAvailable == false) {
                $quizzesAvailable = 0;
            } else {
                $quizzesAvailable = count($quizzesAvailable);
            }
            $resultArray = array();
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode(array("name" => $fach, "fachBefore" => $fachBefore, "deletedAt" => $deletedAt, "quizzesAvailableIDs" => $quizzesAvailable));
            die();
        }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["faecherverwaltungChangeValues" => gnVP($conn, "faecherverwaltungChangeValues")])) {
            $returnArray = array();
            $returnArray["permissionDenied"] = true;
            echo json_encode($returnArray);
            die();
        }
        $fach = $_POST["fach"];
        if (!valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $fach)) {
            $returnArray = array();
            $returnArray["message"] = "Das Backup-Fach, das du bearbeiten möchtest gibt es nicht. ($fach)";
            echo json_encode($returnArray);
            die();
        }

        $type = $_POST["type"];

        if ($type === "changeNameFromBackupFach") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Backup-Fach darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (valueInDatabaseExists($conn, "backuFaecher", "fachBackup", "fachBackup", $fach)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits eine Backup-Klassenstufe mit dem Namen <b>$newName</b>.";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameBackupFachInDatabase($conn, $fach, $newName)) {
                echo json_encode($returnArray);
                die();
            } else {
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "recoverBackupFach") {
            $returnArray = array();
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Fach darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Klassenstufe is already given
            if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits ein Fach mit dem Namen $newName. Gib einen anderen ein.";
                echo json_encode($returnArray);
                die();
            }

            //Create new Klassenstufe
            if (createFachInDatabase($conn, $newName)) {
                //Move quizzes
                $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $fach, 0, true);

                logWrite($conn, "organisationLOG", "Zu verschiebende Quiz von $fach zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
                $verschobeneQuizze = 0;
                if ($zuVerschiebendeQuizze) {
                    foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                        //Set all Quizzes that have the grade to backupGrade -> check again
                        logWrite($conn, "organisationLOG", "Aktuelles Quiz von $fach zu $newName verschieben: " . $currentQuizUniqueID, true);
                        if (!setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                        } else {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach $newName verschoben.", true);
                        }
                    }
                    $verschobeneQuizze = count($zuVerschiebendeQuizze);
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Backup-Fach umbenannt und $verschobeneQuizze zu $newName verschoben. Backup-Fach erfolgreich wiederhergestellt.";
                } else {
                    $verschobeneQuizze = 0;
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Backup-Fach erfolgreich wiederhergestellt. Keine Quiz wurden verschoben.";
                }

                //Delete Old form backupklassenstufe
                if ($returnArray = deleteBackupFachFromDatabase($conn, $fach)) {
                    if ($returnArray["status"]) {
                        $returnArray["message"] = "Klassenstufe $klassenstufe wurde erfolgreich wiederhergestellt. Der Name ist $newName. Es wurden darurch $verschobeneQuizze verschoben.";
                        echo json_encode($returnArray);
                    } else {
                        echo json_encode($returnArray);
                    }
                }
            }
        } else if ($type === "deleteBackupFach") {
            if ($returnArray = deleteBackupFachFromDatabase($conn, $fach)) {
                echo json_encode($returnArray);
            }
        }
    }
}


if (isset($_POST["themenverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessThemenverwaltung" => gnVP($conn, "accessThemenverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $showQuizAuswahl = getValueFromDatabase($conn, "themenVerwaltung", "showQuizAuswahl", "thema", $result, 1, false);
                $quizCanBeCreated = getValueFromDatabase($conn, "themenVerwaltung", "quizCanBeCreated", "thema", $result, 1, false);
                $resultArray[] = array("thema" => $result, "showQuizauswahl" => $showQuizAuswahl, "quizCanBeCreated" => $quizCanBeCreated);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $themen = getAllValuesFromDatabase($conn, "themenVerwaltung", "thema", 0, true);
            if (!$themen) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($themen as $thema) {
                if (str_contains(strtolower($thema), strtolower($input))) {
                    $resultArray[] = $thema;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByShowQuizAuswahl") {
            $input = $_POST["input"];
            returnResults($conn, getValueFromDatabase($conn, "themenVerwaltung", "thema", "showQuizAuswahl", $input, 0, true), $limitResults);
            die();
        } else if ($filter === "filterByQuizCanBeCreated") {
            $input = $_POST["input"];
            returnResults($conn, getValueFromDatabase($conn, "themenVerwaltung", "thema", "quizCanBeCreated", $input, 0, true), $limitResults);
            die();
        } else if ($filter === "all") {
            returnResults($conn, getAllValuesFromDatabase($conn, "themenVerwaltung", "thema", 0, true), $limitResults);
            die();
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $thema = $_POST["thema"];
        if (!valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $thema)) {
            $returnArray = array();
            $returnArray["message"] = "Das Thema, das du bearbeiten möchtest gibt es nicht. ($thema)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {

            if (empty($thema)) {
                echo "no results";
                die();
            }

            $showQuizAuswahl = getValueFromDatabase($conn, "themenVerwaltung", "showQuizAuswahl", "thema", $thema, 1, false);
            $quizCanBeCreated = getValueFromDatabase($conn, "themenVerwaltung", "quizCanBeCreated", "thema", $thema, 1, false);

            echo json_encode(array("name" => $thema, "showQuizauswahl" => $showQuizAuswahl, "quizCanBeCreated" => $quizCanBeCreated));
            die();
        }
    } else if ($operation === "changeValue") {
        $thema = $_POST["thema"];
        if (!valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $thema)) {
            $returnArray = array();
            $returnArray["message"] = "Das Thema, das du bearbeiten möchtest gibt es nicht. ($thema)";
            echo json_encode($returnArray);
            die();
        }
        $type = $_POST["type"];

        if ($type === "changeName") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Thema darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameThemaInDatabase($conn, $thema, $newName)) {
                $changedQuizzes = $returnArray["verschobeneQuizze"];
                $success = $returnArray["success"];
                if ($success) {
                    echo json_encode($returnArray);
                    die();
                } else {
                    echo json_encode($returnArray);
                    die();
                }
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Der Name des Themas konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeShowQuizAuswahl") {
            $newValue = intval($_POST["input"]);

            if (setValueFromDatabase($conn, "themenVerwaltung", "showQuizauswahl", "thema", $thema, $newValue, false)) {
                $returnArray = array();
                $returnArray["message"] = "Thema $thema erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden. (Thema: $thema, $newValue)";
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "changeQuizCanBeCreated") {
            $newValue = intval($_POST["input"]);

            if (setValueFromDatabase($conn, "themenVerwaltung", "quizCanBeCreated", "thema", $thema, $newValue, false)) {
                $returnArray = array();
                $returnArray["message"] = "Thema $thema erfolgreich aktualisiert";
                echo json_encode($returnArray);
                die();
            } else {
                $returnArray = array();
                $returnArray["message"] = "Ein Fehler ist aufgetreten. Wert konnte nicht geändert werden.";
                echo json_encode($returnArray);
                die();
            }
        }
    } else if ($operation === "deleteThema") {
        $thema = $_POST["thema"];
        if (!valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $thema)) {
            $returnArray = array();
            $returnArray["message"] = "Das Thema, das du bearbeiten möchtest gibt es nicht. ($thema)";
            echo json_encode($returnArray);
            die();
        }

        if ($returnArray = deleteThemaFromDatabase($conn, $thema)) {
            echo json_encode($returnArray);
        }
    } else if ($operation === "createThema") {
        $thema = $_POST["thema"];

        $returnArray = createThemaInDatabase($conn, $thema);
        if ($returnArray) {
            echo json_encode($returnArray);
            die();
        } else {
            $returnArray = array();
            $returnArray["message"] = "Thema <b>$thema</b> konnte nicht erstellt werden. Ein Fehler ist aufgetreten.";
            echo json_encode($returnArray);
            die();
        }
    }
}

if (isset($_POST["backupThemenverwaltung"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    if (!userHasPermissions($conn, $userID, ["accessThemenverwaltung" => gnVP($conn, "accessThemenverwaltung")])) {
        $returnArray = array();
        $returnArray["permissionDenied"] = true;
        echo json_encode($returnArray);
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "search") {
        $filter = "";
        if (isset($_POST["filter"])) {
            $filter = $_POST["filter"];
        }


        function returnResults($conn, $results, $limitResults)
        {
            if (!$results) {
                echo "no results";
                die();
            }

            $resultArray = array();

            foreach ($results as $result) {
                $themaBefore = getValueFromDatabase($conn, "backupThemen", "themaBefore", "themaBackup", $result, 1, false);
                $deletedAt = getValueFromDatabase($conn, "backupThemen", "deletedAt", "themaBackup", $result, 1, false);
                $quizzesAvailable = getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $result, 0, true);
                if ($quizzesAvailable == false) {
                    $quizzesAvailable = 0;
                } else {
                    $quizzesAvailable = count($quizzesAvailable);
                }

                $resultArray[] = array("name" => $result, "themaBefore" => $themaBefore, "deletedAt" => $deletedAt, "quizzesAvailableNum" => $quizzesAvailable);
            }
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode($resultArray);
        }

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }


        if ($filter === "filterByName") {
            $input = $_POST["name"];
            $backupThemen = getAllValuesFromDatabase($conn, "backupThemen", "themaBackup", 0, true);
            if (!$backupThemen) returnResults($conn, false, $limitResults);
            $resultArray = array();
            foreach ($backupThemen as $backupThema) {
                if (str_contains(strtolower($backupThema), strtolower($input))) {
                    $resultArray[] = $backupThema;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "filterByThemaBefore") {
            $input = $_POST["input"];

            $backupThemen = getAllValuesFromDatabase($conn, "backupThemen", "themaBackup", 0, true);
            if (!$backupThemen) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($backupThemen as $current) {
                $themaBefore = getValueFromDatabase($conn, "backupThemen", "themaBefore", "themaBackup", $current, 1, false);
                if (str_contains(strtolower($themaBefore), strtolower($input))) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "quizzesAvailable") {
            $input = $_POST["input"];

            $backupThemen = getAllValuesFromDatabase($conn, "backupThemen", "themaBackup", 0, true);
            if ($backupThemen == false) {
                returnResults($conn, false, $limitResults);
                die();
            }
            $resultArray = array();
            foreach ($backupThemen as $current) {
                $hasQuizzes = getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $current, 0, true);
                if ($hasQuizzes == boolval($input)) {
                    $resultArray[] = $current;
                }
            }
            returnResults($conn, $resultArray, $limitResults);
            die();
        } else if ($filter === "all") {
            $backupThemen = getAllValuesFromDatabase($conn, "backupThemen", "themaBackup", 0, true);
            if ($backupThemen == false) {
                returnResults($conn, false, $limitResults);
                die();
            } else {
                returnResults($conn, $backupThemen, $limitResults);
            }
        }
    } else if ($operation === "get") {
        $type = $_POST["type"];

        $limitResults = 0;
        if (isset($_POST["limit"])) {
            $limitResults = intval($_POST["limit"]);
        }

        $thema = $_POST["thema"];
        if (!valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $thema)) {
            $returnArray = array();
            $returnArray["message"] = "Das Backup-Thema, das du bearbeiten möchtest gibt es nicht. ($thema)";
            echo json_encode($returnArray);
            die();
        }

        if ($type === "getFullInformation") {
            if (empty($thema)) {
                $resultArray = array();
                $resultArray["message"] = "Das Backup-Thema darf nicht leer sein";
                echo json_encode($returnArray);
                die();
            }

            $themaBefore = getValueFromDatabase($conn, "backupThemen", "themaBefore", "themaBackup", $thema, 1, false);
            $deletedAt = getValueFromDatabase($conn, "backupThemen", "deletedAt", "themaBackup", $thema, 1, false);
            $quizzesAvailable = getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $thema, 0, true);
            if ($quizzesAvailable == false) {
                $quizzesAvailable = 0;
            } else {
                $quizzesAvailable = count($quizzesAvailable);
            }
            $resultArray = array();
            $resultArray = limitArray($resultArray, $limitResults);
            echo json_encode(array("name" => $thema, "themaBefore" => $themaBefore, "deletedAt" => $deletedAt, "quizzesAvailableIDs" => $quizzesAvailable));
            die();
        }
    } else if ($operation === "changeValue") {
        if (!userHasPermissions($conn, $userID, ["themenverwaltungChangeValues" => gnVP($conn, "themenverwaltungChangeValues")])) {
            $returnArray = array();
            $returnArray["permissionDenied"] = true;
            echo json_encode($returnArray);
            die();
        }
        $thema = $_POST["thema"];
        if (!valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $thema)) {
            $returnArray = array();
            $returnArray["message"] = "Das Backup-Thema, das du bearbeiten möchtest gibt es nicht. ($thema)";
            echo json_encode($returnArray);
            die();
        }

        $type = $_POST["type"];

        if ($type === "changeName") {
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Backup-Thema darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Check if Topic is already given
            if (valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $newName)) {
                $returnArray = array();
                $returnArray["message"] = "Es existiert bereits ein Backup-Thema mit dem Namen <b>$newName</b>.";
                echo json_encode($returnArray);
                die();
            }

            if ($returnArray = renameBackupThemaInDatabase($conn, $thema, $newName)) {
                echo json_encode($returnArray);
                die();
            } else {
                echo json_encode($returnArray);
                die();
            }
        } else if ($type === "recoverBackupThema") {
            $returnArray = array();
            $newName = $_POST["input"];
            if (empty($newName)) {
                $returnArray = array();
                $returnArray["message"] = "Der Name für das Thema darf nicht leer sein.";
                echo json_encode($returnArray);
                die();
            }

            //Create new Klassenstufe
            if (createThemaInDatabase($conn, $newName)) {
                //Move quizzes
                $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $thema, 0, true);

                logWrite($conn, "organisationLOG", "Zu verschiebende Quiz von $fach zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
                $verschobeneQuizze = 0;
                if ($zuVerschiebendeQuizze) {
                    foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                        //Set all Quizzes that have the grade to backupGrade -> check again
                        logWrite($conn, "organisationLOG", "Aktuelles Quiz von $thema zu $newName verschieben: " . $currentQuizUniqueID, true);
                        if (!setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                        } else {
                            logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach $newName verschoben.", true);
                        }
                    }
                    $verschobeneQuizze = count($zuVerschiebendeQuizze);
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Backup-Thema umbenannt und $verschobeneQuizze zu $newName verschoben. Fach erfolgreich wiederhergestellt.";
                } else {
                    $verschobeneQuizze = 0;
                    $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    $returnArray["status"] = true;
                    $returnArray["message"] = "Fach erfolgreich wiederhergestellt. Keine Quiz wurden verschoben.";
                }

                //Delete Old form backupklassenstufe
                if ($returnArray = deleteBackupThemaFromDatabase($conn, $thema)) {
                    if ($returnArray["status"]) {
                        $returnArray["message"] = "Thema $thema wurde erfolgreich wiederhergestellt. Der Name ist $newName. Es wurden darurch $verschobeneQuizze Quiz verschoben.";
                        echo json_encode($returnArray);
                    } else {
                        echo json_encode($returnArray);
                    }
                }
            }
        } else if ($type === "deleteBackupThema") {
            if ($returnArray = deleteBackupThemaFromDatabase($conn, $thema)) {
                echo json_encode($returnArray);
            }
        }
    }
}

if (isset($_POST["overview"])) {
    require_once("../../includes/organisationFunctions.inc.php");
    //setPermissionGroup($conn, "PA-Gruppe", "klassenstufenverwaltungADDandREMOVE", 1);
    if (!userHasPermissions($conn, $userID, ["accessOverview" => gnVP($conn, "accessOverview")])) {
        permissionDenied("Es fehlt die Berechtigung, um die Übersicht zu sehen.");
        die();
    }

    $operation = "";
    if (isset($_POST["operation"])) {
        $operation = $_POST["operation"];
    }

    if ($operation === "getKlassenstufen") {

        $returnArray = array();

        $klassenstufen = getAllValuesFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", 0, true, false);
        if ($klassenstufen) {
            foreach ($klassenstufen as $klassenstufe) {
                $showUser = boolval(getValueFromDatabase($conn, "klassenstufenVerwaltung", "showQuizauswahl", "klassenstufe", $klassenstufe, 1, false));
                $returnArray[] = array("klassenstufe" => $klassenstufe, "showUser" => $showUser);
            }
        }
        $backupklassenstufen = getAllValuesFromDatabase($conn, "backupKlassenstufen", "klassenstufeBackup", 0, true, false);
        if ($backupklassenstufen) {
            foreach ($backupklassenstufen as $klassenstufe) {
                $returnArray[] = array("klassenstufe" => $klassenstufe, "showUser" => false);
            }
        }
        array_unique($returnArray, SORT_REGULAR);
        echo json_encode($returnArray);
        die();
    } else if ($operation === "getFaecher") {
        $selectedKlassenstufe = $_POST["selectedKlassenstufe"];
        $returnArray = array();

        if ($faecher = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "fach", ["klassenstufe"=>$selectedKlassenstufe], true, false)) {
            foreach ($faecher as $fach) {
                $showUser = boolval(getValueFromDatabase($conn, "faecherVerwaltung", "showQuizauswahl", "fach", $fach, 1, false));
                $returnArray[] = array("fach" => $fach, "showUser" => $showUser);
            }
        }
        echo json_encode($returnArray);
        die();
    } else if ($operation === "getThemen") {
        $selectedKlassenstufe = $_POST["selectedKlassenstufe"];
        $selectedFach = $_POST["selectedFach"];
        $returnArray = array();

        if ($themen = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "thema", ["klassenstufe" => $selectedKlassenstufe, "fach" => $selectedFach], true)) {
            foreach ($themen as $thema) {
                $showUser = boolval(getValueFromDatabase($conn, "themenVerwaltung", "showQuizauswahl", "thema", $thema, 1, false));
                $returnArray[] = array("thema" => $thema, "showUser" => $showUser);
            }
        } else {
            echo "no";
            die();
        }
        echo json_encode($returnArray);
        die();
    } else if ($operation === "getQuizze") {
        $selectedKlassenstufe = $_POST["selectedKlassenstufe"];
        $selectedFach = $_POST["selectedFach"];
        $selectedThema = $_POST["selectedThema"];
        $returnArray = array();

        if ($quizze = getValueFromDatabaseMultipleWhere($conn, "selectquiz", "uniqueID", ["klassenstufe" => $selectedKlassenstufe, "fach" => $selectedFach, "thema" => $selectedThema], true)) {
            foreach ($quizze as $uniqueID) {
                $quizname = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $uniqueID, 1, false);
                $quizID = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $uniqueID, 1, false);
                $showUser = boolval(getValueFromDatabase($conn, "selectquiz", "showQuizauswahl", "uniqueID", $uniqueID, 1, false));
                $returnArray[] = array("quizname" => $quizname, "showUser" => $showUser, "uniqueID" => $uniqueID, "quizId"=>$quizID);
            }
        } else {
            echo "no";
            die();
        }
        echo json_encode($returnArray);
        die();
    }
}
