const process = require('./sql_process');
const randomize = require('randomatic');
var connection = require('./connection');

exports.isEmail = (email, callback) => {
    let sql = isNaN(email) ? process.selectWhere('user', ['*'], ['Email'],0, 0, 0, 0, 0) : 
    process.selectWhere('user', ['*'], ['Mobile'],0, 0, 0, 0, 0) ;
    connection.query(sql,
            [email], function (err, rows, fields) {
                if (err) throw err
                if(rows.length){
                    return callback(rows)
                }else{
                    return callback(false)
                }
            })
  }
exports.acct = (obj, callback) => {
    const {country, bank, acct} = obj 
    // do{}
    let sql = process.selectWhere('userbanks', ['*'], ['Country','Bank','Acct'],0, 0, 0, 0, 0) ; 
    connection.query(sql, [country, bank, acct], function (err, rows, fields) {
                if (err) throw err
                if(rows.length){
                    let i = true;
                    while(i){
                        let newBank = randomize('0', 9);
                        newBank = `0${newBank}`;
                        connection.query(sql, [country, newBank, acct], function (err, result, fields){
                            if(err) throw err
                            if(result.length){
                                continue 
                            }else{
                                i = false;
                                callback(newBank)                              
                                break;
                            }
                        })
                    }
                    // return callback(rows)
                }else{
                    return callback(acct)
                }
            })
  }
exports.isMobile = (mobile, callback) => {
    let sql = process.selectWhere('user', ['*'], ['Mobile'],0, 0, 0, 0, 0) ;
    connection.query(sql,
        [mobile], function (err, rows, fields) {
            if (err) throw err
            if(rows.length){
                return callback(rows)
            }else{
                return callback(false)
            }
        })
}
//   var info = '' ;
//   isEmail('neltoby@gmail.com', (res) => {
//       info = res;
//       console.log(info);
//       isEmail('1234567890', (row) => {
//           console.log(row)
//       })
//   })
