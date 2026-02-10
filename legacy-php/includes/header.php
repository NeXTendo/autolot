<?php if (session_status() === PHP_SESSION_NONE) { session_start(); } ?>
<?php require_once __DIR__ . '/config.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= SITE_NAME ?> | <?= SITE_TAGLINE ?></title>
    
    <!-- Bootstrap 5 & FontAwesome -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    
    <!-- Custom Platinum CSS -->
    <link rel="stylesheet" href="<?= BASE_URL ?>style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg sticky-top">
        <div class="container border-bottom border-light border-opacity-10 pb-2">
            <a class="navbar-brand" href="<?= BASE_URL ?>index.php">
                <i class="fa-solid fa-gem me-2"></i>PLATINUM<span>AUTO</span>
            </a>
            
            <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>index.php">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>listings.php">Inventory</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Community</a>
                        <ul class="dropdown-menu glass-panel mt-2 animate-fade-up">
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>community/stories.php">Car Stories</a></li>
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>community/forums/index.php">Forums</a></li>
                            <li><a class="dropdown-item" href="<?= BASE_URL ?>community/events.php">Events</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>contact.php">Contact</a></li>
                    
                    <li class="nav-item ms-lg-4">
                        <?php if (isset($_SESSION["user_id"])): ?>
                            <div class="dropdown">
                                <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 btn-outline-platinum px-4" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fa-regular fa-user"></i>
                                    <span><?= $_SESSION["user_name"]; ?></span>
                                    <span class="badge-role role-<?= $_SESSION['role'] ?? 'guest' ?> ms-2"><?= ucfirst($_SESSION['role'] ?? 'Guest') ?></span>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end glass-panel mt-3 animate-fade-up">
                                    <li><a class="dropdown-item" href="<?= BASE_URL ?>users/profile.php"><i class="fa-solid fa-id-card me-2 small opacity-50"></i> My Profile</a></li>
                                    <li><a class="dropdown-item" href="<?= BASE_URL ?>listings/ListingWizard.php"><i class="fa-solid fa-plus me-2 small opacity-50"></i> Create Listing</a></li>
                                    <?php if (($_SESSION['role'] ?? '') === 'admin' || ($_SESSION['role'] ?? '') === 'moderator'): ?>
                                        <li><a class="dropdown-item" href="<?= BASE_URL ?>admin/dashboard.php"><i class="fa-solid fa-gauge me-2 small opacity-50"></i> Admin Panel</a></li>
                                    <?php endif; ?>
                                    <li><hr class="dropdown-divider border-light border-opacity-10"></li>
                                    <li><a class="dropdown-item text-danger" href="<?= BASE_URL ?>users/logout.php"><i class="fa-solid fa-right-from-bracket me-2 small"></i> Sign Out</a></li>
                                </ul>
                            </div>
                        <?php else: ?>
                            <a href="<?= BASE_URL ?>users/login.php" class="btn-platinum shadow-sm w-100 mt-2 mt-lg-0">Client Access</a>
                        <?php endif; ?>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <style>
    @media (max-width: 991px) {
        .navbar-collapse {
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            padding: 1.5rem;
            border-radius: 15px;
            margin-top: 1rem;
            border: 1px solid rgba(226, 232, 240, 0.1);
        }
    }
    </style>
    <main>
