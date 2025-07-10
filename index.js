require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const saltRounds = 10;
const secretKey = "SuperSecretJWTKey123"; // move to env for production

app.set("view engine", "ejs");  // Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// JWT Auth Middleware
function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login", { error: null }));
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/secrets", isAuthenticated, (req, res) => {
  res.render("secrets", {
    title: "You've Discovered My Secret!",
    message: `Welcome ${req.user.name}`,
    subtext: "This page is authenticated with JWT 🍪"
  });
});

app.get("/submit", isAuthenticated, (req, res) => res.render("submit"));
app.post("/submit", isAuthenticated, (req, res) => res.render("submit"));

// Register
app.post("/register", async (req, res) => {
  const { name, username, password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.send("❌ Password must contain at least one lowercase, one uppercase, one digit, and be 6+ characters.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email: username, password: hashedPassword });
    await newUser.save();
    res.render("login", { error: null });
  } catch (err) {
    console.error(err);
    res.send("Registration failed.");
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: username });
    if (!foundUser) {
      return res.render("login", { error: "❌ User not found." });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.render("login", { error: "❌ Incorrect password." });
    }

    const token = jwt.sign(
      { id: foundUser._id, name: foundUser.name },
      secretKey,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // uncomment on HTTPS
      maxAge: 60 * 60 * 1000
    });

    res.redirect("/secrets");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "❌ Login failed. Try again." });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
