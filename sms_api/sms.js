const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring')
const http = require('http');
const app = express();
app.use(bodyParser.json());

var resreturn;
this.callyourservice= function(mobile,messag,callback) {
       var dataBack;
        var options = {
            "method": "GET",
            "hostname": "api.msg91.com",
            "port": null,
            "path":"/api/sendhttp.php?country=91&sender=FLORYS&route=4&mobiles="+mobile+"&authkey=100479AbqjxsqJWZ5b7182d6&message="+querystring.escape(messag),
            "headers": {}
        }
       var req= http.request(options, function (response) {
            var chunks = [];
            response.on("data", function (chunk) {
            resreturn = response;
            chunks.push(chunk);
        });
        response.on("end", function () {
            body = Buffer.concat(chunks);
   
            console.log(body.toString());
            if (response.statusCode == 200) {
              dataBack=response.statusCode;
                
            }
            else {
                dataBack=response.statusCode;
            }
           
          });
        });
        
        req.end();
  
            
            callback(dataBack);
    }

