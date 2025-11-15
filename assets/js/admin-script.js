// assets/js/admin-script.js

// 1. INISIALISASI FIREBASE (Harusnya sudah benar)
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

// Pastikan inisialisasi hanya sekali
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const usersTable = document.getElementById('pending-users-table');
// Pastikan fungsi showToast sudah ada di main.js dan terhubung.


// 2. FUNGSI UTAMA: MENGAMBIL USER PENDING
async function fetchPendingUsers() {
    usersTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Memuat data...</td></tr>';
    
    try {
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

            // Nama (Ganti user.nama ke user.fullname sesuai signup-script.js)
            row.insertCell().textContent = user.fullname || 'N/A';
            // Email
            row.insertCell().textContent = user.email || 'N/A';
            // Role
            row.insertCell().textContent = user.id_role || 'Marketing (Default)'; 
            // Tanggal Daftar (Ganti user.tgl_daftar ke user.created_at)
            const date = user.created_at ? user.created_at.toDate().toLocaleDateString('id-ID') : 'N/A';
            row.insertCell().textContent = date;

            // Kolom Aksi (Tombol)
            const actionCell = row.insertCell();
            actionCell.innerHTML = `
                <button class="approve-btn" data-uid="${userId}" data-action="approve">Approve</button>
                <button class="reject-btn" data-uid="${userId}" data-action="reject">Reject</button>
            `;
        });
    } catch (error) {
        console.error("Error fetching pending users:", error);
        usersTable.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Gagal memuat data: ${error.message}</td></tr>`;
        showToast('Gagal memuat data user pending.', 'error');
    }
}

// 3. FUNGSI HANDLE AKSI (APPROVE/REJECT)
async function handleAction(button, userId, action) {
    // 1. NONAKTIFKAN TOMBOL DAN UBAH TAMPILAN UNTUK LOADING STATE
    const originalText = button.textContent;
    const isApprove = action === 'approve';
    
    button.disabled = true;
    button.textContent = isApprove ? 'Memproses...' : 'Menolak...';

    // Opsional: Nonaktifkan tombol yang lain di baris yang sama (optional)
    const otherButton = button.closest('td').querySelector(`button:not([data-action="${action}"])`);
    if (otherButton) otherButton.disabled = true;


    try {
        const docRef = db.collection('users').doc(userId);
        
        if (isApprove) {
            await docRef.update({
                status_persetujuan: 'Approved',
                is_active: true
            });
            showToast(`User ${userId} berhasil disetujui!`, 'success');

        } else if (action === 'reject') {
            await docRef.update({
                status_persetujuan: 'Rejected',
                is_active: false
            });
            showToast(`User ${userId} berhasil ditolak.`, 'error');
        }

        // 3. Muat ulang daftar user setelah aksi
        fetchPendingUsers();

    } catch (error) {
        console.error("Error updating user status:", error);
        showToast(`Gagal memproses aksi: ${error.message}`, 'error');
        
        // 4. KEMBALIKAN TOMBOL KE KEADAAN SEMULA JIKA GAGAL
        button.disabled = false;
        button.textContent = originalText;
        if (otherButton) otherButton.disabled = false;

    }
}

// 4. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // PENTING: Cek Otentikasi Admin di sini (belum kita buat)
    
    // Muat user pending
    fetchPendingUsers();

    // Tambahkan event listener untuk tombol di tabel (delegasi event)
    usersTable.addEventListener('click', (event) => {
        const target = event.target;
        
        // Cek apakah yang diklik adalah tombol Approve atau Reject
        if (target.tagName === 'BUTTON' && 
           (target.classList.contains('approve-btn') || target.classList.contains('reject-btn'))) 
        {
            const userId = target.getAttribute('data-uid');
            const action = target.getAttribute('data-action');
            
            // Panggil handleAction dan kirim elemen tombolnya juga
            if (userId && action) {
                handleAction(target, userId, action);
            }
        }
    });
});