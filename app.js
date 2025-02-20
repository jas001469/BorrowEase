require('dotenv').config();

const express = require('express')
const path = require('path')

const mongoose = require('mongoose')
const MongoStore = require('connect-mongo');
const session = require('express-session');


const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const flash = require('connect-flash')

const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user');
const userRoutes = require('./routes/user')
const accountsRoutes = require('./routes/account')
const transactionsRoutes = require('./routes/transaction')

// const dbUrl = process.env.DB_URL
const dbUrl = "mongodb://127.0.0.1:27017/BorrowEase";
const port = process.env.PORT || 1469;
// "mongodb://127.0.0.1:27017/BorrowEase"

mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

if (process.env.RUN_SET_ADMIN === 'true') {
    setAdmin(); // This will set the admin if RUN_SET_ADMIN is set to true
}

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname,'views'))


app.use(express.urlencoded({extended:true})) // it is used to parse the body
app.use(methodOverride('_method'))//Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(express.static(path.join(__dirname,'public')))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    dbName: 'BorrowEaseData',
    crypto: {
        secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!'
    }
});

const sessionconfig = {
    store,
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionconfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.currentUser = req.user; 
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash('error', 'Something went wrong!');
    res.status(err.status || 500).send('Internal Server Error');
});

app.use('/', userRoutes)
app.use('/accounts',accountsRoutes)
app.use('/accounts/:id/transactions',transactionsRoutes)


app.get('/',(req,res)=>{
    res.render('home');
})


app.listen(port,()=>{
    console.log(`Serving at Port ${port}`);
})
