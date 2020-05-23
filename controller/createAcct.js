var connection = require('../process/connection');
var fs = require('fs')
var path = require('path');
var bcrypt = require('bcrypt')
// var bodyParser = require('body-parser')
// var cookieParser = require('cookie-parser');
// const { check } = require('express-validator')
const formidable = require('formidable')
const process = require('../process/sql_process');
const isEmail = require('../process/isEmail');
const token = require('../process/token');
const saltRounds = 10;

createAcct = (req, res) => {
    let  form = formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const {firstname, lastname, email, mobile, password} = fields;
        console.log(firstname, lastname, email, mobile, password);
        let fileDirectory = path.join(__dirname, 'profile',files.profile.name);
        try{
            fs.access(fileDirectory, fs.F_OK, (err) => {
                if(err){
                    let mailMobChk = isEmail.isEmail;
                    mailMobChk(email, (responds) => {
                    if(responds.length){
                        res.json({status: false, msg: 'Email already exist!', name: 'email'})
                    }else{
                        mailMobChk(mobile, (row) => {
                        if(row.length){
                            res.json({status: false, msg: 'Mobile number already exist!', name: 'mobile'})
                        }else{
                            let oldpath = files.profile.path;
                            let date = new Date();
                            let hr = date.getHours();
                            let min = date.getMinutes();
                            let sec = date.getSeconds();
                            let msec = date.getMilliseconds();
                            let day = date.getDate();
                            let mon = date.getMonth()+1;
                            let yr = date.getFullYear();
                            day = day < 10 ? `0${day}`: day ;
                            mon = mon < 10 ? `0${mon}`: mon ;
                            hr = hr < 10 ? `0${hr}`: hr ;
                            min = min < 10 ? `0${min}`: min ;
                            sec = sec < 10 ? `0${sec}`: sec ;
                            msec = msec < 10 ? `0${msec}`: msec ;
                            let today = `${msec}-${sec}-${min}-${hr}-${day}-${mon}-${yr}`;
                            let newpath = path.join(__dirname,'../', 'profile', `${today}${files.profile.name}`);
                            bcrypt.hash(password, saltRounds, (err, hash) => {
                                if(err){
                                    res.json({status: false, msg: 'Server error!'})
                                    res.end();
                                }
                                connection.query(process.insert('user', ['FirstName', 'LastName','Email', 'Mobile', 'Password','Pix']),
                                    [firstname,lastname,email,mobile,hash,`${today}${files.profile.name}`], (err, rows, fields) => {
                                    if (err) throw err  
                                    fs.rename(oldpath, newpath, (err) => {
                                        if(err) throw err;
                                        console.log('file uploaded')
                                        token.createToken({id: rows.insertId}, (tok) => {
                                            console.log('The solution is successful ')
                                            res.json({status: true, token: tok, tok: true})
                                        }) 
                                    })                                       
                                })
                                connection.end();
                            }) 
        
                        }
                        })
                    }
                    })
                
                }else{
                    console.log('file exist!')
                    res.json({ status: false, msg: 'File already exist'});
                }
            
            })  
        }catch(err){
            console.log(err)
        }  
    })
}
module.exports = createAcct;