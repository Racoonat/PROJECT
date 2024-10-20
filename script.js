const apiKey1 = '540ba1d11ea065ab6ecf6073e792d2c9';
const apiKey2 = 'c5e6103992a74b3d83e123003242010';
const apiKey3 = '66cc7527310a45bf919b5d464efcd69c';

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
    getWeatherByCoordinates(lat,lon);
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

    temperatureOption1.innerText = `${temperature.toFixed(2)} ${unitSymbol}`;
    weatherIconOption1.innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">`;
    weatherOption1.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;
}

async function getWeatherByCoordinatesOption2(lat, lon) {
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey2}&q=${lat},${lon}&aqi=no`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    let temperature;
    if(unitSelect.value==="metric"){
        temperature = data.current.temp_c;
    }else if(unitSelect.value==="imperial"){
        temperature = data.current.temp_f;
    }else{
        temperature = data.current.temp_c+273.15;
    }
    
    const icon = data.current.condition.icon;
    const weatherDescription = data.current.condition.text;

    temperatureOption2.innerText = `${temperature.toFixed(2)} ${unitSymbol}`; 
    weatherIconOption2.innerHTML = `<img src="https:${icon}" alt="weather icon"  style="width: 100px; height: 100px;">`;
    weatherOption2.innerText = `${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;

}

async function getWeatherByCoordinatesOption3(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    
    let temperature; 
    if (unitSelect.value === 'imperial') {
        temperature = (data.current_weather.temperature * 9/5) + 32; 
    } else if (unitSelect.value === 'standard') {
        temperature = data.current_weather.temperature + 273.15; 
    } else {
        temperature = data.current_weather.temperature;
    }

    const icon = getWeatherIcon(data.current_weather.weathercode); 
    const weatherDescription = getWeatherDescription(data.current_weather.weathercode); 

    temperatureOption3.innerText = `${temperature.toFixed(2)} ${unitSymbol}`;
    weatherIconOption3.innerHTML = `<img src="${icon}" alt="weather icon" style="width: 100px; height: 100px;">`;
    weatherOption3.innerText = weatherDescription;
}

function getWeatherIcon(weatherCode) {
    const iconMap = {
        0: 'https://www.weatherbit.io/static/img/icons/c01d.png', 
        1: 'https://www.weatherbit.io/static/img/icons/c02d.png', 
        2: 'https://www.weatherbit.io/static/img/icons/c03d.png', 
        3: 'https://www.weatherbit.io/static/img/icons/r01d.png', 
        4: 'https://www.weatherbit.io/static/img/icons/r02d.png', 
        5: 'https://www.weatherbit.io/static/img/icons/s01d.png', 

    };
    return iconMap[weatherCode] || 'https://www.weatherbit.io/static/img/icons/c01d.png'; 
}

function getWeatherDescription(weatherCode) {
    const descriptionMap = {
        0: 'Clear',
        1: 'Partly Cloudy',
        2: 'Cloudy',
        3: 'Light Rain',
        4: 'Rain',
        5: 'Light Snow',
    };
    return descriptionMap[weatherCode] || 'Unknown';
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
    loadPage();
    
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
    loadPage();
});

//--------------------------SET CITY AS ACTUAL LOCATION---------------------------------------------------------------

locationButton.addEventListener('click', () => {
    getLocation().then(({ lat, lon }) => {
        getWeatherByCoordinates(lat, lon);
    })
    loadPage();
});

//--------------------------UPDATE THE CITY---------------------------------------------------------------

function cityUpdate(newCity) {
    actualCity=newCity;
    cityName.innerText = newCity; 
    checkFavouriteCity(newCity);
}

//--------------------------GET 24 HOUR FORECAST---------------------------------------------------------------

async function getHourlyForecastOption1(lat, lon) {
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
        temperatures.push(entry.main.temp);
        temperatures.push(entry.main.temp);
        weatherIconsByHour[hourString] = entry.weather[0].icon || '❓';
    });

    return temperatures;
}

async function getHourlyForecastOption2(lat, lon) {
    const hourlyWeatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey2}&q=${lat},${lon}&hours=24&days=2`; 
    const response = await fetch(hourlyWeatherUrl);
    if (!response.ok) throw new Error('Error with hourly forecast');
    const data = await response.json();

    const hours = [];
    const temperatures = [];
    const weatherIconsByHour = {};
    const currentTime = new Date(); 
    const forecastDays = data.forecast.forecastday;
    for (const day of forecastDays) {
        for (const entry of day.hour) {
            const date = new Date(entry.time);
            if (date >= currentTime && hours.length < 24) {
                const hourString = date.getHours() + ':00'; 
                hours.push(hourString);
                if (unitSelect.value === 'metric') {
                    temperatures.push(entry.temp_c.toFixed(2)); 
                } else if (unitSelect.value === 'imperial') {
                    temperatures.push(entry.temp_f.toFixed(2));
                } else {
                    temperatures.push((entry.temp_c + 273.15).toFixed(2));
                }
                weatherIconsByHour[hourString] = entry.condition.icon || '❓'; 
            }
            if (hours.length >= 24) {
                break;
            }
        }

        if (hours.length >= 24) {
            break;
        }
    }

    return { temperatures2: temperatures, icons: weatherIconsByHour, hours };
}

async function getHourlyForecastOption3(lat, lon) {
    const hourlyWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`;
    const response = await fetch(hourlyWeatherUrl);
    const data = await response.json();

    const temperatures = [];
    const hourlyTemperatures = data.hourly.temperature_2m.slice(0, 24);
    hourlyTemperatures.forEach(temp => {
        let temperature;
        if(unitSelect.value==="imperial"){
            temperature=(temp * 9/5) + 32;
        }else if(unitSelect.value==="standard"){
            temperature =Number(temp)+(273.15);
        }else{
            temperature =temp;
        }   
        temperatures.push(temperature.toFixed(2));
    });
    return temperatures;
}

async function getHourlyChart(lat,lon) {
    let temperatures1=await getHourlyForecastOption1(lat,lon);
    let {temperatures2,icons,hours}=await getHourlyForecastOption2(lat,lon);
    let temperatures3=await getHourlyForecastOption3(lat,lon);
    let chartData = {
        labels: hours,
        datasets:[
            {
                name: "OpenWeather",
                type: 'line',
                values: temperatures1
            },
            {
                name: "WeatherApi",
                type: 'line',
                values: temperatures2
            },
            {
                name: "Open Meteo",
                type: 'line',
                values: temperatures3
            }
        ]
    };
    renderChart("Next 24 hours",'charthours',chartData,icons);
}
//--------------------------GET 7 DAYS FORECAST---------------------------------------------------------------

async function getDailyForecastOption1(lat, lon) {
    const dailyWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey1}&units=${unitSelect.value}`;
    const response = await fetch(dailyWeatherUrl);
    if (!response.ok) throw new Error('Error with daily forecast');
    const data = await response.json();

    const dailyTemperatures = [];

    // Agrupamos temperaturas por día
    const dailyData = {};
    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000).toISOString().split('T')[0]; // Obtenemos solo la fecha
        if (!dailyData[date]) {
            dailyData[date] = { sum: 0, count: 0 };
        }
        dailyData[date].sum += entry.main.temp;
        dailyData[date].count += 1;
    });

    // Calculamos la temperatura media para cada día
    for (const date in dailyData) {
        const averageTemp = (dailyData[date].sum / dailyData[date].count).toFixed(2);
        dailyTemperatures.push( averageTemp);
    }

    return dailyTemperatures; // Retornamos las temperaturas medias
}

async function getDailyForecastOption2(lat, lon) {
    const dailyWeatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey2}&q=${lat},${lon}&days=7`; 
    const response = await fetch(dailyWeatherUrl);
    const data = await response.json();

    const dailyTemperatures = [];
    const weatherIcons= [];
    const days=[];
    const forecastDays = data.forecast.forecastday;

    forecastDays.forEach(day => {
        let averageTemp= (day.day.avgtemp_c+273.15).toFixed(2);
        if(unitSelect.value==="metric"){
            averageTemp = day.day.avgtemp_c.toFixed(2);
        }else if(unitSelect.value==="imperial"){
            averageTemp = day.day.avgtemp_f;
        }
        let temperature = averageTemp;
        dailyTemperatures.push(temperature);
        weatherIcons.push(day.day.condition.icon);
        days.push(day.date);
    });

    return {dailyTemperatures2:dailyTemperatures,weatherIcons,days};
}

async function getDailyForecastOption3(lat, lon) {
    const dailyWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(dailyWeatherUrl);
    const data = await response.json();

    const dailyTemperatures = [];
    const dailyData = data.daily;

    dailyData.temperature_2m_max.forEach((maxTemp, index) => {
        const minTemp = dailyData.temperature_2m_min[index];
        let averageTemp = ((maxTemp + minTemp) / 2).toFixed(2);
        if(unitSelect.value==="imperial"){
            dailyTemperatures.push((averageTemp * 9/5) + 32);
        }else if(unitSelect.value==="metric"){
            dailyTemperatures.push(averageTemp);
        }else{
            let check =Number(averageTemp)+(273.15);
            dailyTemperatures.push(check);
        }   
    });
    return dailyTemperatures;
}

async function getDailyChart(lat, lon) {
    const dailyTemperatures1 = await getDailyForecastOption1(lat, lon);
    const {dailyTemperatures2,weatherIcons,days} = await getDailyForecastOption2(lat, lon);
    const dailyTemperatures3 = await getDailyForecastOption3(lat, lon);
    let chartData={
        labels:days,
        datasets:[
            {
                name: "OpenWeather",
                type: 'line',
                values: dailyTemperatures1
            },
            {
                name: "WeatherApi",
                type: 'line',
                values: dailyTemperatures2
            },
            {
                name: "Open Meteo",
                type: 'line',
                values: dailyTemperatures3
            }
        ]
    }

    renderChart("Average temperature next 7 days",'chartdays', chartData,weatherIcons);
}
//--------------------------RENDER CHART---------------------------------------------------------------

function renderChart(name,chartID, chartData, icons) {
    let chart = new frappe.Chart(`#${chartID}`, {
        title: name,
        data: chartData,
        type: 'axis-mixed', 
        colors: ['#FF0000', '#00FF00', '#0000FF'],
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
    loadPage();
});

//--------------------------SAVE THE FAVORITE LIST---------------------------------------------------------------

function saveFavourites() {
    localStorage.setItem('favourites', JSON.stringify(favouriteCities));
}

//--------------------------LOAD CHART---------------------------------------------------------------

async function loadPage(){
    const { lat, lon } =await getCoordinates(actualCity);
    getWeather(actualCity);
    checkFavouriteCity();
    getHourlyChart(lat,lon);
    getDailyChart(lat,lon); 
}

//--------------------------INITIALIZE CHART---------------------------------------------------------------
async function initialize(){
    favouriteCities=  JSON.parse(localStorage.getItem('favourites')) || [];
    actualCity=  JSON.parse(localStorage.getItem('city')) || getCityName(getLocation()) || 'vallecas';
    //here I am using a default city to be seen when you first open the app. I choose my home City :)
    const { lat, lon } =await getCoordinates(actualCity);
    getWeather(actualCity);
    getHourlyChart(lat,lon);
    getDailyChart(lat,lon); 
}


initialize();


