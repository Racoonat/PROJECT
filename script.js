const apiKey1 = '540ba1d11ea065ab6ecf6073e792d2c9';
const apiKey2 = 'c5e6103992a74b3d83e123003242010';

const toggleSearchButton = document.getElementById('toggleSearchButton');
const unitSelect = document.getElementById('unitSelect');

const searchBar = document.getElementById('search-bar');
const citySearch = document.getElementById('citySearch'); //div
const cityInput = document.getElementById('cityInput'); //search bar
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton'); 

const temperatureOption1 = document.getElementById('temperature-option1');
const weatherOption1=document.getElementById('weather-option1');
const weatherIconOption1=document.getElementById('icon-option1');

const temperatureOption2 = document.getElementById('temperature-option2');
const weatherOption2=document.getElementById('weather-option2');
const weatherIconOption2=document.getElementById('icon-option2');

const temperatureOption3 = document.getElementById('temperature-option3');
const weatherOption3=document.getElementById('weather-option3');
const weatherIconOption3=document.getElementById('icon-option3');

let cityName= document.getElementById('cityName'); 
const favouriteIcon = document.getElementById('favouriteIcon');
const setFavouriteButton = document.getElementById('set-favourite');


let favouriteCities = [];
let unitSymbol = changeUnitSymbol(unitSelect.value);

let actualCity;

//--------------------------GET TEMPERATURE---------------------------------------------------------------

async function getWeather(city) { 
    const { lat, lon } = await getCoordinates(city);
    getWeatherByCoordinatesOption1(lat,lon);
    getWeatherByCoordinatesOption2(lat,lon);
    getWeatherByCoordinatesOption3(lat,lon);
}

async function getWeatherByCoordinates(lat,lon) { 
    getWeatherByCoordinatesOption1(lat,lon);
    getWeatherByCoordinatesOption2(lat,lon);
    getWeatherByCoordinatesOption3(lat,lon);
}

async function getWeatherByCoordinatesOption1(lat,lon) { 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const temperature = data.main.temp;
    const icon=data.weather[0].icon;
    const weatherDescription = data.weather[0].description;

    cityUpdate(data.name);
    updateAppStyle(temperature, data.sys.sunrise, data.sys.sunset);
    checkFavouriteCity();

    temperatureOption1.innerText = `${temperature} ${unitSymbol}`;
    weatherIconOption1.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">`;
    weatherOption1.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;
}

async function getWeatherByCoordinatesOption2(lat, lon) {
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey2}&q=${lat},${lon}&aqi=no`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const temperature = data.current.temp_c; // o temp_f si usas unidades imperiales
    const icon = data.current.condition.icon;
    const weatherDescription = data.current.condition.text;

    temperatureOption2.innerText = `${temperature} ${unitSymbol}`; // °C o °F dependiendo de tu símbolo
    weatherIconOption2.innerHTML = `<img src="https:${icon}" alt="weather icon">`;
    weatherOption2.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;

    getHourlyForecastOption2(lat,lon); 
    getDailyForecast(lat,lon);
}

async function getWeatherByCoordinatesOption3(lat,lon) { 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const temperature = data.main.temp;
    const icon=data.weather[0].icon;
    const weatherDescription = data.weather[0].description;

    temperatureOption3.innerText = `${temperature} ${unitSymbol}`;
    weatherIconOption3.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">`;
    weatherOption3.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;
}

async function getCityName(lat,lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const name=data.name;
    return {name};
}

//--------------------------GET LAN AND LON GIVEN A CITY NAME---------------------------------------------------------------

async function getCoordinates(city) {
    const geocodingUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey1}`;
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

/*async function getHourlyForecast(lat, lon) {
    const hourlyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
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
}*/

async function getHourlyForecastOption2(lat, lon) {
    const hourlyWeatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey2}&q=${lat},${lon}&hours=24`; 
    const response = await fetch(hourlyWeatherUrl);
    if (!response.ok) throw new Error('Error with hourly forecast');
    const data = await response.json();
    
    const hours = [];
    const temperatures = [];
    const weatherIconsByHour = {};

    // Obtenemos las 24 horas del primer día de pronóstico
    data.forecast.forecastday[0].hour.forEach(entry => {
        const date = new Date(entry.time);
        const hourString = date.getHours() + ':00';  // Formato "00:00" para cada hora
        hours.push(hourString);
        console.log(unitSelect.value);
        if(unitSelect.value==='metric'){
            temperatures.push(entry.temp_c).toFixed;
        }
        else if(unitSelect.value==='imperial'){
            temperatures.push(entry.temp_f).toFixed;
        }
        else{
            temperatures.push(entry.temp_c+273.15).toFixed;
        }
        weatherIconsByHour[hourString] = entry.condition.icon || '❓'; 
        
    });

    renderHourlyChart(hours, temperatures, weatherIconsByHour);
}



function renderHourlyChart(hours, temperatures, icons) {

    let datasets=[];
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
    renderChart('charthours',chartData,icons);
}
//--------------------------GET 7 DAYS FORECAST---------------------------------------------------------------

//--------------------------GET 5 DAYS FORECAST---------------------------------------------------------------

async function getDailyForecast(lat, lon) {
    const dailyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
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

function checkFavouriteCity() {
    if (favouriteCities.includes(actualCity)) {
        favouriteIcon.style.visibility = 'visible';
        setFavouriteButton.innerText="Remove as a favourite"; 
    } else {
        favouriteIcon.style.visibility = 'hidden'; 
        setFavouriteButton.innerText="Set as a favourite"; 
    }
    return favouriteCities.includes(actualCity);
}
//--------------------------SET A CITY AS A FAVOURITE (OR REMOVE IT)---------------------------------------------------------------

setFavouriteButton.addEventListener('click',() => {
  
    if (favouriteCities.includes(actualCity)) {
        favouriteCities = favouriteCities.filter(city => city !== actualCity);
    } else {
        favouriteCities.push(actualCity);
    }
    checkFavouriteCity(actualCity);
    saveFavourites();
});

//--------------------------SAVE THE FAVORITE LIST---------------------------------------------------------------

function saveFavourites() {
    localStorage.setItem('favourites', JSON.stringify(favouriteCities));
}


async function loadPage(){
    favouriteCities=  JSON.parse(localStorage.getItem('favourites')) || [];
    actualCity=  JSON.parse(localStorage.getItem('city')) || getCityName(getLocation()) || 'vallecas';
    //here I am using a default city to be seen when you first open the app. I choose my home City :)
    const { lat, lon } =await getCoordinates(actualCity);
    getWeather(actualCity);
    getHourlyForecastOption2(lat,lon); 
    getDailyForecast(lat,lon);
}


function renderChart(chartID, chartData, icons) {
    let chart = new frappe.Chart(`#${chartID}`, {
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
                return `<img src="https:${icons[d]}" alt="weather icon" style="width: 30px; height: 30px;">`; 
            }
        }
    });
}


loadPage();

//here I am using a default city to be seen when you first open the app. I choose my home City :)
