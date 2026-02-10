<div class="glass-panel p-4 shadow-sm animate-fade-up">
    <div class="d-flex align-items-center gap-2 mb-4">
        <i class="fa-solid fa-calculator text-platinum"></i>
        <h5 class="mb-0 fw-bold">Financing Estimate</h5>
    </div>
    
    <div class="mb-4">
        <label class="form-label small text-muted text-uppercase fw-bold">Vehicle Price</label>
        <div class="input-group glass-panel border-opacity-10">
            <span class="input-group-text bg-transparent border-0 text-muted"><?= CURRENCY_SYMBOL ?></span>
            <input type="number" id="calcPrice" class="form-control bg-transparent border-0 text-white shadow-none" value="<?= $vehicle['price'] ?>">
        </div>
    </div>

    <div class="mb-4">
        <label class="form-label small text-muted text-uppercase fw-bold">Down Payment</label>
        <div class="input-group glass-panel border-opacity-10">
            <span class="input-group-text bg-transparent border-0 text-muted"><?= CURRENCY_SYMBOL ?></span>
            <input type="number" id="calcDown" class="form-control bg-transparent border-0 text-white shadow-none" value="<?= round($vehicle['price'] * 0.2) ?>">
        </div>
    </div>

    <div class="mb-4">
        <label class="form-label small text-muted text-uppercase fw-bold">Term (Months)</label>
        <select id="calcTerm" class="form-select glass-panel border-opacity-10 shadow-none text-white bg-dark">
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
            <option value="36">36 Months</option>
            <option value="48">48 Months</option>
            <option value="60" selected>60 Months</option>
            <option value="72">72 Months</option>
        </select>
    </div>

    <div class="mb-4">
        <label class="form-label small text-muted text-uppercase fw-bold">Interest Rate (%)</label>
        <input type="range" class="form-range" id="calcRate" min="1" max="15" step="0.1" value="5.9">
        <div class="d-flex justify-content-between mt-1">
            <span class="small text-muted">1%</span>
            <span class="small fw-bold text-platinum" id="rateVal">5.9%</span>
            <span class="small text-muted">15%</span>
        </div>
    </div>

    <div class="p-4 rounded border border-platinum border-opacity-10 bg-platinum bg-opacity-5 text-center">
        <span class="text-muted small text-uppercase d-block mb-1">Estimated Monthly</span>
        <h2 class="text-platinum fw-bold mb-0" id="monthlyPayment"><?= CURRENCY_SYMBOL ?> --</h2>
    </div>

    <div class="mt-4">
        <button class="btn btn-outline-platinum w-100 py-2 small" onclick="window.location.href='#'">Prequalify Now</button>
    </div>
</div>

<script>
function calculateLoan() {
    const price = parseFloat(document.getElementById('calcPrice').value);
    const down = parseFloat(document.getElementById('calcDown').value);
    const term = parseInt(document.getElementById('calcTerm').value);
    const rate = parseFloat(document.getElementById('calcRate').value) / 100 / 12;
    
    document.getElementById('rateVal').textContent = document.getElementById('calcRate').value + '%';
    
    const principal = price - down;
    let monthly = 0;
    
    if (rate === 0) {
        monthly = principal / term;
    } else {
        monthly = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    }
    
    document.getElementById('monthlyPayment').textContent = '<?= CURRENCY_SYMBOL ?>' + Math.round(monthly).toLocaleString();
}

document.querySelectorAll('#calcPrice, #calcDown, #calcTerm, #calcRate').forEach(el => {
    el.addEventListener('input', calculateLoan);
    el.addEventListener('change', calculateLoan);
});

calculateLoan();
</script>
