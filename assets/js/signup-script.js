// assets/js/signup-script.js

// 1. INISIALISASI FIREBASE & HOOKS
const firebaseConfig = {
    apiKey: "AIzaSyCzKWKanXp34LkluGAA6zJwwyr5unhTlAI",
    authDomain: "internal-asuransi.firebaseapp.com",
    projectId: "internal-asuransi",
    // ... config lainnya
};

// Pastikan inisialisasi hanya sekali
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const signupForm = document.getElementById('signup-form');
const signupButton = document.getElementById('daftar-button') || document.getElementById('signup-button'); // Ambil salah satu ID tombol

// 2. FUNGSI UTAMA: HANDLE SIGN UP
const handleSignUp = async (event) => {
    event.preventDefault();

    if (!signupButton) {
        console.error("Signup button element not found.");
        return;
    }
    
    // Ambil data dari form
    const fullname = document.getElementById('signup-fullname').value.trim();
    // Asumsi ID WhatsApp adalah 'signup-whatsapp' sesuai data lo
    const whatsapp = document.getElementById('signup-whatsapp').value.trim(); 
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    // --- VALIDASI AWAL (Client-side) ---
    if (!fullname || !whatsapp || !email || !password) {
        showToast('Semua kolom wajib diisi!', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Password minimal 6 karakter.', 'error');
        return;
    }
    
    // TAMPILKAN LOADING STATE (Loading dimulai setelah semua validasi awal lolos)
    window.setLoadingState(signupButton, true, 'Mendaftar...', 'Daftar Sekarang');

    try {
        // 1. Buat user di Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userUID = userCredential.user.uid;

        // 2. Simpan data user ke Firestore (dengan status Pending)
        await db.collection('users').doc(userUID).set({
            fullname: fullname,
            email: email,
            whatsapp: whatsapp, 
            id_role: 'Marketing', // Role default
            status_persetujuan: 'Pending', // Status awal, menunggu Admin
            is_active: true, // Default aktif
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });

        showToast('Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan Admin.', 'success');
        
        // 3. Redirect ke halaman login setelah daftar
        // Tidak perlu set loading false di sini karena akan langsung redirect
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
        
        // HENTIKAN LOADING STATE jika terjadi error
        window.setLoadingState(signupButton, false, 'Mendaftar...', 'Daftar Sekarang');

    } 
    // Tidak perlu blok finally di sini karena loading state di-reset saat error,
    // dan tidak di-reset saat sukses (karena langsung redirect).
};

// 3. HOOK UP DOM
document.addEventListener('DOMContentLoaded', () => {
    // A. Fix bug tombol disabled saat initial load
    if (signupButton) {
        // Ambil teks asli dari tombol HTML (misal: "Daftar Sekarang")
        const originalText = signupButton.textContent.trim() || 'Daftar Sekarang'; 
        window.setLoadingState(signupButton, false, 'Mendaftar...', originalText);
    }
    
    // B. Tambahkan Event Listener
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
});