<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $urlData = $_POST["url"] . "\n";
    file_put_contents("urlslist.txt", $urlData, FILE_APPEND | LOCK_EX);
}
?>
