<?php
require 'db.php';

$sql = "
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    status ENUM('VERIFICADO', 'ROBADO', 'TRANSFERIDO') DEFAULT 'VERIFICADO',
    unique_id VARCHAR(50) NOT NULL UNIQUE, -- El código del enlace QR
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
";

try {
    $pdo->exec($sql);
    echo "Tablas creadas con éxito. <a href='index.php'>Ir al Inicio</a>";
} catch (PDOException $e) {
    echo "Error creando tablas: " . $e->getMessage();
}
?>