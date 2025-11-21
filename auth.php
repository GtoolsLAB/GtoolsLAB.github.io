<?php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $action = $_POST['action'];

    if ($action == 'register') {
        // Lógica de REGISTRO
        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->execute([$email, $hash]);
            // Éxito: volvemos al index con mensaje verde
            header("Location: index.html?success=1");
        } catch (Exception $e) {
            // Error: volvemos al index con error tipo 2 (email duplicado)
            header("Location: index.html?error=2");
        }
    } elseif ($action == 'login') {
        // Lógica de LOGIN
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Login correcto
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            header("Location: dashboard.php");
            exit;
        } else {
            // Login incorrecto: volvemos al index con error tipo 1
            header("Location: index.html?error=1");
        }
    }
} else {
    // Si alguien intenta entrar a este archivo directamente sin enviar formulario
    header("Location: index.html");
}
?>
