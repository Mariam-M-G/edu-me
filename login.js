// login.js - Interactive features for login page

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const loginBtn = document.querySelector('.login-btn');
    
    // Simple validation
    if (!email || !password) {
        showToast('Please enter both email and password', true);
        
        if (!email) {
            document.getElementById('email').classList.add('error');
        }
        if (!password) {
            document.getElementById('password').classList.add('error');
        }
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', true);
        document.getElementById('email').classList.add('error');
        return;
    }
    
    // Remove error class if present
    document.getElementById('email').classList.remove('error');
    document.getElementById('password').classList.remove('error');
    
    // Show loading state
    loginBtn.classList.add('loading');
    
    // Simulate API call
    setTimeout(function() {
        loginBtn.classList.remove('loading');
        
        if (email === 'demo@edupulse.com' && password === 'demo123') {
            showToast('Login successful! Redirecting...', false);
            
            // Store remember me preference
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Redirect to dashboard after 1.5 seconds
            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showToast('Invalid email or password. Try demo@edupulse.com / demo123', true);
        }
    }, 1000);
}

// Show toast notification
let toastTimeout = null;

function showToast(message, isError) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    
    toast.classList.remove('show');
    toast.textContent = message;
    
    if (isError) {
        toast.style.background = 'linear-gradient(135deg, #e76f51, #e63946)';
    } else {
        toast.style.background = '#14556f';
    }
    
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);
    
    toastTimeout = setTimeout(function() {
        toast.classList.remove('show');
        toastTimeout = null;
    }, 3000);
}

// Show forgot password message
function showForgotPassword() {
    showToast('Password reset link has been sent to your email', false);
}

// Social login simulation
function socialLogin(provider) {
    showToast('Connecting with ' + provider.charAt(0).toUpperCase() + provider.slice(1) + '...', false);
    
    setTimeout(function() {
        showToast(provider.charAt(0).toUpperCase() + provider.slice(1) + ' login coming soon!', false);
    }, 1500);
}

// Show signup message
function showSignup() {
    showToast('Account creation portal coming soon!', false);
}

// Load remembered email on page load
document.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
    
    // Remove error class on input focus
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(function(input) {
        input.addEventListener('focus', function() {
            this.classList.remove('error');
        });
    });
});