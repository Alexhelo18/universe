const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/universe", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connesso");
  } catch (error) {
    console.error("Errore connessione DB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
