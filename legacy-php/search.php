<?php
require_once 'db.php';
include 'includes/header.php';

// Fetch distinct values for filters
$makes = $pdo->query("SELECT DISTINCT make FROM vehicles ORDER BY make ASC")->fetchAll(PDO::FETCH_COLUMN);
$bodyTypes = $pdo->query("SELECT DISTINCT body_type FROM vehicles WHERE body_type IS NOT NULL ORDER BY body_type ASC")->fetchAll(PDO::FETCH_COLUMN);
$fuelTypes = $pdo->query("SELECT DISTINCT fuel_type FROM vehicles WHERE fuel_type IS NOT NULL ORDER BY fuel_type ASC")->fetchAll(PDO::FETCH_COLUMN);

// Initial Search logic
$where = "WHERE 1=1";
$params = [];

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
if (!empty($_GET['q'])) {
    $where .= " AND (make LIKE :q OR model LIKE :q OR description LIKE :q)";
    $params['q'] = '%' . $_GET['q'] . '%';
}

$stmt = $pdo->prepare("SELECT * FROM vehicles $where ORDER BY created_at DESC");
$stmt->execute($params);
$vehicles = $stmt->fetchAll();
?>

<div class="container py-5 mt-5">
    <div class="row g-5">
        <!-- Sidebar Filters -->
        <div class="col-lg-3">
            <div class="glass-panel p-4 sticky-top" style="top: 100px;">
                <h4 class="mb-4">Filters</h4>
                <form id="searchFilterForm" method="GET" action="search.php">
                    <div class="mb-4">
                        <label class="form-label text-muted small text-uppercase fw-bold">Search</label>
                        <input type="text" name="q" class="form-control bg-dark border-secondary text-white shadow-none" placeholder="Keywords..." value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-muted small text-uppercase fw-bold">Make</label>
                        <select name="make" class="form-select bg-dark border-secondary text-white shadow-none">
                            <option value="">All Brands</option>
                            <?php foreach ($makes as $make): ?>
                                <option value="<?= $make ?>" <?= (($_GET['make'] ?? '') == $make) ? 'selected' : '' ?>><?= $make ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-muted small text-uppercase fw-bold">Price Range</label>
                        <div class="d-flex gap-2">
                            <input type="number" name="min_price" class="form-control bg-dark border-secondary text-white shadow-none" placeholder="Min" value="<?= htmlspecialchars($_GET['min_price'] ?? '') ?>">
                            <input type="number" name="max_price" class="form-control bg-dark border-secondary text-white shadow-none" placeholder="Max" value="<?= htmlspecialchars($_GET['max_price'] ?? '') ?>">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-muted small text-uppercase fw-bold">Body Type</label>
                        <?php foreach ($bodyTypes as $type): ?>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="body_type[]" value="<?= $type ?>" id="type_<?= $type ?>">
                                <label class="form-check-label small" for="type_<?= $type ?>"><?= $type ?></label>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <button type="submit" class="btn-platinum w-100 mt-2">Apply Filters</button>
                    <a href="search.php" class="btn btn-link btn-sm w-100 text-muted mt-2 text-decoration-none">Reset All</a>
                </form>
            </div>
        </div>

        <!-- Search Results -->
        <div class="col-lg-9">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0"><?= count($vehicles) ?> <span class="fw-light opacity-50 fs-4">Results Match</span></h2>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm bg-dark border-secondary text-white shadow-none w-auto">
                        <option>Sort By: Newest First</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Mileage: Lowest</option>
                    </select>
                </div>
            </div>

            <div class="row g-4" id="searchResults">
                <?php if (empty($vehicles)): ?>
                    <div class="col-12 text-center py-5">
                        <i class="fa-solid fa-car-rear fa-3x mb-3 opacity-20"></i>
                        <p class="text-muted">No vehicles found matching your criteria.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($vehicles as $row): ?>
                        <div class="col-md-6 col-xl-4 animate-fade-up">
                            <div class="listing-card" onclick="location.href='vehicle.php?id=<?= $row['id'] ?>'">
                                <div class="image-container">
                                    <?php 
                                        $img = $row['image'] ?: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070';
                                        $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . $img;
                                    ?>
                                    <img src="<?= $imgUrl ?>" alt="<?= htmlspecialchars($row['make'] . ' ' . $row['model']) ?>">
                                    <div class="price-tag"><?= CURRENCY_SYMBOL . number_format($row['price'], 0) ?></div>
                                </div>
                                <div class="card-content">
                                    <h5 class="make-model m-0"><?= htmlspecialchars($row['make']) ?> <span class="fw-light opacity-50"><?= htmlspecialchars($row['model']) ?></span></h5>
                                    <div class="specs mt-3 d-flex justify-content-between">
                                        <span><i class="fa-regular fa-calendar me-1"></i><?= $row['year'] ?></span>
                                        <span><i class="fa-solid fa-road me-1 text-muted"></i><?= number_format($row['mileage']) ?> km</span>
                                    </div>
                                    <hr class="border-light border-opacity-10 my-3">
                                    <div class="d-grid">
                                        <a href="vehicle.php?id=<?= $row['id'] ?>" class="btn btn-outline-platinum btn-sm">View Details</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('searchFilterForm');
    const resultsContainer = document.getElementById('searchResults');

    const updateResults = () => {
        const formData = new FormData(filterForm);
        const params = new URLSearchParams(formData).toString();
        
        // Update URL without reloading
        window.history.replaceState({}, '', `search.php?${params}`);

        fetch(`includes/fetch_listings.php?${params}`)
            .then(response => response.text())
            .then(html => {
                resultsContainer.innerHTML = html;
            })
            .catch(error => console.error('Error fetching search results:', error));
    };

    filterForm.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            // Debounce for text input
            if(element.type === 'text') {
                clearTimeout(window.searchTimeout);
                window.searchTimeout = setTimeout(updateResults, 300);
            } else {
                updateResults();
            }
        });
    });

    // Handle form submission to prevent page reload
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateResults();
    });
});
</script>
