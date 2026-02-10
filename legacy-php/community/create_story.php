<?php
require_once '../db.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: ../users/login.php");
    exit();
}

$error = "";
$success = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = trim($_POST['title']);
    $content = trim($_POST['content']);
    $user_id = $_SESSION['user_id'];
    $image_url = trim($_POST['image_url']);

    if ($title && $content) {
        $stmt = $pdo->prepare("INSERT INTO car_stories (user_id, title, content, image_url) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$user_id, $title, $content, $image_url])) {
            $success = "Your story has been published! <a href='stories.php' class='text-platinum'>View feed</a>";
        } else {
            $error = "Failed to publish story.";
        }
    } else {
        $error = "Please fill in all required fields.";
    }
}
?>

<div class="container py-5 mt-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="glass-panel p-5 animate-fade-up">
                <div class="text-center mb-5">
                    <i class="fa-solid fa-pen-nib fa-3x text-platinum mb-3"></i>
                    <h2 class="fw-bold">Share Your Story</h2>
                    <p class="text-muted">Tell the community about your vehicle, a recent trip, or a restoration project.</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger mb-4">
                        <i class="fas fa-exclamation-circle me-2"></i> <?= $error; ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success border-0 bg-success bg-opacity-10 text-success mb-4">
                        <i class="fas fa-check-circle me-2"></i> <?= $success; ?>
                    </div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-4">
                        <label class="form-label small text-muted text-uppercase fw-bold">Story Title</label>
                        <input type="text" name="title" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="e.g. My 1967 Mustang Restoration Journey" required>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small text-muted text-uppercase fw-bold">Cover Image URL</label>
                        <input type="url" name="image_url" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" placeholder="https://images.unsplash.com/...">
                    </div>

                    <div class="mb-5">
                        <label class="form-label small text-muted text-uppercase fw-bold">The Story</label>
                        <textarea name="content" class="form-control glass-panel shadow-none text-white border-opacity-10 py-3" rows="10" placeholder="Once upon a time..." required></textarea>
                    </div>

                    <div class="d-grid">
                        <button type="submit" class="btn-platinum py-3 fs-5">Publish Story</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
