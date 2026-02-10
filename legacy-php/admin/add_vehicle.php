<?php
require_once '../db.php';
include '../includes/header.php';

// Check for admin role (Simplified for this demo)
if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'seller')) {
    // header('Location: ../users/login.php');
    // exit();
}

$success_msg = '';
$error_msg = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $make = $_POST['make'];
    $model = $_POST['model'];
    $year = $_POST['year'];
    $price = $_POST['price'];
    $mileage = $_POST['mileage'];
    $description = $_POST['description'];
    $seller_id = $_SESSION['user_id'] ?? 1;

    $uploaded_images = [];
    if (!empty($_FILES['images']['name'][0])) {
        foreach ($_FILES['images']['name'] as $key => $val) {
            $fileName = time() . "_" . basename($_FILES['images']['name'][$key]);
            $targetFilePath = "../" . UPLOAD_DIR . $fileName;
            
            if (move_uploaded_file($_FILES['images']['tmp_name'][$key], $targetFilePath)) {
                $uploaded_images[] = $fileName;
            }
        }
    }
    
    $image_string = implode(',', $uploaded_images);

    try {
        $stmt = $pdo->prepare("INSERT INTO vehicles (make, model, year, price, mileage, description, image, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$make, $model, $year, $price, $mileage, $description, $image_string, $seller_id]);
        $success_msg = "Listing created successfully! <a href='../listings.php' class='text-platinum ms-2'>View Inventory</a>";
    } catch (PDOException $e) {
        $error_msg = "Error: " . $e->getMessage();
    }
}
?>

<div class="container py-5 mt-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="glass-panel p-5">
                <div class="d-flex align-items-center mb-5">
                    <a href="../index.php" class="text-muted me-4 border border-light border-opacity-10 p-2 rounded"><i class="fa-solid fa-arrow-left"></i></a>
                    <h2 class="fw-bold mb-0">List New Vehicle</h2>
                </div>

                <?php if ($success_msg): ?>
                    <div class="alert alert-success border-0 glass-panel text-white mb-4"><?= $success_msg ?></div>
                <?php endif; ?>
                <?php if ($error_msg): ?>
                    <div class="alert alert-danger border-0 glass-panel text-white mb-4"><?= $error_msg ?></div>
                <?php endif; ?>

                <form method="POST" enctype="multipart/form-data">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label small text-muted text-uppercase fw-bold">Make</label>
                            <input type="text" name="make" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="e.g. Porsche" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small text-muted text-uppercase fw-bold">Model</label>
                            <input type="text" name="model" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="e.g. 911 Turbo S" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small text-muted text-uppercase fw-bold">Year</label>
                            <input type="number" name="year" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" value="<?= date('Y') ?>" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small text-muted text-uppercase fw-bold">Price ($)</label>
                            <input type="number" name="price" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="250000" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small text-muted text-uppercase fw-bold">Mileage (km)</label>
                            <input type="number" name="mileage" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="1200" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label small text-muted text-uppercase fw-bold">Images</label>
                            <div class="glass-panel p-4 border-dashed text-center">
                                <i class="fa-solid fa-cloud-arrow-up fa-2x mb-3 opacity-25"></i>
                                <input type="file" name="images[]" class="form-control border-0 bg-transparent text-muted" multiple>
                                <p class="small text-muted mt-2 mb-0">Select multiple images for your vehicle gallery</p>
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label small text-muted text-uppercase fw-bold">Description</label>
                            <textarea name="description" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" rows="5" placeholder="Highlight the key features and condition..."></textarea>
                        </div>
                        <div class="col-12 mt-5">
                            <button type="submit" class="btn-platinum w-100 py-3 fs-5">Publish Listing</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
