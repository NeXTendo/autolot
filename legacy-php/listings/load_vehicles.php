<?php
include '../db.php';

$make = isset($_GET['make']) ? $_GET['make'] : '';
$model = isset($_GET['model']) ? $_GET['model'] : '';
$price = isset($_GET['price']) ? $_GET['price'] : 1000000;
$page = isset($_GET['page']) ? $_GET['page'] : 1;
$limit = 12;
$offset = ($page - 1) * $limit;

$whereConditions = [];
$params = [];

if ($make) {
    $whereConditions[] = "make = ?";
    $params[] = $make;
}
if ($model) {
    $whereConditions[] = "model = ?";
    $params[] = $model;
}
if ($price) {
    $whereConditions[] = "price <= ?";
    $params[] = $price;
}

$whereSql = implode(' AND ', $whereConditions);
$whereSql = $whereSql ? "WHERE $whereSql" : '';

$query = "SELECT * FROM vehicles $whereSql LIMIT ? OFFSET ?";
$stmt = $pdo->prepare($query);
// Bind limit and offset as integers
$stmt->bindValue(count($params) + 1, (int)$limit, PDO::PARAM_INT);
$stmt->bindValue(count($params) + 2, (int)$offset, PDO::PARAM_INT);
// Bind other params
foreach ($params as $key => $val) {
    $stmt->bindValue($key + 1, $val);
}
$stmt->execute();
$vehicles = $stmt->fetchAll();

// Get total number of vehicles for pagination
$totalQuery = "SELECT COUNT(*) AS total FROM vehicles $whereSql";
$totalStmt = $pdo->prepare($totalQuery);
$totalStmt->execute($params);
$total = $totalStmt->fetchColumn();
$totalPages = ceil($total / $limit);

echo json_encode([
    'vehicles' => $vehicles,
    'totalPages' => $totalPages
]);
?>
