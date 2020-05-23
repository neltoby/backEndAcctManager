var express = require('express');
var postrouter = express.Router();
const { check } = require('express-validator')
var createAcct = require('../controller/createAcct');
var login = require('../controller/login');
var bodyParser = require('body-parser')
var openAccount = require('../controller/openAccount');
var genKey = require('../controller/genKey');
var confirmKey = require('../controller/confirmKey');
var processTrans = require('../controller/processTrans');
var contdTrans = require('../controller/contdTrans');
var topUp = require('../controller/topUp');
var processToken = require('../controller/processToken');
var checkBal = require('../controller/checkBal');
var statement = require('../controller/statement');

// var app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false })); 

postrouter.use(bodyParser.json())
postrouter.use(bodyParser.urlencoded({extended: false}))


postrouter.post('/createAcct', [check('firstname').isAlpha().withMessage('Must be only alphabetical chars').isLength({ min: 3}).withMessage('Must be atleast 5 char long'),
    check('lastname').isAlpha().withMessage('Must be only alphabetical chars').isLength({ min: 5}).withMessage('Must be atleast 5 char long'),
    check('email').isEmail(),check('mobile').isMobilePhone(),check('password').isAlphanumeric()],
    createAcct);

postrouter.post('/login',login)
postrouter.post('/gen-key',genKey)
postrouter.post('/confirm-key', confirmKey);
postrouter.post('/open-account', openAccount)
postrouter.post('/process-trans', processToken, processTrans)
postrouter.post('/contd-trans', processToken, contdTrans)
postrouter.post('/top-up', processToken, topUp)
postrouter.post('/check-bal', processToken, checkBal)
postrouter.post('/statement', processToken, statement)

module.exports = postrouter;