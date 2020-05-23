var connection = require('../process/connection');
const token = require('../process/token');
const process = require('../process/sql_process');

processToken = (req, res, next) => {
    const {bkid, key} = req.body
    token.verifyToken(req.headers['x-token'], (decode) => {
        if(decode.message){
            res.json({status: false, msg: decode.message, type: 'login', tok: false})
        }else{
            token.verifyToken(req.headers['x-key'], (decoded) => {
                if(decoded.message){
                    connection.query(process.update('trans_code', ['Valid'], ['UserBankId']),
                        ['Expired', bkid], (err, del, fields) => {
                            if (err) {
                                res.json({status: false, msg: 'Error in server', tok: true}) 
                                res.end();
                            }
                            if (del.affectedRows > 0) {
                                let expDateMs = new Date(decoded.expiredAt).getTime()
                                let expDate = expDateMs / 1000
                                res.json({status: true, resExp: {expires: expDate, status: 'expired'}, tok: false})                        
                            }
                    })                   
                }else{
                    const {bid, tid} = decoded
                    if(bkid == bid){
                        req.body['tid'] = tid
                        req.body['bid'] = bid
                        connection.query(process.selectWhere('trans_code', ['*'],['Id'],0,0,0,0,0,0),
                            [tid], (err, trows, fields) => {
                            if (err) {
                                res.json({status: false, msg: 'Error in server1', tok: true}) 
                                res.end();
                            }
                            if(trows.length){
                                if(trows[0].Code === key){
                                    next()
                                }else{
                                    res.json({status: true, keyMsg: 'There was an update to your key. Please generate a new key to continue this transaction ', code: trows[0].Code,  tok: true})
                                }
                            }else{
                                res.json({status: true, nonMsg: 'Please generatea key ', tok: true})
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

module.exports = processToken;