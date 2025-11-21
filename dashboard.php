<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

// Lógica para añadir ítem
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_item'])) {
    $name = $_POST['item_name'];
    $serial = $_POST['serial_number'];
    $desc = $_POST['description'];
    $unique_id = bin2hex(random_bytes(8)); // Genera un código único ej: a1b2c3d4

    $stmt = $pdo->prepare("INSERT INTO items (user_id, item_name, serial_number, description, unique_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $name, $serial, $desc, $unique_id]);
}

// Lógica para reportar robo
if (isset($_GET['stolen'])) {
    $stmt = $pdo->prepare("UPDATE items SET status = 'ROBADO' WHERE id = ? AND user_id = ?");
    $stmt->execute([$_GET['stolen'], $_SESSION['user_id']]);
    header("Location: dashboard.php");
}

// Obtener mis ítems
$stmt = $pdo->prepare("SELECT * FROM items WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$_SESSION['user_id']]);
$items = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi Inventario | ITEM-ID</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <div class="logo">ITEM-ID</div>
        <div>Hola, <?php echo $_SESSION['email']; ?> | <a href="index.php?logout=1" class="logout">Salir</a></div>
    </nav>

    <div class="container">
        <div class="add-section">
            <h2>Registrar Nuevo Objeto</h2>
            <form method="POST" class="form-inline">
                <input type="text" name="item_name" placeholder="Ej: Bicicleta Trek" required>
                <input type="text" name="serial_number" placeholder="Nº Serie / Chasis" required>
                <input type="text" name="description" placeholder="Descripción breve">
                <button type="submit" name="add_item" class="btn-primary">+ Registrar</button>
            </form>
        </div>

        <h2>Mis Objetos Protegidos</h2>
        <div class="grid">
            <?php foreach ($items as $item): ?>
                <div class="card <?php echo $item['status'] == 'ROBADO' ? 'stolen-border' : ''; ?>">
                    <h3><?php echo htmlspecialchars($item['item_name']); ?></h3>
                    <p class="serial">SN: <?php echo htmlspecialchars($item['serial_number']); ?></p>
                    <div class="status-badge <?php echo strtolower($item['status']); ?>">
                        <?php echo $item['status']; ?>
                    </div>
                    
                    <div class="qr-area">
                        <!-- Usamos una API pública para generar el QR al vuelo -->
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://localhost/item-id/view.php?id=<?php echo $item['unique_id']; ?>" alt="QR">
                        <br>
                        <a href="view.php?id=<?php echo $item['unique_id']; ?>" target="_blank" class="link-small">Ver Certificado Público</a>
                    </div>

                    <div class="actions">
                        <?php if($item['status'] != 'ROBADO'): ?>
                            <a href="dashboard.php?stolen=<?php echo $item['id']; ?>" class="btn-danger" onclick="return confirm('¿Seguro? Esto activará la alerta roja.')">REPORTAR ROBO</a>
                        <?php else: ?>
                            <span class="alert-text">⚠️ ALERTA ACTIVADA</span>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html>