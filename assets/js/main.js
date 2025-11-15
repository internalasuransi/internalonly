// assets/js/main.js

// =======================================================
// GLOBAL UTILITY FUNCTIONS & DESIGN LOGIC
// =======================================================

/**
 * Mengatur status loading pada tombol.
 * @param {HTMLElement} buttonElement - Elemen tombol HTML.
 * @param {boolean} isLoading - True untuk mulai loading, false untuk berhenti.
 * @param {string} loadingText - Teks yang ditampilkan saat loading.
 * @param {string} originalText - Teks asli tombol.
 */
window.setLoadingState = (buttonElement, isLoading, loadingText, originalText) => {
    if (!buttonElement) return;

    if (isLoading) {
        buttonElement.setAttribute('data-original-text', originalText); // Simpan teks asli
        buttonElement.disabled = false;
        buttonElement.textContent = loadingText;
        buttonElement.classList.add('loading'); // Tambahkan class untuk styling/cursor
    } else {
        const text = buttonElement.getAttribute('data-original-text') || originalText;
        buttonElement.disabled = false;
        buttonElement.textContent = text;
        buttonElement.classList.remove('loading');
        buttonElement.removeAttribute('data-original-text');
    }
}

// 1. FUNGSI TOAST NOTIFICATION (Global)
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) { console.warn(`Toast container missing: ${message}`); return; }
    
    const toast = document.createElement('div');
    let bgColor = '#4CAF50'; let icon = 'ri-check-line';
    if (type === 'error') { bgColor = '#F44336'; icon = 'ri-close-line'; } 
    else if (type === 'info') { bgColor = '#2196F3'; icon = 'ri-information-line'; }

    toast.style.cssText = `
        background-color: ${bgColor}; color: white; padding: 10px 15px; margin-bottom: 10px; 
        border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; 
        transition: opacity 0.5s, transform 0.5s; transform: translateX(100%);
        position: relative; /* Tambahkan ini agar icon bisa diatur posisinya */
    `;
    toast.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${message}`;
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; 
        setTimeout(() => toast.remove(), 500); }, 5000);
}


// 2. FUNGSI LOG OUT (Global)
window.handleLogout = () => {
    // Menghapus data login dari Local Storage
    localStorage.removeItem('userUID'); 
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('isLoggedIn');
    showToast("Anda telah Log Out!", "info");
    
    // Opsional: Sign out dari Firebase Auth (PENTING untuk membersihkan session)
    try {
        // Cek jika Firebase Auth sudah terinisialisasi
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut();
        }
    } catch(e) {
        console.warn("Firebase Auth not fully initialized, performing local cleanup only.");
    }

    setTimeout(() => {
        window.location.href = 'index.html'; // Redirect ke halaman login
    }, 1000); 
}


// 3. SIDEBAR NAVIGATION LOGIC (Global)
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


// 4. INI LOGIC KHUSUS UNTUK LOGIN PAGE (index.html)
document.addEventListener('DOMContentLoaded', () => {
    // A. SWIPER INITIALIZATION
    const swiperElement = document.querySelector('.login__swiper');
    // Cek keberadaan elemen swiper dan library Swiper
    if (swiperElement && typeof Swiper !== 'undefined') {
        const loginSwiper = new Swiper('.login__swiper', {
            loop: true, // PENTING: Untuk slider terus berputar
            spaceBetween: 32,
            grabCursor: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            autoplay: {
                 delay: 5000, // Ganti setiap 5 detik
                 disableOnInteraction: false, // Lanjutkan autoplay setelah disentuh
            },
        });
    }

    // B. TOGGLE PASSWORD EYE
    const loginEye = document.getElementById('loginEye');
    const loginPassword = document.getElementById('login-password');

    if(loginEye && loginPassword) {
        loginEye.addEventListener('click', () => {
            if(loginPassword.type === 'password'){
                loginPassword.type = 'text';
                loginEye.classList.replace('ri-eye-line', 'ri-eye-off-line');
            } else {
                loginPassword.type = 'password';
                loginEye.classList.replace('ri-eye-off-line', 'ri-eye-line');
            }
        });
    }
});