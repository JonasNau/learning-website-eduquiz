<?php
      class Dbh {
        private $servername;
        private $username;
        private $password;
        private $dbname;
        private $charset;

          public function connect() {
              $this->servername = "localhost";
              $this->username = "developer";
              $this->password = "JonasNaumann270406";
              $this->dbname = "quizapp";
              $this->charset = "utf8mb4";

              try {
                    #Data Source Name
                $dsn = "mysql:host=".$this->servername.";dbname=".$this->dbname.";charset=".$this->charset;

                $pdo = new PDO($dsn, $this->username, $this->password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                return $pdo;
              } catch (PDOException $e){
                echo "Connection Failed: ".$e->getMessage(). "<br/>";
                die();
              }
              
          }
      }

      # print_r(PDO::getAvailableDrivers());
      #var_dump($variables);