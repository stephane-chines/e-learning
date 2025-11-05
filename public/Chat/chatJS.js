if (!localStorage.getItem("IDUser") || localStorage.getItem("IDUser") === "-1") {
  window.location.href = "/Connexion/connexion.html";
}

const matiereTitle = document.getElementById('chat-matiere-title');
const matiereName = localStorage.getItem("selectedSubjectName");
if (matiereTitle && matiereName) {
    matiereTitle.textContent = `${matiereName}`;
}
const IDSubject = localStorage.getItem("selectedSubjectID");
const username = localStorage.getItem("username");
const contenu = document.getElementById('contenu');
const QuestionsReponses = document.querySelector("#QR");
const Documents = document.querySelector("#Documents");
const RetourLobby = document.querySelector("#bouton-menu");
const IDUser = localStorage.getItem("IDUser");


QuestionsReponses.addEventListener("click", () => {
    window.location.href = "/QR";
});

Documents.addEventListener("click", () => {
    window.location.href = "/documents/documents.html";
});

RetourLobby.addEventListener("click", () => {
    window.location.href = "/Accueil/Accueil.html";
});
  
function scrollToBottom() {
    const contenu = document.getElementById('contenu');
    contenu.scrollTop = contenu.scrollHeight;
}

let allChatBlock = document.createElement('div');
allChatBlock.className = 'all-chat-block';

const chatBox = document.getElementById('chatbox');
chatBox.className = 'chatbox';

const chatInput = document.createElement('textarea');
chatInput.className = 'chat-input';
chatInput.placeholder = 'Envoyer un chat ...';
const sendButton = document.createElement('button');
sendButton.innerHTML = `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><g stroke="antiquewhite" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m7.39999 6.32003 8.49001-2.83c3.81-1.27 5.88.81 4.62 4.62l-2.83 8.48997c-1.9 5.71-5.02 5.71-6.92 0l-.84001-2.52-2.52-.84c-5.71-1.9-5.71-5.00997 0-6.91997z"/><path d="m10.11 13.6501 3.58-3.59"/></g></svg>`;
sendButton.className = 'send-button';

chatInput.addEventListener("keydown", (event) => {
    // Vérifie si la touche pressée est "Enter" et qu'aucune touche Shift n'est utilisée (pour garder le saut de ligne)
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Empêche le passage à la ligne
        sendButton.click(); // Simule le clic sur le bouton d'envoi
    }
});

sendButton.addEventListener('click', () => {
    const corps = chatInput.value.trim();
    if (corps) {
        new_chat(corps, IDUser, IDSubject);
        chatInput.value = '';
    }
});

chatBox.appendChild(chatInput);
chatBox.appendChild(sendButton);


let displayedChatIDs = [];
let firstLoad = true;

function createSingleChatBlock(chat, hideHeader = false, IDChat = chat.IDChat) {
    const isMe = String(chat.IDUser) === String(localStorage.getItem("IDUser"));
    const isAdmin = localStorage.getItem("admin") === "1";
    const singleChatBlock = document.createElement('div');
    singleChatBlock.className = 'single-chat-block' + (isMe ? ' me' : '');

    if (!hideHeader) {
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header' + (isMe ? ' me' : '');

        const profilePic = document.createElement('img');
        profilePic.className = 'chat-profile-pic';
        profilePic.src = '../PPs/defaultPP.jpg';

        const userNameDisplay = document.createElement('p');
        userNameDisplay.className = 'chat-user';
        userNameDisplay.textContent = '...';

        const chatDate = document.createElement('span');
        chatDate.className = 'chat-date';

        const chatDateObj = new Date(chat.date);
        const now = new Date();
        const sameDay = chatDateObj.toDateString() === now.toDateString();

        chatDate.textContent = sameDay
            ? chatDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : chatDateObj.toLocaleDateString() + ' ' + chatDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatHeader.appendChild(profilePic);
        chatHeader.appendChild(userNameDisplay);
        chatHeader.appendChild(chatDate);
        singleChatBlock.appendChild(chatHeader);

        fetch(`/get-user-info/${chat.IDUser}`)
            .then(res => res.json())
            .then(userData => {
                userNameDisplay.textContent = userData.username;
                if (userData.ProfilePic && userData.ProfilePic !== "None") {
                    profilePic.src = `../PPs/${userData.ProfilePic}`;
                }
            });
    }

    const chatMessageBlock = document.createElement('div');
    chatMessageBlock.className = 'chat-message-block';

    const chatContent = document.createElement('p');
    chatContent.className = 'chat-content';
    chatContent.textContent = chat.corps;

    chatMessageBlock.appendChild(chatContent);

    // Ajoute le bouton supprimer pour l'auteur ou l'admin
    if (isMe || isAdmin) {
        const boutonsupprimer = document.createElement("button");
        boutonsupprimer.className = 'bouton-supprimerC';
        boutonsupprimer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 32 32" width="20px" height="20px"><path fill="#f06b42" d="M 15 4 C 14.476563 4 13.941406 4.183594 13.5625 4.5625 C 13.183594 4.941406 13 5.476563 13 6 L 13 7 L 7 7 L 7 9 L 8 9 L 8 25 C 8 26.644531 9.355469 28 11 28 L 23 28 C 24.644531 28 26 26.644531 26 25 L 26 9 L 27 9 L 27 7 L 21 7 L 21 6 C 21 5.476563 20.816406 4.941406 20.4375 4.5625 C 20.058594 4.183594 19.523438 4 19 4 Z M 15 6 L 19 6 L 19 7 L 15 7 Z M 10 9 L 24 9 L 24 25 C 24 25.554688 23.554688 26 23 26 L 11 26 C 10.445313 26 10 25.554688 10 25 Z M 12 12 L 12 23 L 14 23 L 14 12 Z M 16 12 L 16 23 L 18 23 L 18 12 Z M 20 12 L 20 23 L 22 23 L 22 12 Z"/></svg>`;
        boutonsupprimer.addEventListener("click", (event) => {
        event.stopPropagation();
        if (confirm("Êtes-vous sûr de vouloir supprimer ce chat ?")) {
        fetch('/api/chat/' + IDChat, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ IDUser: IDUser })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              singleChatBlock.remove();
            } else {
              alert("Erreur lors de la suppression du chat.");
            }
            window.location.reload();
          })
          .catch(err => console.error("Erreur lors de la suppression du chat :", err));
      }
        });
        chatMessageBlock.appendChild(boutonsupprimer);
    }

    singleChatBlock.appendChild(chatMessageBlock);
    return singleChatBlock;
}


function get_all_chats(IDSubject) {
    fetch(`/get-chat/${IDSubject}`)
        .then(res => res.json())
        .then(data => {
            data.sort((a, b) => {
                const dateA = Date.parse(a.date);
                const dateB = Date.parse(b.date);
                if (dateA !== dateB) return dateA - dateB;
                return a.IDChat - b.IDChat;
            });

            let newMessageAdded = false;

            // Ajoute seulement les nouveaux messages
            let lastUserId = null;

            data.forEach((chat, i) => {
    if (!displayedChatIDs.includes(chat.IDChat)) {
        let hideHeader = false;
        if (i > 0) {
            const prevChat = data[i - 1];
            const sameUser = chat.IDUser === prevChat.IDUser;
            const prevDate = new Date(prevChat.date);
            const currDate = new Date(chat.date);
            const diffMs = currDate - prevDate;
            // Affiche le header si ce n'est pas le même user ou si plus de 2 min d'écart
            hideHeader = sameUser && diffMs < 2 * 60 * 1000;
        }
        const singleChatBlock = createSingleChatBlock(chat, hideHeader);
        allChatBlock.appendChild(singleChatBlock);
        displayedChatIDs.push(chat.IDChat);
        newMessageAdded = true;
    }
});

            if (!contenu.contains(allChatBlock)) {
                contenu.appendChild(allChatBlock);
            }

            // Scrolle toujours en bas s'il y a un nouveau message
            if (newMessageAdded) {
                scrollToBottom();
            }

            // Scrolle en bas au premier chargement
            if (firstLoad) {
                setTimeout(() => {
                    contenu.scrollTop = contenu.scrollHeight;
                }, 0);
                firstLoad = false;
            }
        });
}


function new_chat(corps, IDUser, IDSubject) {
    fetch('/api/new-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ corps, IDUser, IDSubject })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('Error creating chat:', data.message);
        }
    });
    get_all_chats(IDSubject);
}

contenu.scrollTop = contenu.scrollHeight;
get_all_chats(IDSubject);
setInterval(() => {
    get_all_chats(IDSubject);
}, 2000);
