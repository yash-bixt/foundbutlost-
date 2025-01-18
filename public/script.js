import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { 
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

import { firebaseConfig } from './config.js';
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Functions
function switchTab(type) {
    const studentTab = document.getElementById('studentTab');
    const adminTab = document.getElementById('adminTab');
    const studentLoginForm = document.getElementById('studentLoginForm');
    const studentRegisterForm = document.getElementById('studentRegisterForm');
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (type === 'student') {
        studentTab.classList.add('active');
        adminTab.classList.remove('active');
        studentLoginForm.classList.add('active');
        adminLoginForm.classList.remove('active');
        studentRegisterForm.classList.remove('active');
    } else {
        adminTab.classList.add('active');
        studentTab.classList.remove('active');
        adminLoginForm.classList.add('active');
        studentLoginForm.classList.remove('active');
        studentRegisterForm.classList.remove('active');
    }
}

function toggleStudentForms() {
    const loginForm = document.getElementById('studentLoginForm');
    const registerForm = document.getElementById('studentRegisterForm');
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

// Authentication Functions
async function login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user is a student
        const userDoc = await getDoc(doc(db, 'students', user.uid));
        if (!userDoc.exists()) {
            await signOut(auth);
            alert('No student account found with these credentials');
            return;
        }

        alert('Login successful!');
        window.location.href = "student.html"; // Redirect to custom dashboard
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert('Invalid email or password');
        } else {
            alert('Error: ' + error.message);
        }
    }
}

async function loginAdmin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    const defaultAdminEmail = 'snusecurity@snu.edu.in';
    const defaultAdminPassword = 'iamadmin';

    if (email === defaultAdminEmail && password === defaultAdminPassword) {
        alert('Admin login successful!');
        window.location.href = "admin.html"; // Redirect to admin dashboard
    } else {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check if user is an admin
            const userDoc = await getDoc(doc(db, 'admins', user.uid));
            if (!userDoc.exists()) {
                await signOut(auth);
                alert('No admin account found with these credentials');
                return;
            }

            alert('Admin login successful!');
            window.location.href = "admin.html"; // Redirect to admin dashboard
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                alert('Invalid email or password');
            } else {
                alert('Error: ' + error.message);
            }
        }
    }
}

async function signUp(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    const rollNumber = document.getElementById('registerRoll').value;

    if (!email || !password || !name || !rollNumber) {
        alert('Please fill in all fields');
        return;
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional student data
        await setDoc(doc(db, 'students', user.uid), {
            name: name,
            email: email,
            rollNumber: rollNumber,
            createdAt: new Date().toISOString()
        });

        alert('Registration successful! You can now login.');
        // Clear the form
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerRoll').value = '';
        // Switch back to login form
        toggleStudentForms();
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert('Email already registered. Please login instead.');
        } else {
            alert('Error: ' + error.message);
        }
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const studentTab = document.getElementById('studentTab');
    const adminTab = document.getElementById('adminTab');
    if (studentTab) studentTab.addEventListener('click', () => switchTab('student'));
    if (adminTab) adminTab.addEventListener('click', () => switchTab('admin'));

    // Form toggle
    const toggleLinks = document.querySelectorAll('.toggle-link');
    toggleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleStudentForms();
        });
    });

    // Get all buttons
    const studentLoginButton = document.querySelector('#studentLoginForm .submit-button');
    const adminLoginButton = document.querySelector('#adminLoginForm .submit-button');
    const signUpButton = document.querySelector('#studentRegisterForm .submit-button');

    // Add event listeners to buttons
    if (studentLoginButton) studentLoginButton.addEventListener('click', login);
    if (adminLoginButton) adminLoginButton.addEventListener('click', loginAdmin);
    if (signUpButton) signUpButton.addEventListener('click', signUp);
});
