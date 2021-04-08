
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
const fetch = require('node-fetch');
const date = require('date-and-time');
const ordinal = require('date-and-time/plugin/ordinal');
require('dotenv').config()

date.plugin(ordinal);

const now = new Date();
var today = date.format(now,'DDD MMMM YYYY')
var fs = require('fs');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
var uID = uuidv4();
// console.log(data.name);
 


// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
exports.docxEdit = function (data){
    
    return new Promise((resolve,reject)=>{
        function replaceErrors(key, value) {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function(error, key) {
                    error[key] = value[key];
                    return error;
                }, {});
            }
            return value;
        }
        
        function errorHandler(error) {
            console.log(JSON.stringify({error: error}, replaceErrors));
        
            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors.map(function (error) {
                    return error.properties.explanation;
                }).join("\n");
                console.log('errorMessages', errorMessages);
                // errorMessages is a humanly readable message looking like this :
                // 'The tag beginning with "foobar" is unopened'
            }
            throw error;
        }
        
        //Load the docx file as a binary
        var content = fs
            .readFileSync(__dirname+'/Reports/1,191 (F) The Clarity OF D’Life Journey Report (1).docx', 'binary');
        
        var zip = new PizZip(content);
        var doc;
        try {
            doc = new Docxtemplater(zip);
        } catch(error) {
            // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
            errorHandler(error);
        }
        
        //set the templateVariables
        doc.setData({
            first_name:data.name,
            day:today
        });
        
        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
            errorHandler(error);
        }
        
        var buf = doc.getZip()
                     .generate({type: 'nodebuffer'});
        
                     console.log(buf);
        
        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        fs.writeFileSync(__dirname+`/outdocx/${data.name}_${uID}.docx`, buf);
        if(buf){
            resolve()
        }else{
            reject('error')
        }
    })

    }

// docx to pdf
// async function docxToPdf(){
    



exports.docx2Pdf = function (data) {
    return new Promise((resolve,reject)=>{
        console.log('executing pdf conversion');
    var fs = require('fs'),
    cloudConvert = new (require('cloudconvert'))(process.env.CLOUDCONVERT);
    var readableStream = fs.createReadStream(__dirname+`/outdocx/${data.name}_${uID}.docx`)
    .pipe(cloudConvert.convert({
        "inputformat": "docx",
        "outputformat": "pdf",
        "input": "upload" 
    }))
    .pipe(fs.createWriteStream(__dirname+`/CustomerReports/${data.name}_${uID}.pdf`));
    
    readableStream.on('finish',()=>{
        resolve();
    })
    })
}

exports.flipBook = function (data) {
    return new Promise((resolve,reject)=>{
        fetch(`https://heyzine.com/api1?pdf=https://numerology-wpgk9.ondigitalocean.app/${data.name}_${uID}.pdf%3Fv2&k=8d79f1ce06caa035`)
    .then(res => resolve(res))
    .catch((err)=>{
        reject(err)
    })

    })
    
}

exports.email = function (data,res) {

    return new Promise((resolve,reject)=>{
        var api_key = process.env.MAILGUN_API;
var domain = "mg.tpi.sg";
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 
var mailOptions = {
  from: 'tolikhith@gmail.com',
  to: data.email,
  subject: 'Hello',
  text: res
};
 
mailgun.messages().send(mailOptions, function (error, body) {
  if(body){
      resolve('done')
  }else{
      reject('mailfailed')
  }
});
    })

    
}


    
    

    


    
