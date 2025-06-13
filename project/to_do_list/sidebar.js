// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle sidebar when button is clicked
    toggleSidebarBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside of it (on mobile)
    document.addEventListener('click', function(event) {
        const isSidebarActive = sidebar.classList.contains('active');
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleBtn = toggleSidebarBtn.contains(event.target);
        
        if (isSidebarActive && !isClickInsideSidebar && !isClickOnToggleBtn) {
            sidebar.classList.remove('active');
        }
    });
    
    // Close sidebar when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
});
