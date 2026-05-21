const User = require("../models/user.js");

module.exports.renderSignUpForm= (req, res) => {
  res.render("listings/users/signup.ejs");
}



module.exports.signup=async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
  
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wanderlust!");
      let redirectUrl = res.locals.redirectUrl || "/listings";
      req.session.save((saveErr) => {
        if (saveErr) {
          return next(saveErr);
        }
        res.redirect(redirectUrl);
      });
      
    });
  } catch (e) {
    req.flash("error",e.message);
    res.redirect("/signup");
  }
}

module.exports.renderLoginForm= (req, res) => {
  res.render("listings/users/login.ejs");
}

module.exports.login=async (req, res, next) => {
    req.flash("success", "welcome to wonderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect(redirectUrl);
    });
}

module.exports.logOut= (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out");
    res.redirect("/listings");
  });
}
