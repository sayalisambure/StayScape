const Review = require("../Models/reviews.js");
const Listing = require("../Models/listing.js");

module.exports.createReview = async(req,res)=>{
    let foundListing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    foundListing.reviews.push(newReview);

    await newReview.save();
    await Listing.findByIdAndUpdate(foundListing._id, {$push: {reviews: newReview._id}});
    req.flash("success","Review added successfully!");
    res.redirect(`/listings/${foundListing._id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let{id,reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}