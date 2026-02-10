<?php
require_once 'db.php';
include 'includes/header.php';

// Pagination setup
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = ITEMS_PER_PAGE;
$offset = ($page - 1) * $limit;

// Search/Filter logic
$make = isset($_GET['make']) ? $_GET['make'] : '';
$min_price = isset($_GET['min_price']) ? $_GET['min_price'] : 0;
$max_price = isset($_GET['max_price']) ? $_GET['max_price'] : 10000000;

$query = "SELECT * FROM vehicles WHERE 1=1";
$params = [];

if ($make) {
    $query .= " AND make = ?";
    $params[] = $make;
}
$query .= " AND price BETWEEN ? AND ?";
$params[] = $min_price;
$params[] = $max_price;

// Get total count for pagination
$countStmt = $pdo->prepare(str_replace("SELECT *", "SELECT COUNT(*)", $query));
$countStmt->execute($params);
$totalItems = $countStmt->fetchColumn();
$totalPages = ceil($totalItems / $limit);

// Get paginated results
$query .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$vehicles = $stmt->fetchAll();

// Get unique makes for filter
$makes = $pdo->query("SELECT DISTINCT make FROM vehicles ORDER BY make ASC")->fetchAll(PDO::FETCH_COLUMN);
?>

<div class="container py-5 mt-4">
    <div class="row g-5">
        <!-- Filters Sidebar -->
        <div class="col-lg-3">
            <button class="btn btn-outline-platinum w-100 d-lg-none mb-4" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse">
                <i class="fa-solid fa-filter me-2"></i> Filter Inventory
            </button>
            
            <div class="collapse d-lg-block" id="filterCollapse">
                <div class="glass-panel p-4 sticky-top" style="top: 100px;">
                <h5 class="mb-4">Refine Search</h5>
                <form action="listings.php" method="GET">
                    <div class="mb-4">
                        <label class="form-label small text-muted text-uppercase fw-bold">Brand</label>
                        <select name="make" class="form-select glass-panel shadow-none text-white border-opacity-10">
                            <option value="">All Brands</option>
                            <?php foreach ($makes as $m): ?>
                                <option value="<?= $m ?>" <?= $make == $m ? 'selected' : '' ?>><?= $m ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small text-muted text-uppercase fw-bold">Price Range</label>
                        <div class="d-flex align-items-center gap-2">
                            <input type="number" name="min_price" class="form-control glass-panel shadow-none text-white border-opacity-10 py-2" placeholder="Min" value="<?= $min_price ?>">
                            <span class="text-muted">-</span>
                            <input type="number" name="max_price" class="form-control glass-panel shadow-none text-white border-opacity-10 py-2" placeholder="Max" value="<?= $max_price ?>">
                        </div>
                    </div>

                    <button type="submit" class="btn-platinum w-100 mb-2">Apply Filters</button>
                    <a href="listings.php" class="btn btn-link w-100 text-muted text-decoration-none small">Clear All</a>
                </form>
            </div>
            </div>
        </div>

        <!-- Inventory Grid -->
        <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 class="fw-bold mb-1">Our Inventory</h2>
                    <p class="text-muted small mb-0">Discover <?= $totalItems ?> matching vehicles</p>
                </div>
                <!-- Sort Dropdown (Visual Only) -->
                <div class="dropdown">
                    <button class="btn btn-outline-platinum dropdown-toggle px-4 border-opacity-10" data-bs-toggle="dropdown">
                        Sort By: Newest
                    </button>
                    <ul class="dropdown-menu glass-panel">
                        <li><a class="dropdown-item" href="#">Price: Low to High</a></li>
                        <li><a class="dropdown-item" href="#">Price: High to Low</a></li>
                        <li><a class="dropdown-item" href="#">Year: Newest</a></li>
                    </ul>
                </div>
            </div>

            <?php if (empty($vehicles)): ?>
                <div class="text-center py-5 my-5">
                    <i class="fa-solid fa-car-side fa-3x text-muted opacity-25 mb-4"></i>
                    <h4 class="text-muted">No vehicles found matching your criteria</h4>
                    <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
            <?php else: ?>
                <div class="row g-3 g-md-4">
                    <?php foreach ($vehicles as $row): ?>
                        <div class="col-6 col-xl-4 mb-2 mb-md-3">
                            <div class="listing-card" onclick="location.href='vehicle.php?id=<?= $row['id'] ?>'">
                                <div class="image-container">
                                    <?php 
                                        $images = explode(',', $row['image']);
                                        $img = !empty($images[0]) ? $images[0] : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070';
                                        $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . $img;
                                    ?>
                                    <img src="<?= $imgUrl ?>" alt="<?= htmlspecialchars($row['make'] . ' ' . $row['model']) ?>">
                                    <div class="price-tag"><?= CURRENCY_SYMBOL . number_format($row['price'], 0) ?></div>
                                </div>
                                <div class="card-content">
                                    <h5 class="make-model m-0"><?= htmlspecialchars($row['make']) ?> <span class="fw-light opacity-50"><?= htmlspecialchars($row['model']) ?></span></h5>
                                    <div class="specs mt-3">
                                        <span><i class="fa-regular fa-calendar me-1"></i><?= $row['year'] ?></span>
                                        <span><i class="fa-solid fa-road me-1"></i><?= number_format($row['mileage']) ?> km</span>
                                    </div>
                                    <div class="mt-3 pt-3 border-top border-light border-opacity-10 d-flex justify-content-between align-items-center">
                                         <span class="small text-muted fw-bold">SHIPPING READY</span>
                                         <i class="fa-solid fa-chevron-right text-platinum small"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <!-- Pagination -->
                <?php if ($totalPages > 1): ?>
                    <nav class="mt-5 pt-4">
                        <ul class="pagination justify-content-center">
                            <li class="page-item <?= $page <= 1 ? 'disabled' : '' ?>">
                                <a class="page-link glass-panel border-opacity-10 mx-1" href="?page=<?= $page - 1 ?>&make=<?= $make ?>&min_price=<?= $min_price ?>&max_price=<?= $max_price ?>"><i class="fa-solid fa-chevron-left"></i></a>
                            </li>
                            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                                <li class="page-item <?= $page == $i ? 'active' : '' ?>">
                                    <a class="page-link <?= $page == $i ? 'bg-platinum text-dark' : 'glass-panel' ?> border-opacity-10 mx-1" href="?page=<?= $i ?>&make=<?= $make ?>&min_price=<?= $min_price ?>&max_price=<?= $max_price ?>"><?= $i ?></a>
                                </li>
                            <?php endfor; ?>
                            <li class="page-item <?= $page >= $totalPages ? 'disabled' : '' ?>">
                                <a class="page-link glass-panel border-opacity-10 mx-1" href="?page=<?= $page + 1 ?>&make=<?= $make ?>&min_price=<?= $min_price ?>&max_price=<?= $max_price ?>"><i class="fa-solid fa-chevron-right"></i></a>
                            </li>
                        </ul>
                    </nav>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
