// =========================================================
// 1. INISIALISASI & KONSTANTA
// =========================================================
const db = firebase.firestore();
const contentArea = document.getElementById('page-content');
const pageTitleElement = document.getElementById('page-title');
const menuItems = document.querySelectorAll('#dashboard-sidebar ul li');
const notificationButton = document.getElementById('notification-button');
const notificationCountElement = document.getElementById('notification-count');

// Map untuk menyimpan data menu: { 'id_menu': { name: 'nama', pageName: 'judul' } }
let menuDataMap = {};

// =========================================================
// 2. FUNGSI UTAMA RBAC DAN PENGATURAN TAMPILAN
// =========================================================

/**
 * Mengubah tampilan halaman berdasarkan menu yang dipilih.
 * @param {string} menuId ID menu dari Firestore (contoh: 'dashboard', 'users').
 * @param {string} pageName Judul halaman yang akan ditampilkan di header.
 */
function loadPageContent(menuId, pageName) {
    // 1. Update Judul Halaman
    if (pageTitleElement) {
        pageTitleElement.textContent = pageName;
    }

    // 2. Kelola Kelas Aktif pada Menu Sidebar
    menuItems.forEach(item => {
        // Hapus kelas 'active' dari semua menu
        item.classList.remove('active');
        // Set kelas 'active' pada menu yang sesuai
        if (item.id === menuId) {
            item.classList.add('active');
        }
    });

    // 3. Muat Konten HTML (Emulasi SPA)
    // Dalam implementasi nyata, kita akan memuat file HTML parsial
    const contentHtml = generateContentHtml(menuId);
    if (contentArea) {
        contentArea.innerHTML = contentHtml;
    }

    // 4. Update URL tanpa reload (History API)
    // Ini penting agar tombol back/forward browser bekerja
    const newUrl = window.location.pathname + `?page=${menuId}`;
    history.pushState({ page: menuId }, pageName, newUrl);
}

/**
 * Membuat konten HTML dummy berdasarkan menuId. 
 * Nanti ini diganti dengan fetch('./pages/dashboard.html').
 * @param {string} menuId
 * @returns {string} HTML content
 */
function generateContentHtml(menuId) {
    const data = menuDataMap[menuId];
    if (data && data.pageName) {
        // Lo bisa tambahkan logika untuk memuat file HTML dari server
        // Contoh: fetch(`pages/${menuId}.html`).then(...)
        
        // Untuk saat ini, kita gunakan konten dummy:
        return `
            <div class="dashboard-content-box">
                <h2>${data.pageName}</h2>
                <p>Ini adalah konten dinamis untuk modul **${data.pageName}** (ID: ${menuId}).</p>
                <p>Implementasi selanjutnya adalah memuat file HTML khusus untuk tiap modul di sini.</p>
            </div>
        `;
    }
    return `<div class="dashboard-content-box"><h2>Halaman Tidak Ditemukan</h2><p>Menu ID: ${menuId} tidak valid.</p></div>`;
}


// =========================================================
// 3. RBAC (ROLE-BASED ACCESS CONTROL)
// =========================================================

/**
 * Menyembunyikan/menampilkan menu berdasarkan role user.
 * @param {string[]} allowedMenuIds Array berisi ID menu yang diizinkan (dari Firestore Role).
 */
function applyRbac(allowedMenuIds) {
    menuItems.forEach(li => {
        const menuId = li.id;
        
        // Cek apakah menu ini diizinkan
        if (allowedMenuIds.includes('ALL') || allowedMenuIds.includes(menuId)) {
            // Tampilkan menu jika diizinkan
            li.style.display = 'list-item'; 
            
            // Tambahkan event listener untuk navigasi SPA
            if (menuId !== 'calendar' && menuId !== 'logout') {
                const menuLink = li.querySelector('a');
                if (menuLink) {
                    menuLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const pageName = menuDataMap[menuId] ? menuDataMap[menuId].pageName : menuId;
                        loadPageContent(menuId, pageName);
                    });
                }
            }
        } else {
            // Sembunyikan menu jika tidak diizinkan
            li.style.display = 'none';
        }
    });
}

/**
 * Mengambil data user saat ini, role, dan menu, lalu menjalankan RBAC.
 */
async function initRbacAndSpa() {
    let user = firebase.auth().currentUser;
    if (!user) {
        // Jika user belum login, arahkan ke login.
        window.location.href = 'index.html'; 
        return;
    }

    try {
        // 1. Ambil data Menu dari Firestore
        const menusSnapshot = await db.collection('menus').get();
        menusSnapshot.forEach(doc => {
            const data = doc.data();
            // Gunakan 'name' (yang ada di HTML: dashboard, todolist, dll.) sebagai kunci ID
            menuDataMap[data.name] = { 
                name: doc.id, 
                pageName: data.pageName 
            };
        });
        
        // 2. Ambil data User dari Firestore (untuk mendapatkan id_role)
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().status_persetujuan !== 'Approved') {
            alert('Akun Anda belum disetujui atau tidak aktif.');
            // firebase.auth().signOut();
            // window.location.href = 'index.html';
            // return;
        }

        const userRole = userDoc.data().id_role || 'Visitor';

        // 3. Ambil Allowed Menu berdasarkan Role
        const roleDoc = await db.collection('roles').doc(userRole).get();
        
        let allowedMenuIds = [];
        if (roleDoc.exists) {
            allowedMenuIds = roleDoc.data().allowed_menus || [];
        } else {
            // Default ke role Visitor jika role tidak ditemukan
            const visitorRole = await db.collection('roles').doc('Visitor').get();
            if (visitorRole.exists) {
                allowedMenuIds = visitorRole.data().allowed_menus || [];
            }
        }

        // Konversi array allowedMenuIds dari ID numerik ('1', '2', dll) 
        // menjadi ID berbasis nama (string: 'dashboard', 'todolist', dll)
        const numericToNameMap = {};
        menusSnapshot.forEach(doc => {
            const data = doc.data();
            numericToNameMap[doc.id] = data.name;
        });

        // Filter dan konversi ID menu yang diizinkan
        let finalAllowedMenuNames = allowedMenuIds.map(id => {
            // Jika 'ALL' ada, biarkan 'ALL'
            if (id === 'ALL') return 'ALL';
            // Konversi ID numerik ke nama menu (ex: '1' -> 'dashboard')
            return numericToNameMap[id]; 
        }).filter(name => name); // Hapus yang undefined/null

        // 4. Terapkan RBAC pada Sidebar
        applyRbac(finalAllowedMenuNames);

        // 5. Tentukan Halaman Default (misalnya 'dashboard')
        const urlParams = new URLSearchParams(window.location.search);
        let defaultMenuId = urlParams.get('page') || 'dashboard';

        // Pastikan halaman default adalah salah satu yang diizinkan
        if (finalAllowedMenuNames.includes('ALL') || finalAllowedMenuNames.includes(defaultMenuId)) {
             const defaultPageName = menuDataMap[defaultMenuId] ? menuDataMap[defaultMenuId].pageName : 'Dashboard Overview';
             loadPageContent(defaultMenuId, defaultPageName);
        } else {
            // Jika halaman yang diminta tidak diizinkan atau tidak ada, muat dashboard (jika diizinkan)
            const fallbackMenu = finalAllowedMenuNames.includes('dashboard') ? 'dashboard' : finalAllowedMenuNames[0];
            const fallbackPageName = menuDataMap[fallbackMenu] ? menuDataMap[fallbackMenu].pageName : 'Dashboard Overview';
            loadPageContent(fallbackMenu, fallbackPageName);
        }

        // 6. INISIALISASI LONCENG NOTIFIKASI (BARIS TAMBAHAN)
        initNotificationWatcher();

    } catch (error) {
        console.error("Error in initRbacAndSpa:", error);
        // Handle error seperti memuat halaman error
        if (contentArea) {
            contentArea.innerHTML = `<div class="dashboard-content-box"><h2>Error Memuat Data</h2><p>Terjadi kesalahan saat memuat data menu: ${error.message}</p></div>`;
        }
    }
}

// =========================================================
// 4. EKSEKUSI
// =========================================================
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User sudah login, inisialisasi RBAC dan SPA
        initRbacAndSpa();
    } else {
        // User belum login, redirect ke index.html (Login Page)
        window.location.href = 'index.html';
    }
});

// Tangani tombol back/forward browser
window.onpopstate = function(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('page') || 'dashboard';
    const pageName = menuDataMap[pageId] ? menuDataMap[pageId].pageName : pageId;
    loadPageContent(pageId, pageName);
};

// =========================================================
// 5. NOTIFIKASI LONCENG (Realtime Updates)
// =========================================================

/**
 * Memantau notifikasi real-time dari Firestore untuk user yang sedang login.
 */
function initNotificationWatcher() {
    const userId = firebase.auth().currentUser.uid;

    // Query: Ambil notifikasi yang ditujukan kepada user ini DAN belum dibaca (isRead: false)
    const notificationQuery = db.collection('notifications')
        .where('recipientId', '==', userId)
        .where('isRead', '==', false);

    // Gunakan onSnapshot untuk update real-time
    notificationQuery.onSnapshot(snapshot => {
        const unreadCount = snapshot.size;
        
        // Update badge jumlah notifikasi
        if (notificationCountElement) {
            notificationCountElement.textContent = unreadCount;
            
            if (unreadCount > 0) {
                // Beri efek visual jika ada notifikasi baru
                notificationButton.classList.add('has-unread'); 
            } else {
                notificationButton.classList.remove('has-unread');
            }
        }
        
        // TODO: Anda bisa menambahkan logika untuk menampilkan pop-up/toast notifikasi baru di sini.

    }, error => {
        console.error("Error watching notifications:", error);
    });
}

