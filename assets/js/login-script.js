// assets/js/login-script.js

// 1. INISIALISASI FIREBASE (Sama seperti signup)
const firebaseConfig = {
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

// 2. FUNGSI TOAST MESSAGE (Salin dari signup-script.js)
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

// 3. FUNGSI HANDLE LOGIN
const handleLogin = async (event) => {
    event.preventDefault(); 
    
    // Ambil nilai input
    const emailInput = document.getElementById('login-email').value;
    const passwordInput = document.getElementById('login-password').value;
    
    if (!emailInput || !passwordInput) {
        showToast('Email dan Password wajib diisi!', 'error');
        return;
    }

    try {
        // 1. Login dengan Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(emailInput, passwordInput);
        const userUID = userCredential.user.uid;

        // 2. Ambil data profil dari Firestore
        const userDoc = await db.collection('users').doc(userUID).get();
        
        if (!userDoc.exists) {
            // Seharusnya tidak terjadi jika signup berhasil
            showToast('Profil user tidak ditemukan.', 'error');
            auth.signOut(); // Log out user yang baru login
            return;
        }

        const userData = userDoc.data();

        // 3. Periksa Status Persetujuan
        if (userData.status_persetujuan !== 'Approved') {
            showToast('Akun Anda masih Menunggu Persetujuan Admin.', 'info');
            auth.signOut(); // Log out user yang tidak disetujui
            return;
        }

        // 4. Login Berhasil & Redirect ke Dashboard
        showToast('Login Berhasil!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html'; // Arahkan ke dashboard
        }, 1500);

    } catch (error) {
        console.error("Login Error:", error);
        let errorMessage = 'Login Gagal. Cek kredensial Anda.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Email atau Password salah.';
        }
        showToast(errorMessage, 'error');
    }
};


// 4. HOOK UP DOM (Menghubungkan fungsi ke form)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});