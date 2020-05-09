const mysql = require('mysql');

const dbconfig = require('./db.json');

const pool = mysql.createPool({
  connectionLimit: 10, // important
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
  timezone: 'UTC+0',
});

const exec = async (sql) => {
  try {
    const promise = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }

        connection.query(sql, (error, results) => {
          connection.release();
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });
    const rows = await promise;
    return rows;
  } catch (err) {
    console.log(`Database error while handling ${sql}`); // eslint-disable-line no-console
    throw err;
  }
};

const cleanup = async () => {
  return new Promise((resolve, reject) => {
    pool.end((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = { dml: exec, query: exec, cleanup };
