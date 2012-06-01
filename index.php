<?php 
session_start();
?>
<!DOCTYPE html>

<html lang="en">
<head>
    <title>GitHub Gollum</title>
    
    <link href="css/editor.css" media="screen" rel="stylesheet" type="text/css" />
    <link href="css/bootstrap.min.css" media="screen" rel="stylesheet" type="text/css" />
    <link href="css/template.css" media="screen" rel="stylesheet" type="text/css" />
</head>

<body>
    <form action="" method="post">
        <textarea id="editor"></textarea>
        <input type="submit" value="Save" class="btn" />
    </form>
    
    <script type="text/javascript" src="javascript/jquery.js"></script>
    <script type="text/javascript" src="javascript/formUploadProgress.js"></script>
    <script type="text/javascript" src="javascript/jquery.form.js"></script>
    <script type="text/javascript" src="javascript/jquery.gollum.js"></script>
    <script type="text/javascript" src="javascript/bootstrap.min.js"></script>
    <script type="text/javascript" src="javascript/gollum.markdown.js"></script>
    
    <script type="text/javascript">
        $(document).ready(function () {
            $('#editor').gollum({
                uploadURL: '/php/imageUpload.php',
                progressURL: '/php/imageProgress.php',
                uploadProgressName: '<?= ini_get('session.upload_progress.name') ?>',
                progressId: 1,
            });
        });
    </script>
</body>
</html>
