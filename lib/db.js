const mariadb = require('mariadb/callback');

require("dotenv").config();

// Mariadb Connection Block
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_Database,
    password: process.env.DB_Password,
    connectionLimit: 5
});
async function asyncFunction() {
    let conn;
    try {
      console.log('establishing connection')
      conn = await pool.getConnection();
      console.log('established')
      const rows = await conn.query("SHOW TABLES");
      console.log(rows);
  
    } catch (err) {
      console.log(err)
        throw err;
    } finally {
        if (conn) return conn.end();
    }
  }

module.exports = {pool};