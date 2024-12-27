const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// Registration Page
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Handle Registration
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to BorrowEase!');
            res.redirect('/accounts/myaccount'); // Redirect to "My Account" page
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Handle Login
router.post('/login', passport.authenticate('local', { 
    failureFlash: true, 
    failureRedirect: '/login' 
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.user.isAuthor ? '/accounts' : '/accounts/myaccount'; // Admin to Accounts, User to My Account
    delete req.session.returnTo; // Cleanup
    res.redirect(redirectUrl);
});

// Handle Logout
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
});

module.exports = router;
