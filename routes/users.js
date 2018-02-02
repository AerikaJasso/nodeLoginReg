const express = require('express');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res, next) => {
    res.send("<h1> No Endpoint</h1>");
});

router.get('/register', (req, res, next) => {
    res.render('users/register', { title: 'Register' });
});

router.get('/login', (req, res, next) => {
    res.render('users/login', { title: 'Log In' });
});

router.post('/register', (req, res, next) => {
    let name = req.body.name;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let cpassword = req.body.cpassword;

    // Form Validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email format is not valid').isEmail();
    req.checkBody('password','Password field is required').notEmpty();
    req.checkBody('cpassword', 'Passwords do not match').equals(req.body.password);

    // Check for errors
    let errors = req.validationErrors();
    if(errors) {
        res.render('users/register', {
            errors: errors,
            name: name,
            email: email,
            username: username,
            password: password,
            cpassword: cpassword,
            title: 'Register'
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
        });
        // Create User
        User.createUser(newUser, (err, user) => {
            if(err) throw err;
            console.log(user);
        });

        // Success flash message
        req.flash('success', 'You are now registered');
        res.location('/');
        res.redirect('/');
    }
});

//  Passport serialize and deserialize to use sessions in login.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log("in the deserializeUser(), this is id:", id);
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Create 'local' strategy for passport authenticate
passport.use(new localStrategy(
    (username, password, done) => {
        // Get the Usersname
        User.findOne({ username: username}, (err, user) => {
            if(err) throw err;
            if(!user) {
                console.log('Unknown User');
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                } else {
                    console.log('Invalid Password');
                    return done(null, false, {message: 'Invalid Password'});
                }
            });
        });
    }
));

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid Credentials'}), (req, res) => {
    console.log('Authentication Successful');
    req.flash('success', 'You are logged in');
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out');
    req.session.destroy();
    res.redirect('/users/login');
});

module.exports = router;