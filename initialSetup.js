const dotenv = require('dotenv')
dotenv.config()

const mongodb = require("mongodb")

mongodb.connect(process.env.CONNECTIONSTRING,{useNewUrlParser:true,useUnifiedTopology:true},function (err, client) {
    module.exports = client;
    const app = require('./index');
    app.listen(3000,function () {
        console.log('code running at port 3000');
    })
})