<?php
require_once '../db.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: " . BASE_URL . "users/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch user's watchlist
$stmt = $pdo->prepare("SELECT v.* FROM vehicles v 
                       JOIN watchlists w ON v.id = w.vehicle_id 
                       WHERE w.user_id = ? 
                       ORDER BY w.created_at DESC");
$stmt->execute([$user_id]);
$watchlist = $stmt->fetchAll();
?>

<div class="container py-5 mt-5">
    <div class="mb-5 animate-fade-up">
        <span class="text-platinum fw-bold small text-uppercase ls-2">Curated Collection</span>
        <h2 class="display-5 fw-bold">My Watchlist</h2>
        <p class="text-muted">Vehicles you are monitoring for acquisition.</p>
    </div>

    <div class="row g-4">
        <?php if (empty($watchlist)): ?>
            <div class="col-12 text-center py-5">
                <i class="fa-regular fa-bookmark fa-3x text-muted opacity-25 mb-4"></i>
                <h4>Your watchlist is empty.</h4>
                <p class="text-muted">Save vehicles you're interested in while browsing the inventory.</p>
                <a href="<?= BASE_URL ?>listings.php" class="btn-platinum px-5 py-2 mt-3">Explore Inventory</a>
            </div>
        <?php else: ?>
            <?php foreach ($watchlist as $row): ?>
                <div class="col-md-6 col-lg-4 col-xl-3 animate-fade-up">
                    <div class="listing-card" onclick="location.href='<?= BASE_URL ?>vehicle.php?id=<?= $row['id'] ?>'">
                        <div class="image-container">
                            <?php 
                                $img = $row['image'] ?: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070';
                                $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . $img;
                            ?>
                            <img src="<?= $imgUrl ?>" alt="<?= htmlspecialchars($row['make'] . ' ' . $row['model']) ?>">
                            <div class="price-tag"><?= CURRENCY_SYMBOL . number_format($row['price'], 0) ?></div>
                        </div>
                        <div class="card-content">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="make-model m-0"><?= htmlspecialchars($row['make']) ?> <span class="fw-light opacity-50"><?= htmlspecialchars($row['model']) ?></span></h5>
                                <button class="btn btn-link text-danger p-0" onclick="event.stopPropagation(); removeWatchlist(<?= $row['id'] ?>)">
                                    <i class="fa-solid fa-bookmark"></i>
                                </button>
                            </div>
                            <div class="specs mt-3">
                                <span><i class="fa-regular fa-calendar me-1"></i><?= $row['year'] ?></span>
                                <span><i class="fa-solid fa-road me-1"></i><?= number_format($row['mileage']) ?> km</span>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<script>
function removeWatchlist(id) {
    if(confirm('Remove this vehicle from your watchlist?')) {
        // Simple redirect for now (simplified implementation)
        window.location.href = 'toggle_watchlist.php?id=' + id + '&redirect=watchlist';
    }
}
</script>

<?php include '../includes/footer.php'; ?>
