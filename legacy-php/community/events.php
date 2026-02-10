<?php
require_once '../db.php';
include '../includes/header.php';

$events = [
    [
        'title' => 'Concours d\'Elegance: Platinum Series',
        'date' => 'Sept 25, 2026',
        'location' => 'Pebble Beach, CA',
        'img' => 'https://images.unsplash.com/photo-1562141982-c5506a71e469?auto=format&fit=crop&q=80&w=600',
        'type' => 'Exhibition'
    ],
    [
        'title' => 'Midnight Run: Electric Revolution',
        'date' => 'Oct 12, 2026',
        'location' => 'Dubai, UAE',
        'img' => 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=600',
        'type' => 'Meetup'
    ],
    [
        'title' => 'Vintage Rally: Silver Arrow Tour',
        'date' => 'Nov 05, 2026',
        'location' => 'Monaco',
        'img' => 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=600',
        'type' => 'Rally'
    ]
];
?>

<div class="container py-5 mt-5">
    <div class="mb-5 animate-fade-up">
        <span class="text-platinum fw-bold small text-uppercase ls-2">Global Access</span>
        <h2 class="display-5 fw-bold">Automotive Events</h2>
        <p class="text-muted">Exclusive gatherings for the Platinum Auto community.</p>
    </div>

    <div class="row g-4 animate-fade-up" style="animation-delay: 0.1s">
        <?php foreach ($events as $event): ?>
            <div class="col-lg-4">
                <div class="glass-panel h-100 overflow-hidden">
                    <div style="height: 250px;">
                        <img src="<?= $event['img'] ?>" class="w-100 h-100" style="object-fit: cover;">
                    </div>
                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-platinum text-dark fw-bold"><?= $event['type'] ?></span>
                            <span class="small text-muted fw-bold"><?= $event['date'] ?></span>
                        </div>
                        <h5 class="fw-bold mb-2"><?= $event['title'] ?></h5>
                        <div class="small text-muted mb-4">
                            <i class="fa-solid fa-location-dot me-1"></i> <?= $event['location'] ?>
                        </div>
                        <button class="btn btn-outline-platinum w-100 py-2">Join Event</button>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
