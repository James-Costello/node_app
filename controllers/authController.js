const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('Success', 'You are now logged out.');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  //checking if the user is authenticatied
  if(req.isAuthenticated()){
    next();
    return
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  //check to see if user with email exists
  //set reset token that expires
  //send email with token
  //redirect to login page
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    req.flash('error', "No account with this email exists");
    return res.redirect('/login');
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 36000000; //1 hr from now
  await user.save();
  const resetURL = ``
}
