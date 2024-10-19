const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const unitSelect = document.getElementById('unitSelect'); 
const table = document.getElementById('favouritesTable');
const tableBody = document.getElementById('favouritesBody');
const favourites = getFavourites();


function getFavourites() {
    return JSON.parse(localStorage.getItem('favourites')) || [];
}

async function getWeather(city) { 
    const { lat, lon } = await getCoordinates(city);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    return {
        temperature: data.main.temp,
        icon: data.weather[0].icon,
        weatherDescription: data.weather[0].description
    };
}

//--------------------------GET LAN AND LON GIVEN A CITY NAME---------------------------------------------------------------

async function getCoordinates(city) {
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(geocodingUrl);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    return { lat: data.coord.lat, lon: data.coord.lon };
}


async function displayFavorites() {
    tableBody.innerHTML = '';

    if (favourites.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3; // Ajusta el número de columnas
        cell.textContent = 'No hay ubicaciones favoritas.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    // Agrega cada favorito a la tabla
    for (const favorite of favourites) {
        
        const weatherData = await getWeather(favorite); // Llama a la función para obtener el clima

        const row = document.createElement('tr');
        // Agrega evento de clic a la fila
        row.addEventListener('click', () => {
            localStorage.setItem('city', JSON.stringify(favorite));
            window.location.href = 'index.html'; 
        });

        const cityCell = document.createElement('td');
        cityCell.textContent = favorite;
        row.appendChild(cityCell);

        const temperatureCell = document.createElement('td');
        temperatureCell.textContent = `${weatherData.temperature}°`; // Añade el símbolo de grados si lo deseas
        row.appendChild(temperatureCell);

        const iconCell = document.createElement('td');
        iconCell.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherData.icon}@2x.png" alt="weather icon">`;
        row.appendChild(iconCell);

        tableBody.appendChild(row);
        
    }
}


document.addEventListener('DOMContentLoaded', displayFavorites);
