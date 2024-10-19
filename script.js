const apiKey = '540ba1d11ea065ab6ecf6073e792d2c9';
const temperatureDiv = document.getElementById('temperature');
const searchButton = document.getElementById('searchButton');
const unitSelect = document.getElementById('unitSelect');
const cityInput = document.getElementById('cityInput');
const locationButton = document.getElementById('locationButton'); 
const citySearch = document.getElementById('citySearch'); 
const weather=document.getElementById('weather');
const weatherIcon=document.getElementById('icon');
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
    const icon=data.weather[0].icon;
    const weatherDescription = data.weather[0].description;
    cityUpdate(data.name);
    getHourlyForecast(lat,lon);
    getDailyForecast(lat,lon);
    updateAppStyle(temperature, data.sys.sunrise, data.sys.sunset);


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
    const weatherIconsByHour = {}; // Objeto para asociar iconos a horas

    // Solo toma las próximas 24 horas
    data.list.slice(0, 24).forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const hourString = date.getHours() + ':00'; // Convierte la hora a un formato legible
        hours.push(hourString); 

        if (entry.main.temp == 0) {
            temperatures.push(0.01);
        } else {
            temperatures.push(entry.main.temp); 
        }

        // Asocia el icono con la hora correspondiente
        weatherIconsByHour[hourString] = entry.weather[0].icon || '❓';
    });

    console.log(weatherIconsByHour); // Verifica que el objeto tiene las horas como claves y los iconos como valores

    renderHourlyChart(hours, temperatures, weatherIconsByHour); // Pasa los iconos como un objeto
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
            weatherIcons[dateString] = entry.weather[0].icon; // Guarda el icono con la fecha como clave
        }
        
        dailyTemperatures[dateString].push(entry.main.temp);
    });

    const days = [];
    const temperatures = [];
    const iconsByDate = {};  // Objeto para almacenar iconos asociados a fechas

    const dateKeys = Object.keys(dailyTemperatures).slice(0, 7); // Obtiene las claves para los próximos 7 días

    dateKeys.forEach(dateKey => {
        const avgTemp = dailyTemperatures[dateKey].reduce((sum, temp) => sum + temp, 0) / dailyTemperatures[dateKey].length;
        days.push(dateKey); 
        if(avgTemp.toFixed(2) == 0) {
            temperatures.push(0.01);
        } else {
            temperatures.push(avgTemp.toFixed(2));
        }
        
        iconsByDate[dateKey] = weatherIcons[dateKey]; // Asigna el icono a la fecha correspondiente
    });

    console.log(iconsByDate); // Verifica que el objeto tiene las fechas como claves y los iconos como valores

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
        title: "Next 7 Days",
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

//-----------------------------------------------------------------------------------------



const toggleSearchButton = document.getElementById('toggleSearchButton');
const searchBar = document.getElementById('search-bar');

toggleSearchButton.addEventListener('click', () => {
    if (searchBar.style.display === 'none') {
        searchBar.style.display = '';
    } else {
        searchBar.style.display = 'none';
    }
});


getTemperature(city);

