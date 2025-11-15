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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const signupForm = document.getElementById('signup-form');
const signupButton = document.getElementById('signup-button'); 

// 2. FUNGSI UTAMA: HANDLE SIGN UP
const handleSignUp = async (event) => {
    event.preventDefault();

    if (!signupButton) return;
    
    // Ambil data dari form (Hanya ambil SATU field password)
    const fullname = document.getElementById('signup-fullname').value;
    const whatsapp = document.getElementById('signup-whatsapp').value; // Asumsi lo punya ID ini
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // --- VALIDASI AWAL ---
    // (Menghapus pengecekan passwordConfirm yang tidak ada)
    if (!fullname || !whatsapp || !email || !password) {
        showToast('Semua kolom wajib diisi!', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Password minimal 6 karakter.', 'error');
        return;
    }
    
    // TAMPILKAN LOADING STATE
    window.setLoadingState(signupButton, true, 'Mendaftar...', 'Daftar');

    try {
        // 1. Buat user di Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userUID = userCredential.user.uid;

        // 2. Simpan data user ke Firestore (dengan status Pending)
        await db.collection('users').doc(userUID).set({
            fullname: fullname,
            email: email,
            whatsapp: whatsapp, // Simpan nomor WhatsApp
            id_role: 'Marketing', // Role default
            status_persetujuan: 'Pending', // Status awal, menunggu Admin
            is_active: true, // Default aktif
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });

        showToast('Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan Admin.', 'success');
        
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
        
    } finally {
        // HENTIKAN LOADING STATE jika ada error dan tidak terjadi redirect
        if (window.location.href.endsWith('signup.html')) {
            window.setLoadingState(signupButton, false, 'Mendaftar...', 'Daftar');
        }
    }
};

// 3. HOOK UP DOM
if (signupForm) {
    signupForm.addEventListener('submit', handleSignUp);
}