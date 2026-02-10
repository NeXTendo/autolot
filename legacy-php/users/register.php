<?php
require_once "../db.php"; 

$error = "";
$success = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $password = $_POST["password"];
    $phone = trim($_POST["phone"]);
    $role = $_POST["role"];

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        $error = "Email already registered!";
    } else {
        // Hash Password
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);

        // Insert into database
        $sql = "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);

        if ($stmt->execute([$name, $email, $hashed_password, $phone, $role])) {
            $success = "Registration successful! <a href='login.php' class='text-platinum'>Login here</a>";
        } else {
            $error = "Error: Registration failed!";
        }
    }
}

include '../includes/header.php';
?>

<div class="container mt-global mb-global">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="glass-panel">
                <div class="text-center mb-4">
                    <i class="fas fa-user-plus fa-3x text-platinum mb-3"></i>
                    <h2 class="h3">Join Platinum Auto</h2>
                    <p class="text-muted">Experience the standard of excellence</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small mb-4">
                        <i class="fas fa-exclamation-circle me-2"></i> <?= $error; ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success border-0 bg-success bg-opacity-10 text-success small mb-4">
                        <i class="fas fa-check-circle me-2"></i> <?= $success; ?>
                    </div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small text-muted">Full Name</label>
                        <input type="text" name="name" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-muted">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="john@example.com" required>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label class="form-label small text-muted">Phone Number</label>
                            <input type="text" name="phone" class="form-control" placeholder="+1..." required>
                        </div>
                        <div class="col">
                            <label class="form-label small text-muted">I want to...</label>
                            <select name="role" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="registered">Register as Private Seller</option>
                                <option value="dealer">Register as Professional Dealer</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="form-label small text-muted">Password</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary w-100 py-3 mb-3">
                        Create Account
                    </button>
                </form>

                <p class="text-center text-muted small mb-0">
                    Already have an account? <a href="login.php" class="text-platinum text-decoration-none fw-bold">Login</a>
                </p>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
