<?php

function getSettingVal($conn, $setting) {

    $stmt = $conn->prepare(("SELECT setting FROM settings WHERE name = ? LIMIT 1"));
    if($stmt->execute([$setting])) {
        if ($stmt->rowCount()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result["setting"];
        }
    } else {
        echo "Error in executing Statement getting settings";
        return false;
    }
    
}