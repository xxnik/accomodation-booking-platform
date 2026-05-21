const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index=async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}

module.exports.renderNewForm= (req, res) => {

  res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "No listing found");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}
 

module.exports.createListing=async (req, res, next) => {
  if (!req.file) {
    throw new ExpressError(400, "Listing image upload failed or is missing.");
  }

  let url=req.file.path;
  let filename=req.file.filename;
  

    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image={url,filename};
    await listing.save();
    req.flash("success", "New Listing created!");
    res.redirect("/listings");
}


module.exports.editListing=async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if(!listing){
      req.flash ("error","Listing you requested doesn't exist");
      return res.redirect("/listings");
    }
    console.log()
    let originalImageurl=listing.image.url;
    originalImageurl=originalImageurl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing,originalImageurl});
  }

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;

    let listing =await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    
    
    if(typeof req.file!=="undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }

module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    req.flash("success", "Listing Deleted!");
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }
