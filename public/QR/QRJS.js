const admin = localStorage.getItem("admin");
const professeur = localStorage.getItem("professeur");
const IDUser = localStorage.getItem("IDUser"); 
const subjectID = localStorage.getItem("selectedSubjectID");
const matiereTitle = document.getElementById('chat-matiere-title');
const matiereName = localStorage.getItem("selectedSubjectName");
if (matiereTitle && matiereName) {
    matiereTitle.textContent = `${matiereName}`;
}
console.log("Subject ID:", subjectID);

if (!localStorage.getItem("IDUser") || localStorage.getItem("IDUser") === "-1") {
  window.location.href = "/Connexion/connexion.html";
}

fetch(`/get-question/` + subjectID)
  .then(res => res.json())
  .then(questions => {
      conteneur.innerHTML = "";
      questions.sort((a, b) => b.votes - a.votes);
      questions.forEach((q) => {
        createQuestionBlock(q.IDQuestion, q.titre, q.corps, q.votes, [], [], q.username, q.date,q.IDUser);
      });
  })
  .catch(err => console.error("Erreur fetch questions:", err));

const boutonAjouterQuestion = document.querySelector("#AjouterQuestion");
const BoutonEnregistrer = document.querySelector("#Enregistrer");
const SaisieTitreQuestion = document.querySelector("#SaisieTitreQuestion");
const SaisieCorpsQuestion = document.querySelector("#SaisieCorpsQuestion");
const imageInput = document.querySelector("#image");
const conteneur = document.querySelector("#conteneur");
const Chat = document.querySelector("#Chat");
const Documents = document.querySelector("#Documents");
const RetourLobby = document.querySelector("#bouton-menu");

const SVGBoutonPlus = `<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><g style="fill:none;stroke:#3f2a56;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:2"><path d="M36 22 V50" /><path d="M50 36 H22" /><circle cx="36" cy="36" r="23" /></g></svg>`
const SVGBoutonVote = `<svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m8 .5-7.5 7.5h4.5v8h6v-8h4.5z" fill="#3f2a56" stroke="#f06b42" stroke-width="1"/></svg> <strong><span style="font-size: 16px;">`;
const SVGBoutonVote1 =`<svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m8 .5-7.5 7.5h4.5v8h6v-8h4.5z" fill="#f06b42" stroke="#f06b42" stroke-width="1"/></svg> <strong><span style="font-size: 16px;">`

const SVGBoutonReponses = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#f06b42" fill-rule="evenodd" d="M1.5 2.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-3.5a.75.75 0 00-.53.22L3.5 11.44V9.25a.75.75 0 00-.75-.75h-1a.25.25 0 01-.25-.25v-5.5zM1.75 1A1.75 1.75 0 000 2.75v5.5C0 9.216.784 10 1.75 10H2v1.543a1.457 1.457 0 002.487 1.03L7.061 10h3.189A1.75 1.75 0 0012 8.25v-5.5A1.75 1.75 0 0010.25 1h-8.5zM14.5 4.75a.25.25 0 00-.25-.25h-.5a.75.75 0 110-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0114.25 12H14v1.543a1.457 1.457 0 01-2.487 1.03L9.22 12.28a.75.75 0 111.06-1.06l2.22 2.22v-2.19a.75.75 0 01.75-.75h1a.25.25 0 00.25-.25v-5.5z"/></svg><strong><span style="font-size: 16px;">`
const SVGSupprimer = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 32 32" width="20px" height="20px"><path fill="#f06b42" d="M 15 4 C 14.476563 4 13.941406 4.183594 13.5625 4.5625 C 13.183594 4.941406 13 5.476563 13 6 L 13 7 L 7 7 L 7 9 L 8 9 L 8 25 C 8 26.644531 9.355469 28 11 28 L 23 28 C 24.644531 28 26 26.644531 26 25 L 26 9 L 27 9 L 27 7 L 21 7 L 21 6 C 21 5.476563 20.816406 4.941406 20.4375 4.5625 C 20.058594 4.183594 19.523438 4 19 4 Z M 15 6 L 19 6 L 19 7 L 15 7 Z M 10 9 L 24 9 L 24 25 C 24 25.554688 23.554688 26 23 26 L 11 26 C 10.445313 26 10 25.554688 10 25 Z M 12 12 L 12 23 L 14 23 L 14 12 Z M 16 12 L 16 23 L 18 23 L 18 12 Z M 20 12 L 20 23 L 22 23 L 22 12 Z"/></svg>`
const SVGEtoileProf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f06b42" width="24" height="24"><path d="M12 2l2.9 6.9L22 10l-5 5.1 1.2 7L12 18l-6.2 4.1L7 15.1 2 10l7.1-1.1L12 2z"/></svg>`

let interfaceVisible = false;

const blocFiltres = document.createElement("div");
blocFiltres.className = "bloc-filtres";

const filtreVotes = document.createElement("button");
filtreVotes.textContent = "Votes";


Chat.addEventListener("click", () => {
  window.location.href = "/Chat/chat.html";
});

Documents.addEventListener("click", () => {
  window.location.href = "/documents/documents.html";
});

RetourLobby.addEventListener("click", () => {
  window.location.href = "/Accueil/Accueil.html";
});

filtreVotes.addEventListener("click", (event) => {
  event.stopPropagation();
  fetch('/get-question/' + subjectID)
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => b.votes - a.votes); // Tri des questions par nombre de votes décroissant
      conteneur.innerHTML = ""; // <-- Vide le conteneur avant d'afficher les questions
      data.forEach((q) => {
        createQuestionBlock(q.IDQuestion, q.titre, q.corps, q.votes, [], [], q.username, q.date, q.IDUser);
      });
    })
    .catch(err => console.error("Erreur fetch questions:", err));
});

const filtreCommentaires = document.createElement("button");
filtreCommentaires.textContent = "Commentaires";
filtreCommentaires.addEventListener("click", async (event) => {
  event.stopPropagation();
  const res = await fetch('/get-question/' + subjectID);
  const data = await res.json();

  // Pour chaque question, récupère le nombre de réponses
  const questionsWithNbReponses = await Promise.all(
    data.map(async (q) => {
      const repRes = await fetch('/get-nb-reponses/' + q.IDQuestion);
      const repData = await repRes.json();
      return { ...q, nbReponses: repData.nbReponses || 0 };
    })
  );

  // Trie par nombre de réponses décroissant
  questionsWithNbReponses.sort((a, b) => b.nbReponses - a.nbReponses);

  conteneur.innerHTML = "";
  questionsWithNbReponses.forEach((q) => {
    createQuestionBlock(q.IDQuestion, q.titre, q.corps, q.votes, [], [], q.username, q.date,q.IDUser);
  });
});
const filtreDate = document.createElement("button");
filtreDate.textContent = "Date";
filtreDate.addEventListener("click", (event) => {
  event.stopPropagation();
  fetch('/get-question/' + subjectID)
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante
      conteneur.innerHTML = ""; // <-- Vide le conteneur avant d'afficher les questions
      data.forEach((q) => {
        createQuestionBlock(q.IDQuestion, q.titre, q.corps, q.votes, [], [], q.username, q.date,q.IDUser);
      });
    })
    .catch(err => console.error("Erreur fetch questions:", err));
});


const filtres = document.createElement("p");
filtres.textContent = "Filtres :";
filtres.className = "filtres";

Enregistrer.insertAdjacentElement('afterend', filtres);
blocFiltres.appendChild(filtreVotes);
blocFiltres.appendChild(filtreCommentaires);
blocFiltres.appendChild(filtreDate);
filtres.insertAdjacentElement('afterend', blocFiltres);


function formatTextePourHTML(texte) {
  // Fonction pour échapper les caractères spéciaux HTML et formater le texte
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;") // 4 espaces pour une tabulation
    .replace(/\n/g, "<br>");
}

function createQuestionBlock(IDQuestion, TitreQuestion, CorpsQuestion, votes, reponses = [], images = [], username, date,auteurID) {
  let interfaceVisible1 = false;
  let interfaceVisible2 = false;
  let interfaceVisible3 = false;

  const blocQuestion = document.createElement("div");
  blocQuestion.className = "bloc-question";

  const blocImages = document.createElement("div");
  blocImages.className = "bloc-images";
  
  fetch(`/api/images/${IDQuestion}`)
    .then(res => res.json())
    .then(data => {
      data.images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "question-image";
        img.style.cursor = "pointer";
        img.addEventListener("click", (e) => {
        e.stopPropagation(); // Pour ne pas déclencher l'ouverture/fermeture du bloc question
        window.open(src, "_blank");
  });
  blocImages.appendChild(img);
});
    });
  
  // Photo de profil pour bloc de question
  const userProfile = document.createElement("div");
  userProfile.className = "user-profile";

  const PPQuestion = document.createElement("img");
  PPQuestion.className = "profile-picture";
  PPQuestion.src = '../PPs/defaultPP.jpg';
  fetch(`/get-user-info/${auteurID}`)
    .then(res => res.json())
    .then(userData => {
      if (userData.ProfilePic && userData.ProfilePic !== "None") {
        PPQuestion.src = `../PPs/${userData.ProfilePic}`;
      }
    });
  userProfile.appendChild(PPQuestion);


  // ID user pour bloc de question
  const usernameQuestion = document.createElement("p");
  usernameQuestion.className = "username-question";
  usernameQuestion.textContent = username;
  userProfile.appendChild(usernameQuestion);

  blocQuestion.appendChild(userProfile);

  // titre bloc de question
  const titreQuestion = document.createElement("p");
  titreQuestion.textContent = TitreQuestion;
  titreQuestion.className = "titre-question";
  blocQuestion.appendChild(titreQuestion);

  // corps bloc de question
  const SuiteQuestion = document.createElement("p");
  SuiteQuestion.innerHTML = formatTextePourHTML(CorpsQuestion);
  SuiteQuestion.className = "suite-question";
  blocQuestion.appendChild(SuiteQuestion);
  SuiteQuestion.appendChild(blocImages);

  const mots = CorpsQuestion.split(/\s+/);
  let PreviewQuestion = mots.slice(0, 30).join(" ");
  if (mots.length > 30) PreviewQuestion += " ...";

  const dateQuestion = document.createElement("p");
  dateQuestion.className = "date-question";
  dateQuestion.textContent = new Date(date).toLocaleDateString("fr-FR", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });



  const boutonVote = document.createElement("button");
  // On récupère le nombre de votes pour la question depuis la BDD
  fetch('/get-votes-question/' + IDQuestion)
    .then(res => res.json())
    .then(data => {
      votes = data.votes
    })
  if (votes === null) {
    votes = 0;
  }
  boutonVote.className = "bouton-vote";
  boutonVote.innerHTML = `${SVGBoutonVote}${votes}</span></strong>`;


  fetch(`/has-voted-question/${IDQuestion}?IDUser=${IDUser}`)
  .then(res => res.json())
  .then(data => {
    let hasVoted = data.hasVoted; // true ou false
    boutonVote.innerHTML = `${SVGBoutonVote}${votes}</span></strong>`;
    if (hasVoted) {
      boutonVote.innerHTML = `${SVGBoutonVote1}${votes}</span></strong>`;
    }
    else {
      boutonVote.innerHTML = `${SVGBoutonVote}${votes}</span></strong>`;
    }
    boutonVote.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!hasVoted) {
        fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDQuestion: IDQuestion, IDUser: IDUser })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            votes++;
            boutonVote.innerHTML = `${SVGBoutonVote1}${votes}</span></strong>`;
            hasVoted = true;
          } else {
            alert(data.error || "Erreur lors du vote.");
          }
        });
      } else {
        fetch('/api/vote', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDQuestion: IDQuestion, IDUser: IDUser })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            votes--;
            boutonVote.innerHTML = `${SVGBoutonVote}${votes}</span></strong>`;
            hasVoted = false;
          } else {
            alert(data.error || "Erreur lors du retrait du vote.");
          }
        });
      }
    });
  });

  const ConteneurBouton = document.createElement("div");

  ConteneurBouton.className = "bloc-vote";
  ConteneurBouton.style.display = "flex";
  ConteneurBouton.style.margin = "0px";
  ConteneurBouton.appendChild(boutonVote);

  const BoutonRéponses = document.createElement("button");
  BoutonRéponses.className = "bouton-reponses";

  fetch('/get-nb-reponses/' + IDQuestion)
    .then(res => res.json())
    .then(data => {
      const nbReponses = data.nbReponses || 0; // Si pas de réponses, on met 0
      BoutonRéponses.innerHTML =  `${SVGBoutonReponses} ${nbReponses}</span></strong>`;
    });

  const ZoneRéponses = document.createElement("div");
  ZoneRéponses.style.display = "none";

  function renderAllReponses() {
    let Réponses = [];
    fetch('/get-reponses/' + IDQuestion)
      .then(res => res.json())
      .then(data => {
        Réponses.length = 0;
        data.forEach(rep => {
          Réponses.push([rep.IDReponse,rep.IDUser, rep.corps, rep.votes, rep.username,rep.professeur]);
        });
        Réponses.sort((a, b) => b[2] - a[2]);
        ZoneRéponses.innerHTML = "";
        Réponses.forEach((rep, idx) => {
          ZoneRéponses.appendChild(createReponseBlock(rep[0], rep[1], rep[2], rep[3],rep[4],rep[5], idx));
        });
      });
  }

  BoutonRéponses.addEventListener("click", (event) => {
    interfaceVisible2 = !interfaceVisible2;
    if (!interfaceVisible1) {
      interfaceVisible1 = true;
    }
    event.stopPropagation();
    if (!interfaceVisible) {
      PreviewQuestionBlock.style.display = "none";
      blocQuestion.style.backgroundColor = "#3f2a56";
    }
    if (interfaceVisible2) {
      ZoneRéponses.style.display = "block";
      NouvelleRéponse.style.display = "block";
      SaisieRéponses.style.display = "block";
      EnvoyerRéponses.style.display = "block";
    } else {
      ZoneRéponses.style.display = "none";
      NouvelleRéponse.style.display = "none";
      SaisieRéponses.style.display = "none";
      EnvoyerRéponses.style.display = "none";
    }
    if (interfaceVisible1) {
      SuiteQuestion.style.display = "block";
      imageElements.forEach(img => img.style.display = "block");
    }
    renderAllReponses();
  });

  ConteneurBouton.appendChild(BoutonRéponses);

  if ((IDUser == auteurID) || (admin==="1")) { // Si l'utilisateur est l'auteur de la question ou un admin
    const boutonsupprimerQ = document.createElement("button");
    boutonsupprimerQ.innerHTML =  `${SVGSupprimer}`;
    boutonsupprimerQ.className = "bouton-supprimerQ";
    //boutonsupprimerQ.textContent = "Supprimer";
    boutonsupprimerQ.addEventListener("click", (event) => {
      event.stopPropagation();
      if (confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
        fetch('/api/question/' + IDQuestion, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDUser: IDUser })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              blocQuestion.remove();
            } else {
              alert("Erreur lors de la suppression de la question.");
            }
            window.location.reload();
          })
          .catch(err => console.error("Erreur lors de la suppression de la question :", err));
      }
    });
    ConteneurBouton.appendChild(boutonsupprimerQ);
  }




  blocQuestion.addEventListener("click", (event) => {
    event.stopPropagation();
    interfaceVisible1 = !interfaceVisible1;

    if (!interfaceVisible) {
      PreviewQuestionBlock.style.display = "none";
      blocQuestion.style.backgroundColor = "#3f2a56";
    }
    if (interfaceVisible1) {
      SuiteQuestion.style.display = "block";
      imageElements.forEach(img => img.style.display = "block");
    } else {
      SuiteQuestion.style.display = "none";
      imageElements.forEach(img => img.style.display = "none");
      ZoneRéponses.style.display = "none";
      NouvelleRéponse.style.display = "none";
      SaisieRéponses.style.display = "none";
      EnvoyerRéponses.style.display = "none";

      interfaceVisible2 = false;
      interfaceVisible3 = false;
    }
  });

  // Fonction pour créer un bloc de réponse
  function createReponseBlock(IDReponse ,IDUser, contenu, votesRep = 0, usernameReponse, idx,professeur) {
    const reponse = document.createElement("div");  
    const texte = document.createElement("p");
    const usernameRep = document.createElement("p");
    texte.innerHTML = formatTextePourHTML(contenu);

    if (professeur === 1 || professeur === "1") {
        reponse.classList.add('professeur-reponse');
        const etoile  = document.createElement("span");
        etoile.innerHTML = SVGEtoileProf;
    }
      
    usernameRep.style.fontSize = "16px";
    usernameRep.style.fontWeight = "bold";
    usernameRep.style.marginTop = "0px";

    // Ajout étoile et username sur la même ligne si professeur
    if (professeur === 1 || professeur === "1") {
        const ligneProf = document.createElement("span");
        ligneProf.style.display = "inline-flex";
        ligneProf.style.alignItems = "center";
        ligneProf.innerHTML = `${usernameReponse}<span style="margin-left: 10px;">${SVGEtoileProf}</span>`;
        usernameRep.innerHTML = ""; // On vide le <p>
        usernameRep.appendChild(ligneProf);
    } else {
        usernameRep.textContent = usernameReponse;
    }
    reponse.style.marginLeft = "20px";
    reponse.style.marginRight = "20px";
    reponse.style.marginTop = "5px";
    reponse.style.marginBottom = "5px";
    reponse.style.fontSize = "16px";
    reponse.style.backgroundColor = "#3f2a56";

    texte.style.marginTop = "0px";
    texte.style.marginBottom = "5px";
    texte.style.marginLeft = "20px";
    texte.style.marginRight = "20px";
    texte.style.padding = "5px";
    texte.style.backgroundColor = "#3f2a56";
    texte.style.color = "antiquewhite";

    const boutonVoteRep = document.createElement("button");
    fetch('/get-votes-reponse/' + IDReponse)
      .then(res => res.json())
      .then(data => {
        votesRep = data.votes || 0; // Si pas de votes, on met 0
        boutonVoteRep.innerHTML = `${SVGBoutonVote}${votesRep}</span></strong>`;
      });
    boutonVoteRep.style.marginTop = "0px";
    boutonVoteRep.style.backgroundColor = "transparent";
    boutonVoteRep.style.border = "none";
    boutonVoteRep.style.color = "antiquewhite";

    fetch(`/has-voted-reponse/${IDReponse}?IDUser=${localStorage.getItem("IDUser")}`)
  .then(res => res.json())
  .then(data => {
    let hasVoted = data.hasVoted; // true ou false
    if (hasVoted) {
      boutonVoteRep.innerHTML = `${SVGBoutonVote1}${votesRep}</span></strong>`;
    } else {
      boutonVoteRep.innerHTML = `${SVGBoutonVote}${votesRep}</span></strong>`;
    }
    boutonVoteRep.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!hasVoted) {
        fetch('/api/vote-reponse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDReponse: IDReponse, IDUser: localStorage.getItem("IDUser") })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            votesRep++;
            boutonVoteRep.innerHTML = `${SVGBoutonVote1}${votesRep}</span></strong>`;
            hasVoted = true;
          } else {
            alert(data.error || "Erreur lors du vote.");
          }
        });
      } else {
        fetch('/api/vote-reponse', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDReponse: IDReponse, IDUser: localStorage.getItem("IDUser") })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            votesRep--;
            boutonVoteRep.innerHTML = `${SVGBoutonVote}${votesRep}</span></strong>`;
            hasVoted = false;
          } else {
            alert(data.error || "Erreur lors du retrait du vote.");
          }
        });
      }
    });
  });
    

    const ConteneurBoutonVoteRep = document.createElement("div");
    ConteneurBoutonVoteRep.className = "bloc-voterep";
    ConteneurBoutonVoteRep.style.display = "flex";
    ConteneurBoutonVoteRep.style.marginRight = "20px";
    ConteneurBoutonVoteRep.style.marginTop = "0px";
    ConteneurBoutonVoteRep.style.marginBottom = "0px";
    ConteneurBoutonVoteRep.style.marginLeft = "20px";
    ConteneurBoutonVoteRep.className = "bloc-voteRep";
    ConteneurBoutonVoteRep.appendChild(boutonVoteRep);

    if ((IDUser == (localStorage.getItem("IDUser"))) || (admin==="1")) { // Si l'utilisateur est l'auteur de la reponse ou un admin
    const boutonsupprimerR = document.createElement("button");
    boutonsupprimerR.innerHTML =  `${SVGSupprimer}`;
    boutonsupprimerR.className = "bouton-supprimerR";
    boutonsupprimerR.addEventListener("click", (event) => {
      event.stopPropagation();
      if (confirm("Êtes-vous sûr de vouloir supprimer cette reponse ?")) {
        fetch('/api/reponse/' + IDReponse, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDUser: IDUser })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              blocQuestion.remove();
            } else {
              alert("Erreur lors de la suppression de la reponse.");
            }
            window.location.reload();
          })
          .catch(err => console.error("Erreur lors de la suppression de la reponse :", err));
      }
    });
    ConteneurBoutonVoteRep.appendChild(boutonsupprimerR);
  }

    reponse.appendChild(usernameRep);
    reponse.appendChild(texte);
    reponse.appendChild(ConteneurBoutonVoteRep);
    return reponse;
  }

  const SaisieRéponses = document.createElement("textarea");
  SaisieRéponses.addEventListener("click", (event) => event.stopPropagation());
  SaisieRéponses.placeholder = "Réponse";
  SaisieRéponses.style.display = "none";
  SaisieRéponses.style.marginLeft = "10px";

  const EnvoyerRéponses = document.createElement("button");
  EnvoyerRéponses.className = "boutons-reponse";
  EnvoyerRéponses.textContent = "Envoyer";
  EnvoyerRéponses.style.display = "none";

  EnvoyerRéponses.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!SaisieRéponses.value.trim()) return (alert("Veuillez écrire une réponse avant de l'envoyer."));
    const usernameReponse = username; // Pour l'affichage local, on peut le changer plus tard
    const txt = SaisieRéponses.value.trim();

    fetch('/api/reponse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ IDQuestion: IDQuestion, corps: txt, IDUser: IDUser, votes: 0 })
    })
      .then(res => res.json())
      .then(data => {
        // On ajoute la réponse à la liste des réponses
        renderAllReponses();
        BoutonRéponses.innerHTML = `${SVGBoutonReponses} ${reponses.length}</span></strong>`;
        SaisieRéponses.value = "";
      })
      .catch(err => console.error("Erreur ajout réponse API:", err));
  });

  const NouvelleRéponse = document.createElement("button");
  NouvelleRéponse.className = "boutons-reponse";
  NouvelleRéponse.style.display = "none";
  NouvelleRéponse.textContent = "Ajouter une réponse";
  NouvelleRéponse.style.marginTop = "10px";
  NouvelleRéponse.addEventListener("click", (event) => {
    event.stopPropagation();
    interfaceVisible3 = !interfaceVisible3;
    if (interfaceVisible3) {
      SaisieRéponses.style.display = "block";
      EnvoyerRéponses.style.display = "block";
    } else {
      SaisieRéponses.style.display = "none";
      EnvoyerRéponses.style.display = "none";
    }
  });

  const PreviewQuestionBlock = document.createElement("div");
  PreviewQuestionBlock.textContent = PreviewQuestion;
  PreviewQuestionBlock.style.display = "none";
  PreviewQuestionBlock.style.backgroundColor = "#3f2a56";
  PreviewQuestionBlock.style.marginLeft = "20px";
  PreviewQuestionBlock.style.marginRight = "20px";
  PreviewQuestionBlock.style.marginTop = "5px";
  PreviewQuestionBlock.style.marginBottom = "5px";
  PreviewQuestionBlock.style.fontSize = "14px";
  PreviewQuestionBlock.style.color = "antiquewhite";

  blocQuestion.addEventListener("mouseenter", () => {
    if (!interfaceVisible1) {
      PreviewQuestionBlock.style.display = "block";
      blocQuestion.style.cursor = "pointer";
      blocQuestion.style.backgroundColor = "#3f2a56";
      PreviewQuestionBlock.style.cursor = "pointer";
      PreviewQuestionBlock.style.backgroundColor = "#3f2a56";
    } else {
      PreviewQuestionBlock.style.display = "none";
    }
  });
  blocQuestion.addEventListener("mouseleave", () => {
    PreviewQuestionBlock.style.display = "none";
    blocQuestion.style.cursor = "default";
    blocQuestion.style.backgroundColor = "#3f2a56";
    PreviewQuestionBlock.style.cursor = "default";
    PreviewQuestionBlock.style.backgroundColor = "#3f2a56";
  });

  
  blocQuestion.appendChild(PreviewQuestionBlock);
  blocQuestion.appendChild(dateQuestion);
  blocQuestion.appendChild(ConteneurBouton);
  blocQuestion.appendChild(NouvelleRéponse);
  blocQuestion.appendChild(SaisieRéponses);
  blocQuestion.appendChild(EnvoyerRéponses);
  blocQuestion.appendChild(ZoneRéponses);
  conteneur.appendChild(blocQuestion);

  renderAllReponses();
}

boutonAjouterQuestion.className = "bouton-ajouter-question";

const boutonPlus = document.createElement("button");
boutonPlus.className = "bouton-plus";
boutonPlus.innerHTML = SVGBoutonPlus;

const texteAjouterQuestion = document.createElement("span");
texteAjouterQuestion.textContent = "Ajouter une question";

boutonAjouterQuestion.addEventListener("click", () => {
  interfaceVisible = !interfaceVisible;

  if (interfaceVisible) {
    boutonPlus.classList.add("on");
    boutonPlus.classList.remove("off");
    SaisieTitreQuestion.style.display = "block";
    SaisieCorpsQuestion.style.display = "block";
    BoutonEnregistrer.style.display = "block";
    imageInput.style.display = "block";
    conteneur.style.display = "block";
  } else {
    boutonPlus.classList.add("off");
    boutonPlus.classList.remove("on");
    SaisieTitreQuestion.style.display = "none";
    SaisieCorpsQuestion.style.display = "none";
    BoutonEnregistrer.style.display = "none";
    imageInput.style.display = "none";
  }
});

boutonAjouterQuestion.appendChild(boutonPlus);
boutonAjouterQuestion.appendChild(texteAjouterQuestion);
BoutonEnregistrer.addEventListener("click", () => {
  const TitreQuestion = SaisieTitreQuestion.value.trim();
  const CorpsQuestion = SaisieCorpsQuestion.value.trim();

  if (!TitreQuestion) return alert("Veuillez remplir au moins le titre de la question.");

  boutonPlus.classList.add("off");
  boutonPlus.classList.remove("on");

  const fichiersImage = imageInput.files;
  const images = [];

  if (fichiersImage && fichiersImage.length > 0) {
    let loaded = 0;
    for (const fichier of fichiersImage) {
      const reader = new FileReader();
      reader.onload = function (e) {
        images.push(e.target.result);
        loaded++;
        if (loaded === fichiersImage.length) {
          envoyerQuestionEtImages(images);
        }
      };
      reader.readAsDataURL(fichier);
    }
  } else {
    envoyerQuestionEtImages([]);
  }

  function envoyerQuestionEtImages(images) {
    fetch('/api/question/' + subjectID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre: TitreQuestion, corps: CorpsQuestion, IDUser: IDUser })
    })
      .then(res => res.json())
      .then(data => {
        if (data.IDQuestion && images.length > 0) {
          fetch('/api/images/' + data.IDQuestion, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images })
          })
          .then(() => {
            rechargerQuestions();
            resetForm();
          });
        } else {
          rechargerQuestions();
          resetForm();
        }
      })
      .catch(err => console.error("Erreur ajout question API:", err));
  }

  function rechargerQuestions() {
    fetch('/get-question/' + subjectID)
      .then(res => res.json())
      .then(questions => {
        conteneur.innerHTML = "";
        questions.sort((a, b) => b.votes - a.votes);
        questions.forEach((q) => {
          createQuestionBlock(q.IDQuestion, q.titre, q.corps, q.votes, [], [], q.username, q.date, q.IDUser);
        });
      });
  }

  function resetForm() {
    SaisieTitreQuestion.value = "";
    SaisieCorpsQuestion.value = "";
    imageInput.value = "";
    SaisieTitreQuestion.style.display = "none";
    SaisieCorpsQuestion.style.display = "none";
    BoutonEnregistrer.style.display = "none";
    imageInput.style.display = "none";
    interfaceVisible = false;
  }
});
