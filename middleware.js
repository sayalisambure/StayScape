const Listing = require("./Models/listing");
const Review = require("./Models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You have to login to add new StayScape!");
        return res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl  = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    console.log("LISTING OWNER:", listing.owner);
    console.log("CURRENT USER:", res.locals.currUser._id);

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not owner of this StayScape");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");  //combines all types of errors
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");  //combines all types of errors
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You did not created this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};