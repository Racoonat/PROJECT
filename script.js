const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const temperatureDiv = document.getElementById('temperature');
const searchButton = document.getElementById('searchButton');
const unitSelect = document.getElementById('unitSelect');
const cityInput = document.getElementById('cityInput');
const locationButton = document.getElementById('locationButton'); 
const citySearch = document.getElementById('citySearch'); 
let cityName= document.getElementById('cityName'); 


let city= 'vallecas';
//here I am using a default city to be seen when you first open the app. I choose my home City :)

let unitSymbol = changeUnitSymbol(unitSelect.value);

//first i want to know the temperature
async function getTemperature(city) { 
    const { lat, lon } = await getCoordinates(city);
    getTemperatureByCoordinates(lat,lon);
}

async function getTemperatureByCoordinates(lat,lon) { 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Error with the temperature');
    const data = await response.json();
    const temperature = data.main.temp;
    cityUpdate(data.name);
    getHourlyForecast(lat,lon);
    updateAppStyle(temperature, data.sys.sunrise, data.sys.sunset);

    temperatureDiv.innerText = `${temperature} ${unitSymbol}`;
}

//this function gives me the latitude and longitude of the city i am looking for 
async function getCoordinates(city) {
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(geocodingUrl);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    return { lat: data.coord.lat, lon: data.coord.lon };
}


// with this function i obtain the current location of the user
function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                error => {
                    console.error('Error obtaining location:', error);
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by the browser'));
        }
    });
}

//Change the unit when selected
unitSelect.addEventListener('change', () => {
    unitSymbol=changeUnitSymbol(unitSelect.value);
    getTemperature(city);
});

//Selects the symbol
function changeUnitSymbol(unit) {
    let symbols = {
        metric: '°C',
        imperial: '°F',
        standard: 'K'
    };
    return symbols[unit];
}

// User selects a city
citySearch.addEventListener('submit', (event) => {
    event.preventDefault();
    if (cityInput) {
        city=cityInput.value;
        console.log(city);
        getTemperature(city); 
    }
});

//user selects to see the temperature in their current position
locationButton.addEventListener('click', () => {
    getLocation().then(({ lat, lon }) => {
        getTemperatureByCoordinates(lat, lon);
    }).catch(error => {
        console.log("Can't found current position")
    });
});

function cityUpdate(newCity) {
    city=newCity;
    cityName.innerText = city; 
}

async function getHourlyForecast(lat, lon) {
    const hourlyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(hourlyWeatherUrl);
    if (!response.ok) throw new Error('Error with hourly forecast');
    const data = await response.json();
    const hours = [];
    const temperatures = [];
    

    data.list.slice(0, 24).forEach(entry => {
        const date = new Date(entry.dt * 1000); 
        hours.push(date.getHours() + ':00'); 
        temperatures.push(entry.main.temp); 
    });
    
    renderHourlyChart(hours, temperatures);
}


function renderHourlyChart(hours, temperatures) {

    let chartData={
        labels: hours,
        datasets: [
            {
                name: "Temperature",
                type:'line',
                values: temperatures
            }
        ]
    };


    let chart = new frappe.Chart('#charthours', {
        title: "Next 24h",
        data: chartData,
        type: 'line', 
        colors: ['#eb5146'],
        height: 200
    });
}

function updateAppStyle(temperature, sunrise, sunset) {
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= new Date(sunrise * 1000).getHours() && currentHour < new Date(sunset * 1000).getHours();

    // Determinar qué CSS cargar
    let stylesheet = '';

    if (isDaytime) {
        if (temperature > 30) {
            stylesheet = 'styles_hot.css';
        } else if (temperature > 10) {
            stylesheet = 'styles_day.css';
        } else {
            stylesheet = 'styles_cold.css';
        }
    } else {
        stylesheet = 'styles_cold.css';
    }

    // Cargar el CSS correspondiente
    loadStylesheet(stylesheet);
}

function loadStylesheet(filename) {
    // Remover la hoja de estilos actual
    const oldLink = document.getElementById('dynamic-stylesheet');
    if (oldLink) {
        oldLink.parentNode.removeChild(oldLink);
    }

    // Crear un nuevo elemento <link>
    const link = document.createElement('link');
    link.id = 'dynamic-stylesheet';
    link.rel = 'stylesheet';
    link.href = filename;
    document.head.appendChild(link);
}

getTemperature(city);

