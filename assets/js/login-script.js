// assets/js/login-script.js

// 1. INISIALISASI FIREBASE & HOOKS
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

const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-button'); 

// 2. FUNGSI UTAMA: HANDLE LOGIN
const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginButton) return; 

    // Ambil data dari form
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // --- VALIDASI AWAL ---
    if (!email || !password) {
        showToast('Email dan Password wajib diisi!', 'error');
        return;
    }

    // TAMPILKAN LOADING STATE
    window.setLoadingState(loginButton, true, 'Masuk...', 'Login');

    try {
        // 1. Login dengan Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userUID = userCredential.user.uid;
        
        // 2. Ambil data user dari Firestore
        const userDoc = await db.collection('users').doc(userUID).get();
        
        if (!userDoc.exists) {
             showToast('Data user tidak ditemukan di database.', 'error');
             await auth.signOut();
             return; // Keluar dari proses
        }

        const userData = userDoc.data();

        // 3. Cek status persetujuan (Admin Approval)
        if (userData.status_persetujuan !== 'Approved') {
             await auth.signOut(); // Log out user yang belum diapprove
             showToast('Akun Anda belum disetujui Admin. Silakan tunggu.', 'error');
             return;
        }

        // 4. Login Berhasil: Simpan data ke Local Storage
        localStorage.setItem('userUID', userUID);
        localStorage.setItem('userRole', userData.id_role);
        localStorage.setItem('isLoggedIn', 'true');

        showToast('Login Berhasil!', 'success');
        
        // 5. REDIRECT BERDASARKAN ROLE
        setTimeout(() => {
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'Admin') {
                window.location.href = 'admin-approval.html'; 
            } else {
                window.location.href = 'dashboard.html'; 
            }
        }, 1500);
        
        // Catatan: Loading state akan di-reset oleh redirect.
        // Jika redirect cepat, ini tidak masalah.

    } catch (error) {
        console.error("Login Error:", error);
        let errorMessage = 'Login gagal. Cek email dan password Anda.';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Password salah.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Akun tidak terdaftar.';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'Format email tidak valid.';
        }
        showToast(errorMessage, 'error');

    } finally {
        // HENTIKAN LOADING STATE jika ada error dan tidak terjadi redirect
        if (window.location.href.endsWith('index.html') || window.location.href.endsWith('/')) {
            window.setLoadingState(loginButton, false, 'Masuk...', 'Login');
        }
    }
};

// 3. HOOK UP DOM
if (loginForm) {
    // Tombol Login sudah memiliki teks 'Login' di HTML
    loginForm.addEventListener('submit', handleLogin);
}