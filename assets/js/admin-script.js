// assets/js/admin-script.js

// 1. KONFIGURASI DAN INISIALISASI
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// PENTING: ID elemen tabel harus disesuaikan.
// Karena lo menggunakan insertRow() langsung, kita asumsikan ID nya adalah <tbody>
const usersTableBody = document.getElementById('users-table-body'); // ASUMSI ID <tbody> ADALAH 'users-table-body'

// Daftar Role yang akan muncul di dropdown
const AVAILABLE_ROLES = [
    'Marketing',
    'Supervisor',
    'Staff',
    'Admin'
];

// **********************************************
// NOTE: Tambahkan logika cek role di sini jika diperlukan 
// **********************************************


/**
 * Fungsi untuk mengupdate tampilan tombol (Loading State)
 */
const setButtonLoadingState = (button, isLoading, loadingText, originalText) => {
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : originalText;
    // Trik: Nonaktifkan tombol lain di baris yang sama saat loading dimulai
    const otherButton = button.closest('td').querySelector(`button:not([data-action="${button.dataset.action}"])`);
    if (otherButton) otherButton.disabled = isLoading;
};

// 2. FUNGSI UTAMA: MENGAMBIL USER PENDING
async function fetchPendingUsers() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Memuat data...</td></tr>';
    
    try {
        const pendingSnapshot = await db.collection('users')
            .where('status_persetujuan', '==', 'Pending')
            .get();

        if (pendingSnapshot.empty) {
            usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada pengguna baru yang menunggu persetujuan.</td></tr>';
            return;
        }

        // PENTING: Kita akan menggunakan HTML string untuk render ulang,
        // yang lebih clean daripada insertRow() saat me-reload.
        let tableHTML = '';
        
        pendingSnapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            
            const date = user.created_at ? user.created_at.toDate().toLocaleDateString('id-ID') : 'N/A';
            
            // --- KODE DROPDOWN ROLE ---
            const roleOptions = AVAILABLE_ROLES.map(role => 
                `<option value="${role}" ${user.id_role === role ? 'selected' : ''}>${role}</option>`
            ).join('');
            
            const dropdownHTML = `
                <select class="role-dropdown" data-uid="${userId}" style="min-width: 100px;">
                    ${roleOptions}
                </select>
            `;

            // --- RENDER BARIS ---
            tableHTML += `
                <tr data-uid="${userId}">
                    <td>${user.fullname || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${dropdownHTML}</td> <td>${date}</td>
                    <td>
                        <button class="approve-btn action-btn" data-uid="${userId}" data-action="approve">Approve</button>
                        <button class="reject-btn action-btn" data-uid="${userId}" data-action="reject">Reject</button>
                    </td>
                </tr>
            `;
        });
        
        usersTableBody.innerHTML = tableHTML;
        
    } catch (error) {
        console.error("Error fetching pending users:", error);
        usersTableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Gagal memuat data: ${error.message}</td></tr>`;
        window.showToast('Gagal memuat data user pending.', 'error');
    }
}

// 3. FUNGSI HANDLE AKSI (APPROVE/REJECT)
async function handleAction(button, userId, action) {
    const originalText = button.textContent;
    const isApprove = action === 'approve';
    
    // 1. AKTIFKAN LOADING STATE PADA TOMBOL
    setButtonLoadingState(button, true, isApprove ? 'Memproses...' : 'Menolak...', originalText);

    try {
        const docRef = db.collection('users').doc(userId);
        
        if (isApprove) {
            // Ambil nilai Role dari dropdown di baris yang sama
            const row = button.closest('tr');
            const roleSelect = row.querySelector('.role-dropdown');
            const selectedRole = roleSelect ? roleSelect.value : 'Marketing'; // Default fallback
            
            await docRef.update({
                status_persetujuan: 'Approved',
                id_role: selectedRole, // Set Role yang dipilih
                is_active: true,
                approved_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            window.showToast(`User ${userId} berhasil disetujui sebagai ${selectedRole}!`, 'success');

        } else if (action === 'reject') {
            await docRef.update({
                status_persetujuan: 'Rejected',
                is_active: false,
                rejected_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            window.showToast(`User ${userId} berhasil ditolak.`, 'error');
        }

        // 2. KUNCI SUKSES: Muat ulang daftar user. 
        // Ini akan merender ulang <tbody> TANPA user yang baru di-approve/reject.
        fetchPendingUsers(); 

    } catch (error) {
        console.error("Error updating user status:", error);
        window.showToast(`Gagal memproses aksi: ${error.message}`, 'error');
        
        // 3. KEMBALIKAN TOMBOL KE KEADAAN SEMULA JIKA GAGAL
        setButtonLoadingState(button, false, isApprove ? 'Memproses...' : 'Menolak...', originalText);
    }
}

// 4. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // 1. Muat user pending saat DOM siap
    fetchPendingUsers();

    // 2. Tambahkan event listener untuk tombol di tabel (delegasi event)
    if (usersTableBody) {
        usersTableBody.addEventListener('click', (event) => {
            const target = event.target;
            
            // Cek apakah yang diklik adalah tombol Approve atau Reject (berdasarkan class .action-btn)
            if (target.tagName === 'BUTTON' && target.classList.contains('action-btn')) 
            {
                const userId = target.getAttribute('data-uid');
                const action = target.getAttribute('data-action');
                
                if (userId && action) {
                    handleAction(target, userId, action);
                }
            }
        });
    }
});