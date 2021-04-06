const express = require('express')
const app = express()
const path = require('path')
const converter = require('./app')
const port = 3000
var data


app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))




app.get('/', (req, res) => {
  res.render('success.html')
})



app.post('/submit', (req, res) => {
    
    data = req.body
    // console.log(data);
    // var date = data.dob.split('-').join('').split('')
    // var a = recursive(date[0]+date[1]) 
    // var b = recursive(date[2]+date[3])
    // var c = recursive(date[4]+date[5])
    // var d = recursive(date[6]+date[7])
    // var ab = recursive(a+b)
    // var cd = recursive(c+d)
    // var number = ab.toString().concat(cd.toString())
    // console.log(number,ab,cd,date);
    converter.docxEdit(data)
    .then(()=>res.render('success.html'))
    .then(()=>converter.docx2Pdf())
    .then(()=> converter.email(data))
    .catch((e)=>console.log('failed'+e))
    
    
  })


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = {'data':data}