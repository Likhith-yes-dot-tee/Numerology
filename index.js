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
var updatedUserData = {}
app.use(express.static('public'))
app.use(express.static('CustomerReports'))
app.use(express.urlencoded({extended: false}))
app.set('views', 'views')
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge:60000*10,httpOnly:true }
}))
app.use(flash());


var userIdentifier = function (req,res,next) {
  users.findOne({'email':req.body.email})
  .then((data)=>{
    userData = data
    return new Promise((resolve,reject)=>{
      if (userData!==null && userData.password === req.body.password) {
        req.session.user = {email:userData.email,_id:userData._id}
        resolve()
      } else {
        req.flash('errors','Email or Password Incorrect')
        reject()
      }
    })
  })
  .then(()=>next())
  .catch((err)=>{
    // console.log(err);
      res.redirect('/login')
  })
  
}

var mustBeLoggedIn = function (req,res,next) {
  console.log(req.session.user);
  if (req.session.user) {
    next()
} else {
    // req.flash('errors','You must be logged in to perform this action')
    req.session.save(function () {
        res.redirect('/')
    })
}
}

app.get('/',function (req,res) {
  res.redirect('/login')
})

app.get('/login',function (req,res) {
  var error = req.flash('errors')
  console.log(error[0]);
  res.render('login.ejs',{err:typeof(error[0])=='undefined'?'':error[0]})
})

app.post('/user-authentication',userIdentifier,function (req,res) {
  res.redirect('/report-generator')
})

app.get('/report-generator',mustBeLoggedIn,function (req,res) {
  console.log("email: "+ req.session.user.email);
  users.findOne({'email':req.session.user.email})
  .then((data)=>{
    var userData = data
    var error = req.flash('reportError')
  console.log(error);
    console.log(userData);
  res.render('index.ejs',{err:error.length==0?['']:error,
                          reportsLeft:userData.reportsLeft,
                          reportsGenerated:userData.reportsGenerated})
})
.catch((err)=>{
    console.log(err)
  })
})
  


app.post('/submit',mustBeLoggedIn, (req, res) => {
  var userData = {}
  users.findOne({'email':req.session.user.email})
  .then((data)=>{
    var userData = data;
    console.log(userData);
  if (userData.transactionId == req.body.transactionId && userData.reportsLeft > 0) {
    var data = req.body
    converter.docxEdit(data)
    .then(()=>users.findOneAndUpdate({'email':userData.email},{$set:{'reportsGenerated':userData.reportsGenerated+1,'reportsLeft':userData.reportsLeft-1}}))
    .then(()=>res.redirect('/success'))
    .then(()=>converter.docx2Pdf(data))
    .then(()=>converter.flipBook(data))
    .then((res)=> converter.email(data,res))
    .catch((e)=>console.log('failed '+e))
  } else {
    if (userData.transactionId != req.body.transactionId) {
      req.flash('reportError','Wrong transaction ID')
    }
    else{
      req.flash('reportError',`ReportsLeft ${userData.reportsLeft}`)
    }
    res.redirect('/report-generator')
  }
  })
  .catch((err)=>{
    console.log(err);
  })
  })

  app.get('/success',function (req,res) {
    users.findOne({'email':req.session.user.email})
    .then((data)=>{res.render('success.ejs',{reportsLeft:data.reportsLeft,reportsGenerated:data.reportsGenerated})})
  })

  app.get('/logout',function (req,res) {
    req.session.destroy()
    res.redirect('/report-generator')   
  })
  module.exports = app
