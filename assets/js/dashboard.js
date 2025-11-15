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

// =========================================================
// Wajib: INISIALISASI APLIKASI FIREBASE
// Ini harus dipanggil sebelum firebase.auth() atau firebase.firestore() digunakan
// =========================================================
firebase.initializeApp(firebaseConfig); 

// =========================================================
// FUNGSI UTILITY DASHBOARD (Toggle Sidebar, Submenu, dll.)
// =========================================================

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


// =========================================================
// FUNGSI MOBILE HANDLING
// =========================================================

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


// =========================================================
// EVENT LISTENERS UTAMA
// =========================================================

// Panggil function ini ketika DOM loaded (untuk mobile)
document.addEventListener('DOMContentLoaded', function() {
 initDashboardMobile();
});

// Close submenus when clicking outside (untuk desktop)
document.addEventListener('click', function(event) {
 const sidebar = document.getElementById("dashboard-sidebar");
// Pastikan klik bukan pada tombol toggle sidebar itu sendiri jika kita mau logikanya seperti ini
const isClickInsideSidebar = sidebar.contains(event.target);

if (!isClickInsideSidebar) {
 closeAllDashboardSubMenus();
 }
});