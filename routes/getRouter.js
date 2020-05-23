var express = require('express');
var getrouter = express.Router();
var getBank = require('../getController/getBank');
// var connection = require('../process/connection');

getrouter.use(express.json());
// app.use(express.urlencoded({ extended: false }));

getrouter.get('/getbank', getBank);


module.exports = getrouter;