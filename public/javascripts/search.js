document.addEventListener("DOMContentLoaded", function () {
	const searchForm = document.getElementById("search-form");
	const searchQuery = document.getElementById("search-query");
	const searchResults = document.getElementById("search-results");
	const additionalData = document.getElementById("additional-data");
	let timeout = null;
	let markers = [];

	// Инициализация карты
	const map = L.map("map").setView([49.9935, 36.2304], 13); // Координаты Харькова

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	searchForm.addEventListener("input", searchStreet);
	searchForm.addEventListener("submit", searchStreet);
	function setHouse(item) {
		const coord = item.dataset.coord;
		if (coord) {
			const [lat, lng] = coord.split(",").map(Number);
			map.setView([lat, lng], 15);
			// Удаляем все предыдущие маркеры
			

			// Добавляем новый маркер
			const marker = L.marker([lat, lng]).addTo(map);
			markers.push(marker);
		}
	}

	function searchStreet(event) {
		event.preventDefault();
		const query = searchQuery.value;
markers.forEach((marker) => map.removeLayer(marker));
markers = [];
		// Отправляем AJAX-запрос только если длина запроса >= 4 символов
		if (query.length >= 4) {
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				fetch("/search?query=" + encodeURIComponent(query))
					.then((response) => response.json())
					.then((data) => {
						// Обновляем результаты поиска
						searchResults.innerHTML = "";
						data.results.forEach((result) => {
							const li = document.createElement("li");
							li.textContent = `${result.s_id} - ${result.street_name} - ${result.ttsstreet}`;
							li.dataset.id = result.s_id;
							li.addEventListener("click", function () {
								loadAdditionalData(result.s_id);
							});
							searchResults.appendChild(li);
						});
					})
					.catch((error) => {
						searchResults.innerHTML = "";
						console.error("Ошибка при выполнении поиска:", error);
					});
			}, 300); // Задержка в 300 мс для уменьшения количества запросов
		} else {
			searchResults.innerHTML = ""; // Очищаем результаты, если запрос меньше 4 символов
		}
	}

	function loadAdditionalData(id) {
		additionalData.innerHTML = "";
        markers.forEach((marker) => map.removeLayer(marker));
		markers = []; 
		fetch("/details?id=" + encodeURIComponent(id))
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				// Обновляем дополнительные данные
				data.forEach((result) => {
					if (result.number_buildFirst > 0) {
						const li = document.createElement("li");
						li.textContent = `${result.number_buildFirst}${
							result.laterFirst ? result.laterFirst : ""
						} `.trim();
						li.textContent += result.number_buildSecond
							? `/${result.number_buildSecond}`
							: "";

						li.dataset.id = result.a_id;
						li.dataset.coord = result.coord;
						additionalData.appendChild(li);
					}
				});
				// Добавляем обработчики кликов для элементов списка
				const itemList = document.querySelectorAll(
					"#additional-data li",
				);
				itemList.forEach((item) => {
					item.addEventListener("click", () => setHouse(item));
				});
			})
			.catch((error) => {
				console.error(
					"Ошибка при загрузке дополнительных данных:",
					error,
				);
			});
	}
});
