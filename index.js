const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const saltRounds = 10;
const secretKey = "SuperSecretJWTKey123"; // use env in production

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser()); // 🍪 enable cookie parser

// MongoDB Connection
mongoose.connect("mongodb+srv://sanket_cse:ZombyYT123@secrets.c25tlmk.mongodb.net/userDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// Auth middleware
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
app.get("/login", (req, res) => res.render("login"));
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
    res.render("login");
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
    if (!foundUser) return res.send("User not found.");

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.send("Incorrect password.");

    const token = jwt.sign(
      { id: foundUser._id, name: foundUser.name },
      secretKey,
      { expiresIn: "1h" }
    );

    // Set token in secure HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only in production
      maxAge: 60 * 60 * 1000
    });

    res.redirect("/secrets");
  } catch (err) {
    console.error(err);
    res.send("Login failed.");
  }
});

// Server Start
app.listen(3000, () => console.log("Server started on port 3000"));
