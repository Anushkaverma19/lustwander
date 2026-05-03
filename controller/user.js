const user=require('../models/init/user');
module.exports.rendersignup=(req, res) => {
    res.render("users/sign");
};
module.exports.signup=async (req, res) => {
    try {
        let { username, email, password } = req.body;

        let newuser = new user({ username, email });
        let registereduser = await user.register(newuser, password);

        console.log(registereduser);
        req.login(registereduser, (err)=> {
            if (err) 
                return next(err);
            
              req.flash("success", "Welcome to Wandering!");
        res.redirect("/listings");
        });

     
    } catch (e) {
        req.flash("failure", e.message);
        res.redirect("/signup");
    }
};
module.exports.renderlogin=(req,res)=>{
    res.render("users/login");
};
module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};
module.exports.logout=(req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};