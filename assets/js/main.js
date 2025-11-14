// =======================================================
// GLOBAL UTILITY FUNCTIONS & DESIGN LOGIC
// =======================================================

// Fungsi Log Out (Global agar bisa dipanggil oleh tombol Log Out di HTML)
window.handleLogout = () => {
    localStorage.removeItem('userSessionToken'); 
    localStorage.removeItem('userRole'); 
    alert("Anda telah Log Out.");
    window.location.href = 'index.html'; // Redirect ke halaman login
}

// Sidebar Logic (Diletakkan di scope global agar bisa diakses oleh onclick="..." di HTML)
window.toggleSidebar = function() {
    const toggleButton = document.getElementById("toggle-btn");
    const sidebar = document.getElementById("sidebar");
    if(sidebar && toggleButton) {
        sidebar.classList.toggle("close");
        toggleButton.classList.toggle("rotate");
        window.closeAllSubMenus();
    }
}

window.toggleSubMenu = function(button) {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggle-btn");

    if(!button.nextElementSibling.classList.contains("show")){
        window.closeAllSubMenus();
    }
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar && toggleButton && sidebar.classList.contains("close")) {
        sidebar.classList.toggle("close");
        toggleButton.classList.toggle("rotate");
    }
}

window.closeAllSubMenus = function() {
    const sidebar = document.getElementById("sidebar");
    if(sidebar) {
        Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
            ul.classList.remove("show");
            ul.previousElementSibling.classList.remove('rotate');
        });
    }
}