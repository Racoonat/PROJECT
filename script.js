const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const temperatureDiv = document.getElementById('temperature');
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const cityDefault = 'madrid';

const unitSelect = document.getElementById('unitSelect'); // Selección de unidad

async function getCoordinates(city) {
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(geocodingUrl);
        if (!response.ok) throw new Error('Ciudad no encontrada');
        const data = await response.json();
        return { lat: data.coord.lat, lon: data.coord.lon };
    } catch (error) {
        console.error('Error al obtener las coordenadas:', error);
        temperatureDiv.innerText = 'Error al cargar la ciudad';
        throw error;
    }
}

async function getTemperature(city) {
    const unit = unitSelect.value; // Obtener la unidad seleccionada
    try {
        const { lat, lon } = await getCoordinates(city);
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
        const response = await fetch(weatherUrl);
        
        if (!response.ok) throw new Error('Error al obtener el clima');
        
        const data = await response.json();
        const temperature = data.main.temp;
        let unitSymbol;

        // Determinar el símbolo de la unidad
        if (unit === 'metric') {
            unitSymbol = '°C';
        } else if (unit === 'imperial') {
            unitSymbol = '°F';
        } else {
            unitSymbol = 'K';
        }

        temperatureDiv.innerText = `${temperature} ${unitSymbol}`;
    } catch (error) {
        console.error('Error al obtener la temperatura:', error);
        temperatureDiv.innerText = 'Error al cargar la temperatura';
    }
}

// Añadir un evento para actualizar la temperatura cuando se cambia la unidad
unitSelect.addEventListener('change', () => {
    const city = cityInput.value.trim();
    if (city) {
        getTemperature(city); // Actualiza la temperatura con la ciudad actual
    }
    else{
        getTemperature(cityDefault);
    }
});

// Evento de búsqueda
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getTemperature(city);
    }
});

// Cargar la temperatura inicial de Helsinki
getTemperature(cityDefault);
