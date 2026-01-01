const express = require("express");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const path = require("path");

// Load environment variables from .env when present (local development)
require('dotenv').config();

// ------------------------------
// App + DB Setup
// ------------------------------
const app = express();

// Session middleware
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  console.error("ERROR: SESSION_SECRET environment variable is required. Set SESSION_SECRET and restart the server.");
  process.exit(1);
}

// Session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Use environment variable for database path, default to 'database.db'
const dbPath = process.env.DB_PATH || "database.db";
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      name TEXT,
      email TEXT,
      message TEXT
    )
  `);
});

// ------------------------------
// Admin Credentials from Environment Variables (required)
// ------------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL) {
  console.error("ERROR: ADMIN_EMAIL environment variable is required. Set ADMIN_EMAIL and restart the server.");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_PASSWORD environment variable is required. Set ADMIN_PASSWORD and restart the server.");
  process.exit(1);
}

const USER = {
  email: ADMIN_EMAIL,
  passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10)
};

// ------------------------------
// Middleware
// ------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ------------------------------
// Routes
// ------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === USER.email && bcrypt.compareSync(password, USER.passwordHash)) {
    req.session.authenticated = true;
    req.session.user = { email: USER.email };
    res.redirect("/admin");
  } else {
    res.status(401).send("Invalid credentials ❌");
  }
});

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

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).send("Unauthorized");
}

app.get("/admin", requireAuth, (req, res) => {
  console.log("Admin page requested (authenticated)");
  res.sendFile(path.join(__dirname, "views", "admin.html"));
});

app.get("/messages", requireAuth, (req, res) => {
  db.all("SELECT * FROM messages", [], (err, rows) => {
    if (err) res.status(500).json({ error: "Failed to load messages" });
    else res.json(rows);
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

// ------------------------------
// Start Server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});