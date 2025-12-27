let isSignupMode = false;

document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseService.initialize();

    // Si déjà connecté, rediriger vers trips
    FirebaseService.auth.onAuthStateChanged(user => {
        if (user) {
            window.location.href = 'trips.html';
        }
    });

    // Gestion du switch signup/login
    document.getElementById('switchLink').addEventListener('click', (e) => {
        e.preventDefault();
        switchMode();
    });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const errorMsg = document.getElementById('errorMessage');

    // Validation simple
    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    if (password.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    // Loading state
    submitBtn.classList.add('loading');
    btnText.innerHTML = '<span class="spinner"></span>';
    errorMsg.style.display = 'none';

    let result;
    if (isSignupMode) {
        result = await FirebaseService.signUp(email, password);
    } else {
        result = await FirebaseService.signIn(email, password);
    }

    if (result.success) {
        // Redirection gérée par onAuthStateChanged
    } else {
        showError(getErrorMessage(result.error));
        submitBtn.classList.remove('loading');
        btnText.textContent = isSignupMode ? "S'inscrire" : "Se connecter";
    }
});

function switchMode() {
    isSignupMode = !isSignupMode;
    const btnText = document.getElementById('btnText');
    const switchLink = document.getElementById('switchLink');
    const switchText = switchLink.parentElement;
    const errorMsg = document.getElementById('errorMessage');
    
    errorMsg.style.display = 'none';
    
    if (isSignupMode) {
        btnText.textContent = "S'inscrire";
        switchText.innerHTML = 'Déjà un compte ? <a href="#" id="switchLink">Se connecter</a>';
    } else {
        btnText.textContent = 'Se connecter';
        switchText.innerHTML = 'Pas encore de compte ? <a href="#" id="switchLink">S\'inscrire</a>';
    }
    
    // Réattacher l'event listener
    document.getElementById('switchLink').addEventListener('click', (e) => {
        e.preventDefault();
        switchMode();
    });
}

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Adresse email invalide',
        'auth/user-not-found': 'Aucun compte trouvé avec cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/email-already-in-use': 'Cet email est déjà utilisé',
        'auth/weak-password': 'Mot de passe trop faible (minimum 6 caractères)',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
        'auth/invalid-credential': 'Email ou mot de passe incorrect'
    };
    
    return messages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
}