<?php
// db.php
$host = "sql10.freesqldatabase.com";
$dbname = "sql10808231";
$user = "sql10808231";
$pass = "mq8yEKik4z"; // ¡CAMBIA ESTO SI YA CAMBIASTE LA CONTRASEÑA!
$port = "3306";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>