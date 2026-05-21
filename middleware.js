const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log(req.path, "..", req.originalUrl);
    if (req.method === "GET") {
      req.session.redirectUrl = req.originalUrl;
    } else if (req.params.id) {
      req.session.redirectUrl = `/listings/${req.params.id}`;
    } else {
      req.session.redirectUrl = req.get("Referrer") || "/listings";
    }
    req.flash("error", "you must be logged in first");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", " you are not the owner of this property");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details
      ? error.details.map((el) => el.message).join(",")
      : "Validation error";
    throw new ExpressError(400, errMsg);
  }

  next();
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details
      ? error.details.map((el) => el.message).join(",")
      : "Validation error";
    throw new ExpressError(400, errMsg);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "review not found");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author) {
    req.flash("error", "review author is missing");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", " you are not author");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
