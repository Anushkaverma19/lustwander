const mongoose = require('mongoose');
const Listing = require("./models/listing");
const Review = require("./models/init/review");
const { listingschema, reviewschema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

// 🔐 LOGIN CHECK
module.exports.loggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("failure", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

// 🔁 SAVE REDIRECT URL
module.exports.saveredirecturl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// 🧑‍💼 LISTING OWNER CHECK
module.exports.isowner = async (req, res, next) => {
    let { id } = req.params;

    let foundListing = await Listing.findById(id);

    // ✅ safety
    if (!foundListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!foundListing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// 📦 LISTING VALIDATION
module.exports.validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body, { abortEarly: false });

    if (error) {
        return next(new ExpressError(400, error.details[0].message));
    }

    next();
};

// ⭐ REVIEW VALIDATION
module.exports.validatereview = (req, res, next) => {
    let { error } = reviewschema.validate(req.body);

    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    }

    next();
};

// ✍️ REVIEW AUTHOR CHECK
module.exports.isauthor = async (req, res, next) => {
    let { id, reviewid } = req.params;

    let foundReview = await Review.findById(reviewid);

    // ✅ safety (IMPORTANT)
    if (!foundReview) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!foundReview.author || !foundReview.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};