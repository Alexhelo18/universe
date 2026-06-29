const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "Accesso negato, token mancante" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token non valido" });
  }
};
