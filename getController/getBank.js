const connection = require('../process/connection');
const process = require('../process/sql_process');
const token = require('../process/token');
const isJson = require('../process/isJson');

const collectInfo = async (element) => {
    await new Promise(resolve => {
        let date = new Date(element.DateTime)
        let month = date.getMonth()
        let yr = date.getFullYear()
        let day = date.getDay()
        let allmonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let ndate = `${allmonth[month]} ${day}, ${yr}`
        element['DateTime'] = ndate
        if(element.TransType === 'Transfer'){
            connection.query(process.join(['transactions','transfer','userbanks','user'], ['transfer.Credited', 
            'transfer.Amt', 'userbanks.Bank', 'user.FirstName', 'user.LastName'],
            [{'transactions.Id': 'transfer.TransId'}, {'userbanks.Acct': 'transfer.Credited'},
            {'user.Id': 'userbanks.User'}],['transactions.Id'],0,0,0,0),
                [element.Id], (err, details, userFields) => {
                    if (err) {
                        throw err
                    }                     
                    element['Credited'] = details[0].Credited
                    element['Amt'] = details[0].Amt
                    element['Bank'] = details[0].Bank
                    element['FirstName'] = details[0].FirstName
                    element['LastName'] = details[0].LastName
                    resolve(element)
            })
        }else{
            connection.query(process.join(['transactions','top_up'], ['top_up.Phone','top_up.Amt'],
            [{'transactions.Id': 'top_up.TransId'}],['transactions.Id'],0,0,0,0),
                [element.Id], (err, detail, userFields) => {
                    if (err) {
                        throw err
                    }
                    let ans = isJson.isJson(detail[0])
                    element.Phone = ans.Phone
                    element.Amt = ans.Amt
                    resolve(element)
            })
        }
        
    }).then(element => {
        return element
    }).catch( error => {
        return error
    })
}
const start = async (input) => {
    await asyncForEach(input, async (element) => {
        await collectInfo(element)
    })
    console.log(input)
    return input
}

getBanks = (req, res) => {
    token.verifyToken(req.headers['x-token'], (decoded) => {
        if(decoded.message){
            console.log(decoded)
            res.json({status: false, msg: decoded.message, tok: false})
        }else{
            console.log(decoded)
            let id = decoded.id
            connection.query(process.selectWhere('userbanks', ['*'],['User'],0,0,0,0,0,0),
                [id], (err, rows, fields) => {
                if (err) {
                    res.json({status: false, msg: 'Error in server16', tok: true}) 
                    res.end();
                }
                console.log(rows)
                if(rows.length){
                    rows.forEach(element => {
                        let sql = 'SELECT COUNT(*) AS Transaction FROM transactions WHERE AcctId=?'
                        connection.query(sql,[element.Id], (err, trans, transFields) => {
                            if (err) res.json({status: false, msg: 'Error in server23', tok: true})
                            if(trans.length){
                                element['Transaction'] = trans[0].Transaction
                            }
                        })
                        let table = element.Type == 'Savings' ? 'saving' : element.Type == 'Current' ? 
                        'current' : element.Type == 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
                        connection.query(process.selectWhere(table, ['*'],['AcctId'],0,0,0,0,0,0),
                            [element.Id], (err, amt, amtFields) => {
                            if (err) res.json({status: false, msg: 'Error in server32', tok: true}) 
                            if(amt.length){
                                element['Amt'] = amt[0].Amt
                            }  

                        })                       
                    });
                    connection.query(process.join(['transactions', 'userbanks'], ['transactions.Id', 'transactions.DateTime',
                    'transactions.AcctId', 'transactions.AcctType', 'transactions.TransType'],[{'userbanks.Id': 'transactions.AcctId'}],['userbanks.User'],0,0,0,0),
                        [id], (err, result, fields) => {
                            if (err) {
                                console.log(err)
                                res.json({status: false, msg: 'Error in server43', tok: true}) 
                            }
                            if(result.length){
                                start(result).then(col => {
                                    if (rows) {
                                        // if(result){
                                            connection.query(process.selectWhere('user', ['FirstName','LastName','Email','Pix',],['Id'],0,0,0,0,0,0),
                                                [id], (err, user, userFields) => {
                                                if (err) res.json({status: false, msg: 'Error in server48', tok: true}) 
                                                if(user){                                      
                                                    connection.query(process.selectWhere('countries', ['*'],0,0,0,0,0,0,0),
                                                        (err, country, countFields) => {
                                                        if (err) res.json({status: false, msg: 'Error in server52', tok: true}) 
                                                        if(country){
                                                            let countries = []
                                                            country.forEach(element => {
                                                                connection.query(process.selectWhere('banks', ['Banks'],['CountryId'],0,0,0,0,0,0),
                                                                    [element.Id], (err, bank, bankFields) => {
                                                                    if (err) res.json({status: false, msg: 'Error in server58', tok: true}) 
                                                                    if(bank.length){
                                                                        let b = [];
                                                                        bank.forEach(element => {
                                                                            b=[...b, element.Banks]
                                                                        });
                                                                        let name = {country: element.Name, banks: b}
                                                                        countries = [...countries, name]
                                                                        res.json({status: true, bank: rows, transaction: col, user: user[0], country: countries})
                                                                    } else{
                                                                        res.json({status: false, msg: 'Server Error68', tok: true})
                                                                    } 
                                                                }) 
                                                            });
                                                            // res.json({status: true, bank: rows, transaction: result, user: user[0]})
                                                        } else{
                                                            res.json({status: false, msg: 'Server Error74', tok: true})
                                                        } 
                                                    }) 
            
                                                    // res.json({status: true, bank: rows, transaction: result, user: user[0]})
                                                } else{
                                                    res.json({status: false, msg: 'Server Error80', tok: true})
                                                } 
                                            })                                
                                        // }else{
                                        //     // res.json({status: false, msg: 'Server Error', tok: true})
                                        // }                   
                                    } else {                                   
                                        res.json({status: false, msg: 'Server Error87', tok: true}) 
                                    }
                                })
                                // new Promise(resolve => {
                                //     resolve(start(result))
                                // }).catch(error => {
                                //     res.json({status: false, msg: 'Error in server43', tok: true}) 
                                // })
                                
                            }                       
                            
                    })
                } else {
                    connection.query(process.selectWhere('user', ['FirstName','LastName','Email','Pix',],['Id'],0,0,0,0,0,0),
                        [id], (err, user, userFields) => {
                        if (err) res.json({status: false, msg: 'Error in server48', tok: true}) 
                        if(user){ 
                            connection.query(process.selectWhere('countries', ['*'],0,0,0,0,0,0,0),
                                (err, country, countFields) => {
                                if (err) res.json({status: false, msg: 'Error in server52', tok: true}) 
                                if(country){
                                    let countries = []
                                    country.forEach(element => {
                                        connection.query(process.selectWhere('banks', ['Banks'],['CountryId'],0,0,0,0,0,0),
                                            [element.Id], (err, bank, bankFields) => {
                                            if (err) res.json({status: false, msg: 'Error in server58', tok: true}) 
                                            if(bank.length){
                                                let b = [];
                                                bank.forEach(element => {
                                                    b=[...b, element.Banks]
                                                });
                                                let name = {country: element.Name, banks: b}
                                                countries = [...countries, name]
                                                res.json({status: true, bank: rows, transaction: [], user: user[0], country: countries})
                                            } else{
                                                res.json({status: false, msg: 'Server Error68', tok: true})
                                            } 
                                        }) 
                                    });
                                    // res.json({status: true, bank: rows, transaction: result, user: user[0]})
                                } else{
                                    res.json({status: false, msg: 'Server Error74', tok: true})
                                } 
                            }) 
                        }
                    })               
                }                                                  
            })
        }
    })
}

module.exports = getBanks;