const mysql = require("mysql2");

const pool = mysql.createPool({
	host: "localhost",
	user: "root", // Замените на ваше имя пользователя
	port:3306,
	password: "pusha", // Замените на ваш пароль
	database: "address", // Замените на вашу базу данных
});

module.exports = pool.promise();
