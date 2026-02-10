<?php
require_once '../db.php';
include '../includes/header.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: " . BASE_URL . "users/login.php");
    exit();
}
?>

<div class="container py-5 mt-5">
    <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-8">
            <div class="glass-panel p-5 animate-fade-up">
                <div class="text-center mb-5">
                    <span class="text-platinum fw-bold small text-uppercase ls-2">Sell Your Vehicle</span>
                    <h2 class="display-6 fw-bold">Premium Listing Wizard</h2>
                    <p class="text-muted">Follow our 11-step process to reach thousands of qualified buyers.</p>
                </div>

                <!-- Listing Strength Meter -->
                <div class="mb-5 animate-fade-up">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted text-uppercase fw-bold">Listing Strength</span>
                        <span class="small fw-bold text-platinum" id="strengthScore">0%</span>
                    </div>
                    <div class="progress bg-dark" style="height: 6px;">
                        <div class="progress-bar bg-platinum shadow-platinum" id="strengthBar" style="width: 0%"></div>
                    </div>
                    <div class="small text-muted mt-2" id="strengthFeedback">Complete more steps to increase your visibility.</div>
                </div>

                <!-- Progress Indicator -->
                <div class="wizard-progress d-flex justify-content-between mb-4 mb-md-5 px-2">
                    <?php for ($i = 1; $i <= 11; $i++): ?>
                        <div class="wizard-step <?= $i === 1 ? 'active' : '' ?>"></div>
                    <?php endfor; ?>
                </div>

                <form id="listingWizardForm" action="process_listing.php" method="POST" enctype="multipart/form-data">
                    
                    <!-- Step 1: Vehicle Identification -->
                    <div class="wizard-content" id="step-1">
                        <h4 class="mb-4">1. Vehicle Identification</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Enter VIN (17 Digits)</label>
                            <div class="input-group">
                                <input type="text" name="vin" id="vinInput" class="form-control bg-dark border-secondary text-white shadow-none" placeholder="Enter Vehicle Identification Number">
                                <button type="button" class="btn btn-outline-platinum px-4" id="decodeVin">Decode</button>
                            </div>
                            <div class="form-text opacity-50">VIN decoding auto-populates engine, trim, and safety features.</div>
                        </div>
                        <div class="row g-3" id="vinResults">
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold">Make</label>
                                <input type="text" name="make" class="form-control bg-dark border-secondary text-white shadow-none" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold">Model</label>
                                <input type="text" name="model" class="form-control bg-dark border-secondary text-white shadow-none" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold">Year</label>
                                <input type="number" name="year" class="form-control bg-dark border-secondary text-white shadow-none" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold">Trim</label>
                                <input type="text" name="trim" class="form-control bg-dark border-secondary text-white shadow-none">
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Odometer & Condition -->
                    <div class="wizard-content d-none" id="step-2">
                        <h4 class="mb-4">2. Odometer & Condition</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Current Mileage (km)</label>
                            <input type="number" name="mileage" class="form-control bg-dark border-secondary text-white shadow-none" required placeholder="e.g., 45000">
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Overall Condition</label>
                            <select name="condition" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="Excellent">Excellent - Like new, no flaws</option>
                                <option value="Very Good" selected>Very Good - Minor wear, well-kept</option>
                                <option value="Good">Good - Average wear for age</option>
                                <option value="Fair">Fair - Noticeable wear/issues</option>
                                <option value="Poor">Poor - Significant problems</option>
                            </select>
                        </div>
                    </div>

                    <!-- Step 3: Colors & Appearance -->
                    <div class="wizard-content d-none" id="step-3">
                        <h4 class="mb-4">3. Colors & Appearance</h4>
                        <div class="row g-3">
                            <div class="col-md-6 mb-4">
                                <label class="form-label text-muted small text-uppercase fw-bold">Exterior Color</label>
                                <select name="exterior_color" class="form-select bg-dark border-secondary text-white shadow-none">
                                    <option value="Black">Black</option>
                                    <option value="White">White</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Gray">Gray</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Red">Red</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-4">
                                <label class="form-label text-muted small text-uppercase fw-bold">Interior Color</label>
                                <select name="interior_color" class="form-select bg-dark border-secondary text-white shadow-none">
                                    <option value="Black">Black</option>
                                    <option value="Gray">Gray</option>
                                    <option value="Beige">Beige</option>
                                    <option value="Brown">Brown</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Step 4: Features & Options -->
                    <div class="wizard-content d-none" id="step-4">
                        <h4 class="mb-4">4. Features & Options</h4>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold mb-2">Technology</label>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" name="features[]" value="Navigation" id="nav">
                                    <label class="form-check-label small" for="nav">Navigation System</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" name="features[]" value="Bluetooth" id="blue">
                                    <label class="form-check-label small" for="blue">Bluetooth Connectivity</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" name="features[]" value="Premium Audio" id="audio">
                                    <label class="form-check-label small" for="audio">Premium Audio System</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small text-uppercase fw-bold mb-2">Safety</label>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" name="features[]" value="Backup Camera" id="camera">
                                    <label class="form-check-label small" for="camera">Backup Camera</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" name="features[]" value="Blind Spot Monitor" id="blind">
                                    <label class="form-check-label small" for="blind">Blind Spot Monitor</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 5: History & Documentation -->
                    <div class="wizard-content d-none" id="step-5">
                        <h4 class="mb-4">5. History & Documentation</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Title Status</label>
                            <select name="title_status" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="Clean">Clean Title</option>
                                <option value="Salvage">Salvage</option>
                                <option value="Rebuilt">Rebuilt</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Accident History</label>
                            <select name="accidents" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="None">No accidents or damage</option>
                                <option value="Minor">Minor accident (cosmetic only)</option>
                                <option value="Moderate">Moderate accident (repaired)</option>
                                <option value="Major">Major accident</option>
                            </select>
                        </div>
                    </div>

                    <!-- Step 6: Photos -->
                    <div class="wizard-content d-none" id="step-6">
                        <h4 class="mb-4">6. Photos</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Upload Gallery (Up to 20 photos)</label>
                            <input type="file" name="vehicle_photos[]" class="form-control bg-dark border-secondary text-white shadow-none" multiple accept="image/*">
                            <div class="form-text opacity-50 mt-2">Professional quality photos sell 3x faster. AI will score your photos in the next step.</div>
                        </div>
                    </div>
                    <!-- Step 7: Vehicle Narrative -->
                    <div class="wizard-content d-none" id="step-7">
                        <h4 class="mb-4">7. Vehicle Narrative</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Detailed Description</label>
                            <textarea name="description" class="form-control bg-dark border-secondary text-white shadow-none" rows="8" placeholder="Describe the history, maintenance, and special features of your vehicle..."></textarea>
                            <div class="form-text opacity-50 mt-2">A compelling story increases buyer trust. High-quality descriptions lead to faster sales.</div>
                        </div>
                    </div>

                    <!-- Step 8: Pricing Strategy -->
                    <div class="wizard-content d-none" id="step-8">
                        <h4 class="mb-4">8. Pricing Strategy</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Asking Price ($)</label>
                            <input type="number" name="price" id="priceInput" class="form-control bg-dark border-secondary text-white shadow-none" required placeholder="e.g., 25500">
                            <div class="form-text text-platinum mt-2 small"><i class="fa-solid fa-wand-magic-sparkles me-2"></i>AI Suggested: $24,800 - $26,200</div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Negotiation Strategy</label>
                            <select name="pricing_strategy" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="Negotiable">Negotiable (Recommended)</option>
                                <option value="Firm">Firm Price</option>
                                <option value="OBO">Or Best Offer</option>
                            </select>
                        </div>
                    </div>

                    <!-- Step 9: Listing Options -->
                    <div class="wizard-content d-none" id="step-9">
                        <h4 class="mb-4">9. Listing Options</h4>
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="p-4 glass-panel h-100 border-light border-opacity-10">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5 class="mb-0">Free Listing</h5>
                                        <span class="badge bg-light text-dark">Default</span>
                                    </div>
                                    <ul class="list-unstyled small opacity-75 mb-4">
                                        <li><i class="fa-solid fa-check me-2 text-success"></i>30-day duration</li>
                                        <li><i class="fa-solid fa-check me-2 text-success"></i>Basic search</li>
                                        <li><i class="fa-solid fa-check me-2 text-success"></i>Standard analytics</li>
                                    </ul>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="plan" value="free" id="planFree" checked>
                                        <label class="form-check-label fw-bold" for="planFree">Select Free</label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-4 glass-panel h-100 bg-platinum bg-opacity-5">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5 class="mb-0 text-platinum">Premium <i class="fa-solid fa-gem ms-1"></i></h5>
                                        <span class="badge bg-platinum text-dark">$29.99</span>
                                    </div>
                                    <ul class="list-unstyled small opacity-75 mb-4">
                                        <li><i class="fa-solid fa-star me-2 text-warning"></i>Featured result (Top)</li>
                                        <li><i class="fa-solid fa-star me-2 text-warning"></i>Homepage spotlight</li>
                                        <li><i class="fa-solid fa-star me-2 text-warning"></i>3x more views avg.</li>
                                    </ul>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="plan" value="premium" id="planPremium">
                                        <label class="form-check-label fw-bold text-platinum" for="planPremium">Upgrade to Premium</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 10: Contact Preferences -->
                    <div class="wizard-content d-none" id="step-10">
                        <h4 class="mb-4">10. Contact Preferences</h4>
                        <div class="mb-4">
                            <label class="form-label text-muted small text-uppercase fw-bold">Primary Contact Method</label>
                            <select name="contact_method" class="form-select bg-dark border-secondary text-white shadow-none">
                                <option value="In-built Messenger">AutoLot Messenger (Private)</option>
                                <option value="Phone Only">Phone Only</option>
                                <option value="Email Only">Email Only</option>
                                <option value="Any">Any Method</option>
                            </select>
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" name="show_phone" value="1" id="showPhone">
                            <label class="form-check-label small" for="showPhone">Show my phone number to verified buyers</label>
                        </div>
                    </div>

                    <!-- Step 11: Review & Publish -->
                    <div class="wizard-content d-none" id="step-11">
                        <h4 class="mb-4">11. Review & Publish</h4>
                        <div class="p-4 glass-panel mb-4 bg-success bg-opacity-5 border-success border-opacity-25">
                            <div class="d-flex align-items-center">
                                <i class="fa-solid fa-circle-check text-success fs-3 me-3"></i>
                                <div>
                                    <h5 class="mb-1">Listing Ready!</h5>
                                    <p class="small text-muted mb-0">Your vehicle is ready to be showcased. By clicking "Publish", you agree to our Terms of Service.</p>
                                </div>
                            </div>
                        </div>
                        <div class="list-group list-group-flush glass-panel overflow-hidden">
                            <div class="list-group-item bg-transparent text-white border-light border-opacity-10 py-3">
                                <div class="row">
                                    <div class="col-4 text-muted small text-uppercase">Vehicle</div>
                                    <div class="col-8 fw-bold" id="summaryVehicle">Pending...</div>
                                </div>
                            </div>
                            <div class="list-group-item bg-transparent text-white border-light border-opacity-10 py-3">
                                <div class="row">
                                    <div class="col-4 text-muted small text-uppercase">Price</div>
                                    <div class="col-8 fw-bold" id="summaryPrice">Pending...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between mt-5 pt-4 border-top border-light border-opacity-10">
                        <button type="button" id="prevBtn" class="btn btn-link text-muted text-decoration-none shadow-none invisible">Back</button>
                        <button type="button" id="nextBtn" class="btn-platinum px-5">Continue</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 11;
    const form = document.getElementById('listingWizardForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    const updateWizard = () => {
        // Hide all steps
        document.querySelectorAll('.wizard-content').forEach(step => step.classList.add('d-none'));
        // Show current step
        document.getElementById(`step-${currentStep}`).classList.remove('d-none');
        
        // Update progress dots
        document.querySelectorAll('.wizard-step').forEach((dot, idx) => {
            dot.classList.remove('active', 'completed');
            if (idx + 1 < currentStep) dot.classList.add('completed');
            if (idx + 1 === currentStep) dot.classList.add('active');
        });

        // Update summary if on final step
        if (currentStep === totalSteps) {
            const make = form.querySelector('[name="make"]').value;
            const model = form.querySelector('[name="model"]').value;
            const year = form.querySelector('[name="year"]').value;
            const price = form.querySelector('[name="price"]').value;
            
            document.getElementById('summaryVehicle').textContent = `${year} ${make} ${model}`;
            document.getElementById('summaryPrice').textContent = `$${Number(price).toLocaleString()}`;
        }

        // Update buttons
        prevBtn.classList.toggle('invisible', currentStep === 1);
        nextBtn.textContent = currentStep === totalSteps ? 'Publish Listing' : 'Continue';
    };

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateWizard();
        } else {
            form.submit();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    const calculateStrength = () => {
        let score = 0;
        const fields = {
            vin: form.querySelector('[name="vin"]').value.length >= 10 ? 15 : 0,
            make: form.querySelector('[name="make"]').value ? 10 : 0,
            model: form.querySelector('[name="model"]').value ? 10 : 0,
            price: form.querySelector('[name="price"]').value ? 10 : 0,
            mileage: form.querySelector('[name="mileage"]').value ? 10 : 0,
            description: form.querySelector('[name="description"]').value.length > 50 ? 20 : (form.querySelector('[name="description"]').value.length > 0 ? 5 : 0),
            photos: form.querySelector('[name="vehicle_photos[]"]').files.length > 0 ? 25 : 0
        };

        score = Object.values(fields).reduce((a, b) => a + b, 0);
        
        const bar = document.getElementById('strengthBar');
        const scoreLabel = document.getElementById('strengthScore');
        const feedback = document.getElementById('strengthFeedback');

        bar.style.width = `${score}%`;
        scoreLabel.textContent = `${score}%`;

        if (score < 40) {
            feedback.textContent = "Weak Listing: Add more details to attract buyers.";
            bar.className = 'progress-bar bg-danger';
        } else if (score < 80) {
            feedback.textContent = "Good Listing: You're getting there! Add photos for better results.";
            bar.className = 'progress-bar bg-warning';
        } else {
            feedback.textContent = "Platinum Strength: Your listing is optimized for the marketplace!";
            bar.className = 'progress-bar bg-platinum shadow-platinum';
        }
    };

    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', calculateStrength);
        el.addEventListener('change', calculateStrength);
    });

    // Mock VIN Decoder update to trigger strength calc
    const originalDecode = document.getElementById('decodeVin')?.onclick;
    document.getElementById('decodeVin')?.addEventListener('click', () => {
        setTimeout(calculateStrength, 100);
    });

    // Initial calc
    calculateStrength();
});
</script>

<?php include '../includes/footer.php'; ?>
