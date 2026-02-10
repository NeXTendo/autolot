<?php
require_once '../../db.php';
include '../../includes/header.php';

$categories = [
    ['id' => 1, 'name' => 'General Discussion', 'desc' => 'Talk about anything automotive.', 'count' => 124, 'icon' => 'fa-comments'],
    ['id' => 2, 'name' => 'Technical & Restoration', 'desc' => 'Share tips, tricks, and project updates.', 'count' => 85, 'icon' => 'fa-wrench'],
    ['id' => 3, 'name' => 'Market Trends', 'desc' => 'Discuss valuations, rarity, and auction results.', 'count' => 56, 'icon' => 'fa-chart-line'],
    ['id' => 4, 'name' => 'Events & Meetups', 'desc' => 'Plan and discuss local car meets.', 'count' => 32, 'icon' => 'fa-calendar-day']
];
?>

<div class="container py-5 mt-5">
    <div class="mb-5 animate-fade-up">
        <span class="text-platinum fw-bold small text-uppercase ls-2">Platinum Hub</span>
        <h2 class="display-5 fw-bold">Community Forums</h2>
        <p class="text-muted">Connect with thousands of automotive enthusiasts worldwide.</p>
    </div>

    <div class="row g-4 animate-fade-up" style="animation-delay: 0.1s">
        <?php foreach ($categories as $cat): ?>
            <div class="col-lg-6">
                <div class="glass-panel p-4 h-100 d-flex gap-4 hover-platinum transition-smooth" onclick="location.href='#'" style="cursor: pointer;">
                    <div class="rounded bg-platinum bg-opacity-10 text-platinum d-flex align-items-center justify-content-center p-3" style="width: 70px; height: 70px; min-width: 70px;">
                        <i class="fa-solid <?= $cat['icon'] ?> fa-2x"></i>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h5 class="mb-0 fw-bold"><?= $cat['name'] ?></h5>
                            <span class="badge bg-platinum bg-opacity-10 text-platinum small"><?= $cat['count'] ?> Posts</span>
                        </div>
                        <p class="text-muted small mb-0"><?= $cat['desc'] ?></p>
                        <div class="mt-3 small text-muted">
                            <i class="fa-regular fa-clock me-1"></i> Last post 2 hours ago
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
