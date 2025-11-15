// assets/js/users-logic.js

// Pastikan firebase sudah diinisialisasi di dashboard.js
const db = firebase.firestore();
const usersCollection = db.collection('users');
const rolesCollection = db.collection('roles');

// DOM Elements
const usersTableBody = document.querySelector('#users-table tbody');
const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');
const btnAddUser = document.getElementById('btn-add-user');
const passwordInput = document.getElementById('password');
const passwordLabel = document.getElementById('password-label');
const roleSelect = document.getElementById('role');


// =========================================================
// 1. FUNGSI PENGATURAN DATA FIREBASE
// =========================================================

/**
 * Mengambil dan mengisi data Role ke dalam dropdown.
 */
async function loadRoles() {
    try {
        const snapshot = await rolesCollection.get();
        // Hapus opsi lama
        roleSelect.innerHTML = '<option value="" disabled selected>Pilih Role</option>';
        
        snapshot.forEach(doc => {
            const role = doc.data();
            const option = document.createElement('option');
            // ID dokumen adalah ID role (e.g., 'Admin', 'Marketing')
            option.value = doc.id; 
            option.textContent = role.name || doc.id;
            roleSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading roles:", error);
        alert('Gagal memuat daftar Role.');
    }
}

/**
 * Mengambil data User dan menampilkannya di tabel.
 */
async function loadUsers() {
    usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center loading-message">Memuat data pengguna...</td></tr>';
    
    try {
        const snapshot = await usersCollection.get();
        let html = '';
        let count = 1;

        if (snapshot.empty) {
            html = '<tr><td colspan="6" class="text-center">Tidak ada data pengguna.</td></tr>';
        } else {
            snapshot.forEach(doc => {
                const user = doc.data();
                html += `
                    <tr data-id="${doc.id}">
                        <td>${count++}</td>
                        <td>${user.displayName || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.id_role || 'Visitor'}</td>
                        <td><span class="status-${user.status_persetujuan}">${user.status_persetujuan || 'Pending'}</span></td>
                        <td>
                            <button class="btn btn-edit" data-id="${doc.id}" data-action="edit">Edit</button>
                            <button class="btn btn-delete" data-id="${doc.id}" data-action="delete">Hapus</button>
                        </td>
                    </tr>
                `;
            });
        }
        usersTableBody.innerHTML = html;
    } catch (error) {
        console.error("Error loading users:", error);
        usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center error-message">Gagal memuat data pengguna.</td></tr>';
    }
}


// =========================================================
// 2. FUNGSI CRUD LOGIC
// =========================================================

/**
 * Menampilkan modal form.
 * @param {string} mode 'add' atau 'edit'
 * @param {Object} data Data user jika mode 'edit'
 */
function openModal(mode, data = {}) {
    userForm.reset();
    userForm.setAttribute('data-mode', mode);

    if (mode === 'add') {
        modalTitle.textContent = 'Tambah User Baru';
        document.getElementById('user-id').value = '';
        passwordInput.required = true;
        passwordInput.style.display = 'block';
        passwordLabel.style.display = 'block';
    } else { // 'edit'
        modalTitle.textContent = 'Edit User: ' + data.displayName;
        document.getElementById('user-id').value = data.uid;
        document.getElementById('display-name').value = data.displayName;
        document.getElementById('email').value = data.email;
        document.getElementById('role').value = data.id_role;
        document.getElementById('status-persetujuan').value = data.status_persetujuan;

        // Password tidak required/ditampilkan saat Edit
        passwordInput.required = false;
        passwordInput.style.display = 'none';
        passwordLabel.style.display = 'none';
    }

    userModal.style.display = 'flex';
}

/**
 * Menutup modal.
 */
function closeModal() {
    userModal.style.display = 'none';
}

/**
 * Menangani submit form (Add/Edit).
 */
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = userForm.getAttribute('data-mode');
    const userId = document.getElementById('user-id').value;
    
    const data = {
        displayName: document.getElementById('display-name').value,
        email: document.getElementById('email').value,
        id_role: document.getElementById('role').value,
        status_persetujuan: document.getElementById('status-persetujuan').value
    };

    try {
        if (mode === 'add') {
            const password = passwordInput.value;
            if (!password) {
                alert("Password wajib diisi untuk user baru.");
                return;
            }
            // Logika Add User:
            // Karena Firebase SDK Client tidak mengizinkan kita membuat user 
            // dengan email/password secara langsung (demi keamanan), 
            // Di implementasi nyata, ini HARUS memanggil Cloud Function/API Endpoint
            // untuk membuat user di Firebase Auth lalu menyimpannya di Firestore.
            alert('Fitur Tambah User sementara dinonaktifkan. Silakan tambahkan user via Firebase Console lalu Edit datanya di sini.');
            // Jika Anda sudah menyiapkan Cloud Function:
            // await fetch('/api/create-user', { method: 'POST', body: JSON.stringify({...data, password}) });

        } else { // mode === 'edit'
            // Logika Edit User (hanya update data Firestore)
            await usersCollection.doc(userId).update(data);
            alert('Data user berhasil diperbarui!');
        }
        
        closeModal();
        loadUsers(); // Refresh tabel
    } catch (error) {
        console.error(`Error ${mode}ing user:`, error);
        alert(`Gagal ${mode === 'add' ? 'menambah' : 'mengedit'} user: ${error.message}`);
    }
});

/**
 * Menangani aksi Edit dan Delete dari tombol di tabel.
 */
usersTableBody.addEventListener('click', async (e) => {
    const action = e.target.getAttribute('data-action');
    const userId = e.target.getAttribute('data-id');

    if (action === 'edit') {
        try {
            const doc = await usersCollection.doc(userId).get();
            if (doc.exists) {
                const userData = { uid: doc.id, ...doc.data() };
                openModal('edit', userData);
            }
        } catch (error) {
            console.error("Error fetching user data for edit:", error);
            alert('Gagal mengambil data user.');
        }

    } else if (action === 'delete') {
        if (confirm('Anda yakin ingin menghapus user ini?')) {
            try {
                // Logika Delete User:
                // Sama seperti Add, untuk menghapus dari Firebase Auth HARUS melalui Cloud Function/API.
                // Di sini kita hanya menghapus dari Firestore.
                await usersCollection.doc(userId).delete();
                alert('User berhasil dihapus (dari Firestore)!');
                loadUsers(); // Refresh tabel
            } catch (error) {
                console.error("Error deleting user:", error);
                alert(`Gagal menghapus user: ${error.message}`);
            }
        }
    }
});


// =========================================================
// 3. INISIALISASI
// =========================================================

// Event listener untuk tombol Tambah User
btnAddUser.addEventListener('click', () => openModal('add'));

// Event listener untuk tombol Tutup Modal
document.querySelectorAll('.close-modal, .close-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Panggil fungsi utama saat script dimuat
loadRoles();
loadUsers();