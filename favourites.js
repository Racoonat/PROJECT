const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const unitSelect = document.getElementById('unitSelect'); 
const table = document.getElementById('favouritesTable');
const tableBody = document.getElementById('favouritesBody');
const favourites = getFavorites();


function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}


function displayFavorites() {
    
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
        cell.colSpan = 4; // Ajusta el número de columnas
        cell.textContent = 'No hay ubicaciones favoritas.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    // Agrega cada favorito a la tabla
    for (const favorite of favourites) {
        try {
            console.log(favorite);
            const weatherData = await getWeather(favorite); // Llama a la función para obtener el clima
            const date = new Date();
            const time = date.toLocaleTimeString(); // Obtén la hora actual

            const row = document.createElement('tr');

            const cityCell = document.createElement('td');
            cityCell.textContent = favorite.city;
            row.appendChild(cityCell);

            const temperatureCell = document.createElement('td');
            temperatureCell.textContent = `${weatherData.temperature}°`; // Añade el símbolo de grados si lo deseas
            row.appendChild(temperatureCell);

            const timeCell = document.createElement('td');
            timeCell.textContent = time; // Hora actual
            row.appendChild(timeCell);

            const iconCell = document.createElement('td');
            iconCell.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherData.icon}@2x.png" alt="weather icon">`;
            row.appendChild(iconCell);

            tableBody.appendChild(row);
        } catch (error) {
            console.error(`Error fetching weather data for ${favorite.city}:`, error);
        }
    }
}

document.addEventListener('DOMContentLoaded', displayFavorites);
console.log(favourites);