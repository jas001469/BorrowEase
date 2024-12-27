const express = require('express')
const router = express.Router({mergeParams:true})
const Account = require('../models/Account')
const Transaction = require('../models/transaction')
const { isOwner, isAdmin } = require('../middleware')



router.post('/', isOwner,async(req,res)=>{
    const account = await Account.findById(req.params.id)
    const transaction = new Transaction(req.body.Transaction)
    account.transactions.push(transaction._id)
    await transaction.save()
    await account.save()
    req.flash('success','Create new transaction')
    res.redirect(`/accounts/${account._id}`)
})

router.delete('/:transactionId', isAdmin,async(req,res)=>{
    const {id,transactionId}=req.params
     await Account.findByIdAndUpdate(id,{$pull:{transactions:transactionId}})
    await Transaction.findByIdAndDelete(transactionId)
    req.flash('success','successfully deleted transaction')
    res.redirect(`/accounts/${id}`)
})

module.exports = router;