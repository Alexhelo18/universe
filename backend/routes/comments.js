const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (readDB, writeDB) => {
  const router = express.Router();

  // GET commenti di un articolo
  router.get("/:articleId", (req, res) => {
    const db = readDB();
    const comments = db.comments.filter(c => c.articleId == req.params.articleId);
    res.json(comments);
  });

  // POST nuovo commento
  router.post("/", (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    const user = jwt.verify(token, "SECRET_KEY");
    const { articleId, content } = req.body;

    const db = readDB();

    const newComment = {
      id: Date.now(),
      articleId,
      author: user.username,
      content,
      createdAt: new Date().toISOString()
    };

    db.comments.push(newComment);
    writeDB(db);

    res.json({ msg: "Commento aggiunto", comment: newComment });
  });

  // PATCH modifica commento
  router.patch("/:id", (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    const user = jwt.verify(token, "SECRET_KEY");
    const db = readDB();

    const comment = db.comments.find(c => c.id == req.params.id);
    if (!comment) return res.status(404).json({ msg: "Commento non trovato" });

    if (comment.author !== user.username) {
      return res.status(403).json({ msg: "Non puoi modificare commenti altrui" });
    }

    comment.content = req.body.content;
    writeDB(db);

    res.json({ msg: "Commento aggiornato", comment });
  });

  // DELETE elimina commento
  router.delete("/:id", (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    const user = jwt.verify(token, "SECRET_KEY");
    const db = readDB();

    const comment = db.comments.find(c => c.id == req.params.id);
    if (!comment) return res.status(404).json({ msg: "Commento non trovato" });

    if (comment.author !== user.username) {
      return res.status(403).json({ msg: "Non puoi eliminare commenti altrui" });
    }

    db.comments = db.comments.filter(c => c.id != req.params.id);
    writeDB(db);

    res.json({ msg: "Commento eliminato" });
  });

  return router;
};
