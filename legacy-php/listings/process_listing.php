<?php
session_start();
require_once '../db.php';
require_once '../includes/config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    try {
        $pdo->beginTransaction();

        $seller_id = $_SESSION['user_id'];
        $make = $_POST['make'] ?? '';
        $model = $_POST['model'] ?? '';
        $year = (int)($_POST['year'] ?? 0);
        $trim = $_POST['trim'] ?? null;
        $price = (float)($_POST['price'] ?? 0);
        $mileage = (int)($_POST['mileage'] ?? 0);
        $condition = $_POST['condition'] ?? 'Good';
        $exterior_color = $_POST['exterior_color'] ?? null;
        $interior_color = $_POST['interior_color'] ?? null;
        $vin = $_POST['vin'] ?? null;
        $description = $_POST['description'] ?? null;
        $is_featured = (isset($_POST['plan']) && $_POST['plan'] === 'premium') ? 1 : 0;
        
        // New fields from 11-step wizard
        $features = isset($_POST['features']) ? implode(', ', $_POST['features']) : null;
        $title_status = $_POST['title_status'] ?? 'Clean';
        $accidents = $_POST['accidents'] ?? 'None';
        $contact_method = $_POST['contact_method'] ?? 'In-built Messenger';
        $pricing_strategy = $_POST['pricing_strategy'] ?? 'Negotiable';
        $show_phone = isset($_POST['show_phone']) ? 1 : 0;

        // Process File Uploads
        $uploaded_images = [];
        if (!empty($_FILES['vehicle_photos']['name'][0])) {
            $upload_dir = '../' . UPLOAD_DIR;
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            foreach ($_FILES['vehicle_photos']['name'] as $key => $name) {
                if ($_FILES['vehicle_photos']['error'][$key] === UPLOAD_ERR_OK) {
                    $tmp_name = $_FILES['vehicle_photos']['tmp_name'][$key];
                    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                    $new_name = uniqid('car_') . '.' . $ext;
                    if (move_uploaded_file($tmp_name, $upload_dir . $new_name)) {
                        $uploaded_images[] = $new_name;
                    }
                }
            }
        }
        $image_string = implode(',', $uploaded_images);

        // Insert into vehicles
        $sql = "INSERT INTO vehicles (
                    make, model, year, trim, price, mileage, `condition`, 
                    exterior_color, interior_color, vin, image, description, 
                    features, title_status, accidents, contact_method,
                    pricing_strategy, show_phone,
                    seller_id, is_featured
                ) VALUES (
                    :make, :model, :year, :trim, :price, :mileage, :condition, 
                    :exterior_color, :interior_color, :vin, :image, :description, 
                    :features, :title_status, :accidents, :contact_method,
                    :pricing_strategy, :show_phone,
                    :seller_id, :is_featured
                )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'make' => $make,
            'model' => $model,
            'year' => $year,
            'trim' => $trim,
            'price' => $price,
            'mileage' => $mileage,
            'condition' => $condition,
            'exterior_color' => $exterior_color,
            'interior_color' => $interior_color,
            'vin' => $vin,
            'image' => $image_string,
            'description' => $description,
            'features' => $features,
            'title_status' => $title_status,
            'accidents' => $accidents,
            'contact_method' => $contact_method,
            'pricing_strategy' => $pricing_strategy,
            'show_phone' => $show_phone,
            'seller_id' => $seller_id,
            'is_featured' => $is_featured
        ]);

        $pdo->commit();
        header("Location: " . BASE_URL . "listings.php?success=1");
        exit();

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // Redirect with error message for better user experience
        header("Location: " . BASE_URL . "listings/ListingWizard.php?error=" . urlencode($e->getMessage()));
        exit();
    }
} else {
    header("Location: " . BASE_URL . "index.php");
    exit();
}
