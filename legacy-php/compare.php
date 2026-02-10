<?php
require_once 'db.php';
include 'includes/header.php';

$ids = isset($_GET['ids']) ? explode(',', $_GET['ids']) : [];
$vehicles = [];

if (!empty($ids)) {
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $vehicles = $stmt->fetchAll();
}
?>

<div class="container py-5 mt-5">
    <div class="mb-5 animate-fade-up">
        <span class="text-platinum fw-bold small text-uppercase ls-2">Side-by-Side</span>
        <h2 class="display-5 fw-bold">Vehicle Comparison</h2>
        <p class="text-muted">Analyze technical specifications and market value across your selections.</p>
    </div>

    <?php if (empty($vehicles)): ?>
        <div class="text-center py-5 glass-panel">
            <i class="fa-solid fa-code-compare fa-3x text-muted opacity-25 mb-4"></i>
            <h4>No vehicles selected for comparison.</h4>
            <p class="text-muted">Add vehicles from our inventory to start comparing.</p>
            <a href="listings.php" class="btn-platinum px-5 py-2 mt-3">Back to Inventory</a>
        </div>
    <?php else: ?>
        <div class="table-responsive animate-fade-up">
            <table class="table table-dark border-light border-opacity-10 align-middle">
                <thead>
                    <tr>
                        <th style="width: 200px;" class="bg-transparent border-0"></th>
                        <?php foreach ($vehicles as $v): ?>
                            <th class="text-center p-4 glass-panel border-0" style="min-width: 250px;">
                                <div class="rounded mb-3 overflow-hidden" style="height: 150px;">
                                    <?php 
                                        $imgs = explode(',', $v['image']);
                                        $img = !empty($imgs[0]) ? $imgs[0] : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=300';
                                        $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . trim($img);
                                    ?>
                                    <img src="<?= $imgUrl ?>" class="w-100 h-100" style="object-fit: cover;">
                                </div>
                                <h6 class="mb-1"><?= $v['make'] . ' ' . $v['model'] ?></h6>
                                <div class="text-platinum fw-bold"><?= CURRENCY_SYMBOL . number_format($v['price']) ?></div>
                                <button class="btn btn-sm btn-outline-danger mt-3" onclick="removeFromCompare(<?= $v['id'] ?>)">Remove</button>
                            </th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Year</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4"><?= $v['year'] ?></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Mileage</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4"><?= number_format($v['mileage']) ?> km</td>
                        <?php endforeach; ?>
                    </tr>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Condition</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4"><span class="badge bg-platinum text-dark"><?= $v['condition'] ?? 'Excellent' ?></span></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Drivetrain</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4"><?= $v['drivetrain'] ?? 'AWD' ?></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Transmission</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4"><?= $v['transmission'] ?? 'Automatic' ?></td>
                        <?php endforeach; ?>
                    </tr>
                    <tr>
                        <td class="text-muted small fw-bold text-uppercase p-4">Market Insight</td>
                        <?php foreach ($vehicles as $v): ?>
                            <td class="text-center p-4 text-success small fw-bold">
                                <i class="fa-solid fa-chart-line me-1"></i> Under Market Value
                            </td>
                        <?php endforeach; ?>
                    </tr>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<script>
function removeFromCompare(id) {
    const urlParams = new URLSearchParams(window.location.search);
    let ids = urlParams.get('ids').split(',');
    ids = ids.filter(i => i != id);
    if(ids.length > 0) {
        window.location.href = 'compare.php?ids=' + ids.join(',');
    } else {
        window.location.href = 'listings.php';
    }
}
</script>

<?php include 'includes/footer.php'; ?>
