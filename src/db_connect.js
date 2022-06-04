// //database 연결구조
// const db = require('mysql2');
// //const config = require('../src/db_info').dev;
// const config = require('./db_info');
// module.exports.conn= async function() {
//     const conn = await db.createConnection({
//     host: config.host,
//     port: config.port,
//     user: config.user,
//     password: config.password,
//     database: config.database

//     });
//     conn.connect(function(err) {
//     if (err) {
//         console.error('에러 db connect.js : ' + err.stack);
//         console.log('error in connect db : ',err);
//         return;
//     }
//     console.log('Mysql DB Connect완료! ID : ' + conn.threadId);
//     });
//     return conn;
// }