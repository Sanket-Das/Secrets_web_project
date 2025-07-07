# 🔐 Secret Authentication App

A secure full-stack web application built with Node.js, Express, MongoDB, and EJS that allows users to register, log in, and view hidden secrets — all powered by secure authentication using JWT (JSON Web Tokens) and bcrypt password hashing.

---

## 🚀 Features

- ✅ User Registration with Full Name, Email, Password
- ✅ Password format validation (uppercase, lowercase, number, 6+ characters)
- ✅ Show/Hide Password functionality in form
- ✅ Passwords securely hashed using **bcrypt**
- ✅ JWT-based stateless authentication
- ✅ Tokens stored in secure, **HttpOnly cookies**
- ✅ Protected routes (only accessible when authenticated)
- ✅ Secure Logout using cookie clearing
- ✅ Fully responsive frontend using EJS & custom CSS

---

## 🛠️ Tech Stack

| Layer       | Tech                      |
|-------------|---------------------------|
| Frontend    | HTML, CSS, EJS            |
| Backend     | Node.js, Express.js       |
| Database    | MongoDB (Mongoose ODM)    |
| Auth        | JWT, bcrypt, HttpOnly Cookies |
| Extras      | cookie-parser, dotenv     |

---

## 🔒 Security Highlights

- 🔐 Passwords are hashed using `bcrypt` before storing in DB
- 🔑 JWT tokens are stored in `HttpOnly` cookies (not accessible via JS)
- 🚫 No plaintext password ever reaches the server
- 🧠 Auth middleware protects secret and submission routes

---

FOLDER STRUCTURE:-

.
├── views/
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── secrets.ejs
│   ├── submit.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── public/
│   └── css/
│       └── styles.css
├── index.js
├── .gitignore
├── package.json
└── README.md


