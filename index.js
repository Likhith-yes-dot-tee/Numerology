const express = require('express')
const app = express()
const path = require('path')
const converter = require('./app')
const port = 3000
var data


app.use(express.static('public'))
app.use(express.static('CustomerReports'))
app.use(express.urlencoded({extended: false}))
app.set('views', 'views')
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
  res.render('index.html')
})



app.post('/submit', (req, res) => {
    
    data = req.body

    converter.docxEdit(data)
    .then(()=>res.render('success.ejs'))
    .then(()=>converter.docx2Pdf(data))
    .then(()=>converter.flipBook(data))
    .then((res)=> converter.email(data,res))
    .catch((e)=>console.log('failed'+e))
    
    
  })


app.listen(process.env.PORT||port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = {'data':data}