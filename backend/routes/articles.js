const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (readDB, writeDB) => {
  const router = express.Router();

  // GET articoli
  router.get("/", async (req, res) => {
    const db = await readDB();

    // Se non esiste ancora la chiave articles, restituiamo array vuoto
    const articles = db.articles || [];

    res.json(articles);
  });

  // POST nuovo articolo (solo admin)
  router.post("/", async (req, res) => {
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

    const db = await readDB();

    // Se non esiste ancora la chiave articles, la creiamo
    if (!db.articles) db.articles = [];

    const newArticle = {
      id: Date.now(),
      title,
      content,
      author,
      createdAt: new Date().toISOString()
    };

    db.articles.push(newArticle);
    await writeDB(db);

    res.json({ msg: "Articolo pubblicato", article: newArticle });
  });

  // PATCH modifica articolo (solo admin)
  router.patch("/:id", async (req, res) => {
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

    const db = await readDB();

    if (!db.articles) return res.status(404).json({ msg: "Nessun articolo presente" });

    const article = db.articles.find(a => a.id == req.params.id);

    if (!article) return res.status(404).json({ msg: "Articolo non trovato" });

    article.title = req.body.title;
    article.content = req.body.content;

    await writeDB(db);

    res.json({ msg: "Articolo aggiornato", article });
  });

  // DELETE elimina articolo (solo admin)
  router.delete("/:id", async (req, res) => {
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

    const db = await readDB();

    if (!db.articles) return res.status(404).json({ msg: "Nessun articolo presente" });

    const index = db.articles.findIndex(a => a.id == req.params.id);

    if (index === -1) return res.status(404).json({ msg: "Articolo non trovato" });

    db.articles.splice(index, 1);
    await writeDB(db);

    res.json({ msg: "Articolo eliminato" });
  });

  return router;
};
