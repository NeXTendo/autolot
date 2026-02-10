<?php 
require_once 'db.php'; 
include 'includes/header.php'; 

// Fetch featured vehicles
$stmt = $pdo->query("SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 4");
$featuredVehicles = $stmt->fetchAll();

// Fetch latest arrivals
$stmt = $pdo->query("SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 8 OFFSET 0");
$latestArrivals = $stmt->fetchAll();
?>

<!-- Hero Slider Section -->
<section class="hero-slider">
    <div id="heroCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
        <div class="carousel-indicators">
            <?php foreach ($featuredVehicles as $index => $row): ?>
                <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="<?= $index ?>" class="<?= $index === 0 ? 'active' : '' ?>"></button>
            <?php endforeach; ?>
        </div>
        <div class="carousel-inner">
            <?php if (empty($featuredVehicles)): ?>
                <div class="carousel-item active">
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" alt="Premium Car">
                    <div class="carousel-caption animate-fade-up">
                        <span class="badge bg-platinum text-dark mb-3 px-3 py-2 rounded-pill fw-bold">SIGNATURE SERIES</span>
                        <h1 class="display-1">EXCEEDING THE ORDINARY</h1>
                        <p class="lead">Experience the pinnacle of automotive engineering and luxury craftsmanship at Platinum Auto.</p>
                        <div class="mt-4">
                            <a href="listings.php" class="btn-platinum me-3">View Inventory</a>
                            <a href="contact.php" class="btn-outline-platinum">Concierge Service</a>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <?php foreach ($featuredVehicles as $index => $row): ?>
                    <?php 
                        $img = $row['image'] ?: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2083';
                        $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . $img;
                    ?>
                    <div class="carousel-item <?= $index === 0 ? 'active' : '' ?>">
                        <img src="<?= $imgUrl ?>" class="d-block w-100" alt="<?= htmlspecialchars($row['make'] . ' ' . $row['model']) ?>">
                        <div class="carousel-caption animate-fade-up">
                            <span class="badge bg-platinum text-dark mb-3 px-3 py-2 rounded-pill fw-bold"><?= strtoupper($row['make']) ?> SIGNATURE</span>
                            <h1 class="display-1"><?= htmlspecialchars($row['make'] . ' ' . $row['model']) ?></h1>
                            <p class="lead">Starting from <?= CURRENCY_SYMBOL . number_format($row['price'], 0) ?>. Redefining your standard of excellence.</p>
                            <div class="mt-4">
                                <a href="vehicle.php?id=<?= $row['id'] ?>" class="btn-platinum me-3">Explore Details</a>
                                <a href="listings.php" class="btn-outline-platinum">Full Inventory</a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</section>

<!-- Featured Categories/Features -->
<section class="py-5 mt-5">
    <div class="container overflow-hidden">
        <div class="row g-4 text-center">
            <div class="col-md-4 animate-fade-up" style="animation-delay: 0.1s">
                <div class="p-4 glass-panel h-100">
                    <i class="fa-solid fa-shield-halved fa-2x mb-3 text-platinum"></i>
                    <h4>Certified Integrity</h4>
                    <p class="text-muted small mb-0">Every vehicle undergoes a rigorous 200-point inspection to meet our platinum standards.</p>
                </div>
            </div>
            <div class="col-md-4 animate-fade-up" style="animation-delay: 0.3s">
                <div class="p-4 glass-panel h-100">
                    <i class="fa-solid fa-gauge-high fa-2x mb-3 text-platinum"></i>
                    <h4>Pure Performance</h4>
                    <p class="text-muted small mb-0">Our collection features the world's most capable performance vehicles and exotics.</p>
                </div>
            </div>
            <div class="col-md-4 animate-fade-up" style="animation-delay: 0.5s">
                <div class="p-4 glass-panel h-100">
                    <i class="fa-solid fa-handshake-simple fa-2x mb-3 text-platinum"></i>
                    <h4>Concierge Service</h4>
                    <p class="text-muted small mb-0">Experience a tailored acquisition journey with our expert automotive consultants.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Curated Collection -->
<section class="py-5">
    <div class="container pb-5">
        <div class="d-flex justify-content-between align-items-end mb-5">
            <div>
                <span class="text-platinum fw-bold small text-uppercase ls-2">Curated Collection</span>
                <h2 class="display-5 fw-bold">Featured Selections</h2>
            </div>
            <a href="listings.php" class="btn-outline-platinum py-2 mb-2">View Full Inventory <i class="fa-solid fa-arrow-right ms-2 small"></i></a>
        </div>

        <div class="row g-3 g-md-4">
            <?php foreach ($latestArrivals as $row): ?>
                <div class="col-6 col-lg-3">
                    <div class="listing-card" onclick="location.href='vehicle.php?id=<?= $row['id'] ?>'">
                        <div class="image-container">
                            <?php 
                                $img = $row['image'] ?: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070';
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
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section class="py-5 mb-5 overflow-hidden">
    <div class="container">
        <div class="glass-panel p-5 text-center position-relative">
            <div class="py-4 position-relative z-1">
                <h2 class="display-6 fw-bold mb-3">Unable to find your perfect match?</h2>
                <p class="text-muted mb-4 mx-auto" style="max-width: 600px;">Our concierge service specializes in sourcing rare and bespoke vehicles through our global network of prestige partners.</p>
                <a href="contact.php" class="btn-platinum px-5">Consult Our Experts</a>
            </div>
        </div>
    </div>
</section>

<?php include 'includes/footer.php'; ?>
