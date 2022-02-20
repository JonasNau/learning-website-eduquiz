<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<div >
  <input type="file" name="file" id="file">
  <input type="button" id="btn_uploadfile" 
     value="Upload" 
     onclick="uploadFile();" >
</div>
<script defer>
   // Upload file
function uploadFile(file, ) {
var files = document.getElementById("file").files;

if(files.length > 0 ){
   var formData = new FormData();
   formData.append("file", files[0]);

   var xhttp = new XMLHttpRequest();

   // Set POST method and ajax file path
   xhttp.open("POST", "ajaxfile.php", true);

   // call on request changes state
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {

        var response = this.responseText;
        if(response == 1){
           alert("Upload successfully.");
        }else{
           alert("File not uploaded.");
        }
      }
   };

   // Send request with data
   xhttp.send(formData);

}else{
   alert("Please select a file");
}

}
</script>
</body>
</html>
<?php

if(isset($_FILES['file']['name'])){
   // file name
   $filename = $_FILES['file']['name'];

   // Location
   $location = './upload/'.$filename;

   // file extension
   $file_extension = pathinfo($location, PATHINFO_EXTENSION);
   $file_extension = strtolower($file_extension);

   // Valid extensions
   $valid_ext = array("pdf","doc","docx","jpg","png","jpeg");

   $response = 0;
   if(in_array($file_extension,$valid_ext)){
      // Upload file
      if(move_uploaded_file($_FILES['file']['tmp_name'],$location)){
         $response = 1;
      } 
   }

   echo $response;
   exit;
}