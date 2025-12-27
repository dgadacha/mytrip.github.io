document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseService.initialize();
    
    // Vérifier si déjà connecté
    FirebaseService.auth.onAuthStateChanged(user => {
        if (user) {
            // Rediriger vers trips si déjà connecté
            window.location.href = 'trips.html';
        }
    });
    
    // Initialiser le thème
    ThemeManager.initialize();
    
    // Event listeners pour les formulaires
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }
    
    // Désactiver le bouton et afficher un spinner
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span>Connexion...';
    hideError();
    hideSuccess();
    
    const result = await FirebaseService.signIn(email, password);
    
    if (result.success) {
        showSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
            window.location.href = 'trips.html';
        }, 500);
    } else {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Se connecter';
        
        // Messages d'erreur en français
        let errorMessage = result.error;
        if (result.error.includes('user-not-found')) {
            errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (result.error.includes('wrong-password')) {
            errorMessage = 'Mot de passe incorrect';
        } else if (result.error.includes('invalid-email')) {
            errorMessage = 'Email invalide';
        } else if (result.error.includes('too-many-requests')) {
            errorMessage = 'Trop de tentatives. Réessayez plus tard';
        }
        
        showError(errorMessage);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const registerBtn = document.getElementById('registerBtn');
    
    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }
    
    if (password.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    // Désactiver le bouton et afficher un spinner
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="spinner"></span>Création du compte...';
    hideError();
    hideSuccess();
    
    const result = await FirebaseService.signUp(email, password);
    
    if (result.success) {
        showSuccess('Compte créé avec succès ! Redirection...');
        setTimeout(() => {
            window.location.href = 'trips.html';
        }, 500);
    } else {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Créer mon compte';
        
        // Messages d'erreur en français
        let errorMessage = result.error;
        if (result.error.includes('email-already-in-use')) {
            errorMessage = 'Cet email est déjà utilisé';
        } else if (result.error.includes('invalid-email')) {
            errorMessage = 'Email invalide';
        } else if (result.error.includes('weak-password')) {
            errorMessage = 'Mot de passe trop faible (minimum 6 caractères)';
        }
        
        showError(errorMessage);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

function hideSuccess() {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}