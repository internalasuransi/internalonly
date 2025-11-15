// assets/js/signup-script.js

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

const signupForm = document.getElementById('signup-form');
// MENGAMBIL TOMBOL BERDASARKAN CLASS KARENA TIDAK ADA ID DI HTML
// Catatan: Jika form ditemukan, ambil tombol di dalamnya.
const signupButton = signupForm ? signupForm.querySelector('.login__button') : null; 

// 2. FUNGSI UTAMA: HANDLE SIGN UP
const handleSignUp = async (event) => {
    event.preventDefault();

    // Cek tombol dan form di awal fungsi
    if (!signupButton || !signupForm) {
        console.error("Form or button element not found. Check HTML IDs.");
        return; 
    }
    
    // Ambil data dari form (Menggunakan ID input field dari HTML yang lo berikan)
    const fullname = document.getElementById('fullname-input').value.trim();
    const whatsapp = document.getElementById('whatsapp-input').value.trim(); 
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    // --- VALIDASI AWAL (Client-side) ---
    if (!fullname || !whatsapp || !email || !password) {
        showToast('Semua kolom wajib diisi!', 'error');
        // Tombol belum di-disabled, jadi aman return di sini.
        return;
    }
    if (password.length < 6) {
        showToast('Password minimal 6 karakter.', 'error');
        return;
    }
    
    // TAMPILKAN LOADING STATE
    window.setLoadingState(signupButton, true, 'Mendaftar...', 'Daftar Sekarang');

    try {
        // 1. Buat user di Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userUID = userCredential.user.uid;

        // 2. Simpan data user ke Firestore 
        await db.collection('users').doc(userUID).set({
            fullname: fullname,
            email: email,
            whatsapp: whatsapp, 
            id_role: 'Marketing', 
            status_persetujuan: 'Pending', 
            is_active: true, 
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });

        showToast('Pendaftaran Berhasil! Menunggu persetujuan Admin.', 'success');
        
        // 3. Redirect ke halaman login setelah daftar
        setTimeout(() => {
            window.location.href = 'index.html'; 
        }, 3000);

    } catch (error) {
        console.error("Signup Error:", error);
        let errorMessage = 'Pendaftaran gagal.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email sudah terdaftar.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password terlalu lemah (min. 6 karakter).';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'Format email tidak valid.';
        }
        showToast(errorMessage, 'error');
        
        // RESET LOADING STATE JIKA ERROR
        window.setLoadingState(signupButton, false, 'Mendaftar...', 'Daftar Sekarang');
    } 
};

// 3. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // A. Fix bug tombol disabled saat initial load
    if (signupButton) {
        // Teks asli adalah "Daftar Sekarang" dari HTML
        const originalText = signupButton.textContent.trim() || 'Daftar Sekarang'; 
        window.setLoadingState(signupButton, false, 'Mendaftar...', originalText);
    }
    
    // B. Tambahkan Event Listener
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
});