<?php
require_once("includes/generalFunctions.php");
require_once("includes/userSystem/functions/generalFunctions.php");
require_once("includes/dbh.incPDO.php");
require_once("./includes/userSystem/functions/login-functions.php");
require_once("./includes/userSystem/functions/permission-functions.php");
require_once("./includes/userSystem/autologin.php");
require_once("./includes/getSettings.php");

require_once("./global.php");

    require_once 'header-start.php';
?>

</head>
    <?php
        require_once 'navigation-bar.php';
        //Include Expire Validation
        ?>

        
        <?php
            if (!isset($_GET["selector"]) || isset($_GET["valitator"])){
                header("location: ../index.php");
            }

            $selector = $_GET["selector"];
            $validator = $_GET["validator"];
            if (empty($selector) || empty($validator)){
                echo "Could not validate your request, sorry!";
            } else {

            if (!ctype_xdigit($selector) !== false && ctype_xdigit($validator) !== false){
                //Something is wrong with your link please check it!
            }
        }
        ?>
         <div class="container">
        <div class="row">
            <div class="col-11 col-md-9 col-lg-10">
                <form action="includes/reset-password.inc.php" method="post">
                    <input type="hidden" name="selector" value="<?php echo $selector; ?>">
                    <input type="hidden" name="validator" value="<?php echo $validator; ?>">
                    <div class="mb-3">
                        <label for="pwd" class="form-label">Gib ein neues Passwort ein</label>
                        <input type="password" class="form-control" id="pwd" name="pwd">
                    </div>
                    <div class="mb-3">
                        <label for="pwd-repeat" class="form-label">Wiederhole das Passwort</label>
                        <input type="password" class="form-control" id="pwd-repeat" name="pwd-repeat">
                    </div>
                    <button type="submit" class="btn btn-primary" name="submit">Passwort erstellen</button>   
                </form>
            </div>
        </div>
    
    </div>
    
            
            
        
        
        

        <?php
        require_once 'body-scripts.php';
    ?>
</body>
</html>