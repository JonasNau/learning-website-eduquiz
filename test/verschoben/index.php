<?php
    session_start();
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
    <?php
    echo $_SESSION["permission"];

    if (!$_SESSION["permission"]){
        ?>
            <form action="setPermission.php" method="post">
                <input type="text" name="input" id="">
                <button type="submit" name="submit">Submit</button>
            </form>
        <?php
    } else {
        if ($_SESSION["permission"] == "admin") {
            ?>
                <p>Hello Admin!</p>

            <?php
        } else {
           echo "hallo";
        }
    }


    
    
    
    
    ?>


</body>
</html>