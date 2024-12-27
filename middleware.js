const Account = require('./models/Account')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const account = await Account.findById(id);
    if (!account || (!req.user.isAuthor && !account.author.equals(req.user._id))) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/accounts');
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    const adminId = process.env.ADMIN_ID;
    if (!req.user || (!req.user.isAuthor && req.user._id.toString() !== adminId)) {
        req.flash('error', 'Admin access required.');
        return res.redirect('/');
    }
    next();
};