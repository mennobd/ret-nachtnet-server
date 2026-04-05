const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/manifest", (req, res) => {
  res.sendFile(path.join(__dirname, "routes", "manifest.json"));
});

app.use("/routes", express.static(path.join(__dirname, "routes")));

app.listen(PORT, () => {
  console.log("Server draait op poort " + PORT);
});