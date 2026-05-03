if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const mongoose = require("mongoose");

const ExpressError = require("./utils/ExpressError.js");

const User = require("./models/init/user.js");

const router = require("./routes/lisinting");
const reviewrouter = require("./routes/review");
const userrouter = require("./routes/user");

// ================= CONFIG =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());

// ================= DB =================
const dbUrl = process.env.ATLAS_URL;

// IMPORTANT: don't connect twice
async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");
}

// ================= SESSION =================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: falseif (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/init/user.js");

const router = require("./routes/lisinting");
const reviewrouter = require("./routes/review");
const userrouter = require("./routes/user");

// ================= CONFIG =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());

// ================= ENV (LOWERCASE FIX) =================
const dbUrl = process.env.atlas_url;
const sessionSecret = process.env.secret;

if (!dbUrl) {
  throw new Error("❌ atlas_url is missing in environment variables");
}

if (!sessionSecret) {
  throw new Error("❌ secret is missing in environment variables");
}

// ================= SESSION =================
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= LOCALS =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.error = req.flash("error");
  res.locals.currentuser = req.user || null;
  next();
});

// ================= ROUTES =================
app.use("/listings", router);
app.use("/listings/:id/review", reviewrouter);
app.use("/", userrouter);

// ================= 404 =================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message });
});

// ================= DB + SERVER =================
async function startServer() {
  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("DB Error:", err);
  }
}

startServer();
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // FIXED
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL LOCALS =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.error = req.flash("error");
  res.locals.currentuser = req.user || null;
  next();
});

// ================= ROUTES =================
app.use("/listings", router);
app.use("/listings/:id/review", reviewrouter);
app.use("/", userrouter);

// ================= 404 =================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message });
});

// ================= START SERVER =================
main()
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Error:", err);
  });