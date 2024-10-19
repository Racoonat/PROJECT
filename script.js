const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';

const toggleSearchButton = document.getElementById('toggleSearchButton');
const unitSelect = document.getElementById('unitSelect');

const searchBar = document.getElementById('search-bar');
const citySearch = document.getElementById('citySearch'); //div
const cityInput = document.getElementById('cityInput'); //search bar
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton'); 

const temperatureDiv = document.getElementById('temperature');
const weather=document.getElementById('weather');
const weatherIcon=document.getElementById('icon');

let cityName= document.getElementById('cityName'); 
const favouriteIcon = document.getElementById('favouriteIcon');
const setFavouriteButton = document.getElementById('set-favourite');


let favouriteCities = [];
let unitSymbol = changeUnitSymbol(unitSelect.value);

//--------------------------GET TEMPERATURE---------------------------------------------------------------

async function getWeather(city) { 
    const { lat, lon } = await getCoordinates(city);
    getWeatherByCoordinates(lat,lon);
}

async function getWeatherByCoordinates(lat,lon) { 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);


    const data = await response.json();
    const temperature = data.main.temp;
    const icon=data.weather[0].icon;
    const weatherDescription = data.weather[0].description;

    cityUpdate(data.name);
    getHourlyForecast(lat,lon);
    getDailyForecast(lat,lon);
    updateAppStyle(temperature, data.sys.sunrise, data.sys.sunset);
    checkFavouriteCity(data.name);


    temperatureDiv.innerText = `${temperature} ${unitSymbol}`;
    weatherIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" style="width: 50px; height: 50px;">`;
    weather.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;
}

//--------------------------GET LAN AND LON GIVEN A CITY NAME---------------------------------------------------------------

async function getCoordinates(city) {
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(geocodingUrl);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    return { lat: data.coord.lat, lon: data.coord.lon };
}
//--------------------------CHANGE LOCATION TO CURRENT LOCATION---------------------------------------------------------------

function getLocation() {
    return new Promise(resolve => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                resolve({ lat, lon });
            });
        }
    });
}

//--------------------------EVENT LISTENERS---------------------------------------------------------------

//--------------------------CHANGE UNIT SYMBOLS---------------------------------------------------------------

unitSelect.addEventListener('change', () => {
    unitSymbol=changeUnitSymbol(unitSelect.value);
    getWeather(actualCity);
});


function changeUnitSymbol(unit) {
    let symbols = {
        metric: '°C',
        imperial: '°F',
        standard: 'K'
    };
    return symbols[unit];
}

//--------------------------SEARCH NEW CITY---------------------------------------------------------------

citySearch.addEventListener('submit', (event) => {
    event.preventDefault();
    if (cityInput.value.trim()) {
        getWeather(cityInput.value.trim()); 
    }
});

//--------------------------SET CITY AS ACTUAL LOCATION---------------------------------------------------------------

locationButton.addEventListener('click', () => {
    getLocation().then(({ lat, lon }) => {
        getWeatherByCoordinates(lat, lon);
    })
});

//--------------------------UPDATE THE CITY---------------------------------------------------------------

function cityUpdate(newCity) {
    actualCity=newCity;
    cityName.innerText = newCity; 
    checkFavouriteCity(newCity);
}

//--------------------------GET 24 HOUR FORECAST---------------------------------------------------------------

async function getHourlyForecast(lat, lon) {
    const hourlyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(hourlyWeatherUrl);
    if (!response.ok) throw new Error('Error with hourly forecast');
    const data = await response.json();
    
    const hours = [];
    const temperatures = [];
    const weatherIconsByHour = {};

    data.list.slice(0, 8).forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const hourString = date.getHours() + ':00'; 
        hours.push(hourString); 
        temperatures.push(entry.main.temp); 
        weatherIconsByHour[hourString] = entry.weather[0].icon || '❓';
    });

    renderHourlyChart(hours, temperatures, weatherIconsByHour); 
}


function renderHourlyChart(hours, temperatures, icons) {
    let chartData = {
        labels: hours,
        datasets: [
            {
                name: "Temperature",
                type: 'line',
                values: temperatures
            }
        ]
    };

    let chart = new frappe.Chart('#charthours', {
        title: "Next 24h",
        data: chartData,
        type: 'line', 
        colors: ['#eb5146'],
        height: 200,
        tooltipOptions: {
            formatTooltipY: (d) => { 
                return `${d} ${unitSymbol}`; 
            },
            formatTooltipX: (d) => { 
                return `<img src="http://openweathermap.org/img/wn/${icons[d]}@2x.png" alt="weather icon" style="width: 20px; height: 20px;">`; 
            }
        }
    });
}
//--------------------------GET 7 DAYS FORECAST---------------------------------------------------------------

//--------------------------GET 5 DAYS FORECAST---------------------------------------------------------------

async function getDailyForecast(lat, lon) {
    const dailyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(dailyWeatherUrl);
    if (!response.ok) throw new Error('Error with daily forecast');
    const data = await response.json();
    const dailyTemperatures = {};
    const weatherIcons = {}; 

    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const dateString = date.toLocaleDateString('en-GB');

        if (!dailyTemperatures[dateString]) {
            dailyTemperatures[dateString] = [];
            weatherIcons[dateString] = entry.weather[0].icon; 
        }
        
        dailyTemperatures[dateString].push(entry.main.temp);
    });

    const days = [];
    const temperatures = [];
    const iconsByDate = {}; 
    const dateKeys = Object.keys(dailyTemperatures).slice(1, 6); 

    dateKeys.forEach(dateKey => {
        const avgTemp = dailyTemperatures[dateKey].reduce((sum, temp) => sum + temp, 0) / dailyTemperatures[dateKey].length;
        days.push(dateKey); 
        temperatures.push(avgTemp.toFixed(2));

        iconsByDate[dateKey] = weatherIcons[dateKey];
    });

    renderDailyChart(days, temperatures, iconsByDate); 
}

function renderDailyChart(days, temperatures, icons) {
    let chartData = {
        labels: days,
        datasets: [
            {
                name: "Temperature",
                type: 'line',
                values: temperatures
            }
        ]
    };

    let chart = new frappe.Chart('#chartdays', {
        title: "Next 5 Days",
        data: chartData,
        type: 'line', 
        colors: ['#eb5146'],
        height: 200,
        tooltipOptions: {
            formatTooltipY: (d) => { 
                return `${d} ${unitSymbol}`; 
            },
            formatTooltipX: (d) => { 
                return `<img src="http://openweathermap.org/img/wn/${icons[d]}@2x.png" alt="weather icon" style="width: 20px; height: 20px;">`; 
            }
        }
    });
}

//--------------------------CHANGE STYLESHEET---------------------------------------------------------------

function updateAppStyle(temperature, sunrise, sunset) {
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= new Date(sunrise * 1000).getHours() && currentHour < new Date(sunset * 1000).getHours();
    let stylesheet = '';

    if (isDaytime) {
        if (temperature > 30) {
            stylesheet = 'styles_cold.css';
        } else if (temperature > 10) {
            stylesheet = 'styles_cold.css';
        } else {
            stylesheet = 'styles_cold.css';
        }
    } else {
        stylesheet = 'styles_cold.css';
    }

    loadStylesheet(stylesheet);
}

function loadStylesheet(filename) {
    const oldLink = document.getElementById('dynamic-stylesheet');
    if (oldLink) {
        oldLink.parentNode.removeChild(oldLink);
    }

    const link = document.createElement('link');
    link.id = 'dynamic-stylesheet';
    link.rel = 'stylesheet';
    link.href = filename;
    document.head.appendChild(link);
}

//--------------------------HIDE SEARCH BAR---------------------------------------------------------------

toggleSearchButton.addEventListener('click', () => { 
    if (searchBar.style.display === 'none') {
        searchBar.style.display = '';
    } else {
        searchBar.style.display = 'none';
    }
});

//--------------------------CHECK IF THE CITY IS A FAVOURITE ONE---------------------------------------------------------------

function checkFavouriteCity(city) {
    if (favouriteCities.includes(city)) {
        favouriteIcon.style.visibility = 'visible';
        setFavouriteButton.innerText="Remove as a favourite"; 
    } else {
        favouriteIcon.style.visibility = 'hidden'; 
        setFavouriteButton.innerText="Set as a favourite"; 
    }
}
//--------------------------SET A CITY AS A FAVOURITE (OR REMOVE IT)---------------------------------------------------------------

setFavouriteButton.addEventListener('click',() => {
  
    if (favouriteCities.includes(actualCity)) {
        favouriteCities = favouriteCities.filter(city => city !== actualCity);
    } else {
        favouriteCities.push(actualCity);
    }
    checkFavouriteCity(actualCity);
});

let actualCity = 'vallecas';
getWeather(actualCity);
//here I am using a default city to be seen when you first open the app. I choose my home City :)
