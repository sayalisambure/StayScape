const listing = require("../Models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
    const allListings = await listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = async (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    //extract the received id
    let {id} = req.params;
    //now search for list based on id
    const findListing= await listing.findById(id).populate("owner").populate({path:"reviews",populate:{path:"author",},});
    if(!findListing){
        req.flash("error","This listing does not exist!");
        return res.redirect("/listings")
    }
    console.log(findListing);
    res.render("listings/show.ejs",{findListing});
}

module.exports.createListing = async (req,res)=>{
        let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();
        req.flash("success","New listing created!");
        res.redirect("/listings");
  
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;

    const findlisting = await listing.findById(id);

    if(!findlisting){
        req.flash("error","This listing does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = findlisting.image.url;
    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/h_300,w_250"
    );

    res.render("listings/edit.ejs", {
        listing: findlisting,
        originalImageUrl
    });
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let updatedListing =await listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!="undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url,filename};
        await updatedListing.save();
    }
    
    req.flash("success","listing updated successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
}

//////////////////////////////////////////////////////

module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;

    const allListings = await listing.find({ category: category });

    res.render("listings/index.ejs", { allListings });
};