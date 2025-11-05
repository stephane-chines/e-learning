const Email = document.querySelector('#email');
const Password = document.querySelector('#password');
const BoutonConnexion = document.querySelector('#connexion');
const BoutonInscription= document.querySelector('#create-account');
const BoutonForgotPassword= document.querySelector('#forgot-password');

BoutonConnexion.addEventListener('click', () => {
    const VerifMail = Email.value.trim();
    const VerifMotdepasse = Password.value.trim();
    
    fetch('/api/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: VerifMail, motdepasse: VerifMotdepasse })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("Email ou mot de passe incorrect !");
        } else {
            localStorage.setItem("IDUser", data.IDUser);
            localStorage.setItem("username", data.username);
            localStorage.setItem("admin", data.admin);
            window.location.href = '/Accueil/Accueil.html';
        }
    }); 
})

BoutonInscription.addEventListener('click', () => {
    window.location.href = '/Inscription/Inscription.html';
})

Password.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        BoutonConnexion.click();
    }
});
BoutonForgotPassword.addEventListener('click', () => {
    const VerifMail = Email.value.trim();

    fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: VerifMail })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Un email de réinitialisation vous a été envoyé.");
        } else {
            alert(data.error || "Une erreur est survenue.");
        }
    });
});
