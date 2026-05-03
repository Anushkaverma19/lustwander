// ================= ENV =================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ================= CORE =================
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

// ================= SECURITY =================
const helmet = require("helmet");
const cors = require("cors");

// ================= SESSION =================
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

// ================= AUTH =================
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ================= OTHERS =================
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// ================= MODELS =================
const User = require("./models/init/user.js");

// ================= UTILS =================
const ExpressError = require("./utils/ExpressError.js");

// ================= ROUTES =================
const listingRouter = require("./routes/lisinting");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ================= DB =================
const dbUrl = process.env.ATLAS_URL;

// ================= APP CONFIG =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// ================= SECURITY MIDDLEWARE =================
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ================= SESSION CONFIG =================
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ONLY HTTPS IN PROD
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
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
  res.locals.currentUser = req.user || null;
  next();
});

// ================= ROUTES =================
app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

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
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });