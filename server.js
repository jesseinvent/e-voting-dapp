const express = require("express");
const path = require("path");

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("src/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.resolve("src/admin/index.html"));
});

app.get("/admin/candidates", (req, res) => {
  res.sendFile(path.resolve("src/admin/candidates.html"));
});

app.get("/admin/voters", (req, res) => {
  res.sendFile(path.resolve("src/admin/voters.html"));
});

app.get("/admin/address-generator", (req, res) => {
  res.sendFile(path.resolve("src/admin/address-generator.html"));
});

app.listen(port);

console.log(`Server started at http://localhost:${port}`);
