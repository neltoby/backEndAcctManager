var connection = require('../process/connection');
const token = require('../process/token');
const process = require('../process/sql_process');
const asyncForEach = require('../process/asyncForEach');

topUp = (req, res) => {
    const {bank, bkid, input, tid, type, selected, bid} = req.body
    console.log(req.body)
    let total = parseInt(0) ;
    input.forEach(element => {
        total = parseInt(total) + parseInt(element.amt)
    });
    const doTopUp = async (element) => {
        // try{
            let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
                type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
            await new Promise(resolve => {
                connection.query(process.selectWhere(tab, ['*'],['AcctId'],0,0,0,0,0,0),
                    [bid], (err, amrows, fields) => {
                    if (err) {
                        error = 'Error in server1'
                        throw err

                    }
                    console.log(amrows)
                    resolve(amrows)
                })
            }).
            then(amrows => {
                if(amrows.length > 0){
                    let addAmt = type === 'Merged Savings/Current' ? selected === 'savings' ? 
                        parseInt(amrows[0].SavingAmt) : parseInt(amrows[0].CurrentAmt) : parseInt(amrows[0].Amt) ;
                    let adddedAmt = addAmt - parseInt(element.amt) ;
                    let newCol = type === 'Merged Savings/Current' ? selected === 'savings' ? 'SavingAmt' : 'CurrentAmt' : 'Amt' ; 
                    console.log(newCol, adddedAmt)
                    connection.query(process.update(tab, [newCol], ['Id']),
                        [adddedAmt, amrows[0].Id], (err, uptabs, fields) => {
                        if (err) {
                            error = 'Error in server1'
                            throw err
                        }
                        console.log(uptabs)
                        if(uptabs.affectedRows > 0){
                            return true
                        }
                        

                    })
                }
            }).then(uptabs => {
                connection.query(process.insert('transactions', ['AcctId', 'AcctType', 'TransType']),
                    [bid, selected, 'TopUp'], (err, trows, fields) => {
                    if (err) {
                        error = 'Error in server1'
                        throw err
                    }
                    if(trows.affectedRows > 0){
                        console.log(trows)
                        let insId = trows.insertId 
                        connection.query(process.insert('top_up', ['TransId', 'Phone', 'Network', 'Amt']),
                            [insId, element.num, element.net, element.amt], (err, inrows, fields) => {
                            if (err) {
                                error = 'Error in server1'
                                throw err
                            }
                            if(inrows.affectedRows > 0) {
                                console.log('success')
                                return true                                           
                            }
                        })
                    }else{
                        error = 'Processing Error'
                        throw new Error ('Processing Error')
                    }
                });
            }).catch( error => {
                console.log(error)
                res.json({status: false, msg: error.message, tok: true}) 
            })
    }
    const start = async () => {
        await asyncForEach(input, async (element) => {
            console.log(element)
            await doTopUp(element)
        })
        console.log('i have finished')
        res.json({status: true, success: true})
    }
    let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
    type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
    let namt = type === 'Merged Savings/Current' ? selected === 'savings' ? 'SavingAmt' : 'CurrentAmt' : 'Amt' ;
    let sql = `SELECT ${tab}.${namt} FROM ${tab} JOIN userbanks ON ${tab}.AcctId = userbanks.Id WHERE ${tab}.AcctId = ? 
    AND userbanks.Bank = ?`
    connection.query(sql,[bid, bank], (err, rows, fields) => {
        if (err) {
            res.json({status: false, msg: 'Error in server1', tok: true}) 
            res.end();
        }
        let ramt;
        console.log(rows);
        if(rows.length){
            if(type == 'Merged Savings/Current'){
                console.log(rows)
                ramt = selected == 'savings' ? rows[0].SavingAmt : rows[0].CurrentAmt ;
            }else{
                ramt = rows[0].Amt
            }
            if (ramt < total) {
                res.json({status: true, resMsg: 'Insufficient Fund'})
            }else{
                let error =''
                let success = []
                try{
                    start()
                    // console.log(success)
                    //     if(success.length  == 3){
                    //         console.log('was filled')
                    //         res.json({status: true, success: true})
                    //     }
                    
                } catch (e) {
                    res.json({status: false, msg: e.message, tok: true}) 
                }
                // else{
                //     res.json({status: false, msg: error, tok: true})
                // }
            }
        }
        
    })
}

module.exports = topUp;