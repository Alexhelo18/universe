const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// URL del tuo JSONBin
const BIN_URL = "https://api.jsonbin.io/v3/b/6a42382fda38895dfe0f00a6";

// READ DB da JSONBin
async function readDB() {
  const res = await fetch(`${BIN_URL}/latest`, {
    headers: {
      "X-Master-Key": process.env.JSONBIN_KEY
    }
  });

  const data = await res.json();
  return data.record; // JSONBin mette i dati dentro "record"
}

// WRITE DB su JSONBin
async function writeDB(newData) {
  await fetch(BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_KEY
    },
    body: JSON.stringify(newData)
  });
}

// ROUTES
const authRoutes = require("./routes/auth")(readDB, writeDB);
const articleRoutes = require("./routes/articles")(readDB, writeDB);
const commentRoutes = require("./routes/comments")(readDB, writeDB);

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/comments", commentRoutes);

// PORT per Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend avviato sulla porta ${PORT}`);
});
