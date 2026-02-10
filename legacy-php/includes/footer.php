    </main>
    <footer class="mt-5 py-5 border-top border-light border-opacity-10">
        <div class="container pb-4">
            <div class="row g-4">
                <div class="col-lg-4">
                    <h5 class="navbar-brand mb-3">PLATINUM<span>AUTO</span></h5>
                    <p class="text-muted small pe-lg-5">Redefining the automotive experience. We provide a curated selection of the world's most prestigious vehicles, ensuring every journey begins with excellence.</p>
                    <div class="d-flex gap-3 mt-4">
                        <a href="#" class="text-muted"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" class="text-muted"><i class="fa-brands fa-twitter"></i></a>
                        <a href="#" class="text-muted"><i class="fa-brands fa-linkedin-in"></i></a>
                    </div>
                </div>
                
                <div class="col-6 col-lg-2">
                    <h6 class="text-white mb-3">Inventory</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-2"><a href="<?= BASE_URL ?>listings.php" class="text-muted text-decoration-none">New Arrivals</a></li>
                        <li class="mb-2"><a href="<?= BASE_URL ?>listings.php" class="text-muted text-decoration-none">Luxury Sedans</a></li>
                        <li class="mb-2"><a href="<?= BASE_URL ?>listings.php" class="text-muted text-decoration-none">Performance SUVs</a></li>
                        <li class="mb-2"><a href="<?= BASE_URL ?>listings.php" class="text-muted text-decoration-none">Exotic Collection</a></li>
                    </ul>
                </div>
                
                <div class="col-6 col-lg-2">
                    <h6 class="text-white mb-3">Company</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-2"><a href="<?= BASE_URL ?>about.php" class="text-muted text-decoration-none">Our Story</a></li>
                        <li class="mb-2"><a href="<?= BASE_URL ?>contact.php" class="text-muted text-decoration-none">Concierge</a></li>
                        <li class="mb-2"><a href="<?= BASE_URL ?>privacy.php" class="text-muted text-decoration-none">Privacy Policy</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-4">
                    <h6 class="text-white mb-3">Our Newsletter</h6>
                    <p class="text-muted small mb-4">Stay informed about our latest curated collections and private events.</p>
                    <div class="input-group">
                        <input type="email" class="form-control glass-panel border-end-0 rounded-start shadow-none" placeholder="Experience luxury inbox...">
                        <button class="btn btn-platinum rounded-end ms-0 px-4" type="button">Join</button>
                    </div>
                </div>
            </div>
            
            <div class="pt-5 mt-5 border-top border-light border-opacity-10 text-center">
                <p class="text-muted small mb-0">&copy; <?= date('Y') ?> <?= SITE_NAME ?>. Developed for Automotive Perfection.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?= BASE_URL ?>assets/js/main.js"></script>
</body>
</html>
