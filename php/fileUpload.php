<?php
session_start();
echo json_encode(array('name' => $_FILES["file"]["name"]));