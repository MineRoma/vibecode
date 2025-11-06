let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    const authForm = document.getElementById('authForm');
    const switchLink = document.getElementById('switchLink');
    
    // Инициализируем демо-пользователей при первом запуске
    initializeDemoUsers();
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    if (token && currentUser) {
        try {
            JSON.parse(currentUser);
            setTimeout(() => {
                window.location.replace('index.html');
            }, 100);
            return;
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
        }
    }
    
    authForm.addEventListener('submit', handleSubmit);
    switchLink.addEventListener('click', toggleMode);
}

// Инициализация демо-пользователей
function initializeDemoUsers() {
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            {
                id: 1,
                username: 'DemoUser',
                email: 'demo@test.com',
                password: 'demo123', // В реальном приложении здесь должен быть хэш!
                avatar: 'D',
                status: 'Online'
            }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
}

function toggleMode(e) {
    e.preventDefault();
    
    isLoginMode = !isLoginMode;
    
    const usernameGroup = document.getElementById('usernameGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const submitBtn = document.getElementById('submitBtn');
    const switchText = document.getElementById('switchText');
    const switchLink = document.getElementById('switchLink');
    
    if (isLoginMode) {
        usernameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        submitBtn.textContent = 'Log In';
        switchText.textContent = 'Need an account?';
        switchLink.textContent = 'Register';
        document.querySelector('.logo h1').textContent = 'Welcome back!';
        document.querySelector('.logo p').textContent = "We're so excited to see you again!";
    } else {
        usernameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        submitBtn.textContent = 'Register';
        switchText.textContent = 'Already have an account?';
        switchLink.textContent = 'Log In';
        document.querySelector('.logo h1').textContent = 'Create an account';
        document.querySelector('.logo p').textContent = 'Welcome to Discord Clone!';
    }
    
    removeMessage('error-message');
    removeMessage('success-message');
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!isLoginMode) {
        if (!username || username.trim().length < 3) {
            showError('Username must be at least 3 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
    }
    
    if (!email || !validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (isLoginMode) {
        await login(email, password);
    } else {
        await register(username, email, password);
    }
}

async function login(email, password) {
    try {
        // Получаем пользователей из localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        // Проверяем пароль (в реальном приложении здесь должно быть хэширование!)
        if (!user || user.password !== password) {
            showError('Invalid email or password');
            return;
        }
        
        // Создаем токен
        const token = btoa(JSON.stringify({ 
            id: user.id, 
            email: user.email, 
            timestamp: Date.now() 
        }));
        
        // Сохраняем пользователя без пароля
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        showSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Login error. Please try again.');
    }
}

async function register(username, email, password) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Проверяем, есть ли уже пользователь с таким email
        if (users.find(u => u.email === email)) {
            showError('Email already registered');
            return;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password, // В реальном приложении здесь должен быть хэш!
            avatar: username.charAt(0).toUpperCase(),
            status: 'Online'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Создаем токен
        const token = btoa(JSON.stringify({ 
            id: newUser.id, 
            email: newUser.email, 
            timestamp: Date.now() 
        }));
        
        // Сохраняем пользователя без пароля
        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;
        
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        showSuccess('Registration successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(message) {
    removeMessage('error-message');
    removeMessage('success-message');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    
    const form = document.getElementById('authForm');
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
    removeMessage('error-message');
    removeMessage('success-message');
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    
    const form = document.getElementById('authForm');
    form.insertBefore(successDiv, form.firstChild);
}

function removeMessage(className) {
    const existingMessage = document.querySelector('.' + className);
    if (existingMessage) {
        existingMessage.remove();
    }
}
