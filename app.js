    if(process.env.NODE_ENV!="production"){
        require("dotenv").config();
    }

    const express=require("express");
    const app=express();
    const mongoose=require("mongoose");
    const path=require("path");
    const methodOverride=require("method-override");
    const ejsMate=require("ejs-mate");
    const ExpressError=require("./utils/ExpressError.js");
    const Review= require("./models/review.js");
    
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const MongoStore = require('connect-mongo');


    const session=require("express-session");
    const flash=require("connect-flash");
    const passport=require("passport");
    const LocalStrategy=require("passport-local");
    const User=require("./models/user.js");

    const listingRouter=require("./routes/listing.js");
    const reviewRouter=require("./routes/review.js");
    const userRouter=require("./routes/user.js");


    // console.log(process.env.SECRET);

    // const MONGOURL="mongodb://127.0.0.1:27017/wanderlust";

    const dbUrl=process.env.ATLASDB_URL;





    app.set("trust proxy", 1);
    app.set("view engine","ejs");
    app.set("views",path.join(__dirname,"views"));
    app.use(express.urlencoded({extended:true}));
    app.use(methodOverride("_method"));
    app.engine("ejs",ejsMate);
    app.use(express.static(path.join(__dirname,"/public")));
    app.use(express.urlencoded({ extended: true })); // form data
    app.use(express.json()); // JSON (Hoppscotch / Postman)

    async function main() {
    await mongoose.connect(dbUrl);
    }

    main()
        .then(()=>{
            console.log("connected to db");
        })
        .catch((err)=>{
            console.log(err);
        });

    let store;
    if (process.env.NODE_ENV === "production") {
        store = MongoStore.create({
            mongoUrl: dbUrl,
            crypto: {
                secret: process.env.SECRET,
            },
            touchAfter: 24 * 3600,
        });

        store.on("error",(err)=>{
            console.log("ERROR in mongo session",err);
        });
    }

    const sessionOptions={
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie:{
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        }
    }

    if (store) {
        sessionOptions.store = store;
    }



    

    app.use(session(sessionOptions));
    app.use(flash());


    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());



    app.use((req,res,next)=>{
        res.locals.success=req.flash("success");
        res.locals.error=req.flash("error");
        res.locals.currUser=req.user;
        next();
    });



    app.use("/listings",listingRouter);
    app.use("/listings/:id/reviews",reviewRouter);
    app.use("/",userRouter);

    app.use((req, res, next) => {
        next(new ExpressError(404, "Page not found!"));
    });
    app.use((err,req,res,next)=>{
        let{statusCode=500,message="something went wrong"}=err;
        if (res.headersSent) {
            return next(err);
        }
        res.status(statusCode).render("error.ejs",{message});
        // res.status(statusCode).send(message);
        
    })
    const port = process.env.PORT || 8080;

    app.listen(port,()=>{
        console.log("server is running");
    });

