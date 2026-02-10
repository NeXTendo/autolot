<?php
require_once "../db.php"; 
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// Check if the user is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: ../users/login.php');
    exit();
}

// Fetch users
$usersResult = $pdo->query("SELECT * FROM users ORDER BY created_at DESC");

// Fetch vehicles
$vehiclesResult = $pdo->query("SELECT * FROM vehicles ORDER BY created_at DESC");

include '../includes/header.php';
?>

<div class="container mt-global mb-global">
    <div class="row mb-5">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0 text-platinum">Admin Dashboard</h2>
                <a href="add_vehicle.php" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i> Add New Vehicle
                </a>
            </div>
        </div>
    </div>

    <!-- Vehicles List -->
    <div class="glass-panel mb-5">
        <h3 class="h4 mb-4"><i class="fas fa-car me-2"></i> Vehicle Listings</h3>
        <div class="table-responsive">
            <table class="table table-dark table-hover border-secondary">
                <thead>
                    <tr>
                        <th>Make & Model</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>Seller ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($car = $vehiclesResult->fetch()): ?>
                        <tr>
                            <td><?= $car['make'] . " " . $car['model']; ?></td>
                            <td><?= $car['year']; ?></td>
                            <td>$<?= number_format($car['price'], 2); ?></td>
                            <td><?= $car['seller_id']; ?></td>
                            <td>
                                <a href="edit_vehicle.php?id=<?= $car['id']; ?>" class="text-platinum me-3 small text-decoration-none">Edit</a>
                                <a href="delete_vehicle.php?id=<?= $car['id']; ?>" class="text-danger small text-decoration-none" onclick="return confirm('Are you sure?')">Delete</a>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Users List -->
    <div class="glass-panel">
        <h3 class="h4 mb-4"><i class="fas fa-users me-2"></i> Platform Users</h3>
        <div class="table-responsive">
            <table class="table table-dark table-hover border-secondary">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($user = $usersResult->fetch()): ?>
                        <tr>
                            <td><?= $user['name']; ?></td>
                            <td><?= $user['email']; ?></td>
                            <td><span class="badge bg-secondary"><?= $user['role']; ?></span></td>
                            <td>
                                <a href="edit_user.php?id=<?= $user['id']; ?>" class="text-platinum me-3 small text-decoration-none">Edit</a>
                                <a href="delete_user.php?id=<?= $user['id']; ?>" class="text-danger small text-decoration-none" onclick="return confirm('Are you sure?')">Delete</a>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
