<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
<?php

var_dump($_FILES);


foreach($_FILES["myfiles"]["tmp_name"] as $key => $value) {
    $targetPath  = "uploades/".basename($_FILES["myFiles"]["name"][$key]);
    move_uploaded_file($value, $targetPath);
}

// $file = $_FILES["file"];

// $fileSize = $_FILES["file"]["size"];
// if ($fileSize == 0){
//     echo "Die Datei ist leer";
//     echo "<br><a href='index.php'>Go back</a>";
//     exit();
// }

// $fileName = $_FILES["file"]["name"];
// $fileType = $_FILES["file"]["type"];
// $fileError = $_FILES["file"]["error"];
// $fileTmpName = $_FILES["file"]["tmp_name"];
// echo "<br>$fileTmpName<br>";

// $fileExtention = explode(".", $fileName); //Gegenteil ist implode() oder join()
// $fileActualExt = strtolower(end($fileExtention));
// echo $fileActualExt;

// $allowedFiles = array("jpg", "jpeg", "png", "pdf", "bin", "docx", "doc", "other", "mp4", "mvk", "mp3", "ogg");

// if (in_array($fileActualExt, $allowedFiles)){
//     if (!$fileError === 0){
//         echo "There was an error uploading your File!";
//     } else {
       
    
//         $fileNameNew = uniqid('', true) . "." . $fileActualExt;
//         $fileDestination = 'uploads/'.$fileNameNew;
//         print $fileDestination;
//         if(move_uploaded_file($fileTmpName, $fileDestination)){
//             echo "Erfolg!";
//             header("location: index.php?upload=success");
//         }
        
//     }

    

// } else {
//     echo "Dieser Dateityp ist nicht erlaubt. Sorry!";
// }

// echo "Ende";

?>

