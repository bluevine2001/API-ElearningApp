require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "discord_clone",
  port: 8889,
});

// récupérer les serveurs d'un utilisateurs //fait
app.get("/servers/of/:id", authenticateToken, (req, res) => {
  const userid = req.params.id;
  pool.query(
    "SELECT listeservs FROM users WHERE id = ?",
    [userid],
    (err, resids) => {
      if (err) {
        console.log(err);
      } else {
        ids = resids[0].listeservs;
        console.log(ids);
        if (ids != null && ids.includes("|")) {
          ids = ids.split("|");
          res.json({ ids: ids });
        } else if (ids != null) {
          res.json({ ids: ids });
        } else {
          res.json({ ids: null });
        }
      }
    }
  );
});

app.get("/getAllServers/", authenticateToken, (req, res) => {
  pool.query("SELECT * FROM serveurs LIMIT 100", (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
      res.json(results);
    }
  });
});

app.get("/getAllUsers/", authenticateToken, (req, res) => {
  pool.query("SELECT * FROM users LIMIT 100", (err, results) => {
    if (err) {
      console.log(err);
    } else {
      console.log(results);
      res.json(results);
    }
  });
});

app.get("/getChapters/:id", authenticateToken, (req, res) => {
  const servid = req.params.id;
  //console.log(servid);
  pool.query(
    "SELECT * FROM chapters WHERE servid = ?",
    [servid],
    (err, result) => {
      if (err) console.log(err);
      else {
        console.log(result);
        res.json(result);
      }
    }
  );
});

app.post("/getLessons", authenticateToken, (req, res) => {
  const servid = req.body.servid;
  const chapter = req.body.chapter;
  pool.query(
    "SELECT * FROM lessons WHERE servid = ? AND lessonChapter = ?",
    [servid, chapter],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.json(result);
      }
    }
  );
});

app.post("/addLessons", authenticateToken, (req, res) => {
  const {
    servid,
    chapterid,
    lessonNumber,
    lessonContent,
    lessonTitle,
    hasQuiz,
    q1,
    q2,
    q3,
    a11,
    a12,
    a13,
    a21,
    a22,
    a23,
    a31,
    a32,
    a33,
    ca1,
    ca2,
    ca3,
  } = req.body;
  pool.query(
    "INSERT INTO `lessons`(`servid`, `lessonNumber`, `content`, `lessonTitle`, `lessonChapter`, `hasQuiz`, `q1`, `q2`, `q3`, `a11`, `a12`, `a13`, `a21`, `a22`, `a23`, `a31`, `a32`, `a33`, `ca1`, `ca2`, `ca3`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      servid,
      lessonNumber,
      lessonContent,
      lessonTitle,
      chapterid,
      hasQuiz,
      q1,
      q2,
      q3,
      a11,
      a12,
      a13,
      a21,
      a22,
      a23,
      a31,
      a32,
      a33,
      ca1,
      ca2,
      ca3,
    ],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.sendStatus(200);
      }
    }
  );
});

app.get("/getProfs", authenticateToken, (req, res) => {
  pool.query("SELECT * FROM users WHERE role = 2", (err, result) => {
    if (err) console.log(err);
    else {
      res.json(result);
    }
  });
});

app.get("/getMembers/:id", authenticateToken, (req, res) => {
  const servid = "%" + req.params.id + "%";
  pool.query(
    "SELECT * FROM users WHERE listeservs LIKE ?",
    [servid],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.json(result);
      }
    }
  );
});

// obtenir un serveur selon son id //fait
app.get("/servers/:id", authenticateToken, (req, res) => {
  const serverid = req.params["id"];
  pool.query(
    "SELECT * FROM serveurs WHERE id = ?",
    [serverid],
    (err, resultat) => {
      if (err) {
        console.log(err);
      } else {
        res.json(resultat);
      }
    }
  );
});

//quitter un serveur
app.post("/leave", authenticateToken, (req, res) => {
  const servId = req.body.servid;
  const userId = req.body.userid;
  //console.log(servId);
  pool.query(
    "SELECT listeservs FROM users WHERE id = ? LIMIT 1",
    [userId],
    (err, result) => {
      if (err) console.log(err);
      else {
        listeservs = result[0].listeservs;
        console.log("hello" + listeservs);
        if (listeservs.includes("|")) {
          listeservs = listeservs.split("|");
          console.log("before : " + listeservs);
          const updateServs = listeservs.filter((serv) => serv != servId);
          console.log("after : " + updateServs);
          const SupdateServs = updateServs.join("|");
          console.log(SupdateServs);
          pool.query(
            "UPDATE users SET listeservs = ? WHERE id = ? LIMIT 1",
            [SupdateServs, userId],
            (err1, result1) => {
              if (err1) console.log(err1);
            }
          );
        } else {
          pool.query(
            "UPDATE users SET listeservs = '' WHERE id = ? LIMIT 1",
            [userId],
            (err1, result1) => {
              if (err1) console.log(err1);
            }
          );
        }
      }
    }
  );
  // pareil mais sur le serveur
  pool.query(
    "SELECT idmembres FROM serveurs WHERE id = ? LIMIT 1",
    [servId],
    (err, result) => {
      if (err) console.log(err);
      else {
        console.log(result);
        idmembres = result[0].idmembres;
        console.log(idmembres);
        if (idmembres != null && idmembres.includes("|")) {
          idmembres = idmembres.split("|");
          console.log("before : " + idmembres);
          const updateServs = idmembres.filter((user) => user != userId);
          console.log("after : " + updateServs);
          const SupdateServs = updateServs.join("|");
          pool.query(
            "UPDATE serveurs SET idmembres = ? WHERE id = ? LIMIT 1",
            [SupdateServs, servId],
            (err1, result1) => {
              if (err1) console.log(err1);
            }
          );
        } else if (idmembres != null) {
          pool.query(
            "UPDATE serveurs SET idmembres = '' WHERE id = ? LIMIT 1",
            [servId],
            (err1, result1) => {
              if (err1) console.log(err1);
            }
          );
        }
      }
    }
  );
  res.sendStatus(200);
});

//créer serveur, nom de serveur, id user, icon, type, date,... //fait
app.post("/servers", authenticateToken, (req, res) => {
  console.log("creation d'un serveur: " + req.body);
  const ownerid = req.body.serveur.ownerid;
  const name = req.body.serveur.servname;
  const icon = req.body.serveur.servicon;
  const date = Date.now() / 1000;

  // création du serveur
  pool.query(
    "INSERT INTO `serveurs`(`owner`, `chanels`, `nom`, `icon`, `datec`, idmembres) VALUES (?,'',?,?,?,?)",
    [ownerid, name, icon, date, ownerid],
    (err, result) => {
      if (err) console.log(err);
      else {
        console.log(result);
        const servid = result.insertId;

        //insertion de la chaine générale
        pool.query(
          "INSERT INTO `chaines`(`nom`, `type`, `idserv`) VALUES ('# général', 'chat', ?)",
          [servid],
          (err1, resultat1) => {
            if (err1) console.log(err1);
            else {
              console.log(resultat1);
              const firstchanelid = resultat1.insertId;

              //insertion de la chaine vocale
              pool.query(
                "INSERT INTO `chaines`(`nom`, `type`, `idserv`) VALUES ('# salon vocal', 'vocal', ?)",
                [servid],
                (err2, resultat2) => {
                  if (err2) console.log(err2);
                  else {
                    console.log(resultat2);
                    const secondchanelid = resultat2.insertId;
                    const chanelids = firstchanelid + "|" + secondchanelid;

                    // association des chaines au serveur
                    pool.query(
                      "UPDATE serveurs SET chanels = ? WHERE id = ?",
                      [chanelids, servid],
                      (err3, resultat3) => {
                        if (err3) console.log(err3);
                        else {
                          console.log(resultat3);
                        }
                      }
                    );

                    //Ajout du serveur au serveurs du propriétaire
                    pool.query(
                      "SELECT listeservs FROM users WHERE id = ?",
                      [ownerid],
                      (err4, resultat4) => {
                        if (err4) console.log(err4);
                        else {
                          //console.log(resultat4);
                          let listeservs = resultat4[0].listeservs;
                          listeservs = listeservs + "|" + servid;
                          console.log(listeservs);
                          pool.query(
                            "UPDATE users SET listeservs = ? WHERE id = ?",
                            [listeservs, ownerid],
                            (err5, resultat5) => {
                              if (err5) console.log(err5);
                              else {
                                console.log(resultat5);
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
  res.sendStatus(200);
});
//créer une chaine nom de chaine, id user, id serveur, type,update la table serveur pour mettre à jour les chaines //fait
app.post("/chanels", authenticateToken, (req, res) => {
  // nom,type,idserv
  //verifier si l'utilisateur est bien le proprio du serveur
  const userid = req.body.userid;
  const chanelName = req.body.name;
  const chanelType = req.body.type;
  const servid = req.body.servid;

  pool.query(
    "INSERT INTO chaines (nom,type,idserv) VALUES (?,?,?)",
    [chanelName, chanelType, servid],
    (err1, result1) => {
      if (err1) console.log(err1);
      else {
        res.status(200).send("channel added");
      }
    }
  );

  //res.sendStatus(200);
});

// obtenir les chaines d'un serveur //fait
app.get("/chanels/:serverid", authenticateToken, (req, res) => {
  const serverid = req.params.serverid;
  pool.query(
    "SELECT * FROM chaines WHERE idserv = ?",
    [serverid],
    (err, resultat) => {
      if (err) {
        console.log(err);
      } else {
        res.json(resultat);
      }
    }
  );
});

// join server //fait
app.post("/join", authenticateToken, (req, res) => {
  const servid = req.body.servid;
  const userId = req.body.userId;
  let joinServ = true;
  pool.query(
    "SELECT idmembres FROM serveurs WHERE id = ?",
    [servid],
    (err, idmembres) => {
      if (err) {
        console.log(err);
      } else {
        console.log(idmembres[0].idmembres);
        idmembres = idmembres[0].idmembres;
        if (idmembres != null && idmembres.includes("|")) {
          let listmembres = idmembres.split("|");
          listmembres.forEach((idM) => {
            console.log();
            if (idM == userId) {
              joinServ = false;
            }
          });
        } else {
          if (joinServ == true) {
            console.log("okay");
            if (idmembres == null) {
              idmembres = userId;
            } else {
              idmembres = idmembres + "|" + userId;
            }
            pool.query(
              "UPDATE serveurs set idmembres = ? WHERE id = ?",
              [idmembres, servid],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("serveurs table update ok");
                }
              }
            );
            pool.query(
              "SELECT listeservs FROM users WHERE id = ?",
              [userId],
              (err, listeservs) => {
                if (err) {
                  console.log(err);
                } else {
                  //console.log(listeservs);
                  listeservs = listeservs[0].listeservs;
                  if (listeservs == null) {
                    listeservs = servid;
                  } else {
                    listeservs = listeservs + "|" + servid;
                  }
                  console.log(listeservs);
                  pool.query(
                    "UPDATE users set listeservs = ? WHERE id = ?",
                    [listeservs, userId],
                    (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("update table users ok");
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    }
  );

  res.sendStatus(200);
});

// quand on clique sur une chaine, afficher le contenue de la chaine //fait
app.get("/displaychanel/:chanelid", authenticateToken, (req, res) => {
  const chanelid = req.params.chanelid;
  pool.query(
    " SELECT * FROM enregistrements WHERE idchaine = ?",
    [chanelid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
});

// Nouveau message //fait
app.post("/newmsg", authenticateToken, (req, res) => {
  //res.sendStatus();
  console.log(req.body);
  const message = req.body.message;
  const chanelid = req.body.idchanel;
  const userid = req.body.userid;
  pool.query(
    "INSERT INTO `enregistrements`(`idchaine`, `content`,`fromuser`) VALUES (?,?,?)",
    [chanelid, message, userid],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.send(result);
      }
    }
  );
});

app.get("/getMsg/:id", authenticateToken, (req, res) => {
  const chanelid = req.params.id;
  pool.query(
    "SELECT * FROM `enregistrements` WHERE `idchaine` = ? ",
    [chanelid],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.json(result);
      }
    }
  );
});

// créer un utilisateur //fait
app.post("/register", (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const pseudo = req.body.pseudo;
  const email = req.body.email;
  const mdp = req.body.mdp;
  const datec = Date.now() / 1000;
  pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, resultat) => {
      if (err) {
        console.log(err);
      } else {
        //console.log(resultat);
        if (resultat.length === 0) {
          //res.send("user dont exist yet");
          pool.query(
            "INSERT INTO `users`(`nom`, `prenom`, `pseudo`, `email`, `mdp`, `datec`) VALUES (?,?,?,?,?,?)",
            [nom, prenom, pseudo, email, mdp, datec],
            (err2, resultat2) => {
              if (err2) {
                console.log(err2);
                res.sendStatus(400);
              } else {
                console.log(resultat2);
                res.sendStatus(200);
              }
            }
          );
        } else {
          res.send("user already exist");
        }
        //
      }
    }
  );
});

// connexion //fait
app.post("/login", (req, res) => {
  const email = req.body.email;
  const mdp = req.body.mdp;
  console.log(req.body);
  pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, resultat) => {
      if (err) {
        console.log(err);
        res.sendStatus(501);
      } else {
        console.log(resultat);
        if (resultat[0] != null && resultat[0].mdp === mdp) {
          //auth avec jwt
          const userId = resultat[0].id;
          const pseudo = resultat[0].pseudo;
          const privateKey = process.env.ACCESS_TOKEN_SECRET;
          const token = jwt.sign({ userId }, privateKey);
          const role = resultat[0].role;
          console.log(token);
          pool.query(
            "UPDATE `users` SET `isonline`= 1 , `currentToken` = ? WHERE id = ?",
            [token, userId],
            (err1, result1) => {
              if (err1) console.log(err1);
              else {
                console.log(result1);
              }
            }
          );
          res.json({
            userId: userId,
            token: token,
            pseudo: pseudo,
            role: role,
          });
          //
        } else {
          res.sendStatus(401);
        }
      }
    }
  );
});

//discover // fait
app.get("/discover/:id", authenticateToken, (req, res) => {
  const userid = "%" + req.params.id + "%";
  pool.query(
    "SELECT * FROM `serveurs` WHERE idmembres NOT LIKE ? LIMIT 10",
    [userid],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.json(result);
      }
    }
  );
});

//recherche d'un utilisateur par son id //fait
app.get("/getUserById/:id", authenticateToken, (req, res) => {
  const userId = req.params.id;
  pool.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) console.log(err);
    else res.json(result);
  });
});

// enregistrer modifs profile // fait
app.post("/saveUserInfo", authenticateToken, (req, res) => {
  const userid = req.body.userid;
  const email = req.body.email;
  const pseudo = req.body.pseudo;
  const nom = req.body.nom;
  const role = req.body.role;
  const prenom = req.body.prenom;
  const password = req.body.password;
  console.log(role);
  pool.query(
    "UPDATE users SET email = ?, pseudo = ?, nom = ?, prenom = ?, mdp = ?, role = ? WHERE id = ?",
    [email, pseudo, nom, prenom, password, role, userid],
    (err, result) => {
      if (err) console.log(err);
      else res.sendStatus(200);
    }
  );
});

//------------ socket io -------------//
// io.on("connection", (socket) => {
//   //console.log("a user connected");
//   socket.on("send chat", (args) => {
//     io.emit("new chat", { username: args.username, message: args.message });
//   });
// });
//------------ à faire ---------------//

//recherche d'un utilisateur par son nom
app.get("/getUserByName/:name", (req, res) => {
  const name = "%" + req.params.name + "%";
  pool.query(
    "SELECT * FROM users WHERE nom LIKE ? OR prenom LIKE ? OR pseudo LIKE ?",
    [name, name, name],
    (err, result) => {
      if (err) console.log(err);
      else res.json(result);
    }
  );
});

//modifier une chaine
app.post("alterchanel/:chanelid", (res, req) => {
  res.send(req.params.id);
});

//middleware pour vérrifier le jeton de l'utilisateur
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.sendStatus(401);
    console.log("pas de jeton :(");
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      //console.log(user);
      pool.query(
        "SELECT currentToken FROM users WHERE id = ?",
        [user.userId],
        (err, result) => {
          if (err) console.log(err);
          else {
            //console.log(result);
            const currentToken = result[0].currentToken;
            if (currentToken != token) {
              res.sendStatus(403);
            }
          }
        }
      );

      next();
    });
  }
}

app.listen(3000, () => {
  console.log("listening on port 3000...");
});

// objectifs :
// - créer des serveurs
// - afficher les serveurs ajouté / crée par l'utilisateurs
// - Afficher une liste de (10) serveurs non rejoint mais dispo
// - créer des chaines pour un serveur spécifique
// - afficher les chaines pour chaque serveur selon le serveur sélectionné
// - Afficher la liste des membres sur le serv
// - rejoindre un serveur avec son identifiant / lien d'invite
// - Afficher le contenue d'une chaine (général par défaut)
// - enregistrer un message / cours / exo
