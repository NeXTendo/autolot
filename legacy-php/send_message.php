<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $message = $_POST['message'];
    $seller_id = $_POST['seller_id'];
    $vehicle_id = $_POST['vehicle_id'];

    if (empty($message)) {
        echo "<script>alert('Message cannot be empty.'); window.location.href = 'vehicle.php?id=$vehicle_id';</script>";
        exit();
    }

    // Insert message into database
    $stmt = $conn->prepare("INSERT INTO messages (seller_id, vehicle_id, message, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iis", $seller_id, $vehicle_id, $message);
    
    if ($stmt->execute()) {
        echo "<script>alert('Message sent successfully!'); window.location.href = 'vehicle.php?id=$vehicle_id';</script>";
    } else {
        echo "<script>alert('Failed to send message. Please try again later.'); window.location.href = 'vehicle.php?id=$vehicle_id';</script>";
    }
}
?>
