<?php
require_once '../db.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['dealer', 'admin'])) {
    header("Location: " . BASE_URL . "users/dashboard.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch Dealer's Inventory Analytics
$stmt = $pdo->prepare("SELECT COUNT(*) as total, SUM(price) as total_value, AVG(price) as avg_price FROM vehicles WHERE seller_id = ?");
$stmt->execute([$user_id]);
$stats = $stmt->fetch();

// Fetch Latest Leads (Messages) with CRM data
$leadStmt = $pdo->prepare("SELECT m.*, v.make, v.model, u.name as sender_name, u.email as sender_email FROM messages m 
                           JOIN vehicles v ON m.vehicle_id = v.id 
                           JOIN users u ON m.user_id = u.id
                           WHERE v.seller_id = ? ORDER BY m.created_at DESC LIMIT 10");
$leadStmt->execute([$user_id]);
$leads = $leadStmt->fetchAll();

?>

<div class="container py-5 mt-5">
    <div class="d-flex justify-content-between align-items-end mb-4 animate-fade-up">
        <div>
            <span class="text-platinum fw-bold small text-uppercase ls-2">Business Hub</span>
            <h2 class="display-6 fw-bold">Dealer Performance</h2>
        </div>
        <div class="text-end">
            <span class="d-block text-muted small">Platinum Certified Partner</span>
            <div class="text-success small fw-bold"><i class="fa-solid fa-circle-check me-1"></i>Verified Dealer</div>
        </div>
    </div>

    <div class="row g-4 mb-5 animate-fade-up" style="animation-delay: 0.1s">
        <div class="col-md-3">
            <div class="glass-panel p-4 h-100">
                <small class="text-muted d-block mb-1 text-uppercase fw-bold">Active Inventory</small>
                <h3 class="fw-bold mb-0"><?= $stats['total'] ?></h3>
                <div class="progress mt-3 bg-dark" style="height: 4px;">
                    <div class="progress-bar bg-platinum" style="width: 75%"></div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="glass-panel p-4 h-100">
                <small class="text-muted d-block mb-1 text-uppercase fw-bold">Portfolio Value</small>
                <h3 class="fw-bold mb-0"><?= CURRENCY_SYMBOL . number_format($stats['total_value'] / 1000, 1) ?>K</h3>
                <span class="text-success small"><i class="fa-solid fa-caret-up me-1"></i>4.2% Growth</span>
            </div>
        </div>
        <div class="col-md-3">
            <div class="glass-panel p-4 h-100">
                <small class="text-muted d-block mb-1 text-uppercase fw-bold">Average MSRP</small>
                <h3 class="fw-bold mb-0"><?= CURRENCY_SYMBOL . number_format($stats['avg_price'] / 1000, 1) ?>K</h3>
                <span class="text-muted small">Market Competitive</span>
            </div>
        </div>
        <div class="col-md-3">
            <div class="glass-panel p-4 h-100 border-platinum border-opacity-25">
                <small class="text-muted d-block mb-1 text-uppercase fw-bold">Reputation Score</small>
                <h3 class="fw-bold mb-0">4.9<span class="text-muted opacity-50 fs-6">/5.0</span></h3>
                <div class="text-warning small">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-lg-8 animate-fade-up" style="animation-delay: 0.2s">
            <div class="glass-panel p-4 h-100">
                <h5 class="mb-4">Inventory Breakdown</h5>
                <canvas id="inventoryChart" style="height: 300px;"></canvas>
            </div>
        </div>
        <div class="col-lg-4 animate-fade-up" style="animation-delay: 0.3s">
            <div class="glass-panel p-4 h-100">
                <h5 class="mb-4">Recent Leads</h5>
                <?php if (empty($leads)): ?>
                    <div class="text-center py-5">
                        <i class="fa-solid fa-user-tag fa-2x mb-3 text-muted opacity-25"></i>
                        <p class="text-muted small">No active inquiries at the moment.</p>
                    </div>
                <?php else: ?>
                    <div class="list-group list-group-flush glass-panel border-0">
                        <?php foreach($leads as $lead): ?>
                            <div class="list-group-item bg-transparent text-white border-light border-opacity-10 py-3 px-0">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <h6 class="mb-0 fw-bold"><?= htmlspecialchars($lead['sender_name']) ?></h6>
                                    <span class="badge bg-<?= $lead['status'] === 'new' ? 'primary' : ($lead['status'] === 'sold' ? 'success' : 'platinum') ?> bg-opacity-10 text-<?= $lead['status'] === 'new' ? 'primary' : ($lead['status'] === 'sold' ? 'success' : 'platinum') ?> small" style="font-size: 0.65rem;"><?= strtoupper($lead['status']) ?></span>
                                </div>
                                <div class="small text-muted mb-2">Inquiry for: <?= $lead['make'] . ' ' . $lead['model'] ?></div>
                                <p class="small text-muted mb-3" style="font-size: 0.75rem; line-height: 1.4;"><?= substr($lead['message'], 0, 100) ?>...</p>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-platinum py-1" style="font-size: 0.7rem;">Manage Status</button>
                                    <a href="mailto:<?= htmlspecialchars($lead['sender_email'] ?? '#') ?>" class="btn btn-sm glass-panel border-opacity-10 text-white py-1" style="font-size: 0.7rem;">Contact</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js for analytics -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sedans', 'SUVs', 'Coupes', 'Exotics', 'Electric'],
            datasets: [{
                label: 'Listings by Category',
                data: [12, 19, 3, 5, 2],
                backgroundColor: 'rgba(229, 231, 235, 0.1)',
                borderColor: 'rgba(229, 231, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
</script>

<?php include '../includes/footer.php'; ?>
