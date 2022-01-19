<?php
require_once 'dbh.incPDO.php';

$database = new Dbh();
$conn = $database->connect();



if (isset($_POST['getQuizData'])) {
    $quizId = $_POST["quizId"];

    try {
        $stmt = $conn->prepare("SELECT quizdata FROM selectquiz WHERE quizId = ? LIMIT 1");
        if ($stmt->execute([$quizId])) {
            if ($stmt->rowCount()) {
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($data["quizdata"]);
                die();
            } else {
                echo "Keine Daten...";
            }
        }
    } catch (Exception $e) {
        echo $e;
    }
    die();
}
