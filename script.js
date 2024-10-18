const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const temperatureDiv = document.getElementById('temperature');
const searchButton = document.getElementById('searchButton');
const unitSelect = document.getElementById('unitSelect');
const cityInput = document.getElementById('cityInput');
const locationButton = document.getElementById('locationButton'); 
const citySearch = document.getElementById('citySearch'); 
const weather=document.getElementById('weather');
let cityName= document.getElementById('cityName'); 



let city= 'vallecas';
//here I am using a default city to be seen when you first open the app. I choose my home City :)

let unitSymbol = changeUnitSymbol(unitSelect.value);

//--------------------------GET TEMPERATURE---------------------------------------------------------------

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
    const weatherDescription = data.weather[0].description;
    cityUpdate(data.name);
    getHourlyForecast(lat,lon);
    getDailyForecast(lat,lon);
    updateAppStyle(temperature, data.sys.sunrise, data.sys.sunset);

    temperatureDiv.innerText = `${temperature} ${unitSymbol}`;
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

//--------------------------EVENT LISTENERS---------------------------------------------------------------

unitSelect.addEventListener('change', () => {
    unitSymbol=changeUnitSymbol(unitSelect.value);
    getTemperature(city);
});


function changeUnitSymbol(unit) {
    let symbols = {
        metric: '°C',
        imperial: '°F',
        standard: 'K'
    };
    return symbols[unit];
}


citySearch.addEventListener('submit', (event) => {
    event.preventDefault();
    if (cityInput) {
        city=cityInput.value;
        console.log(city);
        getTemperature(city); 
    }
});


locationButton.addEventListener('click', () => {
    getLocation().then(({ lat, lon }) => {
        getTemperatureByCoordinates(lat, lon);
    }).catch(error => {
        console.log("Can't found current position")
    });
});

//--------------------------UPDATE THE CITY---------------------------------------------------------------

function cityUpdate(newCity) {
    city=newCity;
    cityName.innerText = city; 
}

//--------------------------GET 24 HOUR FORECAST---------------------------------------------------------------

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

async function getDailyForecast(lat, lon) {
    const dailyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitSelect.value}`;
    const response = await fetch(dailyWeatherUrl);
    if (!response.ok) throw new Error('Error with daily forecast');
    const data = await response.json();
    const dailyTemperatures = {}; 

    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const day = date.getDay(); 
        if (!dailyTemperatures[day]) {
            dailyTemperatures[day] = [];
        }
        dailyTemperatures[day].push(entry.main.temp);
    });

    const days = [];
    const temperatures = [];

    Object.keys(dailyTemperatures).slice(0, 7).forEach(day => {
        const avgTemp = dailyTemperatures[day].reduce((sum, temp) => sum + temp, 0) / dailyTemperatures[day].length;
        days.push(getDayName(parseInt(day))); 
        temperatures.push(avgTemp.toFixed(2)); 
    });

    renderDailyChart(days, temperatures);
}


function getDayName(dayNumber) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[dayNumber];
}

function renderDailyChart(days, temperatures) {

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
        title: "Next 7 Days",
        data: chartData,
        type: 'line', 
        colors: ['#eb5146'],
        height: 200
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

//-----------------------------------------------------------------------------------------

getTemperature(city);

