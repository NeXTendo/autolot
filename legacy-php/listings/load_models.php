<?php
include '../db.php';

$make = isset($_GET['make']) ? $_GET['make'] : '';
if ($make) {
    $stmt = $pdo->prepare("SELECT DISTINCT model FROM vehicles WHERE make = ?");
    $stmt->execute([$make]);
    $models = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($models);
}
?>
