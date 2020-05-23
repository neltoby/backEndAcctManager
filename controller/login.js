var connection = require('../process/connection');
var bcrypt = require('bcrypt')
const formidable = require('formidable')
const process = require('../process/sql_process');
const isEmail = require('../process/isEmail');
const token = require('../process/token');
const saltRounds = 10;
const bodyParser = require('body-parser')

login = (req, res) => {
    // let  form = formidable.IncomingForm();
    // form.parse(req, (err, fields, files) => {
        const {email, password} = req.body;
        console.log(email)
        let cat = isNaN(email) ? 'Email' : 'Mobile';
        let mailMobChk = isEmail.isEmail;
        mailMobChk(email, (ret) => {
            if(ret.length){
                bcrypt.compare(password, ret[0].Password, (err, result) => {
                    if(err) {console.log(err); throw err}
                    if(result == true){
                        token.createToken({id: ret[0].Id}, (tok) => {
                            res.json({status: true, token: tok})
                        }) 
                    }else{
                        res.json({status: false, msg: `Unmatched ${cat}-Password `, name: 'email'})
                    }
                })
            }else{
                res.json({status: false, msg: `Unmatched ${cat}-Password`, name: 'email'})
            }
        })
    // })
}

module.exports = login;
