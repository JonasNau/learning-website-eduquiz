<?php

function deleteAccount($conn, $userID)
{
    //Backup User
    
    //Delete User
    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE userID = ?");
        if ($stmt->execute([$userID])) {
            if ($stmt->rowCount()) {
                return true;
            }
        }
    } catch (Exception $e) {
        $_SESSION["message"] = $e;
        return false;
    }

    //Delete Stay Logged in tokens and other data
    deleteOldConfirmEntry($conn, $userID, "userID");
    deleteAllStayLoggedInTokens($conn, $userID, "userID"); //Prevents too many redirects
    customDatabaseCall($conn, "DELETE FROM scores WHERE userID = ?", [$userID], false);
    return true;

}
