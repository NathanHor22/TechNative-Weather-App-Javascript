// app.js
// Main JavaScript for World Capitals Weather App

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const weatherDisplay = document.getElementById('weather-display');
const weatherIcon = document.getElementById('weather-icon');
const weatherInfo = document.getElementById('weather-info');

// Weather icon mapping
const weatherIcons = {
    sunny: 'assets/sun.png',
    cloudy: 'assets/clouds.png',
    rain: 'assets/rain.png'
};

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

// Show weather data
function showWeather(data, city) {
    // Determine icon based on weather code
    let icon = weatherIcons.sunny;
    let description = 'Sunny';
    if (data.weathercode === 3 || data.weathercode === 2) {
        icon = weatherIcons.cloudy;
        description = 'Cloudy';
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(data.weathercode)) {
        icon = weatherIcons.rain;
        description = 'Rainy';
    }
    weatherIcon.src = icon;
    weatherIcon.alt = description;
    // Use 'temperature' property from Open-Meteo current_weather
    weatherInfo.innerHTML = `
        <strong>${city}</strong><br>
        Temperature: ${data.temperature}°C<br>
        Weather: ${description}
    `;
    weatherDisplay.classList.remove('hidden');
}

// Fetch coordinates for city using Open-Meteo Geocoding API
async function fetchCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch coordinates');
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error('City not found');
    return data.results[0];
}

// Fetch weather data for coordinates using Open-Meteo Weather API
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    const data = await res.json();
    if (!data.current_weather) throw new Error('No weather data available');
    return data.current_weather;
}

// Main search handler
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city or country.');
        return;
    }
    showLoading();
    try {
        const coords = await fetchCoordinates(city);
        const weather = await fetchWeather(coords.latitude, coords.longitude);
        hideLoading();
        showWeather(weather, coords.name + (coords.country ? ', ' + coords.country : ''));
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

// Event listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSearch();
});

// Optionally, show weather for a default city on load
window.addEventListener('DOMContentLoaded', () => {
    searchInput.value = 'London';
    handleSearch();
});

// End of app.js
