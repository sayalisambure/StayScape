const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../Models/reviews.js");
const Listing = require("../Models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
//review post

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;