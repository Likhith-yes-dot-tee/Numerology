const express = require('express')
const app = express()
const path = require('path')
const converter = require('./app')
const users = require('./initialSetup').db().collection('users')
const port = 3000
const session = require('express-session');
const flash = require('connect-flash')
// var data

var userData = {}
app.use(express.static('public'))
app.use(express.static('CustomerReports'))
app.use(express.urlencoded({extended: false}))
app.set('views', 'views')
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge:60000,httpOnly:true }
}))
  app.use(flash());


var userIdentifier = function (req,res,next) {
  users.findOne({'email':req.body.email})
  .then((data)=>{
    userData = data
    return new Promise((resolve,reject)=>{
      if (userData!==null &&userData.password === req.body.password) {
        req.session.user = {email:userData.email,_id:userData._id}
        resolve()
      } else {
        reject("Email or Password Incorrect")
      }
    })
  })
  .then(()=>next())
  .catch((err)=>{
    // console.log(err);
    req.flash('errors',`${err}`)
    req.session.save(function () {
      res.redirect('/login')
    })
  })
  
}

var mustBeLoggedIn = function (req,res,next) {
  console.log(req.session.user);
  if (req.session.user) {
    next()
} else {
    req.flash("errors","You must be logged in to perform this action")
    req.session.save(function () {
        res.redirect('/')
    })
}
}

app.get('/',function (req,res) {
  res.redirect('/login')
})

app.get('/login',function (req,res) {
  var error = req.flash('error')
  console.log(error);
  res.render('login.ejs',{err:typeof(error)==='undefined'?'':error})
})

app.post('/user-authentication',userIdentifier,function (req,res) {
  res.redirect('/report-generator')
})

app.get('/report-generator',mustBeLoggedIn,function (req,res) {
  res.render('index.ejs')
})


app.post('/submit',mustBeLoggedIn, (req, res) => {
  console.log(userData);
  if (userData.transactionId==req.body.transactionId&&userData.reportsLeft>0) {
    var data = req.body
    converter.docxEdit(data)
    .then(()=>res.render('success.ejs'))
    // .then(()=>converter.docx2Pdf(data))
    // .then(()=>converter.flipBook(data))
    // .then((res)=> converter.email(data,res))
    .then(()=>users.findOneAndUpdate({'email':userData.email},{$set:{'reportsGenerated':userData.reportsGenerated+1,'reportsLeft':userData.reportsLeft-1}}))
    .catch((e)=>console.log('failed '+e))
  } else {
    res.redirect('/report-generator')
  }
   
  })


  module.exports = app
