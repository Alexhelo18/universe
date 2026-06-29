const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (readDB, writeDB) => {
  const router = express.Router();

  // GET articoli
  router.get("/", (req, res) => {
    const db = readDB();
    res.json(db.articles);
  });

  // POST nuovo articolo (solo admin)
  router.post("/", (req, res) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    let decoded;
    try {
      decoded = jwt.verify(token.replace("Bearer ", ""), "SECRET_KEY");
    } catch {
      return res.status(401).json({ msg: "Token non valido" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "Accesso riservato agli admin" });
    }

    const { title, content, author } = req.body;
    const db = readDB();

    const newArticle = {
      id: Date.now(),   // ⭐ ID GENERATO CORRETTAMENTE
      title,
      content,
      author,
      createdAt: new Date().toISOString()
    };

    db.articles.push(newArticle);
    writeDB(db);

    res.json({ msg: "Articolo pubblicato", article: newArticle });
  });

  // PATCH modifica articolo (solo admin)
  router.patch("/:id", (req, res) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    let decoded;
    try {
      decoded = jwt.verify(token.replace("Bearer ", ""), "SECRET_KEY");
    } catch {
      return res.status(401).json({ msg: "Token non valido" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "Accesso riservato agli admin" });
    }

    const db = readDB();
    const article = db.articles.find(a => a.id == req.params.id);

    if (!article) return res.status(404).json({ msg: "Articolo non trovato" });

    article.title = req.body.title;
    article.content = req.body.content;

    writeDB(db);

    res.json({ msg: "Articolo aggiornato", article });
  });

  // DELETE elimina articolo (solo admin)
  router.delete("/:id", (req, res) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "Token mancante" });

    let decoded;
    try {
      decoded = jwt.verify(token.replace("Bearer ", ""), "SECRET_KEY");
    } catch {
      return res.status(401).json({ msg: "Token non valido" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "Accesso riservato agli admin" });
    }

    const db = readDB();
    const index = db.articles.findIndex(a => a.id == req.params.id);

    if (index === -1) return res.status(404).json({ msg: "Articolo non trovato" });

    db.articles.splice(index, 1);
    writeDB(db);

    res.json({ msg: "Articolo eliminato" });
  });

  return router;
};
