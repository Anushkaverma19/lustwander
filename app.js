if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const app = express();
const cors = require("cors");
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const sessionoptions = {
    secret:process.env.secert,    
    resave: false,
    saveUninitialized:false,
    cookie: {
expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
httpOnly: true
    }
};

const passport = require("passport");
const localstrategy = require("passport-local");
const user = require("./models/init/user.js");

const ExpressError = require("./utils/expresserror.js");

const mongoose = require('mongoose');

const router = require('./routes/lisinting');
const reviewrouter = require('./routes/review');
const userrouter = require('./routes/user');
// app.use(router);


// ---------------- CONFIG ----------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cors());
  const dbUrl = process.env.atlas_url; 
// ---------------- DB CONNECTION ----------------
async function main() {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
}

// main().catch(err => console.log(err));

// ---------------- HOME ----------------
// app.get('/', (req, res) => {
// //     res.send('Hello World!');
// // });
app.use(session(sessionoptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
//router se phele flash use karo taki har route ke liye flash available ho
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    res.locals.error = req.flash("error");
    res.locals.currentuser = req.user;
   
    next();
}); 


app.use("/listings", router);
app.use("/listings/:id/review",reviewrouter);
app.use("/",userrouter);
//
// ---------------- 404 ----------------
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something wrong" } = err;
    res.status(statusCode).render("error", { message });
});

// ---------------- SERVER ----------------
main()
  .then(() => {
    console.log("MongoDB connected");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch(err => console.log(err));

