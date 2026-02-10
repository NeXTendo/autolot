// Function to show/hide the login form
function toggleLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.style.display = (loginForm.style.display === 'none') ? 'block' : 'none';
}

// AJAX-based function for search filtering (example)
function filterListings() {
    const searchQuery = document.getElementById('searchInput').value;
    const priceRange = document.getElementById('priceRange').value;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'search.php?query=' + searchQuery + '&price=' + priceRange, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            document.getElementById('listings').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// Event listener to trigger filtering
document.getElementById('searchInput').addEventListener('input', filterListings);
document.getElementById('priceRange').addEventListener('input', filterListings);
