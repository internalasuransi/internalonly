// assets/js/signup-script.js

// =================================================================
// 1. INISIALISASI FIREBASE (WAJIB DIGANTI DENGAN CONFIG ANDA)
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCzKWKanXp34LkluGAA6zJwwyr5unhTlAI",
  authDomain: "internal-asuransi.firebaseapp.com",
  projectId: "internal-asuransi",
  storageBucket: "internal-asuransi.firebasestorage.app",
  messagingSenderId: "548382017288",
  appId: "1:548382017288:web:6cd13753a3388162b6cebd",
  measurementId: "G-6FVCS2EXR5"
};

// Inisialisasi Aplikasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =================================================================
// 2. FUNGSI TOAST MESSAGE (untuk notifikasi di kanan bawah)
// =================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    if (!container) {
        // Fallback ke alert bawaan jika container tidak ditemukan
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    const toast = document.createElement('div');
    
    // Styling dasar
    let bgColor = '#4CAF50'; 
    let icon = 'ri-check-line';
    if (type === 'error') {
        bgColor = '#F44336';
        icon = 'ri-close-line';
    } else if (type === 'info') {
        bgColor = '#2196F3';
        icon = 'ri-information-line';
    }

    // Menggunakan kelas untuk styling (jika CSS sudah ada) atau style inline
    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.5s, transform 0.5s;
        transform: translateX(100%);
    `;
    
    toast.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${message}`;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}


// =================================================================
// 3. FUNGSI HANDLE SIGNUP (Membuat User & Profil Firestore)
// =================================================================
const handleSignup = async (event) => {
    event.preventDefault(); 
    
    // Ambil nilai input berdasarkan ID di signup.html
    const fullnameInput = document.getElementById('fullname-input').value; 
    const whatsappInput = document.getElementById('whatsapp-input').value; 
    const emailInput = document.getElementById('email-input').value; 
    const passwordInput = document.getElementById('password-input').value;
    
    // Validasi input
    if (!emailInput || !passwordInput || !fullnameInput || !whatsappInput) {
        showToast('Semua field wajib diisi!', 'error');
        return;
    }

    try {
        // 1. Buat User di Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(emailInput, passwordInput);
        const userUID = userCredential.user.uid;

        // 2. Simpan Profil User ke Koleksi 'users' di Firestore
        await db.collection('users').doc(userUID).set({
            uid: userUID,
            fullname: fullnameInput,
            whatsapp: whatsappInput,
            email: emailInput,
            // Status Default untuk user baru:
            id_role: "", // <-- Peran default
            is_active: false,
            status_persetujuan: "Pending", // Admin harus menyetujui dulu
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Beri Feedback Sukses & Redirect
        showToast('Pendaftaran Berhasil! Menunggu persetujuan Admin.', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html'; // Kembali ke halaman login
        }, 3000);

    } catch (error) {
        console.error("Signup Error:", error);
        let errorMessage = 'Pendaftaran Gagal. Cek email/password.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email sudah terdaftar.';
        } else if (error.code === 'auth/weak-password') {
             errorMessage = 'Password minimal 6 karakter.';
        }
        showToast(errorMessage, 'error');
    }
};


// =================================================================
// 4. HOOK UP DOM (Menghubungkan fungsi ke form)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan Anda sudah menambahkan id="signup-form" ke tag <form> Anda
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});