<?php

function getAllKlassenstufenFromDatabase($conn)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT klassenstufe FROM klassenstufenVerwaltung;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["klassenstufe"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getAllFaecherFromDatabase($conn)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT fach FROM faecherVerwaltung;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["fach"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getKlassenstufenFromDatabaseWhere($conn, $type, $eaqualTo)
{
    if (!$type || empty($type)) return false;
    try {
        $stmt = $conn->prepare("SELECT klassenstufe FROM klassenstufenVerwaltung WHERE $type = ?");
        if ($stmt->execute([$eaqualTo])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["klassenstufe"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return false;
}

function setValueFromKlassenstufenInDatabase($conn, $klassenstufe, $column, $value)
{
    if (!$klassenstufe || !$column) return false;
    try {
        $stmt = $conn->prepare("UPDATE klassenstufenVerwaltung SET $column = ? WHERE klassenstufe = ?");
        if ($stmt->execute([$value, $klassenstufe])) {
            return true;
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return false;
}

function getValueFromKlassenstufenInDatabase($conn, $klassenstufe, $value)
{
    if (empty($value)) return false;
    try {
        $stmt = $conn->prepare("SELECT $value FROM klassenstufenVerwaltung WHERE klassenstufe = ? LIMIT 1;");
        if ($stmt->execute([$klassenstufe])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                return $data[$value];
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return false;
}

function klassenstufeExistsInDatabase($conn, $klassenstufe)
{
    $klassenstufen = getAllKlassenstufenFromDatabase($conn);
    if (!$klassenstufen) {
        return false;
    }
    if (in_array($klassenstufe, $klassenstufen)) {
        return true;
    }
    return false;
}

function generateBackupKlassenstueName($conn, $klassenstufe)
{
    $backupKlassenstue = "";
    //Quizzes that have the grade to delete should get a backupGrade like (23.12.2021-1-Klasse 10)
    $backupDate = date("d.m.Y"); //23.12.2021

    //Check if already delete some Grade today in db (klassenstufeBackup, klassenstufeBefore, DeletedAt) -> get number like 0,1,2,3
    $count = 1;
    $backupKlassenstue = $backupDate . "-" . $count . "-" . $klassenstufe;
    while (valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $backupKlassenstue)) {
        $count++;
        $backupKlassenstue = $backupDate . "-" . $count . "-" . $klassenstufe;
    }
    return $backupKlassenstue;
}

function generateBackupFachName($conn, $fach)
{
    $backupFach = "";
    //Quizzes that have the fach to delete should get a backupGrade like (23.12.2021-1-Klasse 10)
    $backupDate = date("d.m.Y"); //23.12.2021

    $count = 1;
    $backupFach = $backupDate . "-" . $count . "-" . $fach;
    while (valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $backupFach)) {
        $count++;
        $backupFach = $backupDate . "-" . $count . "-" . $fach;
    }
    return $backupFach;
}

function generateBackupThemaName($conn, $fach)
{
    $backupThema = "";
    //Quizzes that have the topic to delete should get a backupGrade like (23.12.2021-1-Klasse 10)
    $backupDate = date("d.m.Y"); //23.12.2021

    $count = 1;
    $backupThema = $backupDate . "-" . $count . "-" . $fach;
    while (valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $backupThema)) {
        $count++;
        $backupThema = $backupDate . "-" . $count . "-" . $fach;
    }
    return $backupThema;
}

function generateBackupQuizName($conn, $uniqueID)
{
    $backupName = "";
    //Quizzes that have the topic to delete should get a backupGrade like (23.12.2021-1-Klasse 10)
    $backupDate = date("d.m.Y"); //23.12.2021

    $count = 1;
    $backupName = $backupDate . "-" . $count . "-" . $uniqueID;
    while (valueInDatabaseExists($conn, "selectquiz", "quizname", "uniqueID", $uniqueID)) {
        $count++;
        $backupName = $backupDate . "-" . $count . "-" . $uniqueID;
    }
    return $backupName;
}

function deleteKlassenstufeFromDatabase($conn, $klassenstufe)
{
    if (!$klassenstufe) return false;
    $returnArray = array();
    //Check if there are Quizzes linked to the klassenstufe
    if (getValueFromDatabase($conn, "selectquiz", "klassenstufe", "klassenstufe", $klassenstufe, 1, false)) {

        $backupKlassenstue = generateBackupKlassenstueName($conn, $klassenstufe);
        if ($resultArray = createBackupKlassenstufeInDatabase($conn, $backupKlassenstue, $klassenstufe, getCurrentDateAndTime(1))) {

            if ($resultArray["status"]) {
                try {
                    $stmt = $conn->prepare("DELETE FROM klassenstufenVerwaltung WHERE klassenstufe = ?");
                    if ($stmt->execute([$klassenstufe])) {
                        $returnArray["status"] = true;
                    }
                } catch (Exception $e) {
                    $returnArray["status"] = false;
                }

                if ($returnArray["status"]) {

                    $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "klassenstufe", $klassenstufe, 0, true);
                    if ($zuVerschiebendeQuizze) {
                        foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                            //Set all Quizzes that have the grade to backupGrade -> check again
                            setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, $backupKlassenstue, false);
                        }
                        $verschobeneQuizze = count($zuVerschiebendeQuizze);
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    } else {
                        $verschobeneQuizze = 0;
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    }

                    $returnArray["backupKlassenstufe"] = $backupKlassenstue;
                    $returnArray["message"] = "Klassenstufe $klassenstufe erfolgreich gelöscht. $verschobeneQuizze Quizze wurden dabei in eine Backup-Klassenstufe ($backupKlassenstue) verschoben, um das verschieben der Quizze zu erleichtern.";
                    return $returnArray;
                }
                return $returnArray;
            } else {
                return $resultArray;
            }
        }
    } else {
        try {
            $stmt = $conn->prepare("DELETE FROM klassenstufenVerwaltung WHERE klassenstufe = ?");
            if ($stmt->execute([$klassenstufe])) {
                $returnArray["verschobeneQuizze"] = 0;
                $returnArray["message"] = "Klassenstufe erfolgreich gelöscht. Es wurde keine Backup-Klassenstufe angelegt, da keine Quizze mit der Klassenstufe verknüpft sind.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        } catch (Exception $e) {
            $returnArray["verschobeneQuizze"] = 0;
            $returnArray["message"] = "Ein Fehler ist aufgetreten: $e";
            $returnArray["status"] = false;
            return $returnArray;
        }
    }
}

function deleteFachFromDatabase($conn, $fach)
{
    if (!$fach) return false;
    $returnArray = array();
    //Check if there are Quizzes linked to the klassenstufe
    if (getValueFromDatabase($conn, "selectquiz", "fach", "fach", $fach, 1, false)) {

        $backupFach = generateBackupFachName($conn, $fach);
        if ($resultArray = createBackupFachInDatabase($conn, $backupFach, $fach, getCurrentDateAndTime(1))) {

            if ($resultArray["status"]) {
                try {
                    $stmt = $conn->prepare("DELETE FROM faecherVerwaltung WHERE fach = ?");
                    if ($stmt->execute([$fach])) {
                        $returnArray["status"] = true;
                    }
                } catch (Exception $e) {
                    $returnArray["status"] = false;
                }

                if ($returnArray["status"]) {

                    $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $fach, 0, true);
                    if ($zuVerschiebendeQuizze) {
                        foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                            //Set all Quizzes that have the grade to backupGrade -> check again
                            setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, $backupFach, false);
                        }
                        $verschobeneQuizze = count($zuVerschiebendeQuizze);
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    } else {
                        $verschobeneQuizze = 0;
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    }

                    $returnArray["backupFach"] = $backupFach;
                    $returnArray["message"] = "Fach $fach erfolgreich gelöscht. $verschobeneQuizze Quizze wurden dabei in eine Backup-Klassenstufe ($backupFach) verschoben, um das verschieben der Quizze zu erleichtern.";
                    return $returnArray;
                }
                return $returnArray;
            } else {
                return $resultArray;
            }
        }
    } else {
        try {
            $stmt = $conn->prepare("DELETE FROM faecherVerwaltung WHERE fach = ?");
            if ($stmt->execute([$fach])) {
                $returnArray["verschobeneQuizze"] = 0;
                $returnArray["message"] = "Fach erfolgreich gelöscht. Es wurde kein Backup-Fach angelegt, da keine Quizze mit dem Fach verknüpft sind.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        } catch (Exception $e) {
            $returnArray["verschobeneQuizze"] = 0;
            $returnArray["message"] = "Ein Fehler ist aufgetreten: $e";
            $returnArray["status"] = false;
            return $returnArray;
        }
    }
}

function deleteThemaFromDatabase($conn, $thema)
{
    if (!$thema) return false;
    $returnArray = array();
    //Check if there are Quizzes linked to the Topic
    if (getValueFromDatabase($conn, "selectquiz", "thema", "thema", $thema, 1, false)) {

        $backupThema = generateBackupThemaName($conn, $thema);
        if ($resultArray = createBackupThemaInDatabase($conn, $backupThema, $thema, getCurrentDateAndTime(1))) {

            if ($resultArray["status"]) {
                try {
                    $stmt = $conn->prepare("DELETE FROM themenVerwaltung WHERE thema = ?");
                    if ($stmt->execute([$thema])) {
                        $returnArray["status"] = true;
                    }
                } catch (Exception $e) {
                    $returnArray["status"] = false;
                }

                if ($returnArray["status"]) {

                    $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $thema, 0, true);
                    if ($zuVerschiebendeQuizze) {
                        foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                            //Set all Quizzes that have the topic to backupGrade
                            setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, $backupThema, false);
                        }
                        $verschobeneQuizze = count($zuVerschiebendeQuizze);
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    } else {
                        $verschobeneQuizze = 0;
                        $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
                    }

                    $returnArray["message"] = "Thema $thema erfolgreich gelöscht. $verschobeneQuizze Quizze wurden dabei in eine Backup-Thema ($backupThema) verschoben, um das verschieben der Quizze zu erleichtern.";
                    return $returnArray;
                }
                return $returnArray;
            } else {
                return $resultArray;
            }
        }
    } else {
        try {
            $stmt = $conn->prepare("DELETE FROM themenVerwaltung WHERE thema = ?");
            if ($stmt->execute([$thema])) {
                $returnArray["verschobeneQuizze"] = 0;
                $returnArray["message"] = "Thema erfolgreich gelöscht. Es wurde kein Backup-Fach angelegt, da keine Quizze mit dem Fach verknüpft sind.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        } catch (Exception $e) {
            $returnArray["verschobeneQuizze"] = 0;
            $returnArray["message"] = "Ein Fehler ist aufgetreten: $e";
            $returnArray["status"] = false;
            return $returnArray;
        }
    }
}

function deleteBackupKlassenstufeFromDatabase($conn, $klassenstufe)
{
    $returnArray = array();
    if (!$klassenstufe) return false;


    //Check if there are Quizzes linked to the klassenstufe
    if (getValueFromDatabase($conn, "selectquiz", "klassenstufe", "klassenstufe", $klassenstufe, 1, false)) {
        $returnArray["status"] = false;
        $returnArray["message"] = "Es <b>sind noch</b> Quizze mit der Klassenstufe <b>verknüpft</b>. Verschiebe diese erst, damit es möglich ist die Backup-Klassenstue zu löschen.";
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM backupKlassenstufen WHERE klassenstufeBackup = ?");
        if ($stmt->execute([$klassenstufe])) {
            $returnArray["status"] = true;
            $returnArray["message"] = "Backup-Klassenstufe erfolgreich gelöscht.";
            return $returnArray;
        }
    } catch (Exception $e) {
        $returnArray["message"] = "Fehler: " . $e;
    }
    return false;
}



function createKlassenstufeInDatabase($conn, $klassenstufe)
{
    if (klassenstufeExistsInDatabase($conn, $klassenstufe)) {
        $returnArray = array();
        $returnArray["message"] = "Die Klassenstufe existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (getValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufe, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Eine Backup-Klassenstufe mit diesem Namen existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($klassenstufe)) {
        $returnArray = array();
        $returnArray["message"] = "Die Klassenstufe darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO klassenstufenVerwaltung (klassenstufe, showQuizauswahl, userCanBe, quizCanBeCreated) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$klassenstufe, 0, 0, 0])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Klassenstufe erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }

    $returnArray = array();
    $returnArray["message"] = "Die Klassenstufe konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function deleteBackupFachFromDatabase($conn, $fach)
{
    $returnArray = array();
    if (!$fach) return false;


    //Check if there are Quizzes linked to the klassenstufe
    if (getValueFromDatabase($conn, "selectquiz", "klassenstufe", "fach", $fach, 1, false)) {
        $returnArray["status"] = false;
        $returnArray["message"] = "Es <b>sind noch</b> Quizze mit dem Fach <b>verknüpft</b>. Verschiebe diese erst, damit es möglich ist das Backup-Fach zu löschen.";
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM backupFaecher WHERE fachBackup = ?");
        if ($stmt->execute([$fach])) {
            $returnArray["status"] = true;
            $returnArray["message"] = "Backup-Fach erfolgreich gelöscht.";
            return $returnArray;
        }
    } catch (Exception $e) {
        $returnArray["message"] = "Fehler: " . $e;
        $returnArray["status"] = false;
        return $returnArray;
    }
    $returnArray["status"] = false;
    return $returnArray;
}

function deleteBackupThemaFromDatabase($conn, $thema)
{
    $returnArray = array();
    if (!$thema) return false;


    //Check if there are Quizzes linked to the klassenstufe
    if (getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $thema, 1, false)) {
        $returnArray["status"] = false;
        $returnArray["message"] = "Es <b>sind noch</b> Quizze mit dem Backup-Thema $thema <b>verknüpft</b>. Verschiebe diese erst, damit es möglich ist das Backup-Thema zu löschen.";
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM backupThemen WHERE themaBackup = ?");
        if ($stmt->execute([$thema])) {
            $returnArray["status"] = true;
            $returnArray["message"] = "Backup-Thema erfolgreich gelöscht.";
            return $returnArray;
        }
    } catch (Exception $e) {
        $returnArray["message"] = "Fehler: " . $e;
        $returnArray["status"] = false;
        return $returnArray;
    }
    $returnArray["status"] = false;
    return $returnArray;
}

function createFachInDatabase($conn, $fach)
{
    if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fach)) {
        $returnArray = array();
        $returnArray["message"] = "Das Fach existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themenBackup", $fach)) {
        $returnArray = array();
        $returnArray["message"] = "Ein Backup-Fach mit diesem Namen existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($fach)) {
        $returnArray = array();
        $returnArray["message"] = "Das Fach darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO faecherVerwaltung (fach, showQuizauswahl, quizCanBeCreated) VALUES (?, ?, ?)");
        if ($stmt->execute([$fach, 1, 1])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Fach erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        $returnArray = array();
        $returnArray["message"] = "Fehler $e";
        $returnArray["status"] = false;
        return $returnArray;
    }

    $returnArray = array();
    $returnArray["message"] = "Das Fach konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function createThemaInDatabase($conn, $thema)
{
    if (valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $thema)) {
        $returnArray = array();
        $returnArray["message"] = "Das Thema existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $thema)) {
        $returnArray = array();
        $returnArray["message"] = "Eine Backup-Thema mit diesem Namen existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($thema)) {
        $returnArray = array();
        $returnArray["message"] = "Das Thema darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO themenVerwaltung (thema, showQuizauswahl, quizCanBeCreated) VALUES (?, ?, ?)");
        if ($stmt->execute([$thema, 1, 1])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Thema <b>$thema<b/> erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        $returnArray = array();
        $returnArray["message"] = "Fehler $e";
        $returnArray["status"] = false;
        return $returnArray;
    }

    $returnArray = array();
    $returnArray["message"] = "Das Thema konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function renameKlassenstueInDatabase($conn, $klassenstufe, $newName)
{
    $returnArray = array();

    //Check if Klassenstufe is already given
    if (valueInDatabaseExists($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $newName)) {
        $returnArray["message"] = "Es existiert bereits eine Klassenstufe mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }
    if (setValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $klassenstufe, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }

    if ($returnArray["success"]) {
        //Get All QuizIDs where the klassenstufe is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "klassenstufe", $klassenstufe, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze (Klassenstufe) von $klassenstufe zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
        if ($zuVerschiebendeQuizze) {
            foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                //Set all Quizzes that have the grade to backupGrade -> check again
                logWrite($conn, "organisationLOG", "Aktuelles Quiz von $klassenstufe zu $newName verschieben: " . $currentQuizUniqueID, true);
                if (!setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                } else {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach (Klassenstufe) $newName verschoben.", true);
                }
            }
            $verschobeneQuizze = count($zuVerschiebendeQuizze);
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Klassenstufe umbenannt und $verschobeneQuizze zu $newName verschoben.";
        } else {
            $verschobeneQuizze = 0;
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Klassenstufe umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Backup-Klassenstufe konnte nicht erstellt werden";
    }

    return $returnArray;
}

function renameFachInDatabase($conn, $fach, $newName)
{
    $returnArray = array();

    //Check if Fach is already given
    if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $newName)) {
        $returnArray["message"] = "Es existiert bereits ein Fach mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }
    if (setValueFromDatabase($conn, "faecherVerwaltung", "fach", "fach", $fach, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }

    if ($returnArray["success"]) {
        //Get All QuizIDs where the fach is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $fach, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze (Fach) von $fach zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
        if ($zuVerschiebendeQuizze) {
            foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                //Set all Quizzes that have the fach to backupGrade -> check again
                logWrite($conn, "organisationLOG", "Aktuelles Quiz von (Fach) $fach zu $newName verschieben: " . $currentQuizUniqueID, true);
                if (!setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                } else {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach (Fach) $newName verschoben.", true);
                }
            }
            $verschobeneQuizze = count($zuVerschiebendeQuizze);
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Fach umbenannt und $verschobeneQuizze zu $newName verschoben.";
        } else {
            $verschobeneQuizze = 0;
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Thema umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Fach konnte nicht erstellt werden";
    }

    return $returnArray;
}

function renameThemaInDatabase($conn, $thema, $newName)
{
    $returnArray = array();
    //Check if Thema is already given
    if (valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $newName)) {
        $returnArray["message"] = "Es existiert bereits ein Thema mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }

    if (setValueFromDatabase($conn, "themenVerwaltung", "thema", "thema", $thema, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }

    if ($returnArray["success"]) {
        //Get All QuizIDs where the fach is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $thema, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze (Thema) von $thema zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
        if ($zuVerschiebendeQuizze) {
            foreach ($zuVerschiebendeQuizze as $currentQuizUniqueID) {
                //Set all Quizzes that have the fach to backupGrade -> check again
                logWrite($conn, "organisationLOG", "Aktuelles Quiz von (Fach) $thema zu $newName verschieben: " . $currentQuizUniqueID, true);
                if (!setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, $newName, false)) {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) konnte nicht verschoben werden.", true);
                } else {
                    logWrite($conn, "organisationLOG", "Quiz (Id: $currentQuizUniqueID) wurde erfolgreich nach (Thema) $newName verschoben.", true);
                }
            }
            $verschobeneQuizze = count($zuVerschiebendeQuizze);
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Fach umbenannt und $verschobeneQuizze zu $newName verschoben.";
        } else {
            $verschobeneQuizze = 0;
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Fach umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Fach konnte nicht erstellt werden";
    }

    return $returnArray;
}


function createBackupKlassenstufeInDatabase($conn, $klassenstufeBackup, $klassenstufeBefore, $deletedAt)
{
    if (getValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufeBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Die Backup-Klassenstufe existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $klassenstufeBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Eine Klassenstufe mit dem Namen existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($klassenstufeBackup)) {
        $returnArray = array();
        $returnArray["message"] = "Die Backup-Klassenstufe darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO backupKlassenstufen (klassenstufeBackup, klassenstufeBefore, deletedAt) VALUES (?, ?, ?)");
        if ($stmt->execute([$klassenstufeBackup, $klassenstufeBefore, $deletedAt])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Backup-Klassenstufe erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }

    $returnArray = array();
    $returnArray["message"] = "Die Klassenstufe konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function createBackupFachInDatabase($conn, $fachBackup, $fachBefore, $deletedAt)
{
    if (getValueFromDatabase($conn, "backupFaecher", "fachBackup", "fachBackup", $fachBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Das Backup-Fach existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (getValueFromDatabase($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $fachBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Ein Fach mit dem Namen $fachBackup existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($fachBackup)) {
        $returnArray = array();
        $returnArray["message"] = "Die Backup-Fach darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO backupFaecher (fachBackup, fachBefore, deletedAt) VALUES (?, ?, ?)");
        if ($stmt->execute([$fachBackup, $fachBefore, $deletedAt])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Backup-Fach erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        $returnArray["status"] = false;
        $returnArray["message"] = "Fehler: $e";
        return $returnArray;
        die();
    }

    $returnArray = array();
    $returnArray["message"] = "Das Backup-Fach konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function createBackupThemaInDatabase($conn, $themaBackup, $themaBefore, $deletedAt)
{
    if (getValueFromDatabase($conn, "backupThemen", "themaBackup", "themaBackup", $themaBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Das Backup-Thema existiert schon.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (getValueFromDatabase($conn, "themenVerwaltung", "thema", "thema", $themaBackup, 1, false)) {
        $returnArray = array();
        $returnArray["message"] = "Ein Thema mit dem Namen $themaBackup existiert bereits.";
        $returnArray["status"] = false;
        return $returnArray;
    }
    if (empty($themaBackup)) {
        $returnArray = array();
        $returnArray["message"] = "Das Backup-Thema darf nicht leer sein.";
        $returnArray["status"] = false;
        return $returnArray;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO backupThemen (themaBackup, themaBefore, deletedAt) VALUES (?, ?, ?)");
        if ($stmt->execute([$themaBackup, $themaBefore, $deletedAt])) {
            if ($stmt->rowCount()) {
                $returnArray = array();
                $returnArray["message"] = "Backup-Thema erfolgreich erstellt.";
                $returnArray["status"] = true;
                return $returnArray;
            }
        }
    } catch (Exception $e) {
        $returnArray["status"] = false;
        $returnArray["message"] = "Fehler: $e";
        return $returnArray;
        die();
    }

    $returnArray = array();
    $returnArray["message"] = "Das Backup-Thema konnte nicht erstellt werden.";
    $returnArray["status"] = false;
    return $returnArray;
}

function renameBackupKlassenstueInDatabase($conn, $klassenstufe, $newName)
{
    $returnArray = array();
    if (valueInDatabaseExists($conn, "backupKlassensufen", "klassenstufeBackup", "klassenstufeBackup", $newName)) {
        $returnArray["message"] = "Es existiert bereits eine Backup-Klassenstufe mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }

    if (setValueFromDatabase($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufe, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }
    if ($returnArray["success"]) {
        //Get All QuizIDs where the klassenstufe is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "klassenstufe", $klassenstufe, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze von $klassenstufe zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
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
            $returnArray["message"] = "Backup-Klassenstufe umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Backup-Klassenstufe konnte nicht erstellt werden";
    }

    return $returnArray;
}

function renameBackupFachInDatabase($conn, $fach, $newName)
{
    $returnArray = array();
    if (valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $newName)) {
        $returnArray["message"] = "Es existiert bereits ein Backup-Fach mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }

    if (setValueFromDatabase($conn, "backupFaecher", "fachBackup", "fachBackup", $fach, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }
    if ($returnArray["success"]) {
        //Get All QuizIDs where the klassenstufe is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "fach", $fach, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze von $fach zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
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
            $returnArray["message"] = "Backup-Fach umbenannt und $verschobeneQuizze zu $newName verschoben.";
        } else {
            $verschobeneQuizze = 0;
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Backup-Fach umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Backup-Fach konnte nicht erstellt werden";
    }

    return $returnArray;
}

function renameBackupThemaInDatabase($conn, $thema, $newName)
{
    $returnArray = array();
    if (valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $newName)) {
        $returnArray["message"] = "Es existiert bereits ein Backup-Thema mit dem Namen $newName";
        echo json_encode($returnArray);
        die();
    }

    if (setValueFromDatabase($conn, "backupThemen", "themaBackup", "themaBackup", $thema, $newName, false)) {
        $returnArray["success"] = true;
    } else {
        $returnArray["success"] = false;
    }
    if ($returnArray["success"]) {
        //Get All QuizIDs where the thema is the same as we want to change
        $zuVerschiebendeQuizze =  getValueFromDatabase($conn, "selectquiz", "uniqueID", "thema", $thema, 0, true);

        logWrite($conn, "organisationLOG", "Zu verschiebende Quizze von $thema zu $newName: " . json_encode($zuVerschiebendeQuizze), true);
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
            $returnArray["message"] = "Backup-Thema umbenannt und $verschobeneQuizze zu $newName verschoben.";
        } else {
            $verschobeneQuizze = 0;
            $returnArray["verschobeneQuizze"] = $verschobeneQuizze;
            $returnArray["status"] = true;
            $returnArray["message"] = "Backup-Thema umbenannt Keine Quizze verschoben. (bereit zum löschen)";
        }
    } else {
        $returnArray["message"] = "Backup-Thema konnte nicht erstellt werden";
    }

    return $returnArray;
}

function recoverKlassenstufenByselectquizTable($conn)
{
}



function changeValueFromSelectQuiz($conn, $columnToChange, $valueToSet, $where, $whereValue)
{
    try {
        $stmt = $conn->prepare("UPDATE selectquiz SET $columnToChange = ? WHERE $where = ?");
        if ($stmt->execute([$valueToSet, $whereValue])) {
            return $stmt->rowCount();
        }
    } catch (Exception $e) {
        echo $e;
        die();
    }
    return false;
}

function getAllBackupKlassenstufenByNameFromDatabase($conn)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT klassenstufeBackup FROM backupKlassenstufen;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["klassenstufeBackup"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getAllBackupFaecherFromDatabase($conn)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT fachBackup FROM backupFaecher;");
        if ($stmt->execute([])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["fachBackup"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function getAllQuizzesWhichHasBackupKlassenstufe($conn, $backupKlassenstufe)
{
    try {
        $stmt = $conn->prepare("SELECT DISTINCT quizId FROM selectquiz WHERE klassenstufe = ?;");
        if ($stmt->execute([$backupKlassenstufe])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $results = array();
                foreach ($data as $result) {
                    $results[] = $result["quizId"];
                }
                return $results;
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    return false;
}

function repairDatabaseValues($conn, $klassenstufen = true, $faecher = true, $themen = true, $quiznames = true, $quizIDs = true, $repairPermissions = true, $repairGroupNameFromUsers = true)
{
    logWrite($conn, "organisationLOG", "NEW REPAIR ******************************************** NEW REPAIR", false, false, "white");

    $quizUniqueIDs = getAllValuesFromDatabase($conn, "selectquiz", "uniqueID", 0, true, false);
    if ($quizUniqueIDs == false) return false; //If there are no quizzes no repair needed

    //Repair for Klassenstufe
    function repairKlassenstufen($conn, $quizUniqueIDs)
    {
        $quizzesToRepair = array();
        foreach ($quizUniqueIDs as $currentQuizUniqueID) {
            $require = boolval(getValueFromDatabase($conn, "selectquiz", "requireKlassenstufe", "uniqueID", $currentQuizUniqueID, 1, false));
            if ($require) {
                $klassenstufeQuiz = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                if (valueInDatabaseExists($conn, "klassenstufenVerwaltung", "klassenstufe", "klassenstufe", $klassenstufeQuiz) || valueInDatabaseExists($conn, "backupKlassenstufen", "klassenstufeBackup", "klassenstufeBackup", $klassenstufeQuiz)) {
                    //logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz mit der ID: $currentQuizUniqueID = in Ordnung" . $klassenstufeQuiz, true);
                } else {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz mit der ID: $currentQuizUniqueID hat keine gültige Klassenstufe, sollte sie aber haben. Unique ID: " . $currentQuizUniqueID . "aktuelle Klasssenstufe: " . $klassenstufeQuiz, true, true);
                    $quizzesToRepair[] = $currentQuizUniqueID;
                }
            } else {
                //Set Klassenstufe to null where is not required
                $klassenstufeFromUniqueId = boolval(getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, 1, false));
                if ($klassenstufeFromUniqueId) {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz mit der ID: $currentQuizUniqueID hat eine Klassenstufe, darf aber keine haben." . $currentQuizUniqueID, true, true);
                    if (setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, null, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz mit der ID: $currentQuizUniqueID hat nun keine Klassenstufe mehr." . $currentQuizUniqueID, true, false, "green");
                    }
                }
            }
        }

        if (count($quizzesToRepair) > 0) {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Folgende Quizze müssen repariert werden:" . json_encode($quizzesToRepair), true, false, "white");
            $backupKlassenstue = generateBackupKlassenstueName($conn, "automatisch");
            if (createBackupKlassenstufeInDatabase($conn, $backupKlassenstue, "automatisch", getCurrentDateAndTime(1))["status"]) {
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Backup-Klassenstufe $backupKlassenstue erfolgreich erstellt.", true, false, "green");
                foreach ($quizzesToRepair as $currentQuizUniqueID) {
                    //Set all Quizzes that have the grade to backupGrade -> check again
                    $klassenstufe = getValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (!setValueFromDatabase($conn, "selectquiz", "klassenstufe", "uniqueID", $currentQuizUniqueID, $backupKlassenstue, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz (uniqueID: $currentQuizUniqueID) konnte nicht in $backupKlassenstue verschoben werden.", true, true);
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Quiz (uniqueID: $currentQuizUniqueID) wurde erfolgreich von $klassenstufe nach $backupKlassenstue verschoben.", true, false, "green");
                    }
                }
            } else {
                //backupKlassenstufe konnte nicht erstellt werden
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Backup-Klassenstufe $backupKlassenstue konnte nicht erstellt werden.", true, true);
            }
        } else {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Keine Quizze müssen repariert werden. Alles in Ordnung. Array: " . json_encode($quizzesToRepair), true, false, "white");
        }
        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Klassenstufen | Fertig", true);
    }
    if ($klassenstufen) {
        repairKlassenstufen($conn, $quizUniqueIDs);
    }


    //Repair for Fächer
    function repairFaecher($conn, $quizUniqueIDs)
    {
        $quizzesToRepair = array();
        foreach ($quizUniqueIDs as $currentQuizUniqueID) {
            $require = boolval(getValueFromDatabase($conn, "selectquiz", "requireFach", "uniqueID", $currentQuizUniqueID, 1, false));
            if ($require) {
                $fachQuiz = getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, 1, false);
                if (valueInDatabaseExists($conn, "faecherVerwaltung", "fach", "fach", $fachQuiz) || valueInDatabaseExists($conn, "backupFaecher", "fachBackup", "fachBackup", $fachQuiz)) {
                    //logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz mit der ID: $currentQuizUniqueID = in Ordnung" . $fachQuiz, true);
                } else {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fach | Quiz mit der ID: $currentQuizUniqueID hat kein gültiges Fach, sollte es aber haben. Unique ID: $currentQuizUniqueID Fach: $fachQuiz", true, true);
                    $quizzesToRepair[] = $currentQuizUniqueID;
                }
            } else {
                //Set Fach to null where is not required
                $fachFromUniqueId = boolval(getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, 1, false));
                if ($fachFromUniqueId) {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz mit der ID: $currentQuizUniqueID hat ein Fach, darf aber keines haben. uniqueID:" . $currentQuizUniqueID, true, true);
                    if (setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, null, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz mit der ID: $currentQuizUniqueID hat nun kein Fach mehr. uniqueID: " . $currentQuizUniqueID, true, false, "green");
                    }
                }
            }
        }

        if (count($quizzesToRepair) > 0) {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Folgende Quizze müssen repariert werden:" . json_encode($quizzesToRepair), true, false, "white");
            $backupFach = generateBackupFachName($conn, "automatisch");
            if (createBackupFachInDatabase($conn, $backupFach, "automatisch", getCurrentDateAndTime(1))["status"]) {
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Backup-Fach $backupFach erfolgreich erstellt.", true, false, "green");
                foreach ($quizzesToRepair as $currentQuizUniqueID) {
                    $fach = getValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (!setValueFromDatabase($conn, "selectquiz", "fach", "uniqueID", $currentQuizUniqueID, $backupFach, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz (uniqueID: $currentQuizUniqueID) konnte nicht in $backupFach verschoben werden.", true, true);
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz (uniqueID: $currentQuizUniqueID) wurde erfolgreich von $fach nach $backupFach verschoben.", true, true);
                    }
                }
            } else {
                //backupFach konnte nicht erstellt werden
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Backup-Fach $backupFach konnte nicht erstellt werden.", true, true);
            }
        } else {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Keine Quizze müssen repariert werden. Alles in Ordnung. Array: " . json_encode($quizzesToRepair), true, false, "white");
        }
        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer| Fertig", true, false, "green");
    }
    if ($faecher) {
        repairFaecher($conn, $quizUniqueIDs);
    }


    //Repair for Themen
    function repairThemen($conn, $quizUniqueIDs)
    {
        $quizzesToRepair = array();
        foreach ($quizUniqueIDs as $currentQuizUniqueID) {
            $require = boolval(getValueFromDatabase($conn, "selectquiz", "requireThema", "uniqueID", $currentQuizUniqueID, 1, false));
            if ($require) {
                $themaQuiz = getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, 1, false);
                if (valueInDatabaseExists($conn, "themenVerwaltung", "thema", "thema", $themaQuiz) || valueInDatabaseExists($conn, "backupThemen", "themaBackup", "themaBackup", $themaQuiz)) {
                    //logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Fächer | Quiz mit der ID: $currentQuizUniqueID = in Ordnung" . $fachQuiz, true);
                } else {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS Thema | Quiz mit der ID: $currentQuizUniqueID hat kein gültiges Thema, sollte es aber haben. Unique ID: $currentQuizUniqueID Thema: $themaQuiz", true, true);
                    $quizzesToRepair[] = $currentQuizUniqueID;
                }
            } else {
                //Set Fach to null where is not required
                $themaFromUniqueId = boolval(getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, 1, false));
                if ($themaFromUniqueId) {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Quiz mit der ID: $currentQuizUniqueID hat ein Fach, darf aber keines haben. uniqueID:" . $currentQuizUniqueID, true, true);
                    if (setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, null, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Quiz mit der ID: $currentQuizUniqueID hat nun kein Thema mehr. uniqueID: " . $currentQuizUniqueID, true, false, "green");
                    }
                }
            }
        }

        if (count($quizzesToRepair) > 0) {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Folgende Quizze müssen repariert werden:" . json_encode($quizzesToRepair), true, false , "white");
            $backupThema = generateBackupThemaName($conn, "automatisch");
            if (createBackupThemaInDatabase($conn, $backupThema, "automatisch", getCurrentDateAndTime(1))["status"]) {
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Backup-Thema $backupThema erfolgreich erstellt.", true, false, "green");
                foreach ($quizzesToRepair as $currentQuizUniqueID) {
                    $thema = getValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, 1, false);
                    if (!setValueFromDatabase($conn, "selectquiz", "thema", "uniqueID", $currentQuizUniqueID, $backupThema, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Quiz (uniqueID: $currentQuizUniqueID) konnte nicht in $backupThema verschoben werden.", true, true);
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Quiz (uniqueID: $currentQuizUniqueID) wurde erfolgreich von $thema nach $backupThema verschoben.", true, false, "green");
                    }
                }
            } else {
                //backupFach konnte nicht erstellt werden
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Backup-Thema $backupThema konnte nicht erstellt werden.", true, true);
            }
        } else {
            logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema | Keine Quizze müssen repariert werden. Alles in Ordnung. Array: " . json_encode($quizzesToRepair), true, false, "white");
        }
        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Thema| Fertig", true, false, "green");
    }
    if ($themen) {
        repairThemen($conn, $quizUniqueIDs);
    }


    //Repair for Quiznames
    function repairQuiznames($conn, $quizUniqueIDs)
    {
        foreach ($quizUniqueIDs as $currentQuizUniqueID) {
            $require = boolval(getValueFromDatabase($conn, "selectquiz", "requireQuizname", "uniqueID", $currentQuizUniqueID, 1, false));
            if ($require) {
                $nameQuiz = getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, 1, false);
                if (!$nameQuiz) {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS Quiz | Quiz mit der ID: $currentQuizUniqueID hat keinen Namen, sollte es aber haben. Unique ID: $currentQuizUniqueID", true, true);
                    if ($quizname = generateBackupQuizName($conn, $currentQuizUniqueID)) {
                        if (setValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, $quizname, false)) {
                        }
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS Quiz | Backup-Name $nameQuiz konnte nicht erstellt werden.", true, true);
                    }
                } else {
                    //Quizname OK
                }
            } else {
                //Set Fach to null where is not required
                $nameFromUniqueId = boolval(getValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, 1, false));
                if ($nameFromUniqueId) {
                    logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Quiz | Quiz mit der ID: $currentQuizUniqueID hat einen Namen, darf aber keinen haben.", true, true);
                    if (setValueFromDatabase($conn, "selectquiz", "quizname", "uniqueID", $currentQuizUniqueID, null, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Quiz | Quiz mit der ID: $currentQuizUniqueID hat nun keinen Namen mehr. uniqueID: ", true, false, "green");
                    }
                }
            }
        }
        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: Quizze| Fertig", true, false, "green");
    }
    if ($quiznames) {
        repairQuiznames($conn, $quizUniqueIDs);
    }


    //Repair for Quiznames
    function repairQuizIDs($conn, $quizUniqueIDs)
    {
        foreach ($quizUniqueIDs as $currentQuizUniqueID) {
            $quizID = getValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $currentQuizUniqueID, 1, false);
            $count = getValueFromDatabase($conn, "selectquiz", "uniqueID", "quizID", $quizID, 0, true, false);
            if (!$count) {
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDs | Quiz mit der uniqueID: $currentQuizUniqueID hat keine quizID", true, true);

                if ($backupName = generateRandomUniqueName(3)) {
                    if (setValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $currentQuizUniqueID, $backupName, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDS | Quiz mit der uniqueID: $currentQuizUniqueID hat nun die ID $backupName", true, false, "green");
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDS | Quiz mit der uniqueID: $currentQuizUniqueID konnte den Namen $backupName nicht annehmen. Fehler.", true, true);
                    }
                }
            }
            if ($count && count($count) > 1) {
                logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDS | Doppelte ID entdeckt: $quizID.", true, true);
                if ($backupName = generateRandomUniqueName(3)) {
                    if (setValueFromDatabase($conn, "selectquiz", "quizId", "uniqueID", $currentQuizUniqueID, $backupName, false)) {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDS | Quiz mit der uniqueID: $currentQuizUniqueID hat nun die ID $backupName", true, false, "green");
                    } else {
                        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizIDS | Quiz mit der uniqueID: $currentQuizUniqueID konnte den Namen $backupName nicht annehmen. Fehler.", true, true);
                    }
                }
            }
        }
        logWrite($conn, "organisationLOG", "REPAIR_PROCESS: QuizzeIDs | Fertig", true, false, "green");
    }
    if ($quizIDs) {
        repairQuizIDs($conn, $quizUniqueIDs);
    }


    //TODO:Repair permssions that are not there
    function repairPermissions($conn)
    {
        $allPermissions = json_validate(getAllValuesFromDatabase($conn, "permissions", "name", 0, true));
        //Groups
        $allGroups = getAllValuesFromDatabase($conn, "groupPermissions", "groupName", 0, true);
        if ($allGroups) {
            foreach ($allGroups as $currentGroup) {
                //check for allowed 
                $allAllowedPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "permissions", "groupName", $currentGroup, 1, false));
                if ($allAllowedPermissions) {
                    foreach ($allAllowedPermissions as $currentPermissionKey => $currentPermissionValue) {
                        if (!in_array($currentPermissionKey, $allPermissions)) {
                            if (removeFromObjectDatabase($conn, "groupPermissions", "permissions", "groupName", $currentGroup, $currentPermissionKey, true, false, "key")) {
                                logWrite($conn, "organisationLOG", "Permissions | Die Berechtigung (allowed) $currentPermissionKey wurde von Gruppe $currentGroup entfernt, da es die Berechtigung nicht gibt.", true, false, "green");
                            } else {
                                logWrite($conn, "organisationLOG", "Permissions | (allowed) $currentPermissionKey wurde nicht von Gruppe $currentGroup entfernt. Es gibt die Berechtigung aber nicht.", true, true);
                            }
                        }
                    }
                }
                $allForbiddenPermissions = json_validate(getValueFromDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $currentGroup, 1, false));
                if ($allForbiddenPermissions) {
                    foreach ($allForbiddenPermissions as $currentPermission) {
                        if (!in_array($currentPermission, $allPermissions)) {
                            if (removeFromArrayDatabase($conn, "groupPermissions", "isForbiddenTo", "groupName", $currentGroup, $currentPermission, true, true)) {
                                logWrite($conn, "organisationLOG", "Permissions | Die Berechtigung (forbidden) $currentPermission wurde von Gruppe $currentGroup entfernt, da es die Berechtigung nicht gibt.", true, false, "green");
                            } else {
                                logWrite($conn, "organisationLOG", "Permissions | (forbidden) $currentPermission wurde nicht von Gruppe $currentGroup entfernt. Es gibt die Berechtigung aber nicht.", true, true);
                            }
                        }
                    }
                }
            }
            logWrite($conn, "organisationLOG", "Permissions | Gruppen fertig.", true, false, "green");
        } else {
            logWrite($conn, "organisationLOG", "Keine Gruppen vorhanden, um deren Berechtigungen zu ändern", true, false, "yellow", ".log");
        }
        //Users
        $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
        if ($allUsers) {
            foreach ($allUsers as $currentUser) {
                //check for allowed 
                $allAllowedPermissions = json_validate(getValueFromDatabase($conn, "users", "permissions", "userID", $currentUser, 1, false));
                if ($allAllowedPermissions) {
                    foreach ($allAllowedPermissions as $currentPermissionKey => $currentPermissionValue) {
                        if (!in_array($currentPermissionKey, $allPermissions)) {
                            if (removeFromObjectDatabase($conn, "users", "permissions", "userID", $currentUser, $currentPermissionKey, true, false, "key")) {
                                logWrite($conn, "organisationLOG", "Permissions | Die Berechtigung (allowed) $currentPermissionKey wurde von Benutzer $currentUser entfernt, da es die Berechtigung nicht gibt.", true, false, "green");
                            } else {
                                logWrite($conn, "organisationLOG", "Permissions | (allowed) $currentPermissionKey wurde nicht von Benutzer $currentUser mit entfernt. Es gibt die Berechtigung aber nicht.", true, true);
                            }
                        }
                    }
                }
                $allForbiddenPermissions = json_validate(getValueFromDatabase($conn, "users", "isForbiddenTo", "userID", $currentUser, 1, false));
                if ($allForbiddenPermissions) {
                    foreach ($allForbiddenPermissions as $currentPermission) {
                        if (!in_array($currentPermission, $allPermissions)) {
                            if (removeFromArrayDatabase($conn, "users", "isForbiddenTo", "userID", $currentUser, $currentPermission, true, true)) {
                                logWrite($conn, "organisationLOG", "Permissions | Die Berechtigung (forbidden) $currentPermission wurde von Benutzer $currentUser entfernt, da es die Berechtigung nicht gibt.", true, false, "green");
                            } else {
                                logWrite($conn, "organisationLOG", "Permissions | (forbidden) $currentPermission wurde nicht von Benutzer $currentUser  entfernt. Es gibt die Berechtigung aber nicht.", true, true);
                            }
                        }
                    }
                }
            }
            logWrite($conn, "organisationLOG", "Permissions | Benutzer fertig.", true, false, "green");
        } else {
            logWrite($conn, "organisationLOG", "Keine Gruppen vorhanden, um deren Berechtigungen zu ändern", true, false, "yellow", ".log");
        }
    }
    if ($repairPermissions) {
        repairPermissions($conn);
    }


    //Repair Grup Names from users
    function repairGroupNameFromUsers($conn)
    {
        //Users
        $allUsers = getAllValuesFromDatabase($conn, "users", "userID", 0, true);
        $allAvailableGroups = json_validate(getAllValuesFromDatabase($conn, "groupPermissions", "groupName", 0, true));
        if ($allUsers) {
            if ($allAvailableGroups) {
                foreach ($allUsers as $currentUser) {
                    //check for groups 
                    $allGroupsFromUser = json_validate(getValueFromDatabase($conn, "users", "groups", "userID", $currentUser, 1, false));
                    if ($allGroupsFromUser) {
                        foreach ($allGroupsFromUser as $currentGroup) {
                            if (!in_array($currentGroup, $allAvailableGroups)) {
                                if (removeFromArrayDatabase($conn, "users", "groups", "userID", $currentUser, $currentGroup, true, true)) {
                                    logWrite($conn, "organisationLOG", "Groups | Die Gruppe $currentGroup wurde von Benutzer $currentUser entfernt, da es die Gruppe nicht gibt.", true, false, "green");
                                } else {
                                    logWrite($conn, "organisationLOG", "Groups |  Die Gruppe $currentGroup wurde nicht von Benutzer $currentUser  entfernt. Es gibt die Gruppe aber nicht.", true, true);
                                }
                            }
                        }
                    }
                }
            } else {
                //Delete All Groups from all users beause ther isn't a grup
                if ($allAvailableGroups !== false && count($allAvailableGroups) == 0) {
                    foreach ($allUsers as $currentUser) {
                        //check for groups 
                        if (insertArrayDatabase($conn, "users", "groups", "userID", $currentUser, array())) {
                            logWrite($conn, "organisationLOG", "Groups | Alle Gruppen von $currentUser entfernt, da es keine Gruppen gibt.", true, false, "green");
                        } else {
                            logWrite($conn, "organisationLOG", "Groups | Es konnten nicht alle Gruppen von $currentUser entfernt werden.", true, true);
                        }
                    }
                }
            }
        } else {
            logWrite($conn, "organisationLOG", "Keine Benutzer vorhanden, um Gruppen zu entfernen", true, false, "yellow", ".log");
        }
        logWrite($conn, "organisationLOG", "Users | fertig", true, false, "green", ".log");
    }

    if ($repairGroupNameFromUsers) {
        repairGroupNameFromUsers($conn);
    }
}
