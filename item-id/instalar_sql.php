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
    description TEXT,
    status ENUM('VERIFICADO', 'ROBADO', 'TRANSFERIDO') DEFAULT 'VERIFICADO',
    unique_id VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
";

try {
    $pdo->exec($sql);
    echo "<h1>¡Base de datos creada correctamente!</h1>";
    echo "<p>Las tablas 'users' e 'items' ya están listas en sql10808231.</p>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>