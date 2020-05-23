var connection = require('../process/connection');
const token = require('../process/token');
const process = require('../process/sql_process');

checkBal = (req, res) => {
    const {bid, selected, type} = req.body
    let tab = type === 'Current' ? 'current' : type === 'Savings' ? 'saving' : 
        type === 'Merged Savings/Current' ? 'saving_current' : 'dom' ;
    let col = selected ? selected === 'savings' ? 'SavingAmt' : 'CurrentAmt' : 'Amt' ;
    let sql = `SELECT ${tab}.*, userbanks.Currency from  ${tab} JOIN userbanks 
        ON ${tab}.AcctId = userbanks.Id WHERE ${tab}.AcctId = ? `
    connection.query(sql, [bid], (err, rows, fields) => {
        if (err) {
            error = 'Error in server1'
            throw err
        }
        if(rows.length){
                    let newCol = type === 'Merged Savings/Current' ? selected === 'savings' ? 'SavingAmt' : 'CurrentAmt' : 'Amt' ; 
            let amt = type === 'Merged Savings/Current' ? selected === 'Current' ? rows[0].CurrentAmt : rows[0].SavingAmt : rows[0].Amt ;
            let report = type === 'Merged Savings/Current' ? {type: type, selected: selected, amt: amt, currency: rows[0].Currency} 
            : {type: type, amt: amt, currency: rows[0].Currency}
            res.json({status: true, report: report})
        }else {
            let sql = `SELECT Currency FROM userbanks WHERE Id = ?`
            connection.query(sql, [bid], (err, rows, fields) => {
                if (err) {
                    error = 'Error in server1'
                    throw err
                }
                if(rows.length){
                    let report = type === 'Merged Savings/Current' ? {type: type, selected: selected, amt: 0, currency: rows[0].Currency} 
                    : {type: type, amt: 0, currency: rows[0].Currency}
                    res.json({status: true, report: report})
                }
            })
        }
    })
}

module.exports = checkBal;