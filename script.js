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

console.log(city);

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

getTemperature(city);

