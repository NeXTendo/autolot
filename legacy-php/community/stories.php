<?php
require_once '../db.php';
include '../includes/header.php';

// Fetch stories with user info
$stmt = $pdo->query("SELECT s.*, u.name as author_name FROM car_stories s 
                     JOIN users u ON s.user_id = u.id 
                     WHERE s.status = 'published' 
                     ORDER BY s.created_at DESC");
$stories = $stmt->fetchAll();
?>

<div class="container py-5 mt-5">
    <div class="d-flex justify-content-between align-items-end mb-5 animate-fade-up">
        <div>
            <span class="text-platinum fw-bold small text-uppercase ls-2">Community Feed</span>
            <h2 class="display-5 fw-bold">Car Stories</h2>
            <p class="text-muted">Experiences, restorations, and road trips from our community.</p>
        </div>
        <a href="create_story.php" class="btn-platinum px-4 py-2">Share Your Story</a>
    </div>

    <div class="row g-4">
        <?php if (empty($stories)): ?>
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-feather fa-3x text-muted opacity-25 mb-4"></i>
                <h4>No stories yet. Be the first to share!</h4>
            </div>
        <?php else: ?>
            <?php foreach ($stories as $story): ?>
                <div class="col-md-6 col-lg-4 animate-fade-up">
                    <div class="glass-panel h-100 overflow-hidden">
                        <?php if ($story['image_url']): ?>
                            <div style="height: 200px; overflow: hidden;">
                                <img src="<?= htmlspecialchars($story['image_url']) ?>" class="w-100 h-100" style="object-fit: cover;">
                            </div>
                        <?php endif; ?>
                        <div class="p-4">
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <span class="badge bg-platinum text-dark small fw-bold">FEATURED STORY</span>
                                <span class="text-muted small"><?= date('M d, Y', strtotime($story['created_at'])) ?></span>
                            </div>
                            <h4 class="mb-3"><?= htmlspecialchars($story['title']) ?></h4>
                            <p class="text-muted small mb-4"><?= substr(strip_tags($story['content']), 0, 150) ?>...</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto border-top border-light border-opacity-10 pt-3">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style="width: 30px; height: 30px; font-size: 0.8rem;">
                                        <?= strtoupper(substr($story['author_name'], 0, 1)) ?>
                                    </div>
                                    <span class="small fw-bold"><?= htmlspecialchars($story['author_name']) ?></span>
                                </div>
                                <a href="#" class="text-platinum small text-decoration-none fw-bold">Read More <i class="fa-solid fa-arrow-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
