<?php 
include '../db.php'; 
include '../includes/header.php';
?>

<div class="container mt-5">
    <h2>Vehicle Listings</h2>

    <!-- Filter Section -->
    <div class="row mb-4">
        <div class="col-md-3">
            <label for="makeFilter">Make</label>
            <select id="makeFilter" class="form-select">
                <option value="">All Makes</option>
                <?php
                    $stmt = $pdo->query("SELECT DISTINCT make FROM vehicles ORDER BY make ASC");
                    while ($make = $stmt->fetch()) {
                        echo "<option value='".htmlspecialchars($make['make'])."'>".htmlspecialchars($make['make'])."</option>";
                    }
                ?>
            </select>
        </div>

        <div class="col-md-3">
            <label for="modelFilter">Model</label>
            <select id="modelFilter" class="form-select">
                <option value="">All Models</option>
                <!-- Dynamic options will be loaded via AJAX -->
            </select>
        </div>

        <div class="col-md-3">
            <label for="priceFilter">Price Range</label>
            <input type="range" id="priceFilter" class="form-range" min="0" max="1000000" step="1000" value="1000000">
            <span id="priceRangeLabel">$0 - $1,000,000</span>
        </div>

        <div class="col-md-3">
            <button id="filterBtn" class="btn btn-primary w-100 mt-4">Apply Filters</button>
        </div>
    </div>

    <!-- Vehicle Listings Grid -->
    <div id="vehicleGrid" class="row">
        <!-- Vehicles will be loaded dynamically via AJAX -->
    </div>

    <!-- Pagination Controls -->
    <nav aria-label="Page navigation">
        <ul id="pagination" class="pagination justify-content-center">
            <!-- Pagination will be dynamically created via AJAX -->
        </ul>
    </nav>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<script>
$(document).ready(function () {
    let currentPage = 1;

    // Function to load vehicle listings
    function loadVehicles(page = 1) {
        let make = $('#makeFilter').val();
        let model = $('#modelFilter').val();
        let price = $('#priceFilter').val();
        
        $.ajax({
            url: 'load_vehicles.php',
            type: 'GET',
            data: {
                make: make,
                model: model,
                price: price,
                page: page
            },
            success: function(response) {
                let data = JSON.parse(response);
                
                // Populate vehicles grid
                let vehicleGrid = $('#vehicleGrid');
                vehicleGrid.empty();
                data.vehicles.forEach(function(vehicle) {
                    vehicleGrid.append(`
                        <div class="col-md-3">
                            <div class="card mb-4">
                                <img src="../assets/images/${vehicle.image}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}">
                                <div class="card-body">
                                    <h5 class="card-title">${vehicle.make} ${vehicle.model}</h5>
                                    <p class="card-text">$${vehicle.price}</p>
                                    <a href="../vehicle.php?id=${vehicle.id}" class="btn btn-primary">View Details</a>
                                </div>
                            </div>
                        </div>
                    `);
                });

                // Populate pagination
                let pagination = $('#pagination');
                pagination.empty();
                for (let i = 1; i <= data.totalPages; i++) {
                    pagination.append(`
                        <li class="page-item ${i === page ? 'active' : ''}">
                            <a class="page-link" href="javascript:void(0);" onclick="loadVehicles(${i})">${i}</a>
                        </li>
                    `);
                }
            }
        });
    }

    // Filter button click event
    $('#filterBtn').click(function () {
        currentPage = 1;
        loadVehicles(currentPage);
    });

    // Price range slider change event
    $('#priceFilter').on('input', function () {
        $('#priceRangeLabel').text('$0 - $' + $(this).val());
    });

    // Load models based on selected make
    $('#makeFilter').change(function () {
        let make = $(this).val();
        
        $.ajax({
            url: 'load_models.php',
            type: 'GET',
            data: { make: make },
            success: function(response) {
                let models = JSON.parse(response);
                let modelFilter = $('#modelFilter');
                modelFilter.empty();
                modelFilter.append('<option value="">All Models</option>');
                models.forEach(function(model) {
                    modelFilter.append(`<option value="${model}">${model}</option>`);
                });
            }
        });
    });

    // Load initial vehicle data
    loadVehicles(currentPage);
});
</script>

<?php include '../includes/footer.php'; ?>