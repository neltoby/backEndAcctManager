const connection = require('../process/connection');
const process = require('../process/sql_process');
const token = require('../process/token');
const randomize = require('randomatic');
const acct = require('../process/isEmail');

openAccounts = (req, res) => {
    console.log(req.headers['x-token']);
    token.verifyToken(req.headers['x-token'], (decoded) => {
        if(decoded.message){
            res.json({status: false, msg: decoded.message, tok: false})
        }else{
            // console.log(decoded)
            let {country,bank,type,cards} = req.body
            let id = decoded.id
            let acctNo = randomize('0', 9);
            acctNo = `0${acctNo}`;
            let obj = {country: country, bank: bank, acct: acctNo}
            acct.acct(obj, (num) => {
                connection.query(process.insert('userbanks', ['User', 'Country','Bank', 'Acct', 'Type']),
                    [id,country,bank,num,type], (err, rows, fields) => {
                        if (err) {
                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                            res.end();
                        }
                        let rowId = rows.insertId
                        cards.forEach(element => {
                            connection.query(process.insert('cards', ['BankId', 'Card']),
                                [rowId,element], (err, result, fields) => { 
                                    if (err) {
                                        res.json({status: false, msg: 'Error in server', tok: true}) 
                                        res.end();
                                    }
                            })
                        });
                        let table;
                        if(type == 'Savings'){
                            table = 'saving'
                        }else if(type == 'Current'){
                            table = 'current'
                        }else if(type == 'Merged Savings/Current'){
                            table = 'saving_current'
                        }else if(type == 'Domicillary'){
                            table = 'dom'
                        }
                        connection.query(process.insert(table, ['AcctId']), [rowId], (err, result, fields) => { 
                            if (err) {
                                res.json({status: false, msg: 'Error in server', tok: true}) 
                                res.end();
                            }
                        })
                        res.json({status: true, res: {Bank: bank, Country: country, Type: type, 
                            Acct: num, Id: rowId, User: id, Amt: 0, Currency: '#', Transaction: 0}})
                        // connection.query(process.selectWhere('transactions', ['*'],['User']),
                        //     [id], (err, result, fields) => {
                        //         if (err) res.json({status: false, msg: 'Error in server', tok: true}) 
                        //         if (rows) {
                        //             if(result){
                        //                 res.json({status: true, bank: rows, transaction: result})
                        //             }else{
                        //                 res.json({status: false, msg: 'Server Error', tok: true})
                        //             }                   
                        //         } else {
                        //             res.json({status: false, msg: 'Server Error', tok: true}) 
                        //         }
                                
                        // })
                                                            
                })
            })
            
        }
    })
}

module.exports = openAccounts;