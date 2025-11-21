<?php
require 'db.php';

$id = $_GET['id'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM items WHERE unique_id = ?");
$stmt->execute([$id]);
$item = $stmt->fetch();

if (!$item) {
    die("<h1>Error 404</h1><p>Este objeto no existe en el registro ITEM-ID.</p>");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado Digital | ITEM-ID</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="public-view">
    <div class="certificate-container <?php echo $item['status'] == 'ROBADO' ? 'bg-red' : 'bg-green'; ?>">
        <div class="cert-header">
            <h1>ITEM-ID CERTIFIED</h1>
            <p>Registro de Propiedad Digital</p>
        </div>

        <?php if($item['status'] == 'ROBADO'): ?>
            <div class="alert-banner">
                🚫 ¡OBJETO REPORTADO COMO ROBADO! 🚫
                <p>No comprar. Contactar autoridades.</p>
            </div>
        <?php endif; ?>

        <div class="cert-details">
            <h2><?php echo htmlspecialchars($item['item_name']); ?></h2>
            <p><strong>Estado:</strong> <?php echo $item['status']; ?></p>
            <p><strong>Nº Serie:</strong> <?php echo htmlspecialchars($item['serial_number']); ?></p>
            <p><strong>Descripción:</strong> <?php echo htmlspecialchars($item['description']); ?></p>
            <p><strong>Fecha de Registro:</strong> <?php echo $item['created_at']; ?></p>
        </div>

        <div class="footer-cert">
            <p>La autenticidad de este objeto está garantizada por ITEM-ID.</p>
            <small>ID Único: <?php echo $item['unique_id']; ?></small>
        </div>
    </div>
</body>
</html>