const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "database.json");

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ROUTES
const authRoutes = require("./routes/auth")(readDB, writeDB);
const articleRoutes = require("./routes/articles")(readDB, writeDB);
const commentRoutes = require("./routes/comments")(readDB, writeDB);

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/comments", commentRoutes);

app.listen(3001, () => {
  console.log("Backend avviato sulla porta 3001");
});
