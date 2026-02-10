<?php 
require_once 'db.php'; 
include 'includes/header.php'; 

if (!isset($_GET['id'])) {
    header("Location: index.php");
    exit();
}

$id = intval($_GET['id']);
$stmt = $pdo->prepare("SELECT v.*, u.name as seller_name, u.email as seller_email FROM vehicles v JOIN users u ON v.seller_id = u.id WHERE v.id = ?");
$stmt->execute([$id]);
$vehicle = $stmt->fetch();

if (!$vehicle) {
    echo "<div class='container py-5 my-5 text-center'><h2 class='text-platinum'>Vehicle Not Found</h2><a href='listings.php' class='btn-platinum mt-3'>Back to Collection</a></div>";
    include 'includes/footer.php';
    exit();
}

// Fetch related vehicles
$relatedStmt = $pdo->prepare("SELECT * FROM vehicles WHERE make = ? AND id != ? LIMIT 4");
$relatedStmt->execute([$vehicle['make'], $id]);
$relatedVehicles = $relatedStmt->fetchAll();

$images = $vehicle['image'] ? explode(',', $vehicle['image']) : [];
?>

<div class="container py-5 mt-4">
    <!-- Breadcrumb -->
    <nav class="mb-5">
        <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="index.php" class="text-muted text-decoration-none small">Home</a></li>
            <li class="breadcrumb-item"><a href="listings.php" class="text-muted text-decoration-none small">Inventory</a></li>
            <li class="breadcrumb-item active small text-platinum fw-bold"><?= htmlspecialchars($vehicle['make'] . ' ' . $vehicle['model']) ?></li>
        </ol>
    </nav>

    <div class="row g-5">
        <!-- Gallery Section -->
        <div class="col-lg-7">
            <div id="vehicleGallery" class="carousel slide glass-panel p-2 shadow-lg" data-bs-ride="carousel">
                <div class="carousel-inner rounded-3">
                    <?php if (empty($images)): ?>
                        <div class="carousel-item active">
                            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" class="d-block w-100" style="height: 550px; object-fit: cover;">
                        </div>
                    <?php else: ?>
                        <?php foreach ($images as $index => $img): 
                            $imgUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . trim($img);
                        ?>
                            <div class="carousel-item <?= $index === 0 ? 'active' : '' ?>">
                                <img src="<?= $imgUrl ?>" class="d-block w-100" style="object-fit: cover;" alt="<?= htmlspecialchars($vehicle['make']) ?>">
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                
                <?php if (count($images) > 1): ?>
                    <button class="carousel-control-prev" type="button" data-bs-target="#vehicleGallery" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#vehicleGallery" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                    
                    <div class="carousel-indicators position-relative mt-3">
                        <?php foreach ($images as $index => $img): ?>
                            <button type="button" data-bs-target="#vehicleGallery" data-bs-slide-to="<?= $index ?>" class="<?= $index === 0 ? 'active' : '' ?> glass-panel shadow-none border-0" style="width: 60px; height: 40px; overflow: hidden; opacity: 1;">
                                <?php $thumbUrl = (strpos($img, 'http') === 0) ? $img : BASE_URL . UPLOAD_DIR . trim($img); ?>
                                <img src="<?= $thumbUrl ?>" class="w-100 h-100" style="object-fit: cover;">
                            </button>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Details Section -->
        <div class="col-lg-5">
            <div class="glass-panel p-4 h-100">
                <div class="mb-4">
                    <span class="text-platinum fw-bold small text-uppercase ls-2"><?= htmlspecialchars($vehicle['make']) ?> SIGNATURE</span>
                    <h1 class="display-5 fw-bold mt-1"><?= htmlspecialchars($vehicle['model']) ?></h1>
                    <div class="d-flex align-items-center gap-3 mt-3">
                        <h2 class="text-platinum mb-0 fw-bold"><?= CURRENCY_SYMBOL . number_format($vehicle['price'], 0) ?></h2>
                        <span class="px-3 py-1 glass-panel border-opacity-10 text-success small fw-bold">READY FOR DELIVERY</span>
                    </div>
                    <div class="mt-3 p-3 glass-panel border-platinum border-opacity-25 bg-platinum bg-opacity-5 animate-fade-up">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fa-solid fa-wand-magic-sparkles text-platinum"></i>
                            <span class="small fw-bold">PLATINUM AI APPRAISAL</span>
                        </div>
                        <p class="small text-muted mb-0 mt-1">This vehicle is priced <span class="text-success fw-bold">within 2%</span> of market value based on condition and rarity.</p>
                    </div>
                </div>

                <div class="row g-2 g-md-3 mb-4 mb-md-5">
                    <div class="col-6 col-md-6">
                        <div class="p-2 p-md-3 glass-panel border-opacity-10 text-center">
                            <small class="text-muted d-block mb-1">YEAR</small>
                            <span class="fw-bold"><?= $vehicle['year'] ?></span>
                        </div>
                    </div>
                    <div class="col-6 col-md-6">
                        <div class="p-2 p-md-3 glass-panel border-opacity-10 text-center">
                            <small class="text-muted d-block mb-1">MILEAGE</small>
                            <span class="fw-bold"><?= number_format($vehicle['mileage']) ?> km</span>
                        </div>
                    </div>
                </div>

                <div class="mb-5">
                    <h6 class="text-white fw-bold mb-3 border-bottom border-light border-opacity-10 pb-2">Description</h6>
                    <p class="text-muted small" style="line-height: 1.8;"><?= nl2br(htmlspecialchars($vehicle['description'])) ?></p>
                </div>

                <div class="mt-auto">
                    <!-- Dealer Info -->
                    <div class="p-4 glass-panel border-opacity-10 rounded-pill d-flex align-items-center justify-content-between mb-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-circle bg-platinum text-dark d-flex align-items-center justify-content-center fw-bold" style="width: 45px; height: 45px;"><?= strtoupper(substr($vehicle['seller_name'], 0, 1)) ?></div>
                            <div class="small">
                                <span class="d-block text-white fw-bold"><?= htmlspecialchars($vehicle['seller_name']) ?></span>
                                <span class="text-muted opacity-50 text-uppercase" style="font-size: 0.7rem;">Concierge Specialist</span>
                            </div>
                        </div>
                        <a href="mailto:<?= $vehicle['seller_email'] ?>" class="text-muted hover-white"><i class="fa-solid fa-envelope"></i></a>
                    </div>
                    
                    <div class="d-grid gap-3 mb-5">
                        <button class="btn-platinum py-3 fs-6" data-bs-toggle="modal" data-bs-target="#inquiryModal">Begin Acquisition</button>
                        <div class="row g-2">
                            <div class="col-8">
                                <button class="btn-outline-platinum py-3 w-100">Reserve for Viewing</button>
                            </div>
                            <div class="col-4">
                                <button class="btn glass-panel border-opacity-10 text-platinum py-3 w-100" id="watchlistBtn" onclick="toggleWatchlist(<?= $vehicle['id'] ?>)">
                                    <i class="fa-regular fa-bookmark"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Financing Section -->
                    <?php include 'includes/finance_calc.php'; ?>

                    <!-- Insurance CTA -->
                    <div class="mt-4 p-4 glass-panel border-opacity-10 border-start border-platinum border-4">
                        <div class="d-flex align-items-center gap-3 mb-2">
                            <i class="fa-solid fa-shield-halved text-platinum"></i>
                            <h6 class="mb-0 fw-bold">Platinum Protection</h6>
                        </div>
                        <p class="small text-muted">Protect your acquisition with our tailor-made insurance solutions for luxury vehicles.</p>
                        <button class="btn btn-link text-platinum p-0 small text-decoration-none fw-bold">Request Insurance Quote <i class="fa-solid fa-arrow-right ms-1"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Listings -->
    <div class="mt-5 pt-5 pb-5">
        <h3 class="fw-bold mb-5">Comparable Selections</h3>
        <div class="row g-4">
            <?php foreach ($relatedVehicles as $rel): ?>
                <div class="col-md-6 col-lg-3">
                    <div class="listing-card" onclick="location.href='vehicle.php?id=<?= $rel['id'] ?>'">
                        <div class="image-container" style="height: 180px;">
                            <?php 
                                $relImgArray = $rel['image'] ? explode(',', $rel['image']) : [];
                                $relImg = !empty($relImgArray) ? $relImgArray[0] : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070';
                                $relImgUrl = (strpos($relImg, 'http') === 0) ? $relImg : BASE_URL . UPLOAD_DIR . trim($relImg);
                            ?>
                            <img src="<?= $relImgUrl ?>" alt="<?= htmlspecialchars($rel['make']) ?>">
                            <div class="price-tag py-1 px-3 small"><?= CURRENCY_SYMBOL . number_format($rel['price'], 0) ?></div>
                        </div>
                        <div class="card-content">
                            <h6 class="make-model m-0"><?= htmlspecialchars($rel['make']) ?> <span class="fw-light opacity-50"><?= htmlspecialchars($rel['model']) ?></span></h6>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<!-- Inquiry Modal -->
<div class="modal fade" id="inquiryModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-panel border-opacity-10 text-white">
            <div class="modal-header border-0 pb-0">
                <h5 class="fw-bold">Experience Inquiry</h5>
                <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form action="send_message.php" method="POST">
                    <p class="text-muted small mb-4">Request more information or schedule a private virtual or in-person viewing of the <?= htmlspecialchars($vehicle['make'] . ' ' . $vehicle['model']) ?>.</p>
                    <div class="mb-4">
                        <label class="form-label small text-muted text-uppercase fw-bold">Message</label>
                        <textarea name="message" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" rows="4" placeholder="How may we assist you with this acquisition?"></textarea>
                    </div>
                    <input type="hidden" name="vehicle_id" value="<?= $vehicle['id'] ?>">
                    <input type="hidden" name="seller_id" value="<?= $vehicle['seller_id'] ?>">
                    <button type="submit" class="btn-platinum w-100 py-3">Send Secure Inquiry</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
