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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const loginForm = document.getElementById('login-form');
// PERHATIKAN: Cek index.html lo, pastikan ID tombolnya 'login-button'
const loginButton = document.getElementById('login-button'); 
// Asumsi ID input: login-email & login-password

// 2. FUNGSI UTAMA: HANDLE LOGIN
const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginButton) return; 

    // Ambil data dari form
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // --- VALIDASI AWAL ---
    if (!email || !password) {
        showToast('Email dan Password wajib diisi!', 'error');
        return; // Tombol masih enabled, jadi aman return di sini.
    }

    // TAMPILKAN LOADING STATE
    window.setLoadingState(loginButton, true, 'Masuk...', 'Log In');

    try {
        // 1. Login dengan Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userUID = userCredential.user.uid;

        // 2. Ambil data user dari Firestore untuk cek status persetujuan
        const userDoc = await db.collection('users').doc(userUID).get();
        
        if (!userDoc.exists) {
            throw new Error('User data not found in database.');
        }

        const userData = userDoc.data();
        
        // 3. Cek status persetujuan (Admin Approval)
        if (userData.status_persetujuan !== 'Approved') {
             await auth.signOut();
             showToast('Akun Anda belum disetujui Admin. Silakan tunggu.', 'error');
             window.setLoadingState(loginButton, false, 'Masuk...', 'Log In'); 
             return;
        }

        // 4. JIKA SUKSES DAN APPROVED: Simpan data di Local Storage
        localStorage.setItem('userUID', userUID); 
        localStorage.setItem('userRole', userData.id_role);
        localStorage.setItem('isLoggedIn', 'true');

        showToast(`Selamat datang!`, 'success');
        
        // 5. Redirect ke Dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000); 

    } catch (error) {
        console.error("Login Error:", error);
        let errorMessage = 'Login gagal. Cek email dan password Anda.';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Kredensial salah. Cek Email dan Password.';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'Format email tidak valid.';
        }
        
        showToast(errorMessage, 'error');

    } finally {
        // Jaring pengaman: RESET LOADING jika ada error dan tidak terjadi redirect
        if (window.location.href.endsWith('index.html') || window.location.href.endsWith('/')) {
            window.setLoadingState(loginButton, false, 'Masuk...', 'Log In');
        }
    }
};

// 3. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // === PERBAIKAN UTAMA DI SINI ===
    if (loginButton) {
        // Ambil teks asli dari tombol.
        const originalText = loginButton.textContent.trim() || 'Log In'; 
        
        // PAKSA TOMBOL AKTIF SAAT LOAD, MENGATASI BROWSER CACHING
        window.setLoadingState(loginButton, false, 'Masuk...', originalText);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});