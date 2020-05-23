var mysql = require('mysql');

connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat'
  })
connection.connect((err) => {
  if (err) throw err
  console.log('Connected...');
});
module.exports = connection;
