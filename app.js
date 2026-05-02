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

const user = require("./models/init/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/lisinting");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ---------------- VIEW ENGINE ----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ---------------- MIDDLEWARE ----------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());

// ---------------- DATABASE ----------------
const dbUrl = process.env.atlas_url;

async function connectDB() {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected");
}

// ---------------- SESSION (PRODUCTION FIX) ----------------
const sessionOptions = {
    secret: process.env.secret || "fallbackSecretOnlyForDev",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // 🔥 IMPORTANT
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// ---------------- GLOBAL VARIABLES ----------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentuser = req.user || null;
    next();
});

// ---------------- ROUTES ----------------
app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

// ---------------- 404 ----------------
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { message });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.log(err));