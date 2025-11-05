Email = document.querySelector('#email');
const Password = document.querySelector('#password');
const Prenom = document.querySelector('#prenom');
const Nom = document.querySelector('#nom');
const ConfirmPassword = document.querySelector('#confirmpassword');
const BoutonRetour = document.querySelector('#retour');
const BoutonInscription = document.querySelector('#Inscription');
const Promo = document.getElementById('promo');

BoutonInscription.addEventListener('click', () => {
    if (
        Email.value.trim() === '' ||
        Password.value.trim() === '' ||
        Prenom.value.trim() === '' ||
        Nom.value.trim() === '' ||
        ConfirmPassword.value.trim() === '' ||
        Promo.value === null
    ) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    const mail = Email.value.trim();
    const motdepasse = Password.value.trim();
    const confirmMotdepasse = ConfirmPassword.value.trim();
    const prenom = Prenom.value.trim();
    const nom = Nom.value.trim();
    const promo = Promo.value;

    // Vérifier la complexité du mot de passe
    if (motdepasse.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères.');
        return;
    }

    if (mail.includes('junia.com') && motdepasse === confirmMotdepasse) {
        // 1. Inscription utilisateur
        fetch('/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: mail, motdepasse: motdepasse, prenom: prenom, nom: nom, PromoID: promo })
        })
        .then(res => res.json())
        .then(async data => {
            if(data.success) {
                // 2. Envoi mail de vérification via ton API send-email
                const verificationLink = `${window.location.origin}/api/valider?token=${data.token}`;
                const subject = "Vérification de votre adresse e-mail";
                const message = `Bonjour ${prenom},\n\nMerci de vous être inscrit. Veuillez vérifier votre adresse e-mail en cliquant sur ce lien :\n${verificationLink}\n\nCe lien est valable 24h.`;

                const mailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: mail, subject, message })
                });
                const mailData = await mailResponse.json();

                if(mailData.success) {
                    alert('Inscription réussie ! Un e-mail de vérification vous a été envoyé.');
                    window.location.href = '/Connexion/connexion.html';
                } else {
                    alert('Inscription réussie, mais erreur lors de l’envoi de l’e-mail.');
                }
            } else {
                alert('Erreur lors de l\'inscription : ' + (data.message || ''));
            }
        })
        .catch(err => {
            console.error(err);
            alert('Erreur serveur.');
        });
    }
    Email.value = "";
    Password.value = "";
});

BoutonRetour.addEventListener('click', () => {
    window.location.href = '/Connexion/connexion.html';
});
