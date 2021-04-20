const express = require("express");
// const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
var app = express();



var server = app.listen(3000, function () {
    console.log("Listening on port %$...", server.address().port);
});

// const path = require('path');
const router = express.Router();

// let rawdata = fs.readFileSync(path.resolve("/home/www/simfastteam4.atwebpages.com", "test.json"));
let rawdata = fs.readFileSync(path.resolve(__dirname, "test.json"));
let flightListJSON = JSON.parse(rawdata);
// console.log(flightListJSON);

app.get('/load', function (req, res) {


	//// this cannot be correct.
	res.setHeader('Access-Control-Allow-Origin', '*'); 	// access granted to 'wildcard'	-- no credentials needed 
	//https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  	res.json(flightListJSON);

  	// res.send(JSON.stringify(flightListJSON));
})

