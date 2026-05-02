const review = require('../models/init/review');
const listing = require('../models/listing');
module.exports.create=async (req, res) => {

    let foundlisting = await listing.findById(req.params.id);
let newreview = new review(req.body.review);
newreview.author=req.user._id;

foundlisting.review.push(newreview._id);

    await newreview.save();
    await foundlisting.save();
    req.flash("success", "review added!");       

    res.redirect(`/listings/${foundlisting._id}`);
};
module.exports.destroy=async (req, res) => {
    const { id, reviewid } = req.params;

    await listing.findByIdAndUpdate(id, {
       $pull: { review: reviewid }
    }); 

    await review.findByIdAndDelete(reviewid);
        req.flash("success", "review delted");       


    res.redirect(`/listings/${id}`);
};
