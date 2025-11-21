<?php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $action = $_POST['action'];

    if ($action == 'register') {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $hash]);
            $_SESSION['message'] = "Cuenta creada. Ahora inicia sesión.";
        } catch (Exception $e) {
            $_SESSION['error'] = "El email ya existe.";
        }
    } elseif ($action == 'login') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            header("Location: dashboard.php");
            exit;
        } else {
            $_SESSION['error'] = "Credenciales incorrectas.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>ITEM-ID | Acceso</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container login-box">
        <h1>ITEM-ID</h1>
        <p>El Notario Digital de tus objetos.</p>
        
        <?php if(isset($_SESSION['error'])) { echo "<p class='error'>".$_SESSION['error']."</p>"; unset($_SESSION['error']); } ?>
        <?php if(isset($_SESSION['message'])) { echo "<p class='success'>".$_SESSION['message']."</p>"; unset($_SESSION['message']); } ?>

        <form method="POST">
            <input type="email" name="email" placeholder="Tu Email" required>
            <input type="password" name="password" placeholder="Contraseña" required>
            <div class="buttons">
                <button type="submit" name="action" value="login" class="btn-primary">Entrar</button>
                <button type="submit" name="action" value="register" class="btn-secondary">Registrarse</button>
            </div>
        </form>
    </div>
</body>
</html>