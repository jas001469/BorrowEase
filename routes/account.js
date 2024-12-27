require('dotenv').config();
const express=require('express')
const router = express.Router()
const Account = require('../models/Account') 
const { isLoggedIn,isOwner,isAdmin } = require('../middleware');


router.get('/',isAdmin,isLoggedIn,async(req,res)=>{
    const accounts = await Account.find({}).populate('transactions').populate('author')
    res.render('account/index', {accounts})
})

router.get('/myaccount', isLoggedIn, async (req, res) => {
    // if (!req.isAuthenticated()) {
    //     req.flash('error', 'You must log in first!');
    //     return res.redirect('/login');
    // }
    try {
        const account = await Account.find({ author: req.user._id }).populate('transactions');
        if (!account || account.length === 0) {
            req.flash('error', 'You do not have an account.');
            return res.redirect('/');
        }
        res.render('account/myaccount', { account, currentUser: req.user });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/');
    }
});

router.get('/accounts',isLoggedIn, async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must log in first!');
        return res.redirect('/login');
    }
    try {
        let accounts;
        if (req.user.isAdmin) {
            // Fetch all accounts if the user is an admin
            accounts = await Account.find({});
        } else {
            // Fetch only the accounts belonging to the logged-in user
            accounts = await Account.find({ author: req.user._id });
        }
        res.render('account/index', { accounts, currentUser: req.user });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong while retrieving accounts.');
        res.redirect('/');
    }
});


router.get('/new',isLoggedIn, async(req,res)=>{
    res.render('account/new')
})

router.post('/',isLoggedIn, async(req,res)=>{
    req.flash('success','Succesfuly made new account')
    const account = new Account(req.body.Account)
    account.author = req.user._id || process.env.ADMIN_ID;
  await account.save()
  req.flash('success','Succesfuly made new account')
  res.redirect(`/accounts/${account._id}`)
})

router.get('/:id',isLoggedIn, async(req,res)=>{
    const account = await Account.findById(req.params.id).populate('transactions')
    if(!account){
        req.flash('error','cannot find the account')
        return res.redirect('/accounts')
    }
    res.render('account/show', {account})
})

router.get('/:id/edit',isLoggedIn,async(req,res)=>{
    const account = await Account.findById(req.params.id)
    if(!account){
        req.flash('error','cannot find the account')
        return res.redirect('/accounts')
    }
    res.render('account/edit',{account})

})

router.put('/:id',isOwner,isLoggedIn, async(req,res)=>{
    const{id}=req.params;
    const account = await Account.findByIdAndUpdate(id,{...req.body.Account})
    req.flash('success','Succesfully updated account! ')
    res.redirect(`/accounts/${account._id}`)
})

router.delete('/:id',isAdmin, isLoggedIn,async(req,res)=>{
    const {id} = req.params;
    await Account.findByIdAndDelete(id);
    req.flash('success','successfully deleted account')
    res.redirect('/accounts')
})

module.exports = router;