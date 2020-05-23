var jwt = require('jsonwebtoken');
var fs = require('fs')
var path  = require('path')

const location = path.join(__dirname,'sec.txt');

module.exports = {
    createToken : (payload, callback) => {
        // console.log(location)
        const sec = fs.readFile(location, {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                console.log(err)
                throw err
            }
            jwt.sign(payload, data,
            { audience: 'https', notBefore: 0, expiresIn: '1hr'},(err, token) => {
                // console.log(token)
                return callback(token)
            })

        })
    },
    customToken : (payload,  time='1hr', callback) => {
        // console.log(location)
        const sec = fs.readFile(location, {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                console.log(err)
                throw err
            }
            jwt.sign(payload, data,
            { audience: 'https', notBefore: 0, expiresIn: time},(err, token) => {
                // console.log(token)
                return callback(token)
            })

        })
    },

    verifyToken : (token, callback) => {
        const sec = fs.readFile(location, {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                // console.log(err)
                throw err
            }
            jwt.verify(token, data, (err, decoded) => {
                if (err) {
                    return callback(err)
                }
                    return callback(decoded)
                })

        })
    }
}
