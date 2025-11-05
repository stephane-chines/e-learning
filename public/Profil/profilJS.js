const selectPrenom = document.getElementById("prenom");
const selectNom = document.getElementById("nom");
const selectPromo = document.getElementById("promo");
const enregistrer = document.getElementById("enregistrer");
const profilePicture = document.getElementById("profilePic");
const chooseProfilePicture = document.getElementById("chooseProfilePic");
const modifierMDP = document.getElementById("modifierMDP");
const ancienMDP = document.getElementById("ancienMDP");
const nouveauMDP = document.getElementById("nouveauMDP");
const validerMDP = document.getElementById("validerMDP");
document.getElementById("profileOverlay").addEventListener("click", () => {
    document.getElementById("chooseProfilePicture").click();
});


let afficherModifierMDP = false;


modifierMDP.addEventListener("click", (event) => {
    afficherModifierMDP = !afficherModifierMDP

    if (afficherModifierMDP) {
        ancienMDP.style.display = "block";
        nouveauMDP.style.display = "block";
        validerMDP.style.display = "block";
    } else {
        ancienMDP.style.display = "none";
        nouveauMDP.style.display = "none";
        validerMDP.style.display = "none";
    }
})

validerMDP.addEventListener("click", (event) => {
    const VerifMotdepasse = ancienMDP.value.trim();
    fetch('/verif-mdp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IDUser: IDUser, ancienMDP: VerifMotdepasse })
    })
        .then(res => res.json())
        .then(data => {
            if (data.match) {
                const NouveauMotDePasse = nouveauMDP.value.trim();
                fetch('/change-mdp', {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ IDUser: IDUser, nouveauMDP: NouveauMotDePasse })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert("Mot de passe modifié !");
                            modifierMDP.click();
                        } else {
                            alert("Erreur lors de la modification du mot de passe")
                        }
                    });
            } else {
                alert("Mot de passe incorrect");
            };
    })
    
    
})



if (!localStorage.getItem("IDUser") || localStorage.getItem("IDUser") === "-1") {
    window.location.href = "/Connexion/connexion.html";
}

profilePicture.addEventListener("click", (event) => {
    chooseProfilePicture.click();
});

let imageBase64 = null;
chooseProfilePicture.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            profilePicture.src = e.target.result;
            imageBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
})

enregistrer.addEventListener("click", (event) => {

    const newPrenom = selectPrenom.value.trim();
    const newNom = selectNom.value.trim();
    const newPromoID = selectPromo.value;
    const newUsername = newPrenom + " " + newNom;

    // Si une image a été sélectionnée, on l'envoie d'abord
    if (imageBase64) {
        fetch(`/api/upload-profile-pic/${IDUser}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 })
        })
            .then(res => res.json())
            .then(data => {
                // Ensuite, on met à jour les infos utilisateur avec le nom du fichier image
                updateUser(newPrenom, newNom, newPromoID, data.filename);
            });
    } else {
        updateUser(newPrenom, newNom, newPromoID, null);
    }
});

function updateUser(prenom, nom, promoID, profilePicFilename) {
    fetch(`/update-user/${IDUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prenom,
            nom,
            PromoID: promoID,
            username: prenom + " " + nom,
            ProfilePic: profilePicFilename // Peut être null
        })
    }).then(() => {
        window.location.href = "/Accueil/Accueil.html";
    });
}
