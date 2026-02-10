<?php
require_once "../db.php"; 

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = $_POST["password"];

    if (!empty($email) && !empty($password)) {
        // Prepare statement to avoid SQL injection
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Start session and save user data
            if (session_status() === PHP_SESSION_NONE) { session_start(); }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];

            header("Location: ../index.php"); 
            exit();
        } else {
            $error = "Invalid email or password.";
        }
    } else {
        $error = "Please fill in all fields.";
    }
}

include '../includes/header.php';
?>

<div class="container mt-global mb-global">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="glass-panel">
                <div class="text-center mb-4">
                    <i class="fas fa-lock fa-3x text-platinum mb-3"></i>
                    <h2 class="h3">Welcome Back</h2>
                    <p class="text-muted">Enter your credentials to continue</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small mb-4">
                        <i class="fas fa-exclamation-circle me-2"></i> <?= $error; ?>
                    </div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small text-muted">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="name@example.com" required>
                    </div>
                    <div class="mb-4">
                        <div class="d-flex justify-content-between">
                            <label class="form-label small text-muted">Password</label>
                            <a href="#" class="small text-platinum text-decoration-none">Forgot?</a>
                        </div>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary w-100 py-3 mb-3">
                        Sign In
                    </button>
                </form>

                <p class="text-center text-muted small mb-0">
                    Don't have an account? <a href="register.php" class="text-platinum text-decoration-none fw-bold">Register</a>
                </p>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
