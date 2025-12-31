const express = require("express");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("database.db");

// Create messages table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      name TEXT,
      email TEXT,
      message TEXT
    )
  `);
});

// Demo admin user
const USER = {
  email: "admin@business.com",
  passwordHash: bcrypt.hashSync("123456", 10)
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Login POST
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === USER.email && bcrypt.compareSync(password, USER.passwordHash)) {
    res.send("Login successful ✔️");
  } else {
    res.send("Invalid credentials ❌");
  }
});

// Contact POST
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  db.run(
    "INSERT INTO messages VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) res.send("Error saving message ❌");
      else res.send("Message saved successfully ✔️");
    }
  );
});

// Admin dashboard
app.get("/admin", (req, res) => {
  console.log("Admin page requested");
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// API to fetch messages
app.get("/messages", (req, res) => {
  db.all("SELECT * FROM messages", [], (err, rows) => {
    if (err) res.status(500).json({ error: "Failed to load messages" });
    else res.json(rows);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});