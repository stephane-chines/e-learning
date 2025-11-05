const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs')


app.use(express.json({ limit: '10mb' })); // Permet d'envoyer des images en base64 jusqu'à 10 Mo
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./BDD.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reponses(
    IDReponse INTEGER PRIMARY KEY AUTOINCREMENT,
    IDQuestion INT,
    corps TEXT,
    votes INT,
    IDUser INT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(IDQuestion) REFERENCES questions(IDQuestion),
    FOREIGN KEY(IDUser) REFERENCES Utilisateurs(IDUser)
    );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS chat(
   IDChat INTEGER PRIMARY KEY AUTOINCREMENT,
   IDUser INT,
   corps TEXT,
   date DATETIME DEFAULT CURRENT_TIMESTAMP,
   IDSubject INT,
   FOREIGN KEY(IDSubject) REFERENCES Subject(IDSubject),
   FOREIGN KEY(IDUser) REFERENCES Utilisateurs(IDUser)
   );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS document(
   IDDocument INTEGER PRIMARY KEY AUTOINCREMENT,
   url TEXT,
   nom TEXT,
   IDSubject INT,
   type INT
);`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Utilisateurs(
   IDUser INTEGER PRIMARY KEY AUTOINCREMENT,
   motdepasse TEXT,
   nom TEXT,
   prenom TEXT,
   username TEXT,
   email TEXT,
   PromoID INTEGER,
   ProfilePic TEXT DEFAULT "None",
   professeur INTEGER,
   admin INTEGER DEFAULT 0,
   verification_token TEXT,
   verification_expires DATETIME DEFAULT CURRENT_TIMESTAMP,
   reset_token TEXT,
   reset_expires TEXT,
   verifie INTEGER DEFAULT 0
);`
  );

  db.run(`CREATE TABLE IF NOT EXISTS questions(
   IDQuestion INTEGER PRIMARY KEY AUTOINCREMENT,
   titre TEXT,
   corps TEXT,
   votes INT,
   date DATETIME DEFAULT CURRENT_TIMESTAMP,
   IDUser INT,
   IDSubject INT,
   FOREIGN KEY(IDSubject) REFERENCES Subject(IDSubject),
   FOREIGN KEY(IDUser) REFERENCES Utilisateurs(IDUser)
);`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Images(
   IDImages INTEGER PRIMARY KEY AUTOINCREMENT,
   IDQuestion INT,
   url TEXT,
   FOREIGN KEY(IDQuestion) REFERENCES questions(IDQuestion)
);`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Subject(
   IDSubject INTEGER PRIMARY KEY AUTOINCREMENT,
   subject TEXT UNIQUE,
   Semestre INTEGER,
   PromoID INTEGER,
   imageLink TEXT
   );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Promo(
    PromoID INTEGER PRIMARY KEY AUTOINCREMENT,
    promo TEXT
    )`)
})


db.run(`INSERT OR IGNORE INTO Subject (IDSubject ,subject, Semestre, imageLink, PromoID) VALUES
  (0, 'FPGA', 1, 'image/FPGA.jpg',0),
  (1, 'Microcontrôleur', 1, "image/Electronique-numérique-Microcontrolleur.jpg",0),
  (2, 'Ethique', 1, "image/Ethique.jpg",0),
  (3, 'Gestion de Projet', 1, "image/Gestion-de-projets.jpg",0),
  (4, 'Langage C', 1, "image/Langage-C.jpg",0),
  (5, 'Mécanique Quantique', 1, "image/Mécanique-quantique.jpg",0),
  (6, 'Oddyssée', 1, "image/Oddyssée.png",0),
  (7, 'Probabilités Statistiques', 1, "image/Probabilités-Statistiques.jpg",0),
  (8, 'Transformations Intégrales', 1, "image/Transformations-intégrales.png",0),
  (9, 'Analyse des signaux', 2, 'image/Analyse-des-signaux.jpg',0),
  (10, 'Automatique', 2, 'image/Automatique.jpg',0),
  (11, 'Bases de données', 2, "image/Base-de-données.jpg",0),
  (12, 'Comptabilité', 2, 'image/Comptabilité.jpg',0),
  (13, 'Economie', 2, 'image/Economie.png',0),
  (14, 'Electronique Analogique', 2, 'image/Electronique-analogique.jpg',0),
  (15, 'Marketing', 2, 'image/Marketing.png',0),
  (16, 'Physique du Solide', 2, 'image/Physique-du-solide.png',0),
  (17, 'Programmation Orientée Objet', 2, "image/Programation-orienté-objet.jpg",0),
  (18, 'Réseaux', 2, 'image/Réseau.jpg',0)
`);

db.run(`INSERT OR IGNORE INTO Promo (PromoID, promo) VALUES
  (0, "CSI3"),
  (1, "ISA3")`
)

db.run(`CREATE TABLE IF NOT EXISTS votes_questions (
    IDVoteQ INTEGER PRIMARY KEY AUTOINCREMENT,
    IDUser INTEGER NOT NULL,
    IDQuestion INTEGER NOT NULL,
    UNIQUE(IDUser, IDQuestion),
    FOREIGN KEY(IDUser) REFERENCES Utilisateurs(IDUser),
    FOREIGN KEY(IDQuestion) REFERENCES questions(IDQuestion)
);`)

db.run(`CREATE TABLE IF NOT EXISTS votes_reponses (
    IDVoteR INTEGER PRIMARY KEY AUTOINCREMENT,
    IDUser INTEGER NOT NULL,
    IDReponse INTEGER NOT NULL,
    UNIQUE(IDUser, IDReponse),
    FOREIGN KEY(IDUser) REFERENCES Utilisateurs(IDUser),
    FOREIGN KEY(IDReponse) REFERENCES reponses(IDReponse)
);`)

// Nouvelle route POST pour écrire une question en fonction de la matiere (pour fetch côté client)
app.post('/api/question/:IDSubject', (req, res) => {
  let { titre, corps, IDUser, votes } = req.body;
  let IDSubject = req.params.IDSubject; // Récupération de l'ID du subject depuis les paramètres de la route
  if (!titre) return res.status(400).json({ error: "Le titre est obligatoire" });
  if (!votes) votes = 0;

  const sql = 'INSERT INTO questions (titre, corps, IDUser, votes, IDSubject) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [titre, corps, IDUser, votes, IDSubject], function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'insertion :", err);
      return res.status(500).json({ error: "Erreur lors de l'insertion" });
    }
    // On renvoie l'objet inséré
    res.json({ IDQuestion: this.lastID, titre, corps, IDUser, votes, date: new Date().toISOString(), IDSubject });
  });
});

// Rote POST pour écrire une réponse (pour fetch côté client)
app.post('/api/reponse', (req, res) => {
  const { IDQuestion, corps, IDUser, votes } = req.body;
  if (!IDQuestion || !corps) return res.status(400).json({ error: "IDQuestion et corps sont obligatoires" });
  const votesValue = votes || 0;
  const sql = 'INSERT INTO reponses (IDQuestion, IDUser, corps, votes) VALUES (?, ?, ?, ?)';
  db.run(sql, [IDQuestion, IDUser, corps, votesValue], function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'insertion de la réponse :", err);
      return res.status(500).json({ error: "Erreur lors de l'insertion de la réponse" });
    }
    res.json({ IDReponse: this.lastID, IDQuestion, corps, IDUser, votes: votesValue, date: new Date().toISOString() });
  });
});

// Route GET pour lire toutes les questions d'une matiere (utilisée pour l'affichage)
app.get('/get-question/:IDSubject', (req, res) => {
  const IDSubject = req.params.IDSubject;
  db.all(`
    SELECT questions.*, Utilisateurs.username
    FROM questions
    LEFT JOIN Utilisateurs ON questions.IDUser = Utilisateurs.IDUser
    WHERE questions.IDSubject = ?`, [IDSubject], (err, rows) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des questions :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des questions" });
    }
    res.json(rows);
  });
});

// Route GET pour lire le chat d'un subject

app.get('/get-chat/:IDSubject', (req, res) => {
  const IDSubject = req.params.IDSubject;
  db.all(`
    SELECT chat.*, Utilisateurs.username
    FROM chat
    LEFT JOIN Utilisateurs ON chat.IDUser = Utilisateurs.IDUser
    WHERE chat.IDSubject = ?
    ORDER BY chat.date ASC
  `, [IDSubject], (err, rows) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture du chat :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture du chat" });
    }
    res.json(rows);
  });
});
// Route POST forgot-password
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });

  db.get("SELECT * FROM Utilisateurs WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Erreur SELECT :", err);
      return res.status(500).json({ error: 'Erreur base de données.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // expire dans 30 minutes

    db.run(
      "UPDATE Utilisateurs SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, email],
      async (errUpdate) => {
        if (errUpdate) {
          console.error("Erreur UPDATE :", errUpdate);
          return res.status(500).json({ error: 'Erreur lors de l’enregistrement du token.' });
        }

        const resetLink = `${process.env.RESET_URL}?token=${token}&email=${encodeURIComponent(email)}`;

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                            <p>Bonjour,</p>
                            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                            <p>Cliquez sur le lien suivant pour créer un nouveau mot de passe :</p>
                            <a href="${resetLink}">${resetLink}</a>
                            <p><i>Ce lien est valable 30 minutes.</i></p>
                        `
          });

          res.json({ success: true });
        } catch (errMail) {
          console.error("Erreur envoi email :", errMail);
          res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
        }
      }
    );
  });
});
app.post('/api/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const saltRounds = 10;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  // Rechercher l'utilisateur avec ce token + mail, et vérifier qu’il n’est pas expiré
  const sql = `
    SELECT * FROM Utilisateurs 
    WHERE email = ? AND reset_token = ? AND datetime(reset_expires) > datetime('now')
  `;
  db.get(sql, [email, token], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erreur interne" });
    }
    if (!user) {
      return res.status(400).json({ error: "Lien invalide ou expiré" });
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mise à jour du mot de passe et suppression du token
    const updateSql = `
      UPDATE Utilisateurs 
      SET motdepasse = ?, reset_token = NULL, reset_expires = NULL 
      WHERE IDUser = ?
    `;
    db.run(updateSql, [hashedPassword, user.IDUser], function (err) {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe" });
      }
      return res.json({ success: true, message: "Mot de passe réinitialisé avec succès." });
    });
  });
});

// Route GET pour lire les réponses d'une question
app.get('/get-reponses/:id', (req, res) => {
  const id = req.params.id;
  db.all(`
    SELECT reponses.*, Utilisateurs.username
    FROM reponses
    LEFT JOIN Utilisateurs ON reponses.IDUser = Utilisateurs.IDUser
    WHERE reponses.IDQuestion = ?
  `, [id], (err, rows) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des réponses :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des réponses" });
    }
    res.json(rows);
  });
});

app.post('/verif-mdp', async (req, res) => {
  const { IDUser, ancienMDP } = req.body;
  if (!IDUser || !ancienMDP) {
    return res.status(400).json({ error: "IDUser et ancienMDP sont requis" });
  }
  db.get('SELECT motdepasse FROM Utilisateurs WHERE IDUser = ?', [IDUser], async (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la récupération du MDP :", err);
      return res.status(500).json({ error: "Erreur lors de la récupération du MDP" });
    }
    if (!row) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    const match = await bcrypt.compare(ancienMDP, row.motdepasse);
    res.json({ match });
  });
});

app.put('/change-mdp', async (req, res) => {
  const { IDUser, nouveauMDP } = req.body;
  if (!IDUser || !nouveauMDP) {
    return res.status(400).json({ error: "IDUser et nouveauMDP sont requis" });
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(nouveauMDP, saltRounds);
  db.run("UPDATE Utilisateurs SET motdepasse = ? WHERE IDUser = ?", [hashedPassword, IDUser], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la modification du MDP :", err);
      return res.status(500).json({ error: "Erreur lors de la modification du MDP" });
    }
    res.json({ success: true });
  })
})

// Route GET pour obtenir le nombre de réponses d'une question
app.get('/get-nb-reponses/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT COUNT(*) AS nbReponses FROM reponses WHERE IDQuestion = ?', [id], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture du nombre de réponses :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture du nombre de réponses" });
    }
    res.json({ nbReponses: row.nbReponses });
  });
});

// Route GET pour obtenir le nombre de votes d'une réponse à une question
app.get('/get-votes-reponse/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT votes FROM reponses WHERE IDReponse = ?', [id], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des votes :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des votes" });
    }
    if (!row) return res.status(404).json({ error: "Réponse non trouvée" });
    res.json({ votes: row.votes });
  });
});
// Date actuelle + 24h (en secondes)

// Route pour upload la photo de profil
app.post('/api/upload-profile-pic/:IDUser', (req, res) => {
  const { image } = req.body;

  if (!image) return res.status(400).json({ error: "Aucune image reçue" });

  const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: "Format d'image invalide" });

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const filename = `PPUser${req.params.IDUser}.${ext}`;
  const filepath = path.join(__dirname, 'public', 'PPs', filename);

  fs.writeFile(filepath, Buffer.from(data, 'base64'), err => {
    if (err) {
      console.error("Erreur lors de l'enregistrement de l'image :", err);
      return res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
    res.json({ filename });
  });
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });

    res.status(200).json({ success: true, message: 'E-mail envoyé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de l’envoi de l’e-mail' });
  }
});


app.get('/api/valider', (req, res) => {
  const token = req.query.token;
  console.log("Token reçu :", token);
  console.log("Heure du serveur :", new Date().toISOString());

  const sql = `SELECT * FROM Utilisateurs WHERE verification_token = ? `;

  db.get(sql, [token], (err, row) => {
    if (err || !row) {
      return res.status(400).send("Vous pouvez à présent vous connecter aux services JuniHelp.");
    }

    const updateSql = `UPDATE Utilisateurs SET verifie = 1, verification_token = NULL, verification_expires = NULL WHERE IDUser = ?`;

    db.run(updateSql, [row.IDUser], (err2) => {
      if (err2) return res.status(500).send("Erreur lors de la validation.");
      return res.send("Adresse e-mail vérifiée avec succès !");
    });
  });
});


// Route GET pour lire les votes d'une question
app.get('/get-votes-question/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT votes FROM questions WHERE IDQuestion = ?', [id], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des votes :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des votes" });
    }
    if (!row) return res.status(404).json({ error: "Question non trouvée" });
    res.json({ votes: row.votes });
  });
});

// Route GET pour connâitre le nombre de chats d'un subject
app.get('/get-nb-chats/:IDSubject', (req, res) => {
  const IDSubject = req.params.IDSubject;
  db.get('SELECT COUNT(*) AS nbchats FROM chat WHERE IDSubject = ?', [IDSubject], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture du nombre de chats :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture du nombre de chats" });
    }
    res.json({ nbchats: row.nbchats });
  });
});

// Route GET pour connaitre toutes les promos enregistrées dans la BDD
app.get('/get-all-promos', (req, res) => {
  db.all('SELECT * FROM Promo', (err, rows) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des promos :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des promos" });
    }
    res.json({ rows });
  })
})

// Route GET pour obtenir les informations d'un utilisateur
app.get('/get-user-info/:IDUser', (req, res) => {
  const IDUser = req.params.IDUser;
  db.get('SELECT * FROM Utilisateurs WHERE IDUser = ?', [IDUser], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la récupération des infos de l'utilisateur :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des infos de l'user" });
    }
    if (!row) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(row);
  })
})

// Route GET pour obtenir les matières à afficher (en fonction de la promo)
app.get('/get-subjects/:PromoID', (req, res) => {
  const PromoID = req.params.PromoID;
  db.all('SELECT * FROM Subject WHERE PromoID = ?', [PromoID], (err, rows) => {
    if (err) {
      console.error("Erreur SQlite : ", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des matières à afficher" });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Promo non trouvée" });
    res.json(rows);
  })
})


// Route POST pour écrire un message dans le chat
app.post('/api/new-chat', (req, res) => {
  const { corps, IDUser, IDSubject } = req.body;
  const sql = 'INSERT INTO chat (corps, IDUser, IDSubject) VALUES (?, ?, ?)';
  db.run(sql, [corps, IDUser, IDSubject], function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'insertion du chat :", err);
      return res.status(500).json({ success: false, error: "Erreur lors de l'insertion du chat" });
    }
    res.json({ success: true, IDChat: this.lastID, corps, IDUser, date: new Date().toISOString(), IDSubject });
  });
});

// Vote pour une question (empêche le double vote)
app.post('/api/vote', (req, res) => {
  const { IDQuestion, IDUser } = req.body;
  if (!IDQuestion || !IDUser) return res.status(400).json({ error: "ID Manquante" });

  db.get('SELECT * FROM votes_questions WHERE IDUser = ? AND IDQuestion = ?', [IDUser, IDQuestion], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la vérification du vote :", err);
      return res.status(500).json({ error: "Erreur lors de la vérification du vote" });
    }
    if (row) {
      return res.status(400).json({ error: "Vous avez déjà voté pour cette question." });
    }
    db.run('INSERT INTO votes_questions (IDUser, IDQuestion) VALUES (?, ?)', [IDUser, IDQuestion], function (err) {
      if (err) {
        console.error("Erreur SQLite lors de l'insertion du vote :", err);
        return res.status(500).json({ error: "Erreur lors de l'insertion du vote" });
      }
      db.run('UPDATE questions SET votes = votes + 1 WHERE IDQuestion = ?', [IDQuestion], function (err) {
        if (err) {
          console.error("Erreur SQLite lors du vote :", err);
          return res.status(500).json({ error: "Erreur lors du vote" });
        }
        res.json({ success: true });
      });
    });
  });
});

// Vote pour une réponse (empêche le double vote)
app.post('/api/vote-reponse', (req, res) => {
  const { IDReponse, IDUser } = req.body;
  if (!IDReponse || !IDUser) return res.status(400).json({ error: "ID Manquante" });

  db.get('SELECT * FROM votes_reponses WHERE IDUser = ? AND IDReponse = ?', [IDUser, IDReponse], (err, row) => {
    if (err) {
      console.error("Erreur SQLite lors de la vérification du vote :", err);
      return res.status(500).json({ error: "Erreur lors de la vérification du vote" });
    }
    if (row) {
      return res.status(400).json({ error: "Vous avez déjà voté pour cette réponse." });
    }
    db.run('INSERT INTO votes_reponses (IDUser, IDReponse) VALUES (?, ?)', [IDUser, IDReponse], function (err) {
      if (err) {
        console.error("Erreur SQLite lors de l'insertion du vote :", err);
        return res.status(500).json({ error: "Erreur lors de l'insertion du vote" });
      }
      db.run('UPDATE reponses SET votes = votes + 1 WHERE IDReponse = ?', [IDReponse], function (err) {
        if (err) {
          console.error("Erreur SQLite lors du vote pour la réponse :", err);
          return res.status(500).json({ error: "Erreur lors du vote pour la réponse" });
        }
        res.json({ success: true });
      });
    });
  });
});

// Route POST pour envoyer un nouveau document
app.post('/api/new-doc', (req, res) => {
  const { nom, IDSubject, type, fichier } = req.body;
  if (!nom || !IDSubject || !type || !fichier) {
    return res.status(400).json({ success: false, error: "Champs manquants" });
  }
  // 1. Insertion avec url temporaire
  db.run('INSERT INTO document (url, nom, IDSubject, type) VALUES (?, ?, ?, ?)', ["", nom, IDSubject, type], function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'écriture du nouveau document :", err);
      return res.status(500).json({ success: false, error: "Erreur lors de l'écriture du document" });
    }
    const IDDocument = this.lastID;
    const matches = fichier.match(/^data:application\/pdf;base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, error: "Format de fichier invalide" });
    }
    const data = matches[1];
    const url = `document${IDDocument}.pdf`;
    const filepath = path.join(__dirname, 'public', 'documents', 'files', url);

    fs.writeFile(filepath, Buffer.from(data, 'base64'), err2 => {
      if (err2) {
        console.error("Erreur lors de l'enregistrement du PDF :", err2);
        return res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement du PDF" });
      }
      // 2. Mise à jour de l'url avec le bon format
      db.run('UPDATE document SET url = ? WHERE IDDocument = ?', [url, IDDocument], function (err3) {
        if (err3) {
          console.error("Erreur SQLite lors de la mise à jour de l'url :", err3);
          return res.status(500).json({ success: false, error: "Erreur lors de la mise à jour de l'url" });
        }
        res.json({ success: true, IDDocument, nom, url, IDSubject, type });
      });
    });
  });
});

app.get('/api/documents/:IDSubject/:type', (req, res) => {
  const { IDSubject, type } = req.params;
  db.all('SELECT * FROM document WHERE IDSubject = ? AND type = ?', [IDSubject, type], (err, rows) => {
    if (err) {
      console.error("Erreur SQLite lors de la lecture des documents :", err);
      return res.status(500).json({ error: "Erreur lors de la lecture des documents" });
    }
    res.json(rows);
  });
});

app.post('/api/inscription', async (req, res) => {
  const { email, motdepasse, prenom, nom, professeur, PromoID } = req.body;

  if (!email) return res.status(400).json({ error: "Le mail est obligatoire" });
  if (!motdepasse) return res.status(400).json({ error: "Le mot de passe est obligatoire" });
  if (!PromoID) return res.status(400).json({ error: "La promo est obligatoire" });

  try {
    // Vérifie manuellement si l'email existe déjà
    db.get('SELECT email FROM Utilisateurs WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error("Erreur SQLite lors de la vérification :", err);
        return res.status(500).json({ error: "Erreur lors de la vérification de l'email" });
      }

      if (existingUser) {
        return res.status(409).json({ error: "Cette adresse email est déjà utilisée." });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(motdepasse, saltRounds);
      const username = prenom + " " + nom;
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // +24h

      const sql = 'INSERT INTO Utilisateurs (email, motdepasse, prenom, nom, professeur, username, PromoID, verification_token, verification_expires, verifie) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)';
      db.run(sql, [email, hashedPassword, prenom, nom, professeur || 0, username, PromoID, token, expires], function (insertErr) {
        if (insertErr) {
          console.error("Erreur SQLite lors de l'insertion :", insertErr);
          return res.status(500).json({ error: "Erreur lors de l'insertion" });
        }

        return res.status(200).json({ success: true, token });
      });
    });

  } catch (error) {
    console.error("Erreur globale :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route PUT pour modiifer les infos d'un utilisateur
app.put('/update-user/:IDUser', (req, res) => {
  const IDUser = req.params.IDUser;
  const { prenom, nom, PromoID, username, ProfilePic } = req.body;

  if (!prenom || !nom || PromoID === undefined) {
    return res.status(400).json({ error: "Prénom, nom et PromoID sont manquants" })
  }

  let sql, params;
  if (ProfilePic) {
    sql = 'UPDATE Utilisateurs SET prenom = ?, nom = ?, PromoID = ?, ProfilePic = ?, username = ? WHERE IDUser = ?';
    params = [prenom, nom, PromoID, ProfilePic, username, IDUser];
  } else {
    sql = 'UPDATE Utilisateurs SET prenom = ?, nom = ?, PromoID = ?, username = ? WHERE IDUser = ?';
    params = [prenom, nom, PromoID, username, IDUser];
  }

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erreur SQLite lors de la modification de l'user", err);
      return res.status(500).json({ error: "Erreur lors de la modification" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ success: true });
  })
});

app.post('/api/connexion', async (req, res) => {
  const { email, motdepasse } = req.body;
  // Récupérer l'utilisateur depuis la base de données via l'email
  db.get('SELECT * FROM Utilisateurs WHERE email = ? AND verifie=1', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erreur interne" });
    }
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Comparer le mot de passe en clair reçu avec le mot de passe haché stocké
    const match = await bcrypt.compare(motdepasse, user.motdepasse);
    if (match) {
      return res.json({ IDUser: user.IDUser, username: user.username, admin: user.admin });
    } else {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
  });
});

app.post('/add-subject', (req, res) => {
  const { subject, Semestre, PromoID, imageLink } = req.body;
  if (!subject || !Semestre || !PromoID) {
    return res.status(400).json({ error: "Nom de la matière, semestre et promo requis." });
  }
  const sql = 'INSERT INTO Subject (subject, Semestre, PromoID, imageLink) VALUES (?, ?, ?, ?)';
  db.run(sql, [subject, Semestre, PromoID, imageLink || ""], function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'ajout de la matière :", err);
      return res.status(500).json({ error: "Erreur lors de l'ajout de la matière." });
    }
    res.json({ success: true, IDSubject: this.lastID });
  });
});


app.delete('/api/question/:IDQuestion', (req, res) => {
  const IDQuestion = req.params.IDQuestion;
  const { IDUser } = req.body;

  if (!IDQuestion || !IDUser) {
    return res.status(400).json({ error: "IDQuestion ou IDUser manquant" });
  }

  db.get('SELECT IDUser FROM questions WHERE IDQuestion = ?', [IDQuestion], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la vérification de l'auteur" });
    }
    if (!row) {
      return res.status(404).json({ error: "Question non trouvée" });
    }

    // Vérifie si l'utilisateur est l'auteur OU admin
    db.get('SELECT admin FROM Utilisateurs WHERE IDUser = ?', [IDUser], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: "Erreur lors de la vérification de l\'admin" });
      }
      if (parseInt(row.IDUser) !== parseInt(IDUser) && user.admin !== 1) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cette question" });
      }

      db.run('DELETE FROM questions WHERE IDQuestion = ?', [IDQuestion], function (err) {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la suppression de la question" });
        }
        res.json({ success: true });
      });
    });
  });
});

app.delete('/api/reponse/:IDReponse', (req, res) => {
  const IDReponse = req.params.IDReponse;
  const { IDUser } = req.body;

  if (!IDReponse || !IDUser) {
    return res.status(400).json({ error: "IDReponse ou IDUser manquant" });
  }

  db.get('SELECT IDUser FROM reponses WHERE IDReponse = ?', [IDReponse], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la vérification de l'auteur" });
    }
    if (!row) {
      return res.status(404).json({ error: "Reponse non trouvée" });
    }

    // Vérifie si l'utilisateur est l'auteur OU admin
    db.get('SELECT admin FROM Utilisateurs WHERE IDUser = ?', [IDUser], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: "Erreur lors de la vérification de l'admin" });
      }
      if (parseInt(row.IDUser) !== parseInt(IDUser) && user.admin !== 1) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cette reponse" });
      }

      db.run('DELETE FROM reponses WHERE IDReponse = ?', [IDReponse], function (err) {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la suppression de la reponse" });
        }
        res.json({ success: true });
      });
    });
  });
});

app.delete('/api/chat/:IDChat', (req, res) => {
  const IDChat = req.params.IDChat;
  const { IDUser } = req.body;

  if (!IDChat || !IDUser) {
    return res.status(400).json({ error: "IDChat ou IDUser manquant" });
  }

  db.get('SELECT IDUser FROM chat WHERE IDChat = ?', [IDChat], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la vérification de l'auteur" });
    }
    if (!row) {
      return res.status(404).json({ error: "Chat non trouvée" });
    }

    // Vérifie si l'utilisateur est l'auteur OU admin
    db.get('SELECT admin FROM Utilisateurs WHERE IDUser = ?', [IDUser], (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: "Erreur lors de la vérification de l'admin" });
      }
      if (parseInt(row.IDUser) !== parseInt(IDUser) && user.admin !== 1) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer ce chat" });
      }

      db.run('DELETE FROM chat WHERE IDChat = ?', [IDChat], function (err) {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la suppression du Chat" });
        }
        res.json({ success: true });
      });
    });
  });
});


// Enlever un vote sur une question
app.delete('/api/vote', (req, res) => {
  const { IDQuestion, IDUser } = req.body;
  if (!IDQuestion || !IDUser) return res.status(400).json({ error: "ID Manquante" });

  db.get('SELECT * FROM votes_questions WHERE IDUser = ? AND IDQuestion = ?', [IDUser, IDQuestion], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la vérification du vote" });

    db.run('DELETE FROM votes_questions WHERE IDUser = ? AND IDQuestion = ?', [IDUser, IDQuestion], function (err) {
      if (err) return res.status(500).json({ error: "Erreur lors de la suppression du vote" });
      db.run('UPDATE questions SET votes = votes - 1 WHERE IDQuestion = ?', [IDQuestion], function (err) {
        if (err) return res.status(500).json({ error: "Erreur lors du décrément du vote" });
        res.json({ success: true });
      });
    });
  });
});

// Enlever un vote sur une réponse
app.delete('/api/vote-reponse', (req, res) => {
  const { IDReponse, IDUser } = req.body;
  if (!IDReponse || !IDUser) return res.status(400).json({ error: "ID Manquante" });

  db.get('SELECT * FROM votes_reponses WHERE IDUser = ? AND IDReponse = ?', [IDUser, IDReponse], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la vérification du vote" });
    if (!row) return res.status(400).json({ error: "Vous n'avez pas encore voté pour cette réponse." });

    db.run('DELETE FROM votes_reponses WHERE IDUser = ? AND IDReponse = ?', [IDUser, IDReponse], function (err) {
      if (err) return res.status(500).json({ error: "Erreur lors de la suppression du vote" });
      db.run('UPDATE reponses SET votes = votes - 1 WHERE IDReponse = ?', [IDReponse], function (err) {
        if (err) return res.status(500).json({ error: "Erreur lors du décrément du vote" });
        res.json({ success: true });
      });
    });
  });
});


app.get('/has-voted-question/:IDQuestion', (req, res) => {
  const IDQuestion = req.params.IDQuestion;
  const IDUser = req.query.IDUser;
  db.get('SELECT 1 FROM votes_questions WHERE IDUser = ? AND IDQuestion = ?', [IDUser, IDQuestion], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur SQL" });
    res.json({ hasVoted: !!row });
  });
});


app.get('/has-voted-reponse/:IDReponse', (req, res) => {
  const IDReponse = req.params.IDReponse;
  const IDUser = req.query.IDUser;
  db.get('SELECT 1 FROM votes_reponses WHERE IDUser = ? AND IDReponse = ?', [IDUser, IDReponse], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur SQL" });
    res.json({ hasVoted: !!row });
  });
});



app.get('/download-bdd', (req, res) => {
  const file = path.join(__dirname, 'BDD.db');
  res.download(file, 'BDD.db', (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement de la BDD :", err);
      res.status(500).send("Erreur lors du téléchargement de la base de données.");
    }
  });
});

app.get('/delete-document/:IDDocument', (req, res) => {
  const IDDocument = req.params.IDDocument;
  // 1. Récupérer l'URL du fichier
  db.get('SELECT url FROM document WHERE IDDocument = ?', [IDDocument], (err, row) => {
    if (err || !row) {
      return res.status(404).send("Document non trouvé");
    }
    const filepath = path.join(__dirname, 'public', 'documents', 'files', row.url);
    // 2. Supprimer le fichier du disque
    fs.unlink(filepath, (err2) => {
      // Même si le fichier n'existe pas, on continue la suppression en BDD
      db.run('DELETE FROM document WHERE IDDocument = ?', [IDDocument], function (err3) {
        if (err3) {
          return res.status(500).send("Erreur lors de la suppression en BDD");
        }
        res.send("Document supprimé");
      });
    });
  });
});


app.delete('/api/subject/:IDSubject', (req, res) => {
  const IDSubject = req.params.IDSubject;
  const IDUser = req.query.IDUser;
  if (!IDSubject || !IDUser) {
    return res.status(400).json({ error: "IDSubject ou IDUser manquant" });
  }
  db.get('SELECT admin FROM Utilisateurs WHERE IDUser = ?', [IDUser], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: "Erreur lors de la vérification de l'admin" });
    }
    if (user.admin !== 1) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cette matière" });
    }
    db.run('DELETE FROM Subject WHERE IDSubject = ?', [IDSubject], function (err) {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la suppression de la matière" });
      }
      res.json({ success: true });
    });
  });
});


app.post('/api/images/:IDQuestion', (req, res) => {
  const { images } = req.body;
  const IDQuestion = req.params.IDQuestion;
  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ error: "Aucune image reçue" });
  }
  let saved = 0;
  images.forEach((imgData, idx) => {
    const matches = imgData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return;
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const filename = `Q${IDQuestion}_img${idx}.${ext}`;
    const filepath = path.join(__dirname, 'public', 'Images', filename);
    fs.writeFile(filepath, Buffer.from(data, 'base64'), err => {
      if (!err) {
        // Tu peux enregistrer le nom dans la BDD si tu veux
      }
      saved++;
      if (saved === images.length) {
        res.json({ success: true });
      }
    });
  });
});


app.get('/api/images/:IDQuestion', (req, res) => {
  const IDQuestion = req.params.IDQuestion;
  const dir = path.join(__dirname, 'public', 'Images');
  fs.readdir(dir, (err, files) => {
    if (err) return res.json({ images: [] });
    // Filtre les fichiers qui correspondent à la question
    const images = files
      .filter(f => f.startsWith(`Q${IDQuestion}_img`))
      .map(f => `/Images/${f}`);
    res.json({ images });
  });
});



app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

// Route pour la racine (redirige vers la page de connexion si non connecté côté client)
app.get('/', (req, res) => {
  res.redirect('/Connexion/connexion.html');
});



app.use((req, res, next) => {
  if (!req.session || !req.session.IDUser) {
    return res.redirect('/Connexion/connexion.html');
  }
  next();
});
