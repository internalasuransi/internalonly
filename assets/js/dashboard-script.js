const firebaseConfig = {
    // Pastikan ini adalah konfigurasi yang lengkap dan benar
    apiKey: "AIzaSyCzKWKanXp34LkluGAA6zJwwyr5unhTlAI",
    authDomain: "internal-asuransi.firebaseapp.com",
    projectId: "internal-asuransi",
    storageBucket: "internal-asuransi.firebasestorage.app",
    messagingSenderId: "548382017288",
    appId: "1:548382017288:web:6cd13753a3388162b6cebd",
    measurementId: "G-6FVCS2EXR5"
};

// Tambahkan function untuk handle touch events better
function initDashboardMobile() {
    const sidebar = document.getElementById("dashboard-sidebar");
    
    // Prevent body scroll ketika sub-menu terbuka di mobile
    sidebar.addEventListener('touchmove', function(e) {
        if (window.innerWidth <= 800 && this.scrollHeight > this.clientHeight) {
            e.stopPropagation();
        }
    }, { passive: false });
    
    // Close sub-menus ketika tap outside di mobile
    document.addEventListener('touchstart', function(event) {
        const sidebar = document.getElementById("dashboard-sidebar");
        const isClickInsideSidebar = sidebar.contains(event.target);
        
        if (!isClickInsideSidebar) {
            closeAllDashboardSubMenus();
        }
    });
}

// Panggil function ini ketika DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    initDashboardMobile();
});

function toggleDashboardSidebar() {
    const toggleButton = document.getElementById("dashboard-toggle-btn")
    const sidebar = document.getElementById("dashboard-sidebar")

    sidebar.classList.toggle("close")
    toggleButton.classList.toggle("dashboard-rotate")

    closeAllDashboardSubMenus()
}

function toggleDashboardSubMenu(button) {
    const toggleButton = document.getElementById("dashboard-toggle-btn")
    const sidebar = document.getElementById("dashboard-sidebar")

    if(!button.nextElementSibling.classList.contains("show")){
        closeAllDashboardSubMenus()
    }

    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('dashboard-rotate')

    if (sidebar.classList.contains("close")) {
        sidebar.classList.toggle("close")
        toggleButton.classList.toggle("dashboard-rotate")
    }
}

function closeAllDashboardSubMenus() {
    const sidebar = document.getElementById("dashboard-sidebar")

    Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
        ul.classList.remove("show")
        ul.previousElementSibling.classList.remove('dashboard-rotate')
    })
}

// Close submenus when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById("dashboard-sidebar");
    const isClickInsideSidebar = sidebar.contains(event.target);
    
    if (!isClickInsideSidebar) {
        closeAllDashboardSubMenus();
    }
});