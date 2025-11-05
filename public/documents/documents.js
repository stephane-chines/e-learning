// ouvrir les PDF
const IDSubject = localStorage.getItem("selectedSubjectID")

const matiereTitle = document.getElementById('chat-matiere-title');
const matiereName = localStorage.getItem("selectedSubjectName");
if (matiereTitle && matiereName) {
    matiereTitle.textContent = `${matiereName}`;
}

document.getElementById('ouvrir-annales').onclick = function() {
  const pdf = document.getElementById('pdf-annales').value;
  if (pdf) window.open(pdf, '_blank');
};
document.getElementById('ouvrir-cours').onclick = function() {
  const pdf = document.getElementById('pdf-cours').value;
  if (pdf) window.open(pdf, '_blank');
};
document.getElementById('ouvrir-fiches').onclick = function() {
  const pdf = document.getElementById('pdf-fiches').value;
  if (pdf) window.open(pdf, '_blank');
};

// Navigation buttons
Chat.addEventListener("click", () => {
  window.location.href = "/Chat/chat.html";
});

QR.addEventListener("click", () => {
  window.location.href = "/QR/index.html";
});

const RetourLobby = document.querySelector("#bouton-menu");
RetourLobby.addEventListener("click", () => {
  window.location.href = "/Accueil/Accueil.html";
});

// Ajout de document
const btnAjouter = document.getElementById("btn-ajouter");
const formAjout = document.getElementById("form-ajout");
const annulerAjout = document.getElementById("annuler-ajout");

let interfaceVisible = false;

btnAjouter.onclick = () => {
  if (interfaceVisible) {
    formAjout.style.display = "none";
    interfaceVisible = false;
    btnAjouter.textContent = "Ajouter un fichier"; 
    return;
  }
  else {
    formAjout.style.display = "block";
    interfaceVisible = true;
    btnAjouter.textContent = "Annuler"; 
  }
};



formAjout.onsubmit = function (e) {
  e.preventDefault();
  const nom = document.getElementById("nom-fichier").value.trim();
  const type = document.getElementById("categorie-fichier").value;
  const fichier = document.getElementById("fichier-pdf").files[0];

  if (!nom || !type || !fichier) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileBase64 = e.target.result; // data:application/pdf;base64,...
    fetch('/api/new-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom,
        IDSubject,
        type,
        fichier: fileBase64
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Document ajouté !");
          formAjout.reset();
          formAjout.style.display = "none";
          window.location.reload();
        } else {
          alert("Erreur lors de l'ajout du document.");
        }
      });
  };
  reader.readAsDataURL(fichier);
  formAjout.reset();
  formAjout.style.display = "none";
};

function chargerDocuments(type, selectElement) {
  fetch(`/api/documents/${IDSubject}/${type}`)
    .then(res => res.json())
    .then(docs => {
      // Vide les options sauf la première
      selectElement.innerHTML = '<option value="">Choisir</option>';
      docs.forEach(doc => {
        const option = document.createElement('option');
        option.value = `/documents/files/${doc.url}`;
        option.textContent = doc.nom || doc.url;
        selectElement.appendChild(option);
      });
    });
}

// Pour chaque select, recharge la liste au focus
document.querySelectorAll('.pdf-select').forEach(select => {
  select.addEventListener('focus', function () {
    const type = select.getAttribute('data-type');
    chargerDocuments(type, select);
  });
});
