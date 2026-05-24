// Helper: Toggle password visibility
function togglePassword(fieldId, iconId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);
    if (field.type === "password") {
        field.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        field.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// Toast notification system
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Terms & Privacy policy handlers
function showTerms() {
    showToast("📜 Terms of Service: By using EduPulse you agree to our academic community guidelines.");
}

function showPrivacy() {
    showToast("🔒 Privacy Policy: Your data is protected and never shared without consent.");
}

// DOM Elements
const roleSelect = document.getElementById('role');
const institutionGroup = document.getElementById('institutionGroup');
const dynamicContainer = document.getElementById('dynamicFieldsContainer');
const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');

// Clear dynamic fields container
function clearDynamicFields() {
    dynamicContainer.innerHTML = '';
}

// Render role-specific fields
function updateRoleSpecificFields() {
    const selectedRole = roleSelect.value;
    
    // Handle Institution visibility - only for Faculty Member
    if (selectedRole === 'faculty') {
        institutionGroup.style.display = 'block';
    } else {
        institutionGroup.style.display = 'none';
        const institutionField = document.getElementById('institution');
        if (institutionField) institutionField.value = '';
    }
    
    // Clear and render dynamic fields based on role
    clearDynamicFields();
    
    if (selectedRole === 'student') {
        // Student fields: GPA, Academic Level, Major
        const studentHTML = `
            <div class="input-group full dynamic-field">
                <label for="gpa">GPA (0.0 - 4.0)</label>
                <div class="input-wrapper">
                    <i class="fas fa-chart-line input-icon"></i>
                    <input type="number" step="0.01" id="gpa" placeholder="e.g., 3.75" min="0" max="4.0">
                </div>
            </div>
            <div class="input-group full dynamic-field">
                <label for="academicLevel">Academic Level</label>
                <div class="input-wrapper">
                    <i class="fas fa-graduation-cap input-icon"></i>
                    <select id="academicLevel">
                        <option value="">Select academic level</option>
                        <option value="freshman">Freshman</option>
                        <option value="sophomore">Sophomore</option>
                        <option value="junior">Junior</option>
                        <option value="senior">Senior</option>
                        <option value="masters">Master's</option>
                        <option value="phd">PhD</option>
                    </select>
                </div>
            </div>
            <div class="input-group full dynamic-field">
                <label for="major">Major / Field of Study</label>
                <div class="input-wrapper">
                    <i class="fas fa-book input-icon"></i>
                    <input type="text" id="major" placeholder="e.g., Computer Science, Business">
                </div>
            </div>
        `;
        dynamicContainer.insertAdjacentHTML('beforeend', studentHTML);
    } 
    else if (selectedRole === 'employer') {
        // Training Provider fields: Company Name, Industry, Contact Email
        const employerHTML = `
            <div class="input-group full dynamic-field">
                <label for="companyName">Company Name</label>
                <div class="input-wrapper">
                    <i class="fas fa-building input-icon"></i>
                    <input type="text" id="companyName" placeholder="Enter your company/organization name">
                </div>
            </div>
            <div class="input-group full dynamic-field">
                <label for="industry">Industry</label>
                <div class="input-wrapper">
                    <i class="fas fa-industry input-icon"></i>
                    <input type="text" id="industry" placeholder="e.g., Technology, Healthcare, Finance">
                </div>
            </div>
            <div class="input-group full dynamic-field">
                <label for="contactEmail">Contact Email (Work)</label>
                <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon"></i>
                    <input type="email" id="contactEmail" placeholder="professional@company.com">
                </div>
            </div>
        `;
        dynamicContainer.insertAdjacentHTML('beforeend', employerHTML);
    }
    else if (selectedRole === 'supervisor') {
        // Academic Supervisor - informational message (no required fields)
        const supervisorInfo = document.createElement('div');
        supervisorInfo.className = 'dynamic-field';
        supervisorInfo.style.padding = '0.75rem 1rem';
        supervisorInfo.style.background = '#f8fafc';
        supervisorInfo.style.borderRadius = '0.75rem';
        supervisorInfo.style.marginBottom = '1rem';
        supervisorInfo.style.fontSize = '0.85rem';
        supervisorInfo.style.color = '#1e293b';
        supervisorInfo.style.border = '1px solid #e2e8f0';
        supervisorInfo.innerHTML = '<i class="fas fa-chalkboard-teacher" style="margin-right: 8px;"></i> Supervisor role: You will guide academic projects and mentor students.';
        dynamicContainer.appendChild(supervisorInfo);
    }
}

// Form validation and submission
function handleSignup(event) {
    if (event) event.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('terms').checked;
    
    // Basic validation
    if (!firstName || !lastName) {
        showToast("Please enter your full name.", true);
        return;
    }
    
    if (!email) {
        showToast("Email address is required.", true);
        return;
    }
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", true);
        return;
    }
    
    if (!role) {
        showToast("Please select your role.", true);
        return;
    }
    
    // Institution validation (only for faculty)
    if (role === 'faculty') {
        const institution = document.getElementById('institution').value.trim();
        if (!institution) {
            showToast("Please enter your Institution / Organization name.", true);
            return;
        }
    }
    
    // Student-specific validation
    if (role === 'student') {
        const gpa = document.getElementById('gpa')?.value.trim();
        const academicLevel = document.getElementById('academicLevel')?.value;
        const major = document.getElementById('major')?.value.trim();
        
        if (!gpa) {
            showToast("Please enter your GPA.", true);
            return;
        }
        
        const gpaNum = parseFloat(gpa);
        if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
            showToast("GPA must be between 0.0 and 4.0.", true);
            return;
        }
        
        if (!academicLevel) {
            showToast("Please select your academic level.", true);
            return;
        }
        
        if (!major) {
            showToast("Please enter your major / field of study.", true);
            return;
        }
    }
    
    // Training Provider validation
    if (role === 'employer') {
        const companyName = document.getElementById('companyName')?.value.trim();
        const industry = document.getElementById('industry')?.value.trim();
        const contactEmail = document.getElementById('contactEmail')?.value.trim();
        
        if (!companyName) {
            showToast("Please enter your company name.", true);
            return;
        }
        
        if (!industry) {
            showToast("Please enter your industry.", true);
            return;
        }
        
        if (!contactEmail) {
            showToast("Please enter a contact email for your organization.", true);
            return;
        }
        
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(contactEmail)) {
            showToast("Please enter a valid contact email address.", true);
            return;
        }
    }
    
    // Password validation
    if (!password) {
        showToast("Please create a password.", true);
        return;
    }
    
    if (password.length < 6) {
        showToast("Password must be at least 6 characters long.", true);
        return;
    }
    
    if (password !== confirmPassword) {
        showToast("Passwords do not match.", true);
        return;
    }
    
    if (!termsChecked) {
        showToast("You must agree to the Terms of Service and Privacy Policy.", true);
        return;
    }
    
    // Show loading state
    signupBtn.classList.add('loading');
    signupBtn.disabled = true;
    
    // Collect user data for submission
    const userData = {
        firstName,
        lastName,
        email,
        role,
        termsAccepted: true,
        timestamp: new Date().toISOString()
    };
    
    // Add role-specific data
    if (role === 'faculty') {
        userData.institution = document.getElementById('institution').value.trim();
    }
    if (role === 'student') {
        userData.gpa = document.getElementById('gpa').value.trim();
        userData.academicLevel = document.getElementById('academicLevel').value;
        userData.major = document.getElementById('major').value.trim();
    }
    if (role === 'employer') {
        userData.companyName = document.getElementById('companyName').value.trim();
        userData.industry = document.getElementById('industry').value.trim();
        userData.contactEmail = document.getElementById('contactEmail').value.trim();
    }
    if (role === 'supervisor') {
        userData.supervisorNote = "Academic Supervisor";
    }
    
    console.log("Signup Data:", userData);
    
    // Simulate API call
    setTimeout(() => {
        showToast(`✅ Welcome ${firstName}! Your account has been created successfully.`);
        
        // Reset button after delay
        setTimeout(() => {
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
            // Optionally redirect to login page
            // window.location.href = "login.html";
        }, 1500);
    }, 800);
}

// Event listeners
roleSelect.addEventListener('change', updateRoleSpecificFields);
signupForm.addEventListener('submit', handleSignup);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateRoleSpecificFields();
});