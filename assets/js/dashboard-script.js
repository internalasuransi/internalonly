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