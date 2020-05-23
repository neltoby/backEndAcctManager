var connection = require('../process/connection');
var bcrypt = require('bcrypt')
const process = require('../process/sql_process');
const isEmail = require('../process/isEmail');
const token = require('../process/token');
const saltRounds = 10;

retrieveToken = (req, res) => {
    const {email, password} = req.body;
    let cat = isNaN(email) ? 'Email' : 'Mobile';
    let mailMobChk = isEmail.isEmail;
    console.log(req.body.email);
}

module.exports = retrieveToken