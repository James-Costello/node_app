const passport = require('passport')

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
}
