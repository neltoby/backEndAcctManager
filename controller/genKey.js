var connection = require('../process/connection');
const token = require('../process/token');
var nodemailer = require('nodemailer')
var TMClient = require('textmagic-rest-client');
const process = require('../process/sql_process');
const randomize = require('randomatic');
// const smpp = require('smpp');
// const session = new smpp.Session({host: '0.0.0.0', port: 9500});

// let isConnected = false
// session.on('connect', () => {
//   isConnected = true;

//   session.bind_transceiver({
//       system_id: 'Tobenna',
//       password: 'Hallelujah',
//       interface_version: 1,
//       system_type: '380666000600',
//       address_range: '+380666000600',
//       addr_ton: 1,
//       addr_npi: 1,
//   }, (pdu) => {
//     if (pdu.command_status == 0) {
//         console.log('Successfully bound')
//     }else{
//         console.log('Failed to bound')
//     }

//   })
// })

// session.on('close', () => {
//     console.log('smpp is now disconnected') 
     
//     if (isConnected) {        
//       session.connect();    //reconnect again
//     }
// })
  
// session.on('error', error => { 
// console.log('smpp error', error)   
// isConnected = false;
// });

// function sendSMS(from, to, text) {
//     from = `+${from}`  

//     // this is very important so make sure you have included + sign before ISD code to send sms

//     to = `+${to}`

//     session.submit_sm({
//         source_addr:      from,
//         destination_addr: to,
//         short_message:    text
//     }, function(pdu) {
//         if (pdu.command_status == 0) {
//             // Message successfully sent
//             console.log(pdu.message_id);
//         }
//     });
// }

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'neltoby@gmail.com',
      pass: 'luvlife4u'
    }
});

genKey = (req, res) => {
    console.log(req.headers['x-token']);
    token.verifyToken(req.headers['x-token'], (decoded) => {
        if(decoded.message){
            res.json({status: false, msg: decoded.message, type: 'login', tok: false})
        }else{
            console.log(req.body.id);
            const {id, expires} = req.body
            let first = randomize('0', 2)
            first+=`-${randomize('0', 3)}`
            let created = expires.split(' ').join('');
            // console.log(first)
            connection.query(process.selectWhere('trans_code', ['*'], ['UserBankId'],0, 0, 0, 0, 0),
                [id.bid], (err, rows, fields) => {
                    if (err) {
                        res.json({status: false, msg: 'Error in server1', tok: true}) 
                        res.end();
                    }
                    connection.query(process.selectWhere('user', ['*'], ['Id'],0, 0, 0, 0, 0),
                        [id.uid], (err, ruws, fields) => {
                        if (err) {
                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                            res.end();
                        }
                        if(ruws.length){
                            var mailOptions = {
                                from: 'neltoby@gmail.com',
                                to: ruws[0].Email,
                                subject: 'Verify your TBT Key',
                                html: `<h3>TBT Key verification</h3>
                                <p>Please ignore this message if you didnt request for this code</p>
                                <p>And consider changing your password</p>
                                <p><b>${first}</b></p>`
                            };
                            if(rows.length){
                                id['tid'] = rows[0].Id
                                console.log(id)           
                                token.customToken(id, created, (tok) => {
                                    token.verifyToken(tok, (decoded) => {
                                        connection.query(process.update('trans_code', ['Code','Created','Allowed','Duration','Valid'], ['Id']),
                                            [first,decoded.iat,decoded.exp,expires,'Valid',rows[0].Id], (err, ups, fields) => {
                                                if (err) {
                                                    res.json({status: false, msg: 'Error in server', tok: true}) 
                                                    res.end();
                                                }
                                                if(ups.affectedRows > 0){
                                                    transporter.sendMail(mailOptions, function(error, info){
                                                        if (error) {
                                                          console.log(error);
                                                        } else {
                                                          console.log('Email sent: ' + info.response);
                                                        }
                                                    });
                                                    // sendSMS('2349036521234', '2347089976021', `Your TBT Key is ${first}`)
                                                    const response = {code: first, expires: decoded.exp, status: 'active'}
                                                    res.json({status: true, res: response, tok: tok}) 
                                                }else{
                                                    res.json({status: false, msg: 'Error in server'}) 
                                                }

                                        })
                                    })
                                })
                                
                            }else{
                                connection.query(process.insert('trans_code', ['UserBankId', 'Code', 'Duration']),
                                    [id.bid,first, expires], (err, ins, fields) => {
                                        if (err) {
                                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                                            res.end();
                                        }
                                        const transId = ins.insertId
                                        id['tid'] = transId
                                        token.customToken(id, created, (tok) => {
                                            token.verifyToken(tok, (decoded) => {
                                                connection.query(process.update('trans_code', ['Created','Allowed'], ['Id']),
                                                    [decoded.iat,decoded.exp,transId], (err, ups, fields) => {
                                                        if (err) {
                                                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                            res.end();
                                                        }
                                                        if(ups.affectedRows > 0){
                                                            transporter.sendMail(mailOptions, function(error, info){
                                                                if (error) {
                                                                  console.log(error);
                                                                } else {
                                                                  console.log('Email sent: ' + info.response);
                                                                }
                                                            });
                                                            const response = {code: first, expires: decoded.exp, status: 'active'}
                                                            res.json({status: true, res: response, tok: tok}) 
                                                        }

                                                })
                                            })
                                        })

                                })
                            }
                        }
                    })
            })
        }
    })
     
}

module.exports = genKey;