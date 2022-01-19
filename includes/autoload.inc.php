<?php

spl_autoload_register('myAutoloader');

function myAutoloader($className) {
    $path = "classes/";
    $extention = ".class.php";
    $fullPath = $path.$className.$extention;

    require_once $fullPath;
}