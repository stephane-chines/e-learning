document.addEventListener('DOMContentLoaded', () => {
  // Récupérer token + email dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  // Référence aux éléments du DOM
  const inputNewPassword = document.getElementById('newPassword');
  const inputConfirmPassword = document.getElementById('confirmPassword');
  const btnSubmit = document.getElementById('submit');

  btnSubmit.addEventListener('click', () => {
    const newPassword = inputNewPassword.value.trim();
    const confirmPassword = inputConfirmPassword.value.trim();

    if (!newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // Envoi de la requête POST
    fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Mot de passe réinitialisé avec succès !");
          window.location.href = '/Connexion/connexion.html';
        } else {
          alert(data.error || "Une erreur est survenue.");
        }
      })
      .catch(() => {
        alert("Erreur réseau, veuillez réessayer.");
      });
  });
});
