// assets/js/admin-script.js

// 1. INISIALISASI FIREBASE (Sama seperti login-script)
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

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const usersTable = document.getElementById('pending-users-table');
// (Salin fungsi showToast dari login-script.js atau signup-script.js ke sini)

// 2. FUNGSI UTAMA: MENGAMBIL USER PENDING
async function fetchPendingUsers() {
    usersTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Memuat data...</td></tr>';
    
    // Query Firestore: Ambil user di koleksi 'users' yang statusnya 'Pending'
    const pendingSnapshot = await db.collection('users')
        .where('status_persetujuan', '==', 'Pending')
        .get();

    if (pendingSnapshot.empty) {
        usersTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada pengguna baru yang menunggu persetujuan.</td></tr>';
        return;
    }

    usersTable.innerHTML = ''; // Kosongkan tabel
    
    pendingSnapshot.forEach(doc => {
        const user = doc.data();
        const userId = doc.id; // UID user
        const row = usersTable.insertRow();

        // Nama
        row.insertCell().textContent = user.nama || 'N/A';
        // Email
        row.insertCell().textContent = user.email || 'N/A';
        // Role (Kita asumsikan role-nya ada, kalau tidak ada ganti dengan 'Pending Role')
        row.insertCell().textContent = user.id_role || 'Pending Role'; 
        // Tanggal Daftar (Konversi Firestore Timestamp)
        const date = user.tgl_daftar ? user.tgl_daftar.toDate().toLocaleDateString('id-ID') : 'N/A';
        row.insertCell().textContent = date;

        // Kolom Aksi (Tombol)
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button class="approve-btn" data-uid="${userId}" data-action="approve">Approve</button>
            <button class="reject-btn" data-uid="${userId}" data-action="reject">Reject</button>
        `;
    });
}

// 3. FUNGSI HANDLE AKSI (APPROVE/REJECT)
async function handleAction(userId, action) {
    try {
        const docRef = db.collection('users').doc(userId);
        
        if (action === 'approve') {
            await docRef.update({
                status_persetujuan: 'Approved',
                is_active: true // Aktifkan user
            });
            showToast(`User ${userId} berhasil disetujui!`, 'success');

        } else if (action === 'reject') {
            await docRef.update({
                status_persetujuan: 'Rejected',
                is_active: false // Non-aktifkan user
            });
            showToast(`User ${userId} berhasil ditolak.`, 'error');
        }

        // Muat ulang daftar user setelah aksi
        fetchPendingUsers();

    } catch (error) {
        console.error("Error updating user status:", error);
        showToast(`Gagal memproses aksi: ${error.message}`, 'error');
    }
}

// 4. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek User yang login (PENTING: Hanya Admin yang boleh masuk)
    // Lo bisa tambahkan pengecekan if (localStorage.getItem('userRole') !== 'Admin') { redirect('/login.html'); }
    
    // 2. Muat user pending
    fetchPendingUsers();

    // 3. Tambahkan event listener untuk tombol di tabel (delegasi event)
    usersTable.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON' && (target.classList.contains('approve-btn') || target.classList.contains('reject-btn'))) {
            const userId = target.getAttribute('data-uid');
            const action = target.getAttribute('data-action');
            if (userId && action) {
                handleAction(userId, action);
            }
        }
    });
});