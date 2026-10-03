if(process.env.NODE_ENV!="PRODUCTION"){
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//initialize server on port 8080

//const MONGO_URL = 'mongodb://127.0.0.1:27017/StayScape';
const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true
    }
};

// app.get("/",(req,res)=>{
//     console.log("hii i am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//initializes passport for each request
app.use(passport.session());//every request should know which session it is part of
passport.use(new LocalStrategy(User.authenticate()));//new local strategy we created in passport ,every use should authenticate through local strategy using authenticate method..static method given by mongoose

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());//storing info of user into session
passport.deserializeUser(User.deserializeUser());//unstoring info of user into session

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");//helloworld is password...register is static method which automatically checks its functions like unique username or email

//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})
app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    //res.render("error.ejs","message");
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,()=>{
    console.log("Server islistening")
})