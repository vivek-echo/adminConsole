const mysql = require('mysql2');

const mysqDb = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
});
mysqDb.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});
module.exports = mysqDb;