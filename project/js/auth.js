/**
 * Authentication state management for the home page
 * This script checks if a user is logged in and updates the UI accordingly
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    // Get navigation elements
    const navbarNav = document.querySelector('#navbarResponsive .navbar-nav');
    const footerLinks = document.querySelectorAll('footer .text-muted');
    
    if (token && userName) {
        // User is logged in
        updateNavForLoggedInUser(navbarNav, userName);
        updateFooterForLoggedInUser(footerLinks);
    } else {
        // User is not logged in, no changes needed
        console.log('User is not logged in');
    }
});

/**
 * Update the navigation bar for logged in users
 * @param {HTMLElement} navbarNav - The navbar navigation element
 * @param {string} userName - The user's name
 */
function updateNavForLoggedInUser(navbarNav, userName) {
    // Find the "Sign In/ Sign Up" link
    const signInLink = Array.from(navbarNav.querySelectorAll('.nav-item')).find(
        item => item.textContent.includes('Sign In/ Sign Up')
    );
    
    if (signInLink) {
        // Replace with user info and logout button
        signInLink.innerHTML = `
            <div class="nav-link" style="font-family: cursive;">
                <span>|     Welcome, ${userName}     |</span>
                <a href="#" id="logoutBtn" class="logout-link">     Logout     |</a>
            </div>
        `;
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
}

/**
 * Update the footer links for logged in users
 * @param {NodeList} footerLinks - The footer link elements
 */
function updateFooterForLoggedInUser(footerLinks) {
    // Find the "Sign In/ Sign Up" link in the footer
    const signInFooterLink = Array.from(footerLinks).find(
        link => link.textContent.includes('Sign In/ Sign Up')
    );
    
    if (signInFooterLink) {
        // Replace with "My Account" link
        signInFooterLink.textContent = 'My Account';
        signInFooterLink.href = 'account.html'; // Create this page if needed
    }
}

/**
 * Handle user logout
 */
function logout() {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Redirect to home page
    window.location.href = 'home.html';
}