/**
 * Live Info Widget - Real-time Stone Town info and currency
 * Shows: Local time, temperature, and USD to TZS exchange rate
 */

// API Configuration
const STONE_TOWN_COORDS = { lat: -6.1630, lon: 39.1919 };

// State
let weatherData = null;
let exchangeRate = null;
let timeInterval = null;

/**
 * Fetch Stone Town weather from Open-Meteo (free, no API key required)
 * Using Open-Meteo API - https://open-meteo.com/
 */
async function fetchWeather() {
  try {
    // Free weather API from Open-Meteo (no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${STONE_TOWN_COORDS.lat}&longitude=${STONE_TOWN_COORDS.lon}&current=temperature_2m,weather_code&timezone=Africa/Dar_es_Salaam`;

    console.log('[Live Info Widget] Fetching weather from:', url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Live Info Widget] Weather data received:', data.current);

    return {
      temp: Math.round(data.current.temperature_2m),
      description: getWeatherDescription(data.current.weather_code),
      icon: getWeatherIcon(data.current.weather_code)
    };
  } catch (error) {
    console.error('[Live Info Widget] Error fetching weather:', error);
    console.log('[Live Info Widget] Using fallback weather data');
    // Fallback to typical Zanzibar weather
    return {
      temp: 28,
      description: 'Tropical',
      icon: '☀️'
    };
  }
}

/**
 * Convert WMO weather code to description
 */
function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Rain Showers',
    81: 'Rain Showers',
    82: 'Heavy Rain Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Heavy Thunderstorm'
  };
  return descriptions[code] || 'Tropical';
}

/**
 * Get weather icon for code
 */
function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code >= 51 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 86) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

/**
 * Fetch USD to TZS exchange rate from reliable source
 * Using exchangerate-api.com (free tier, no key required for USD base)
 */
async function fetchExchangeRate() {
  try {
    // Free API from exchangerate-api.com
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';

    console.log('[Live Info Widget] Fetching exchange rate from:', url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`);
    }

    const data = await response.json();

    // TZS rate from USD
    const rate = data.rates.TZS;
    console.log('[Live Info Widget] Exchange rate received: USD 1 =', rate, 'TZS');

    return {
      rate: rate,
      timestamp: data.time_last_updated,
      source: 'exchangerate-api.com'
    };
  } catch (error) {
    console.error('[Live Info Widget] Error fetching exchange rate:', error);

    // Try alternative API: frankfurter.app (European Central Bank data)
    try {
      console.log('[Live Info Widget] Trying fallback exchange rate API...');
      const fallbackUrl = 'https://api.frankfurter.app/latest?from=USD&to=TZS';
      const response = await fetch(fallbackUrl);

      if (response.ok) {
        const data = await response.json();
        console.log('[Live Info Widget] Fallback rate received:', data.rates.TZS);
        return {
          rate: data.rates.TZS,
          timestamp: data.date,
          source: 'frankfurter.app'
        };
      }
    } catch (fallbackError) {
      console.error('[Live Info Widget] Fallback exchange rate API also failed:', fallbackError);
    }

    // Ultimate fallback (approximate current rate)
    console.log('[Live Info Widget] Using hardcoded fallback rate');
    return {
      rate: 2500,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }
}

/**
 * Get Stone Town local time (East Africa Time - EAT, UTC+3)
 */
function getStoneTownTime() {
  const now = new Date();

  // Convert to East Africa Time (UTC+3)
  const eatTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'Africa/Dar_es_Salaam'
  }));

  const hours = eatTime.getHours().toString().padStart(2, '0');
  const minutes = eatTime.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Update the live info widget display
 */
function updateDisplay() {
  // Update time
  const timeEl = document.getElementById('stoneTownTime');
  if (timeEl) {
    timeEl.textContent = getStoneTownTime();
  } else {
    console.warn('Live Info Widget: stoneTownTime element not found');
  }

  // Update temperature
  const tempEl = document.getElementById('stoneTownTemp');
  if (tempEl && weatherData) {
    tempEl.textContent = `${weatherData.temp}°C`;
  } else if (!tempEl) {
    console.warn('Live Info Widget: stoneTownTemp element not found');
  }

  // Update exchange rate
  const rateEl = document.getElementById('usdTzsRate');
  if (rateEl && exchangeRate) {
    rateEl.textContent = `${exchangeRate.rate.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  } else if (!rateEl) {
    console.warn('Live Info Widget: usdTzsRate element not found');
  }
}

/**
 * Initialize the live info widget
 */
export async function initLiveInfoWidget() {
  console.log('[Live Info Widget] Starting initialization...');

  // Check if elements exist
  const timeEl = document.getElementById('stoneTownTime');
  const tempEl = document.getElementById('stoneTownTemp');
  const rateEl = document.getElementById('usdTzsRate');

  if (!timeEl || !tempEl || !rateEl) {
    console.error('[Live Info Widget] Required DOM elements not found:', {
      timeEl: !!timeEl,
      tempEl: !!tempEl,
      rateEl: !!rateEl
    });
    console.log('[Live Info Widget] Make sure you are viewing on a screen wider than 1024px');
    return;
  }

  console.log('[Live Info Widget] DOM elements found, fetching data...');

  // Initial data fetch
  try {
    // Fetch weather and exchange rate in parallel
    const [weather, rate] = await Promise.all([
      fetchWeather(),
      fetchExchangeRate()
    ]);

    weatherData = weather;
    exchangeRate = rate;

    console.log('[Live Info Widget] Data loaded successfully:', { weather, rate });
  } catch (error) {
    console.error('[Live Info Widget] Error loading data:', error);
  }

  // Initial display update
  updateDisplay();
  console.log('[Live Info Widget] Initialization complete!');

  // Update time every minute
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = setInterval(() => {
    updateDisplay();
  }, 60000); // Every 60 seconds

  // Refresh weather every 10 minutes
  setInterval(async () => {
    weatherData = await fetchWeather();
    updateDisplay();
  }, 600000); // Every 10 minutes

  // Refresh exchange rate every 30 minutes
  setInterval(async () => {
    exchangeRate = await fetchExchangeRate();
    updateDisplay();
  }, 1800000); // Every 30 minutes
}

/**
 * Cleanup
 */
export function cleanupLiveInfoWidget() {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
}
