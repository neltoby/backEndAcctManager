var connection = require('../process/connection');
const process = require('../process/sql_process');
const time = require('../process/time');
const isJson = require('../process/isJson');
const asyncForEach = require('../process/asyncForEach');

// const handleFxn = (i,rows) => {
//     // console.log(i)
//     // console.log(rows.length)
//     // let item = rows[i]
 
//         rows.map((item, i) => {
//             return (
//                 item.DateTime = time(item.DateTime )
//                  new Promise((resolve, reject) => {
//                     let sql = item.TransType === 'Transfer' ? process.join(['transfer','userbanks','user'], 
//                     ['transfer.Amt','userbanks.Acct','userbanks.Country','userbanks.Bank','user.FirstName','user.LastName'],
//                     [{'transfer.CreditedId': 'userbanks.Id'},{'user.Id': 'userbanks.User'}], ['transfer.TransId'],0,0,0,0,0):
//                     process.selectWhere('top_up', ['Phone', 'Amt'],['TransId'],0,0,0,0,0,0) ;
//                     // console.log(sql)
//                     connection.query(sql, [item.Id], (err, srow, fields) => {
//                         if (err) {
//                             console.log(err)
//                             throw err
//                         }
//                         // console.log(srow)
//                         if(srow){
//                             rows[i] = {...item,...srow[0]}
//                             // console.log(rows[i])
//                             resolve(i++)
//                         }
//                     })
//                 }).then(nI => {
//                     let newI = parseInt(nI) + 1
//                     handleFxn(newI, rows)
//                 }).catch(err => {
//                     // console.log(err)
//                 })
//             )
//         })             
// }
const doFxn = async (target) => {      
    console.log(target)     
    await new Promise((resolve, reject) => {
        target.DateTime = time(target.DateTime )
        let sql = target.TransType === 'Transfer' ? process.join(['transfer','userbanks','user'], 
            ['transfer.Amt','userbanks.Acct','userbanks.Country','userbanks.Bank','user.FirstName','user.LastName'],
            [{'transfer.CreditedId': 'userbanks.Id'},{'user.Id': 'userbanks.User'}], ['transfer.TransId'],0,0,0,0,0):
            process.selectWhere('top_up', ['Phone', 'Amt'],['TransId'],0,0,0,0,0,0) ;
            connection.query(sql, [target.Id], (err, srow, fields) => {
                if (err) {
                    console.log(err)
                    throw err
                }
                console.log(srow)
                if(srow){
                    if(target.TransType === 'Transfer'){
                        target.Amt = srow[0].Amt
                        target.Acct = srow[0].Acct
                        target.Country = srow[0].Country
                        target.Bank = srow[0].Bank
                        target.FirstName = srow[0].FirstName
                        target.LastName = srow[0].LastName
                    }else{
                        let ans = isJson.isJson(srow[0])
                        console.log
                        target.Phone = ans.Phone
                        target.Amt = ans.Amt
                    }
                    // target = {...target,...srow[0]}
                    console.log(target)
                    resolve(target)
                }
            })
    }).catch(err => {
        console.log(err)
    }) 
       
}

statement = (req, res) => {
    const {bid, selected, type} = req.body
    console.log(req.body)
    // let debit
    // let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
    //     type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
    const fxn = (callback) => {
        let dsql = 'SELECT * FROM transactions WHERE AcctId = ? '
        connection.query(dsql, [bid], (err, rows, fields) => {
            if (err) {
                error = 'Error in server1'
                throw err
            }
            // console.log(rows)
            if(rows.length){
                if (type === 'Merged Savings/Current') {
                    rows = rows.filter(row => {
                        return row.AcctType === selected
                    })
                } 
                const start = async () => {
                    await asyncForEach(rows, async (element) => {
                        console.log(element)
                        await doFxn(element)
                    })
                    console.log('i have finished')
                    return true
                }
                // start()
                console.log(rows)
                new Promise((resolve, reject) => {
                    start().then(nrow => {
                        if(nrow){
                            resolve(nrow) 
                        }else{
                            reject(nrow)
                        }                     
                    })                                                   
                }).then(nrow => {
                   
                    return callback(rows)
                }).catch(err => {
                    console.log(err)
                })
            }else{
                return callback([])
            }
        })
    }
    fxn(row => {
        let debit = row
        console.log(debit)
        return new Promise((resolve, reject) => {
            let csql = process.join(['transfer','transactions','userbanks','user'], 
            ['transfer.Amt','transactions.TransType', 'transactions.DateTime', 'userbanks.Country','userbanks.Bank',' userbanks.Acct','user.FirstName','user.LastName'],
            [{'transfer.TransId': 'transactions.Id'},{'userbanks.Id': 'transactions.AcctId'}, {'user.Id': 'userbanks.User'}], ['transfer.CreditedId'],0,0,0,0,0)
            connection.query(csql, [bid], (err, srow, fields) => {
                if (err) {
                    reject(err)
                }
                // console.log(srow)                   
                    resolve(srow)
            })
        }).then(newrow => {
            if(newrow.length){
                newrow.forEach(element => {
                    element.DateTime = time(element.DateTime )
                });
            }
            console.log({status: true, credited: newrow, debited: row})
            res.json({status: true, report: {credit: newrow, debit: row, bid: bid}})
        }).catch(err => {
            console.log(err)
        })
    })
    // console.log(debit)
}

module.exports = statement;