const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "discord_clone",
  port: 8889,
});

pool.query("SELECT * FROM serveurs", [], (err, resultat) => {});
