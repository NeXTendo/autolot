<?php
require_once '../db.php';
require_once '../includes/config.php';

$where = "WHERE 1=1";
$params = [];

if (!empty($_GET['q'])) {
    $where .= " AND (make LIKE :q OR model LIKE :q OR description LIKE :q)";
    $params['q'] = '%' . $_GET['q'] . '%';
}
if (!empty($_GET['make'])) {
    $where .= " AND make = :make";
    $params['make'] = $_GET['make'];
}
if (!empty($_GET['min_price'])) {
    $where .= " AND price >= :min_price";
    $params['min_price'] = $_GET['min_price'];
}
if (!empty($_GET['max_price'])) {
    $where .= " AND price <= :max_price";
    $params['max_price'] = $_GET['max_price'];
}
if (!empty($_GET['body_type'])) {
    $types = (array)$_GET['body_type'];
    $placeholders = [];
    foreach ($types as $i => $type) {
        $key = "type_$i";
        $placeholders[] = ":$key";
        $params[$key] = $type;
    }
    $where .= " AND body_type IN (" . implode(',', $placeholders) . ")";
}

$stmt = $pdo->prepare("SELECT * FROM vehicles $where ORDER BY created_at DESC");
$stmt->execute($params);
$vehicles = $stmt->fetchAll();

if (empty($vehicles)) {
    echo '<div class="col-12 text-center py-5"><i class="fa-solid fa-car-rear fa-3x mb-3 opacity-20"></i><p class="text-muted">No vehicles found matching your criteria.</p></div>';
} else {
    foreach ($vehicles as $row) {
        $img = $row['image'] ?: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070';
        $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . $img;
        $price = CURRENCY_SYMBOL . number_format($row['price'], 0);
        $mileage = number_format($row['mileage']) . " km";
        
        echo <<<HTML
        <div class="col-md-6 col-xl-4 animate-fade-up">
            <div class="listing-card" onclick="location.href='vehicle.php?id={$row['id']}'">
                <div class="image-container">
                    <img src="{$imgUrl}" alt="{$row['make']} {$row['model']}">
                    <div class="price-tag">{$price}</div>
                </div>
                <div class="card-content">
                    <h5 class="make-model m-0">{$row['make']} <span class="fw-light opacity-50">{$row['model']}</span></h5>
                    <div class="specs mt-3 d-flex justify-content-between">
                        <span><i class="fa-regular fa-calendar me-1"></i>{$row['year']}</span>
                        <span><i class="fa-solid fa-road me-1 text-muted"></i>{$mileage}</span>
                    </div>
                    <hr class="border-light border-opacity-10 my-3">
                    <div class="d-grid">
                        <a href="vehicle.php?id={$row['id']}" class="btn btn-outline-platinum btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        </div>
HTML;
    }
}
