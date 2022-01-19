<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Files</title>
</head>
<body>
    <form>
        <input type="file" name="file" id="inpFile" multiple>
        <br>
        <br>
        <button type="submit" name="btnUpload" id="btnUpload">UPLOAD</button>
    </form>
    <hr>
    <a href="uploads/">Uploads</a>

    <script>
        const inputFile = document.getElementById("inpFile");
        const btnUpload = document.getElementById("btnUpload");

        btnUpload.addEventListener("click", function(){
            const xhr = new XMLHttpRequest();
            const formData = new FormData();

            for (const file of inputFile.files) {
                formData.append("myFiles[]", file);
            }

            xhr.open("post", "upload.php");
            xhr.send(formData);
        })

    </script>
</body>
</html>