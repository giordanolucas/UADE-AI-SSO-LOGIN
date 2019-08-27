const express = require("express");
const path = require("path");
const port = process.env.PORT || 8081;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(path.resolve(__dirname, "build")));

app.get("/public/sso.js", (req, res) => {
  res.setHeader('Content-type', "text/javascript; charset=UTF-8");
  res.sendFile(path.resolve(path.resolve(__dirname, "public"), "sso.js"));
});

app.get("/public/sso.min.js", (req, res) => {
  res.setHeader('Content-type', "text/javascript; charset=UTF-8");
  res.sendFile(path.resolve(path.resolve(__dirname, "public"), "sso.min.js"));
});

// send the user to index html page inspite of the url
app.get("*", (req, res) => {
  res.sendFile(path.resolve(path.resolve(__dirname, "build"), "index.html"));
});

app.listen(port);
