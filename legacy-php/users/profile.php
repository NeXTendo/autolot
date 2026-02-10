<?php
require_once '../db.php';
include '../includes/header.php';
include '../includes/functions.php';

if (!isUserLoggedIn()) {
    header('Location: login.php');
    exit();
}

$user = getLoggedInUser();
$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $currentPassword = $_POST['currentPassword'];
    $newPassword = $_POST['newPassword'];
    $confirmPassword = $_POST['confirmPassword'];

    if (!password_verify($currentPassword, $user['password'])) {
        $error = "The current password provided is incorrect.";
    } else {
        try {
            // Update email
            if ($email !== $user['email']) {
                $stmt = $pdo->prepare("UPDATE users SET email = ? WHERE id = ?");
                $stmt->execute([$email, $user['id']]);
                $success = "Email address updated successfully.";
            }

            // Update password if fields are not empty
            if (!empty($newPassword)) {
                if ($newPassword === $confirmPassword) {
                    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $stmt->execute([$hashedPassword, $user['id']]);
                    $success = ($success ? $success . " and " : "") . "Password updated successfully.";
                } else {
                    $error = "New passwords do not match.";
                }
            }
            
            // Refresh user data if successful
            if ($success) {
                $user = getLoggedInUser();
            }
        } catch (PDOException $e) {
            $error = "An error occurred while updating your profile.";
        }
    }
}
?>

<div class="container py-5 mt-5">
    <div class="row justify-content-center">
        <!-- Profile Sidebar -->
        <div class="col-lg-4 mb-4">
            <div class="glass-panel p-5 text-center animate-fade-up">
                <div class="position-relative d-inline-block mb-4">
                    <div class="rounded-circle bg-platinum shadow-platinum d-flex align-items-center justify-content-center fw-bold text-dark" style="width: 100px; height: 100px; font-size: 2.5rem;">
                        <?= strtoupper(substr($user['name'], 0, 1)) ?>
                    </div>
                </div>
                <h3 class="fw-bold mb-1"><?= htmlspecialchars($user['name']) ?></h3>
                <span class="badge bg-platinum text-dark mb-4 px-3 py-2"><?= strtoupper($user['role']) ?></span>
                
                <div class="list-group list-group-flush bg-transparent text-start">
                    <a href="dashboard.php" class="list-group-item bg-transparent text-platinum border-light border-opacity-10 py-3">
                        <i class="fa-solid fa-gauge-high me-2"></i> Dashboard
                    </a>
                    <a href="profile.php" class="list-group-item bg-transparent text-white fw-bold border-light border-opacity-10 py-3 active-platinum">
                        <i class="fa-solid fa-user-gear me-2"></i> Security Settings
                    </a>
                    <a href="watchlist.php" class="list-group-item bg-transparent text-platinum border-light border-opacity-10 py-3">
                        <i class="fa-regular fa-bookmark me-2"></i> My Watchlist
                    </a>
                </div>
            </div>
        </div>

        <!-- Form Section -->
        <div class="col-lg-7">
            <div class="glass-panel p-5 animate-fade-up" style="animation-delay: 0.1s">
                <h4 class="fw-bold mb-4">Security & Access</h4>
                
                <?php if ($error): ?>
                    <div class="alert alert-danger mb-4">
                        <i class="fas fa-exclamation-circle me-2"></i> <?= $error; ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success mb-4">
                        <i class="fas fa-check-circle me-2"></i> <?= $success; ?>
                    </div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-5">
                        <h6 class="text-muted text-uppercase fw-bold small mb-3">Login Identity</h6>
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" value="<?= htmlspecialchars($user['email']) ?>" required>
                    </div>

                    <div class="mb-5">
                        <h6 class="text-muted text-uppercase fw-bold small mb-3">Change Password</h6>
                        <div class="mb-4">
                            <label class="form-label">Current Password</label>
                            <input type="password" name="currentPassword" class="form-control" placeholder="Required to authorize changes" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3 mb-md-0">
                                <label class="form-label">New Password</label>
                                <input type="password" name="newPassword" class="form-control" placeholder="Leave blank to keep current">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" name="confirmPassword" class="form-control" placeholder="Repeat new password">
                            </div>
                        </div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn-platinum py-3 fw-bold">Update Account Security</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
.active-platinum {
    background: rgba(226, 232, 240, 0.05) !important;
    border-left: 4px solid var(--platinum) !important;
}
</style>

<?php include '../includes/footer.php'; ?>
