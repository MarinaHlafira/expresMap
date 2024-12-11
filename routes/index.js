const express = require("express");
const router = express.Router();
const db = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Express" });
});

/* GET search results. */
router.get("/search", async function (req, res, next) {
	const query = req.query.query;
	// Возвращаем статические результаты поиска
	try {
		const [results] = await db.query(
			"SELECT DISTINCT s_id, street_name, ttsstreet FROM address.vwaddress WHERE r_id IS NOT NULL AND street_name LIKE ?",
			[`%${query}%`],
		);
		res.json({ results: results });
	} catch (error) {
		console.error("Ошибка при выполнении запроса:", error);
		res.status(500).json({ error: "Ошибка при выполнении запроса" });
	}
});

/* GET additional data. */
router.get("/details", async function (req, res, next) {
	const id = req.query.id;

	try {
		const [results] = await db.query(
			"SELECT a_id, number_buildFirst, ad.laterFirst, ad.number_buildSecond, ad.laterSecond, housing, description, coord FROM address.vwaddress ad WHERE s_id = ?",
			[id],
		);
		if (results.length > 0) {
			res.json(results);
		} else {
			res.status(404).json({ error: "Данные не найдены" });
		}
	} catch (error) {
		console.error("Ошибка при выполнении запроса:", error);
		res.status(500).json({ error: "Ошибка при выполнении запроса" });
	}
});

module.exports = router;
