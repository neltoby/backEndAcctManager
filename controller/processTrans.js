var connection = require('../process/connection');
const token = require('../process/token');
const process = require('../process/sql_process');

processTrans = (req, res) => {
    console.log(req.headers['x-token']);
    const {bank, acct, key, pin, bkid, type, amt, tid, bid} = req.body
    console.log(req.body);
    let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
    type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
    console.log(tab);
    console.log(bid);
    // connection.query(process.selectWhere('trans_code', ['*'],['Id'],0,0,0,0,0,0),
    //     [tid], (err, trows, fields) => {
        // if (err) {
        //     res.json({status: false, msg: 'Error in server1', tok: true}) 
        //     res.end();
        // }
        // if(trows.length){
            // if(trows[0].Code === key){
                connection.query(process.selectWhere(tab, ['*'],['AcctId'],0,0,0,0,0,0),
                    [bid], (err, rows, fields) => {
                    if (err) {
                        res.json({status: false, msg: 'Error in server1', tok: true}) 
                        res.end();
                    }
                    let ramt;
                    console.log(rows);
                    if(rows.length){
                        if(type == 'Merged Savings/Current'){
                            console.log(rows)
                            ramt = req.body.selected == 'saving' ? rows[0].SavingAmt : rows[0].CurrentAmt ;
                        }else{
                            ramt = rows[0].Amt
                        }
                        if (ramt < amt) {
                            res.json({status: true, resMsg: 'Insufficient Fund'})
                        }else{
                            connection.query(process.join(['user','userbanks'], ['user.Id','user.FirstName','user.LastName', 'userbanks.Country', 'userbanks.Bank'],
                            [{'user.Id': 'userbanks.User'}], ['userbanks.Acct','userbanks.Bank'],0 , 0, 0, 0,0, 0),
                                [acct,bank], (err, arows, fields) => {
                                    if (err) {
                                        res.json({status: false, msg: 'Error in server1', tok: true}) 
                                        res.end();
                                    }
                                    console.log(arows)
                                    if(arows.length){
                                        res.json({status: true, res: {firstName: arows[0].FirstName, 
                                            lastName: arows[0].LastName, country: arows[0].Country, bank: arows[0].Bank}})
                                    }else{
                                        res.json({status: true, resMsg: 'Unauthorised account'})
                                    }
                            })
                        }
                    }else{
                        res.json({status: true, resMsg: 'Unauthorised user'})
                    }
                })
            // }else{
            //     res.json({status: true, keyMsg: 'There was an update to your key. Please generate a new key to continue this transaction ', code: trows[0].Code,  tok: true})
            // }
        // }
    // }) 
}

module.exports = processTrans;