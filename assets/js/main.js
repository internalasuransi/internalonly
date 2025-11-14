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

// =======================================================
// CORE LOGIC PER HALAMAN
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

    // Identifikasi Halaman saat ini
    const path = window.location.pathname;

    // --- HIDE & SHOW PASSWORD LOGIC ---
    const showHiddenPass = (passwordId, eyeId) => {
        const input = document.getElementById(passwordId),
              iconEye = document.getElementById(eyeId)
        if (iconEye && input) {
            iconEye.addEventListener('click', () => {
                input.type === 'password' ? input.type = 'text' : input.type = 'password'
                iconEye.classList.toggle('ri-eye-off-line')
                iconEye.classList.toggle('ri-eye-line')
            })
        }
    }
    // Asumsi ID input Password adalah 'password-input'
    showHiddenPass('password-input', 'loginEye'); 

    // --- SWIPER IMAGES LOGIC ---
    const swiperElement = document.querySelector('.login__swiper');
    if (swiperElement) {
        new Swiper('.login__swiper', {
           loop: true,
           spaceBetween: '24',
           grabCursor: true,
           speed: 600,
           pagination: { el: '.swiper-pagination', clickable: true },
           autoplay: { delay: 3000, disableOnInteraction: false },
        });
    }

    
    // ----------------------------------------------------
    // LOGIC UNTUK signup.html (DAFTAR)
    // ----------------------------------------------------
    if (path.endsWith('signup.html')) {
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault(); 

                const fullname = document.getElementById('fullname-input').value;
                const whatsapp = document.getElementById('whatsapp-input').value;
                const email = document.getElementById('email-input').value;
                const password = document.getElementById('password-input').value;

                if (email && password.length >= 6 && fullname && whatsapp) {
                    const signupData = {
                        action: 'SIGNUP', 
                        email: email,
                        password: password,
                        nama_lengkap: fullname,
                        no_whatsApp: whatsapp,
                    };

                    const result = await sendGASRequest(signupData);
                    alert(result.message);
                    
                    if (result.success) {
                        window.location.href = 'index.html'; // Redirect ke login setelah sukses
                    }
                } else {
                    alert('Mohon lengkapi semua field (Password min 6 karakter).');
                }
            });
        }
    } 

    
    // ----------------------------------------------------
    // LOGIC UNTUK index.html (LOGIN)
    // ----------------------------------------------------
    else if (path.endsWith('index.html') || path === '/') {
        const loginForm = document.getElementById('login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault(); 

                const credential = document.getElementById('credential-input').value;
                const password = document.getElementById('password-input').value;
                
                const loginData = {
                    action: 'LOGIN',
                    credential: credential, 
                    password: password
                };

                const result = await sendGASRequest(loginData);

                alert(result.message);

                if (result.success) {
                    localStorage.setItem('userSessionToken', result.sessionToken);
                    localStorage.setItem('userRole', result.idRole);
                    window.location.href = 'dashboard.html'; // Redirect ke dashboard
                }
            });
        }
    }
    
    // ----------------------------------------------------
    // LOGIC UNTUK forgot-password.html (RESET PASSWORD)
    // ----------------------------------------------------
    else if (path.endsWith('forgot-password.html')) {
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email-input').value;

                if(email) {
                    const result = await sendGASRequest({ action: 'RESET_PASSWORD', email: email });
                    alert(result.message);
                    if (result.success) {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert('Mohon masukkan alamat email.');
                }
            });
        }
    }

    // ----------------------------------------------------
    // LOGIC UNTUK dashboard.html (SECURITY CHECK)
    // ----------------------------------------------------
    else if (path.endsWith('dashboard.html')) {
        // Cek Sesi Wajib
        checkUserSession();
    }

}); // Penutup DOMContentLoaded