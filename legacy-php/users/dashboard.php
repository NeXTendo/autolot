<?php
require_once '../db.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: " . BASE_URL . "users/login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'] ?? 'registered';

// Fetch user's listings
$stmt = $pdo->prepare("SELECT * FROM vehicles WHERE seller_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
$myListings = $stmt->fetchAll();

// Fetch user's messages/inquiries (simplified)
$msgStmt = $pdo->prepare("SELECT * FROM messages WHERE receiver_id = ? ORDER BY created_at DESC LIMIT 5");
// Assuming messages table exists from previous context or initial state
// $msgStmt->execute([$user_id]);
// $recentMessages = $msgStmt->fetchAll();
$recentMessages = []; // Placeholder if table missing

?>

<div class="container py-5 mt-5">
    <div class="row g-4">
        <!-- Sidebar Navigation -->
        <div class="col-lg-3">
            <div class="glass-panel p-4 sticky-top" style="top: 100px;">
                <div class="text-center mb-4">
                    <div class="rounded-circle bg-platinum text-dark d-inline-flex align-items-center justify-content-center fw-bold mb-3" style="width: 80px; height: 80px; font-size: 2rem;">
                        <?= strtoupper(substr($_SESSION['user_name'], 0, 1)) ?>
                    </div>
                    <h5 class="mb-0"><?= htmlspecialchars($_SESSION['user_name']) ?></h5>
                    <span class="badge-role role-<?= $role ?> mt-2"><?= ucfirst($role) ?></span>
                </div>
                
                <div class="list-group list-group-flush glass-panel border-0 overflow-hidden">
                    <a href="#" class="list-group-item list-group-item-action bg-transparent text-white active border-0 py-3">
                        <i class="fa-solid fa-gauge me-3"></i> Overview
                    </a>
                    <a href="<?= BASE_URL ?>listings/ListingWizard.php" class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3">
                        <i class="fa-solid fa-plus me-3"></i> Create Listing
                    </a>
                    <a href="#" class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3">
                        <i class="fa-solid fa-car me-3"></i> My Vehicles
                    </a>
                    <a href="#" class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3">
                        <i class="fa-solid fa-envelope me-3"></i> Inquiries
                    </a>
                    <a href="#" class="list-group-item list-group-item-action bg-transparent text-white border-0 py-3">
                        <i class="fa-solid fa-heart me-3"></i> Watchlist
                    </a>
                </div>
            </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="col-lg-9">
            <div class="row g-4 mb-5">
                <div class="col-md-4">
                    <div class="glass-panel p-4 text-center">
                        <h2 class="display-6 fw-bold text-platinum mb-1"><?= count($myListings) ?></h2>
                        <span class="text-muted small text-uppercase fw-bold">Active Listings</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="glass-panel p-4 text-center">
                        <h2 class="display-6 fw-bold text-platinum mb-1">0</h2>
                        <span class="text-muted small text-uppercase fw-bold">Total Inquiries</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="glass-panel p-4 text-center">
                        <h2 class="display-6 fw-bold text-platinum mb-1">0</h2>
                        <span class="text-muted small text-uppercase fw-bold">Watchlist Items</span>
                    </div>
                </div>
            </div>

            <div class="glass-panel p-4 mb-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-0">My Recent Listings</h4>
                    <a href="<?= BASE_URL ?>listings/ListingWizard.php" class="btn btn-outline-platinum btn-sm">Add New</a>
                </div>

                <?php if (empty($myListings)): ?>
                    <div class="text-center py-5">
                        <i class="fa-solid fa-car-rear fa-3x mb-3 opacity-20"></i>
                        <p class="text-muted">You haven't listed any vehicles yet.</p>
                        <a href="<?= BASE_URL ?>listings/ListingWizard.php" class="btn-platinum px-4">Start Selling</a>
                    </div>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-dark table-hover align-middle">
                            <thead>
                                <tr class="text-muted small text-uppercase border-bottom border-light border-opacity-10">
                                    <th>Vehicle</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($myListings as $car): ?>
                                    <tr class="border-bottom border-light border-opacity-10">
                                        <td>
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="rounded border border-light border-opacity-10" style="width: 50px; height: 40px; overflow: hidden;">
                                                    <?php 
                                                        $carImages = $car['image'] ? explode(',', $car['image']) : [];
                                                        $carImg = !empty($carImages) ? $carImages[0] : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=100';
                                                        $carImgUrl = (strpos($carImg, 'http') === 0) ? $carImg : BASE_URL . UPLOAD_DIR . trim($carImg);
                                                    ?>
                                                    <img src="<?= $carImgUrl ?>" class="w-100 h-100" style="object-fit: cover;">
                                                </div>
                                                <div>
                                                    <span class="d-block fw-bold"><?= $car['year'] . ' ' . $car['make'] . ' ' . $car['model'] ?></span>
                                                    <span class="text-muted small"><?= number_format($car['mileage']) ?> km</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span class="fw-bold text-platinum"><?= CURRENCY_SYMBOL . number_format($car['price']) ?></span></td>
                                        <td><span class="badge bg-success bg-opacity-10 text-success fw-bold">Active</span></td>
                                        <td class="text-end">
                                            <a href="<?= BASE_URL ?>vehicle.php?id=<?= $car['id'] ?>" class="btn btn-link text-platinum p-0 me-3"><i class="fa-solid fa-eye"></i></a>
                                            <a href="#" class="btn btn-link text-muted p-0 me-3"><i class="fa-solid fa-pen-to-square"></i></a>
                                            <a href="#" class="btn btn-link text-danger p-0"><i class="fa-solid fa-trash-can"></i></a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
