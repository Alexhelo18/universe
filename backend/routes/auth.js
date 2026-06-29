const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (readDB, writeDB) => {
  const router = express.Router();

  // ===========================
  // REGISTRAZIONE
  // ===========================
  router.post("/register", async (req, res) => {
    const { nome, cognome, username, email, password } = req.body;
    const db = readDB();

    // Controllo email già registrata
    const emailExists = db.users.find(u => u.email === email);
    if (emailExists) {
      return res.json({ msg: "Email già registrata" });
    }

    // Controllo username già registrato
    const usernameExists = db.users.find(u => u.username === username);
    if (usernameExists) {
      return res.json({ msg: "Username già registrato" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      nome,
      cognome,
      username,
      email,
      password: hashed,
      role: "user"
    };

    db.users.push(newUser);
    writeDB(db);

    res.json({ msg: "Registrazione completata" });
  });

  // ===========================
  // LOGIN
  // ===========================
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.json({ msg: "Email non trovata" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ msg: "Password errata" });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        username: user.username,
        nome: user.nome,
        cognome: user.cognome
      },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({ msg: "Login effettuato", token });
  });

  return router;
};
