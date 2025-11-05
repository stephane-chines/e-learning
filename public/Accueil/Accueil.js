const matiereContainer = document.querySelector('.matiere-container');
const BoutonMatiere = document.getElementById('Nouvelle-Matiere');
const Enregistrer = document.getElementById('Enregistrer');
const IDUser = localStorage.getItem("IDUser");
const isAdmin = localStorage.getItem("admin") === "1";


if (!isAdmin && BoutonMatiere) {
    BoutonMatiere.style.display = "none";

}

let Affichage = false

if (!localStorage.getItem("IDUser") || localStorage.getItem("IDUser") === "-1") {
    window.location.href = "/Connexion/connexion.html";
}

BoutonMatiere.addEventListener('click', (event) => {
    if (Affichage) {
        Affichage = false;
        matiereContainer.style.display = 'none';
        document.querySelectorAll('.supprimer').forEach(btn => btn.classList.remove('visible'));
    } else {
        Affichage = true;
        matiereContainer.style.display = 'flex';
        document.querySelectorAll('.supprimer').forEach(btn => btn.classList.add('visible'));
    }
});

Enregistrer.addEventListener('click', (event) => {
    event.preventDefault();

    const nomMatiere = document.getElementById('Saisie-Matiere').value.trim();
    const semestre = parseInt(document.getElementById('choix-semestre').value, 10);
    const promoID = document.getElementById('choix-promo').value;
    const fichierImage = document.getElementById('Saisie-Fichier').files[0];

    if (!nomMatiere || isNaN(semestre)) {
        alert("Veuillez remplir le nom de la matière et choisir un semestre / promo.");
        return;
    }

    // Si une image est sélectionnée, on la lit en base64
    if (fichierImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageBase64 = e.target.result;
            envoyerMatiere(nomMatiere, semestre, promoID, imageBase64);
        };
        reader.readAsDataURL(fichierImage);
    } else {
        envoyerMatiere(nomMatiere, semestre, promoID, "");
    }
    
});

function envoyerMatiere(nomMatiere, semestre, promoID, imageLink) {
    fetch('/add-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subject: nomMatiere,
            Semestre: semestre,
            PromoID: promoID,
            mageLink: imageLink
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('Saisie-Matiere').value = "";
            document.getElementById('choix-semestre').value = "";
            document.getElementById('choix-promo').value = "";
            document.getElementById('Saisie-Fichier').value = "";
            window.location.reload();
        }
    })
    .catch(err => {
        alert("Erreur lors de l'ajout de la matière.");
        console.error(err);
    });
}



// On centre globalement le conteneur gallery
gallery.style.display = 'flex';
gallery.style.flexDirection = 'column';
gallery.style.alignItems = 'center';

// Création du conteneur pour le semestre 1
const containerSem1 = document.createElement("div");
containerSem1.id = "semestre1";
containerSem1.style.textAlign = "center"; // Centre le titre et les boutons à l'intérieur

// Création du conteneur interne pour les matières du semestre 1 (affichage horizontal)
const subjectsContainerSem1 = document.createElement("div");
subjectsContainerSem1.style.display = "flex";
subjectsContainerSem1.style.flexWrap = "wrap"; // Permet le retour à la ligne si nécessaire
subjectsContainerSem1.style.justifyContent = "center"; // Centre horizontalement les éléments
containerSem1.appendChild(subjectsContainerSem1);

// Création du conteneur pour le semestre 2
const containerSem2 = document.createElement("div");
containerSem2.id = "semestre2";
containerSem2.style.textAlign = "center";

// Création du conteneur interne pour les matières du semestre 2 (affichage horizontal)
const subjectsContainerSem2 = document.createElement("div");
subjectsContainerSem2.style.display = "flex";
subjectsContainerSem2.style.flexWrap = "wrap";
subjectsContainerSem2.style.justifyContent = "center";
containerSem2.appendChild(subjectsContainerSem2);

// On vide le conteneur principal gallery et on y ajoute nos 2 groupes
gallery.innerHTML = "";
gallery.appendChild(containerSem1);

const divider = document.createElement("hr");
divider.className = "divider";
gallery.appendChild(divider);
gallery.appendChild(containerSem2);


function createSubjectButton(subjectName, subjectID, subjectImage, container) {
    const button = document.createElement("div");
    button.className = "photo";
    
    if (isAdmin) {
        const supprimer = document.createElement("button");
        supprimer.className = "supprimer";
        supprimer.textContent = "Supprimer";
        supprimer.addEventListener("click", (event) => {
            event.stopPropagation();
            fetch(`/api/subject/${subjectID}?IDUser=${IDUser}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Matière supprimée avec succès.");
                    container.removeChild(button);
                } else {
                    alert("Erreur lors de la suppression de la matière.");
                }
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de la matière :', error);
            });
        });
        button.appendChild(supprimer);
    }
    
    
    // Ajout d'un id pour la recherche
    button.id = subjectName;
    
    // Si une image est définie, on l'ajoute
    if (subjectImage) {
        const img = document.createElement("img");
        img.src = subjectImage;
        img.alt = subjectName;
        button.appendChild(img);
    }
    
    // Crée un élément de légende pour le nom et l'ajoute en bas de l'image
    const caption = document.createElement("figcaption");
    caption.textContent = subjectName;
    button.appendChild(caption);
    
    // Événement click pour rediriger l'utilisateur
    button.addEventListener("click", () => {
        localStorage.setItem("selectedSubjectID", subjectID);
        localStorage.setItem("selectedSubjectName", subjectName);
        window.location.href = "/QR";
    });
    
    container.appendChild(button);
}

// On récupère la promo de l'utilisateur
fetch(`/get-user-info/${IDUser}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(res => res.json())
    .then(data => {
        const PromoID = data.PromoID;
        // On affiche seulement les matières de cette promo
        fetch(`/get-subjects/${PromoID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                data.sort((a, b) => a.subject.localeCompare(b.subject));
                data.forEach(subject => {
                    if (subject.Semestre === 1) {
                        createSubjectButton(subject.subject, subject.IDSubject, subject.imageLink, subjectsContainerSem1);
                    } else if (subject.Semestre === 2) {
                        createSubjectButton(subject.subject, subject.IDSubject, subject.imageLink, subjectsContainerSem2);
                    } else {
                        createSubjectButton(subject.subject, subject.IDSubject, subject.imageLink, gallery);
                    }
                });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des matières :', error);
            });
    });

function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const recherche = document.getElementById("recherche");

recherche.addEventListener("input", function() {
    const texte = normalize(recherche.value);
    // Récupérer tous les éléments de classe "photo"
    const photos = document.querySelectorAll('.photo');
    photos.forEach(photo => {
        // On utilise l'id de la div pour le nom
        const nomLisible = normalize(photo.id);
        photo.style.display = nomLisible.includes(texte) ? "block" : "none";
    });
});

logout.addEventListener("click", (event) => {
    localStorage.setItem("IDUser", -1);
    window.location.href = '/Connexion/connexion.html';
});

profil.addEventListener("click", (event) => {
    window.location.href = '/Profil/profil.html';
});

const imageProfil = document.getElementById("profil-img");

fetch(`/get-user-info/${IDUser}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(res => res.json())
    .then(data => {
        if (data.ProfilePic && data.ProfilePic !== "None") {
            imageProfil.src = `../PPs/${data.ProfilePic}`;
        } else {
            imageProfil.src = '../PPs/defaultPP.jpg';
        }
    })

    
