const connection = require('../process/connection');
const process = require('../process/sql_process');
const token = require('../process/token');

contdTrans = (req, res) => {
    const {bank, acct, bid, type, selected, amt, key, tid} = req.body
    // connection.query(process.selectWhere('trans_code', ['*'],['Id'],0,0,0,0,0,0),
    //     [tid], (err, trows, fields) => {
    //     if (err) {
    //         res.json({status: false, msg: 'Error in server1', tok: true}) 
    //         res.end();
    //     }
    //     if(trows.length){
    //         if(trows[0].Code === key){
                connection.query(process.insert('transactions', ['AcctId', 'AcctType', 'TransType']),
                    [bid, selected, 'Transfer'], (err, rows, fields) => {
                        if (err) {
                            console.log(err)
                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                            res.end();
                        }
                        if(rows.affectedRows > 0){
                            const trId = rows.insertId                                
                            connection.query(process.insert('transfer', ['TransId', 'Credited', 'Amt']),
                                [trId, acct, amt], (err, trans, fields) => {
                                    if (err) {
                                        res.json({status: false, msg: 'Error in server1', tok: true}) 
                                        res.end();
                                    }
                                    if(trans.affectedRows > 0){
                                        let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
                                        type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;                                          
                                        connection.query(process.selectWhere(tab, ['*'],['AcctId'],0,0,0,0,0,0),
                                            [bid], (err, tabs, fields) => {
                                                if (err) {
                                                    res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                    res.end();
                                                }
                                                if(tabs.length){
                                                    let tabAmt = type === 'Merged Savings/Current' ? selected === 'savings' ? 
                                                    tabs[0].SavingAmt : tabs[0].CurrentAmt : tabs[0].amt ;
                                                    let newAmt = tabAmt - amt ;
                                                    let upAmt = 'Merged Savings/Current' ? selected === 'savings' ? 'SavingAmt' :
                                                    'CurrentAmt' : 'Amt' ;
                                                    connection.query(process.update(tab, [upAmt], ['AcctId']),
                                                    [newAmt, bid], (err, uptabs, fields) => {
                                                        if (err) {
                                                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                            res.end();
                                                        }
                                                        if(uptabs.affectedRows){
                                                            connection.query(process.selectWhere('userbanks', ['*'],['Acct'],0,0,0,0,0,0),
                                                            [acct], (err, userow, fields) => {
                                                                if (err) {
                                                                    res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                                    res.end();
                                                                }
                                                                if(userow.length){
                                                                    let actTab = userow[0].Type === 'Current' ? 'current' : userow[0].Type === 'Savings' ? 'saving' : 
                                                                    userow[0].Type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;  
                                                                    let newCol = userow[0].Type === 'Merged Savings/Current' ? 'SavingAmt' : 'Amt' ;                                                                      
                                                                    connection.query(process.selectWhere(actTab, ['*'],['AcctId'],0,0,0,0,0,0),
                                                                    [userow[0].Id], (err, seltabs, fields) => {
                                                                        if (err) {
                                                                            console.log(err)
                                                                            res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                                            res.end();
                                                                        }
                                                                        if(seltabs.length){
                                                                            let addAmt = userow[0].Type === 'Merged Savings/Current' ? parseInt(seltabs[0].SavingAmt) : parseInt(seltabs[0].Amt) ;
                                                                            let adddedAmt = addAmt + parseInt(amt) ;
                                                                            connection.query(process.update(actTab, [newCol], ['AcctId']),
                                                                            [adddedAmt, userow[0].Id], (err, uptabs, fields) => {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                    res.json({status: false, msg: 'Error in server1', tok: true}) 
                                                                                    res.end();
                                                                                }
                                                                                if(uptabs.affectedRows > 0){
                                                                                    res.json({status: true, success: true})
                                                                                }
                                                                            })
                                                                            
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                            
                                                        }
                                                    })

                                                }
                                            })
                                    }
                            })
                        }
                })
    //         }else{
    //             res.json({status: true, keyMsg: 'There was an update to your key. Please generate a new key to continue this transaction ', code: trows[0].Code,  tok: true})
    //         }
    //     }
    // })
                    
}

module.exports = contdTrans;