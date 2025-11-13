// =======================================================
// SIDEBAR LOGIC (Untuk dashboard.html - BARU DITAMBAHKAN)
// =======================================================

function toggleSidebar() {
    const toggleButton = document.getElementById("toggle-btn")
    const sidebar = document.getElementById("sidebar")

    if(sidebar && toggleButton) {
        sidebar.classList.toggle("close")
        toggleButton.classList.toggle("rotate")
        closeAllSubMenus()
    }
}

function toggleSubMenu(button) {
    const toggleButton = document.getElementById("toggle-btn")
    const sidebar = document.getElementById("sidebar")

    if(!button.nextElementSibling.classList.contains("show")){
        closeAllSubMenus()
    }

    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')

    if (sidebar && toggleButton && sidebar.classList.contains("close")) {
        sidebar.classList.toggle("close")
        toggleButton.classList.toggle("rotate")
    }
}

function closeAllSubMenus() {
    const sidebar = document.getElementById("sidebar")
    if(sidebar) {
        Array.from(sidebar.getElementsByClassName("show")).forEach(ul => {
            ul.classList.remove("show")
            ul.previousElementSibling.classList.remove('rotate')
        })
    }
}

// Global exposure untuk HTML onclick
window.toggleSidebar = toggleSidebar;
window.toggleSubMenu = toggleSubMenu;

// =======================================================
// LOGIN/SIGNUP LOGIC (Existing Code)
// =======================================================

/*=============== HIDE & SHOW PASSWORD ===============*/
const showHiddenPass = (password, eye) => {
   const input = document.getElementById(password),
         iconEye = document.getElementById(eye)

   if (iconEye && input) {
        iconEye.addEventListener('click', () => {
            input.type === 'password' ? input.type = 'text'
                                    : input.type = 'password'
            iconEye.classList.toggle('ri-eye-off-line')
            iconEye.classList.toggle('ri-eye-line')
        })
    }
}
// Catatan: Fungsi ini perlu dijalankan setelah DOM dimuat, jadi kita bungkus di bawah.


/*=============== SWIPER IMAGES ===============*/
// Catatan: Fungsi ini perlu dijalankan setelah DOM dimuat, jadi kita bungkus di bawah.

document.addEventListener('DOMContentLoaded', () => {
    
    // Inisialisasi HIDE & SHOW PASSWORD
    showHiddenPass('loginPass', 'loginEye'); 

    // Inisialisasi SWIPER
    const swiperElement = document.querySelector('.login__swiper');
    if (swiperElement) {
        const swiperLogin = new Swiper('.login__swiper', {
           loop: true,
           spaceBetween: '24',
           grabCursor: true,
           speed: 600,
           pagination: {
              el: '.swiper-pagination',
              clickable: true,
           },
           autoplay: {
              delay: 3000,
              disableOnInteraction: false,
           },
        });
    }

    // --- AREA UNTUK LOGIC BACKEND LOGIN/SIGNUP/RESET NANTI ---
    // ...
});