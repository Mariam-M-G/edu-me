// script.js - Modern Interactive Features for EduPulse

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollSpy();
    initSmoothScroll();
    initAnimations();
    initFormValidation();
    initMobileMenu();
    initPricingToggle();
    initPricingCards();
    initNavbarScroll();
});

// Navigation and Mobile Menu
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            const bars = document.querySelectorAll('.bar');
            if (bars.length > 0) {
                if (hamburger.classList.contains('active')) {
                    bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    bars[1].style.opacity = '0';
                    bars[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            }
        });
    }
}

// Close mobile menu when clicking a link
function initMobileMenu() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                const bars = document.querySelectorAll('.bar');
                bars.forEach(function(bar) {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });
}

// Scroll Spy
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Smooth scroll
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initAnimations() {
    const animatedElements = document.querySelectorAll('.vp-item, .step, .premium-card, .value-props, .steps-container');
    
    if (animatedElements.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(function(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // Animate progress bars
    const progressBars = document.querySelectorAll('.bar-fill');
    if (progressBars.length > 0) {
        const barObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = window.getComputedStyle(bar).width;
                    bar.style.width = '0';
                    setTimeout(function() {
                        bar.style.width = width;
                    }, 100);
                    barObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        
        progressBars.forEach(function(bar) {
            barObserver.observe(bar);
        });
    }
}

// Toast Message System
let toastTimeout = null;

function showToast(message, isError) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Clear existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
    
    // Remove show class first (reset animation)
    toast.classList.remove('show');
    
    // Set message and style
    toast.textContent = message;
    
    if (isError) {
        toast.style.background = 'linear-gradient(135deg, #e76f51, #e63946)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #1a6d8f, #2a9d8f)';
    }
    
    // Force display block
    toast.style.display = 'block';
    
    // Small delay to ensure DOM updates
    setTimeout(function() {
        // Add show class to display toast
        toast.classList.add('show');
    }, 10);
    
    // Set timeout to hide toast
    toastTimeout = setTimeout(function() {
        // Remove show class to hide
        toast.classList.remove('show');
        
        // Hide after transition
        setTimeout(function() {
            toast.style.display = 'none';
            // Reset background for next use
            toast.style.background = 'linear-gradient(135deg, #1a6d8f, #2a9d8f)';
        }, 300);
        
        toastTimeout = null;
    }, 3000);
}

// Form validation
function initFormValidation() {
    const contactForm = document.querySelector('.contact-right');
    if (contactForm) {
        const sendButton = contactForm.querySelector('button');
        if (sendButton) {
            const newButton = sendButton.cloneNode(true);
            sendButton.parentNode.replaceChild(newButton, sendButton);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                const nameInput = document.getElementById('contactName');
                const emailInput = document.getElementById('contactEmail');
                const orgInput = document.getElementById('contactOrg');
                const messageInput = document.getElementById('contactMsg');
                
                let isValid = true;
                
                const inputs = [nameInput, emailInput, orgInput, messageInput];
                for (var i = 0; i < inputs.length; i++) {
                    if (inputs[i]) inputs[i].style.borderColor = '#e2e8f0';
                }
                
                if (!nameInput || nameInput.value.trim() === '') {
                    if (nameInput) nameInput.style.borderColor = '#e76f51';
                    isValid = false;
                }
                
                if (!emailInput || emailInput.value.trim() === '' || !isValidEmail(emailInput.value)) {
                    if (emailInput) emailInput.style.borderColor = '#e76f51';
                    isValid = false;
                }
                
                if (!orgInput || orgInput.value.trim() === '') {
                    if (orgInput) orgInput.style.borderColor = '#e76f51';
                    isValid = false;
                }
                
                if (!messageInput || messageInput.value.trim() === '') {
                    if (messageInput) messageInput.style.borderColor = '#e76f51';
                    isValid = false;
                }
                
                if (isValid) {
                    if (nameInput) nameInput.value = '';
                    if (emailInput) emailInput.value = '';
                    if (orgInput) orgInput.value = '';
                    if (messageInput) messageInput.value = '';
                    showToast('✨ Message sent! We\'ll reply within 24 hours.', false);
                } else {
                    showToast('Please fill in all fields correctly', true);
                }
            });
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Global functions
function openLogin() {
    showToast('🔐 Login portal coming soon!', false);
}

function openSignup() {
    showToast('📝 Sign up for early access!', false);
}

function scrollToHowitworks() {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
        const offsetTop = howItWorksSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function handleContactSubmit() {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const orgInput = document.getElementById('contactOrg');
    const messageInput = document.getElementById('contactMsg');
    
    let isValid = true;
    
    const inputs = [nameInput, emailInput, orgInput, messageInput];
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i]) inputs[i].style.borderColor = '#e2e8f0';
    }
    
    if (!nameInput || nameInput.value.trim() === '') {
        if (nameInput) nameInput.style.borderColor = '#e76f51';
        isValid = false;
    }
    
    if (!emailInput || emailInput.value.trim() === '' || !isValidEmail(emailInput.value)) {
        if (emailInput) emailInput.style.borderColor = '#e76f51';
        isValid = false;
    }
    
    if (!orgInput || orgInput.value.trim() === '') {
        if (orgInput) orgInput.style.borderColor = '#e76f51';
        isValid = false;
    }
    
    if (!messageInput || messageInput.value.trim() === '') {
        if (messageInput) messageInput.style.borderColor = '#e76f51';
        isValid = false;
    }
    
    if (isValid) {
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (orgInput) orgInput.value = '';
        if (messageInput) messageInput.value = '';
        showToast('✨ Message sent! We\'ll reply within 24 hours.', false);
    } else {
        showToast('Please fill in all fields correctly', true);
    }
}

// Pricing Toggle
function initPricingToggle() {
    const toggleSwitch = document.getElementById('billingToggle');
    const monthlyLabels = document.querySelectorAll('.monthly-label');
    const yearlyLabels = document.querySelectorAll('.yearly-label');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function() {
            this.classList.toggle('yearly');
            
            monthlyLabels.forEach(function(label) {
                label.classList.toggle('active');
            });
            yearlyLabels.forEach(function(label) {
                label.classList.toggle('active');
            });
            
            monthlyPrices.forEach(function(price) {
                price.classList.toggle('hidden');
            });
            yearlyPrices.forEach(function(price) {
                price.classList.toggle('hidden');
            });
        });
    }
}

function initPricingCards() {
    const cards = document.querySelectorAll('.pricing-card');
    if (cards.length === 0) return;
    
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            cards.forEach(function(c) {
                if (c !== this) {
                    c.style.opacity = '0.7';
                }
            }.bind(this));
        });
        
        card.addEventListener('mouseleave', function() {
            cards.forEach(function(c) {
                c.style.opacity = '1';
            });
        });
    });
}

function selectPlan(plan) {
    const planNames = {
        basic: 'Basic Plan',
        advanced: 'Advanced Plan',
        premium: 'Premium Plan'
    };
    
    const toggleSwitch = document.getElementById('billingToggle');
    const isYearly = toggleSwitch ? toggleSwitch.classList.contains('yearly') : false;
    const billingPeriod = isYearly ? 'yearly' : 'monthly';
    
    showToast('✨ You selected ' + planNames[plan] + ' (' + billingPeriod + '). Our team will contact you shortly!', false);
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    });
}

// Parallax effect
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        hero.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
        hero.style.opacity = 1 - scrolled * 0.002;
    }
});

// Dashboard reveal
window.addEventListener('load', function() {
    const dashboard = document.querySelector('.dashboard-preview');
    if (dashboard) {
        dashboard.style.opacity = '0';
        dashboard.style.transform = 'translateY(30px)';
        setTimeout(function() {
            dashboard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            dashboard.style.opacity = '1';
            dashboard.style.transform = 'translateY(0)';
        }, 200);
    }
    
    const barFills = document.querySelectorAll('.bar-fill');
    barFills.forEach(function(bar) {
        if (bar.classList.contains('w86')) {
            bar.style.width = '86%';
        } else if (bar.classList.contains('w72')) {
            bar.style.width = '72%';
        } else if (bar.classList.contains('w91')) {
            bar.style.width = '91%';
        }
    });
});
// Add these functions to your existing script.js file

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'login.html';
}

// Redirect to signup page
function redirectToSignup() {
    window.location.href = 'signup.html';
}

// Update the existing openLogin and openSignup functions
function openLogin() {
    window.location.href = 'login.html';
}

function openSignup() {
    window.location.href = 'signup.html';
}

// Update the selectPlan function to redirect to signup for free trial
function selectPlan(plan) {
    const toast = document.getElementById('toast');
    if (toast) {
        const planNames = {
            basic: 'Basic Plan',
            advanced: 'Advanced Plan',
            premium: 'Premium Plan'
        };
        
        const toggleSwitch = document.getElementById('billingToggle');
        const isYearly = toggleSwitch ? toggleSwitch.classList.contains('yearly') : false;
        const billingPeriod = isYearly ? 'yearly' : 'monthly';
        
        toast.textContent = '✨ To continue with ' + planNames[plan] + ' (' + billingPeriod + '), please sign up for an account!';
        toast.classList.add('show');
        
        setTimeout(function() {
            toast.classList.remove('show');
            // Redirect to signup page after toast
            window.location.href = 'signup.html';
        }, 2000);
    }
}

// Update scrollToHowitworks function (keep existing functionality)
function scrollToHowitworks() {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
        const offsetTop = howItWorksSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}