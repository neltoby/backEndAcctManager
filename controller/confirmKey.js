const connection = require('../process/connection');
const process = require('../process/sql_process');
const token = require('../process/token');

confirmKey = (req, res) => {
    // console.log(req.headers['x-key']);
    const {bid} = req.body
    token.verifyToken(req.headers['x-token'], (decode) => {
        if(decode.message){
            res.json({status: false, msg: 'Expired session', type: 'login', tok: false})
        }else{
            token.verifyToken(req.headers['x-key'], (decoded) => {
                if(decoded.message){
                    connection.query(process.update('trans_code', ['Valid'], ['UserBankId']),
                        ['Expired', bid], (err, del, fields) => {
                            if (err) {
                                res.json({status: false, msg: 'Error in server1', tok: true}) 
                                res.end();
                            }
                            if (del.affectedRows > 0) {
                                let expDateMs = new Date(decoded.expiredAt).getTime()
                                let expDate = expDateMs / 1000
                                res.json({status: true, expMsg: true, res: {expires: expDate, status: 'expired'}, tok: false})
                            }
                    })
                    
                }else{
                    if(bid === decoded.bid){
                        let {tid, id, bid} = decoded
                        connection.query(process.selectWhere('trans_code', ['*'],['Id'],0,0,0,0,0,0),
                            [tid], (err, rows, fields) => {
                            if (err) {
                                res.json({status: false, msg: 'Error in server1', tok: true}) 
                                res.end();
                            }
                            if (rows.length) {
                                res.json({status: true, res: {code: rows[0].Code, expires: decoded.exp, status: 'active'}})
                            }
                        })
                    }else{
                        res.json({status: true, nonMsg: 'Unmatched token'})
                    }
                }
            })
        }
    })
}

module.exports = confirmKey;