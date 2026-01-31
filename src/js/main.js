import {
  updateHeaderDateTime,
  fillCitiesSelect,
  fillCountriesSelect,
} from "../js/state/appstate.js";
import {
  getCountries,
  getCountrybyCode,
  getGetPublicHolidaysbyYear,
  SearchEventsbyCity,
  Getweekendlogday,
  GetWeatherForecast,
  Getexchangecurrent,
  sunsetapi,
} from "../js/api/appdb.js";

setInterval(updateHeaderDateTime, 60000);
updateHeaderDateTime();

const APP_NAME = "Wanderlust - Your Global Travel Planner (Starter)";
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    views.forEach((view) => view.classList.remove("active"));

    const viewName = item.dataset.view; // ✅ هنا اتعرّف
    const targetView = viewName + "-view";
    const viewElement = document.getElementById(targetView);

    if (viewElement) {
      viewElement.classList.add("active");
      if (viewName === "dashboard") {
        document.title = APP_NAME;
      } else {
        document.title = `${APP_NAME} | ${viewName}`;
      }
      if (viewName === "holidays") {
        if (!holidaysLoaded && countrySelect.value && yearselect.value) {
          showHolidaysInfo();
          holidaysLoaded = true;
        }
      }
      if (viewName === "events") {
        if (!eventsLoaded && countrySelect.value && citySelect.value) {
          showEventbycity();
          eventsLoaded = true;
        }
      }
      if (viewName === "weather") {
        if (!weatherloaded && countrySelect.value && citySelect.value) {
          showWeather();
          weatherloaded = true;
        }
      }
      if (viewName === "long-weekends") {
        if (!longweekendloaded && countrySelect.value && citySelect.value) {
          getlongweekends();
          longweekendloaded = true;
        }
      }
      if (viewName === "sun-times") {
        if (!sunloaded && countrySelect.value && citySelect.value) {
          updateSunCard();
          sunloaded = true;
        }
      }
    }
  });
});

function getLocalTimeFromUTCOffset(offset) {
  const now = new Date();
  const sign = offset.includes("-") ? -1 : 1;
  const [hours, minutes] = offset.replace("UTC", "").split(":");
  const offsetMs =
    sign * ((parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000);
  const localTime = new Date(now.getTime() + offsetMs);
  return localTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
let clockInterval = null;
function startCountryClock(utcOffset) {
  if (clockInterval) {
    clearInterval(clockInterval);
  }
  let currentTime = getLocalTimeFromUTCOffset(utcOffset);
  clockInterval = setInterval(() => {
    currentTime = getLocalTimeFromUTCOffset(utcOffset);
  }, 1000);

  return currentTime;
}

let selectedCountryCode = null;
let selectedCity = null;
const countrySelect = document.getElementById("global-country");
const citySelect = document.getElementById("global-city");
const yearselect = document.getElementById("global-year");
let buttonexplore = document.getElementById("global-search-btn");
let amount = document.getElementById("currency-amount");
let from = document.getElementById("currency-from");
let to = document.getElementById("currency-to");
let btnconvert = document.getElementById("convert-btn");
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
let holidaysLoaded = false;
let eventsLoaded = false;
let weatherloaded = false;
let longweekendloaded = false;
let sunloaded = false;
const weatherCodes = {
  0: { text: "Clear sky", icon: "fa-sun" },
  1: { text: "Mainly clear", icon: "fa-cloud-sun" },
  2: { text: "Partly cloudy", icon: "fa-cloud-sun" },
  3: { text: "Overcast", icon: "fa-cloud" },
  45: { text: "Fog", icon: "fa-smog" },
  48: { text: "Depositing rime fog", icon: "fa-smog" },
  51: { text: "Light drizzle", icon: "fa-cloud-rain" },
  53: { text: "Moderate drizzle", icon: "fa-cloud-rain" },
  55: { text: "Dense drizzle", icon: "fa-cloud-rain" },
  61: { text: "Slight rain", icon: "fa-cloud-showers-heavy" },
  63: { text: "Moderate rain", icon: "fa-cloud-showers-heavy" },
  65: { text: "Heavy rain", icon: "fa-cloud-showers-heavy" },
  71: { text: "Slight snow", icon: "fa-snowflake" },
  73: { text: "Moderate snow", icon: "fa-snowflake" },
  75: { text: "Heavy snow", icon: "fa-snowflake" },
  80: { text: "Slight rain showers", icon: "fa-cloud-showers-heavy" },
  81: { text: "Moderate rain showers", icon: "fa-cloud-showers-heavy" },
  82: { text: "Violent rain showers", icon: "fa-cloud-showers-heavy" },
  95: { text: "Thunderstorm", icon: "fa-bolt" },
  96: { text: "Thunderstorm with hail", icon: "fa-bolt" },
  99: { text: "Severe thunderstorm", icon: "fa-bolt" },
};

window.addEventListener("load", async () => {
  const savedCountry = localStorage.getItem("selectedCountry");
  if (!savedCountry) return;

  countrySelect.value = savedCountry;

  const countryArr = await getCountrybyCode(savedCountry);
  const country = countryArr[0];
  if (!country) return;

  fillCitiesSelect(citySelect, country.capital || []);
  citySelect.value = country.capital?.[0] || "";

  showSelectedCountryInfo();
  await showCountryDashboardInfo();
  await showHolidaysInfo();
  holidaysLoaded = true;
  await showEventbycity();
  eventsLoaded = true;
  await showWeather();
  weatherloaded = true;
  await getlongweekends();
  longweekendloaded = true;
  await updateSunCard();
  sunloaded = true;
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("dashboard-view").classList.add("active");
  navItems.forEach((i) => i.classList.remove("active"));
  document.querySelector('[data-view="dashboard"]').classList.add("active");
});

async function init() {
  try {
    const countries = await getCountries();
    fillCountriesSelect(countrySelect, countries);
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}
countrySelect.addEventListener("change", async () => {
  try {
    selectedCountryCode = countrySelect.value;
    if (!selectedCountryCode) return;
    const countryArr = await getCountrybyCode(selectedCountryCode);
    let country = countryArr[0];
    if (!country) return;
    selectedCity = fillCitiesSelect(citySelect, country.capital || []);
    localStorage.setItem("selectedCountry", countrySelect.value);
    holidaysLoaded = false;
    eventsLoaded = false;
    weatherloaded = false;
    longweekendloaded = false;
    sunloaded = false;
  } catch (error) {
    console.error("Error loading country details:", error);
  }
});
init();
yearselect.addEventListener("change", () => {
  holidaysLoaded = false;
});
citySelect.addEventListener("change", () => {
  eventsLoaded = false;
  weatherloaded = false;
  holidaysLoaded = false;
  longweekendloaded = false;
  sunloaded = false;
});
async function showSelectedCountryInfo() {
  if (!countrySelect.value || !citySelect.value || !yearselect.value) return;

  const countryArr = await getCountrybyCode(countrySelect.value);
  const country = countryArr[0];
  if (!country) return;
  let cartona = `
   <div class="selected-flag">
                  <img id="selected-country-flag" src="${country.flags.svg}" alt="flag 's ${country.name.common}">
                </div>
                <div class="selected-info">
                  <span class="selected-country-name" id="selected-country-name">${country.name.common}</span>
                  <span class="selected-city-name" id="selected-city-name">${citySelect.value}</span>
                </div>
                <button class="clear-selection-btn" id="clear-selection-btn">
                  <i class="fa-solid fa-xmark"></i>
                </button>
  `;
  document.getElementById("selected-destination").innerHTML = cartona;

  const closebtn = document.getElementById("clear-selection-btn");
  if (closebtn) {
    closebtn.addEventListener("click", () => {
      document.getElementById("selected-destination").innerHTML = "";
      countrySelect.value = "";
      citySelect.value = "";
      yearselect.value = "2026";
      document.getElementById("dashboard-country-info").innerHTML = "";
      document.getElementById("holidays-content").innerHTML = "";
      document.getElementById("holidays-selection").innerHTML = "";
      localStorage.removeItem("selectedCountry");
    });
  }
}
buttonexplore.addEventListener("click", () => {
  showSelectedCountryInfo();
  showCountryDashboardInfo();
  showHolidaysInfo();
  showEventbycity();
  showWeather();
  getlongweekends();
  updateSunCard();
  holidaysLoaded = true;
  weatherloaded = true;
  eventsLoaded = true;
  longweekendloaded = true;
  sunloaded = true;
});
async function showCountryDashboardInfo() {
  if (!countrySelect.value || !yearselect.value) return;

  try {
    const countryArr = await getCountrybyCode(countrySelect.value);
    let country = countryArr[0];
    if (!country) return;
    let utcOffset = country.timezones[0];
    let currentTime = startCountryClock(utcOffset);
    let capital = country.capital ? country.capital.join(", ") : "N/A";
    let population = country.population.toLocaleString();
    let area = country.area.toLocaleString() + " km²";
    let continent = country.continents[0] || "N/A";
    let callingCode = country.idd?.root
      ? country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : "")
      : "N/A";
    let drivingSide = country.car?.side || "N/A";
    let weekStart = country.startOfWeek || "N/A";
    let currencies = country.currencies
      ? Object.values(country.currencies)
          .map((c) => `${c.name} (${c.symbol})`)
          .join(", ")
      : "N/A";
    let languages = country.languages
      ? Object.values(country.languages).join(", ")
      : "N/A";
    let neighbors = country.borders || [];
    let mapsLink = country.maps?.googleMaps || "#";

    let cartona = `
      <div class="dashboard-country-header">
                <img src="${country.flags.svg}" alt="${country.name.common}" class="dashboard-country-flag">
                <div class="dashboard-country-title">
                  <h3>${country.name.common}</h3>
                  <p class="official-name">${country.name.official}</p>
                  <span class="region"><i class="fa-solid fa-location-dot"></i> ${country.region}</span>
                </div>
              </div>
      
      <div class="dashboard-local-time">
                 <div class="local-time-display">
                   <i class="fa-solid fa-clock"></i>
                   <span class="local-time-value" id="country-local-time">${currentTime}</span>
                   <span class="local-time-zone">${country.timezones[0]}</span>
                 </div>
               </div>
      
       <div class="dashboard-country-grid">
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-building-columns"></i>
                  <span class="label">Capital</span>
                  <span class="value">${capital}</span>
                </div>
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-users"></i>
                  <span class="label">Population</span>
                  <span class="value">${population}</span>
                </div>
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-ruler-combined"></i>
                  <span class="label">Area</span>
                  <span class="value">${area}</span>
                </div>
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-globe"></i>
                  <span class="label">Continent</span>
                  <span class="value">${continent}</span>
                </div>
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-phone"></i>
                  <span class="label">Calling Code</span>
                  <span class="value">${callingCode}</span>
                </div>
                <div class="dashboard-country-detail">
                  <i class="fa-solid fa-car"></i>
                  <span class="label">Driving Side</span>
                  <span class="value">${drivingSide}</span>
                </div>

        <div class="dashboard-country-detail">
                  <i class="fa-solid fa-calendar-week"></i>
                  <span class="label">Week Starts</span>
                  <span class="value">${weekStart}</span>
                </div>
              </div>
              
              <div class="dashboard-country-extras">
                <div class="dashboard-country-extra">
                  <h4><i class="fa-solid fa-coins"></i> Currency</h4>
                  <div class="extra-tags">
                    <span class="extra-tag">${currencies}</span>
                  </div>
                </div>
                <div class="dashboard-country-extra">
                  <h4><i class="fa-solid fa-language"></i> Languages</h4>
                  <div class="extra-tags">
                    <span class="extra-tag">${languages}</span>
                  </div>
                </div>
         <div class="dashboard-country-extra">
                  <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
                  <div class="extra-tags">
            ${neighbors.map((n) => `<span class="extra-tag border-tag">${n}</span>`).join(" ")}
          </div>
        </div>
      </div>
      <div class="dashboard-country-actions">

                      <a href="${mapsLink}" target="_blank" class="btn-map-link">

                  <i class="fa-solid fa-map"></i> View on Google Maps

                </a>

              </div>
    
    `;

    document.getElementById("dashboard-country-info").innerHTML = cartona;
  } catch (err) {
    console.error("Error loading country dashboard info:", err);
  }
}
async function showHolidaysInfo() {
  if (!countrySelect.value || !yearselect.value) return;
  const countryarr = await getCountrybyCode(countrySelect.value);
  const country = countryarr[0];
  const publicholidayarr = await getGetPublicHolidaysbyYear(
    yearselect.value,
    countrySelect.value,
  );
  let holidaycontent = "";
  let holidayheader = `
      <div class="current-selection-badge">
                <img src="https://flagcdn.com/w40/${countrySelect.value.toLowerCase()}.png" alt="${countrySelect.value}" class="selection-flag">
                <span>${country.name.common}</span>
                <span class="selection-year">${yearselect.value}</span>
              </div>`;

  for (let index = 0; index < publicholidayarr.length; index++) {
    const holiday = publicholidayarr[index];
    const dateObj = new Date(holiday.date);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const weekDay = weekDays[dateObj.getDay()];
    holidaycontent += `
          <div class="holiday-card">
              <div class="holiday-card-header">
                <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
                <button class="holiday-action-btn"><i class="fa-regular fa-heart"></i></button>
              </div>
              <h3>${holiday.localName}</h3>
              <p class="holiday-name">${holiday.name}</p>
              <div class="holiday-card-footer">
                <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i>${weekDay}</span>
                <span class="holiday-type-badge">Public</span>
              </div>
            </div>
     `;
  }
  document.getElementById("holidays-content").innerHTML = holidaycontent;
  document.getElementById("holidays-selection").innerHTML = holidayheader;
}
async function showEventbycity() {
  const data = await SearchEventsbyCity(citySelect.value, countrySelect.value);
  const evens = data?._embedded?.events || [];
  let cartona = "";
  if (evens.length === 0) {
    document.getElementById("events-content").innerHTML =
      "<p>No events found for this city.</p>";
    return;
  }
  evens.forEach((event) => {
    const venue = event._embedded?.venues?.[0];
    const location = venue
      ? `${venue.name}, ${venue.city?.name}`
      : "Unknown location";
    const imageUrl = event.images?.[0]?.url || "";
    const category = event.classifications?.[0]?.segment?.name || "Event";
    const date = event.dates?.start?.localDate || "";
    const time = event.dates?.start?.localTime || "";
    const eventName = event.name;
    const cityName = event._embedded?.venues?.[0]?.city?.name || "Unknown city";
    cartona += `
      <div class="event-card">
              <div class="event-card-image">
                <img src="${imageUrl}" alt="${event.name}">
                <span class="event-card-category">${category}</span>
                <button class="event-card-save"><i class="fa-regular fa-heart"></i></button>
              </div>
              <div class="event-card-body">
                <h3> ${eventName} in ${cityName}</h3>
                <div class="event-card-info">
                  <div><i class="fa-regular fa-calendar"></i>${date} ${time}</div>
                  <div><i class="fa-solid fa-location-dot"></i>${location}</div>
                </div>
                <div class="event-card-footer">
                  <button class="btn-event"><i class="fa-regular fa-heart"></i> Save</button>
                  <a href="${event.url}" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
                </div>
              </div>
            </div> `;
  });

  document.getElementById("events-content").innerHTML = cartona;
}
async function showWeather() {
  if (!countrySelect || !citySelect) return;

  const country = await getCountrybyCode(countrySelect.value);
  if (!country || !country.length) return;

  const countryData = country[0];

  if (!countryData.capitalInfo?.latlng) {
    console.error("No capital coordinates for this country");
    return;
  }

  const [lat, lon] = countryData.capitalInfo.latlng;
  const data = await GetWeatherForecast(lat, lon);

  if (!data || !data.current || !data.daily || !data.hourly) {
    console.error("Weather data not available");
    return;
  }

  const badge = document.querySelector(
    "#weather-view .current-selection-badge",
  );
  if (badge) {
    badge.querySelector(".selection-city").textContent =
      `• ${citySelect.value}`;
    badge.querySelector(".selection-flag").src = countryData.flags.svg;
    badge.querySelector("span").textContent = countryData.name.common;
  }
  renderWeeklyWeather(data.daily);
  renderHourlyWeather(data.hourly);
  renderDailyWeather(data.current, data.daily, citySelect.value);
}
function renderDailyWeather(current, daily, cityName) {
  const info = weatherCodes[Number(current.weather_code)] || {
    text: "Unknown",
    icon: "fa-sun",
  };
  document.querySelector(".weather-location span").textContent = cityName;
  document.querySelector(".weather-time").textContent = new Date(
    current.time,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  document.querySelector(".weather-hero-icon i").className =
    `fa-solid ${info.icon}`;
  document.querySelector(".temp-value").textContent = Math.round(
    current.temperature_2m,
  );
  document.querySelector(".weather-condition").textContent = info.text;
  document.querySelector(".weather-feels").textContent =
    ` Feels like ${Math.round(current.apparent_temperature)}°C`;
  document.querySelector(".high").textContent =
    `↑ ${Math.round(daily.temperature_2m_max[0])}°`;
  document.querySelector(".low").textContent =
    `↓ ${Math.round(daily.temperature_2m_min[0])}°`;
  // document.querySelector(".humidity .detail-value").innerHTML = ` ${current.relative_humidity_2m}%`;
  // document.querySelector(".wind .detail-value").textContent =  ` ${Math.round(current.wind_speed_10m)} km/h`;
  //   document.querySelector(".uv .detail-value").textContent =daily.uv_index_max ? daily.uv_index_max[0] : "--";
}
function renderWeeklyWeather(daily) {
  const container = document.querySelector(".forecast-list");
  container.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const code = Number(daily.weather_code[i]);
    const info = weatherCodes[code] || { icon: "fa-sun" };

    container.innerHTML += `
      <div class="forecast-day">
        <span>${i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <i class="fa-solid ${info.icon}"></i>
        <span>
          ${Math.round(daily.temperature_2m_max[i])}° /
          ${Math.round(daily.temperature_2m_min[i])}°
        </span>
      </div>
    `;
  }
}
function renderHourlyWeather(hourly) {
  const container = document.querySelector(".hourly-scroll");
  container.innerHTML = "";

  const nowHour = new Date().getHours();

  for (let i = 0; i < 12; i++) {
    const code = Number(hourly.weather_code[i]);
    const info = weatherCodes[code] || { icon: "fa-sun" };
    const hour = (nowHour + i) % 24;

    container.innerHTML += `
      <div class="hourly-item ${i === 0 ? "now" : ""}">
        <span>${i === 0 ? "Now" : hour + ":00"}</span>
        <i class="fa-solid ${info.icon}"></i>
        <span>${Math.round(hourly.temperature_2m[i])}°</span>
      </div>
    `;
  }
}
async function getlongweekends() {
  const data = await Getweekendlogday(yearselect.value, countrySelect.value);
  const country = await getCountrybyCode(countrySelect.value);
  let countryarr = country[0];
  let cartona = ` <div class="current-selection-badge">
                <img src="${countryarr.flags.svg}" alt="${countryarr.name.common}" class="selection-flag">
                <span>${countryarr.name.common}</span>
                <span class="selection-year">${yearselect.value}</span>
              </div>`;

  let content = "";

  data.forEach((item, index) => {
    let days = getDaysBetween(item.startDate, item.endDate);
    let daysVisual = "";
    days.forEach((day) => {
      const dayInfo = formatDay(day);
      const isWeekend = dayInfo.name === "Fri" || dayInfo.name === "Sat";
      daysVisual += `
        <div class="lw-day ${isWeekend ? "weekend" : ""}">
          <span class="name">${dayInfo.name}</span>
          <span class="num">${dayInfo.num}</span>
        </div>
      `;
    });
    content += ` <div class="lw-card">
              <div class="lw-card-header">
                <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${item.dayCount} Days</span>
                <button class="holiday-action-btn"><i class="fa-regular fa-heart"></i></button>   
              </div>
              <h3>Long Weekend #${index + 1}</h3>
              <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${formatDateRange(item.startDate, item.endDate)}</div>
            <div class="lw-info-box ${item.needBridgeDay ? "warning" : "success"}">
        <i class="fa-solid ${item.needBridgeDay ? "fa-circle-exclamation" : "fa-check-circle"}"></i>
        ${item.needBridgeDay ? "Need bridge day!" : "No extra days off needed!"}
      </div>
              <div class="lw-days-visual">
                    ${daysVisual}
              </div>
            </div>`;
  });
  document.getElementById("lw-content").innerHTML = content;
  document.querySelector(
    "#long-weekends-view .view-header-selection",
  ).innerHTML = cartona;
}
function getDaysBetween(startDate, endDate) {
  const days = [];

  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    days.push({
      dayName: weekDays[currentDate.getDay()],
      dayNumber: currentDate.getDate(),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}
function formatDay(day) {
  return {
    name: day.dayName.substring(0, 3),
    num: day.dayNumber,
  };
}
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = months[start.getMonth()];
  const startDay = start.getDate();

  const endMonth = months[end.getMonth()];
  const endDay = end.getDate();

  const year = start.getFullYear();

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}
async function Convertmoney() {
  const rates = await Getexchangecurrent(from.value);
  const rate = rates.conversion_rates;
  const result = Number(amount.value) * rate[to.value];
  const price = rate[to.value];
  const lastUpdateUTC = rates.time_last_update_utc;
  const dateOnly = new Date(lastUpdateUTC);
  const formattedDate = dateOnly.toLocaleDateString("en-GB");
  showconverting(price, result, formattedDate);
}
btnconvert.addEventListener("click", () => {
  Convertmoney();
});
function showconverting(price, result, formateddate) {
  let cartona = `
    <div class="conversion-display">
                <div class="conversion-from">
                  <span class="amount">${Number(amount.value)}</span>
                  <span class="currency-code">${from.value}</span>
                </div>
                <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
                <div class="conversion-to">
                  <span class="amount">${result}</span>
                  <span class="currency-code">${to.value}</span>
                </div>
              </div>
              <div class="exchange-rate-info">
                <p>1 ${from.value} = ${price} ${to.value}</p>
                <small>Last updated: ${formateddate}</small>
              </div>`;
  document.getElementById("currency-result").innerHTML = cartona;
}
async function updateSunCard() {
  const country = await getCountrybyCode(countrySelect.value);
  let countryarr = country[0];
  const [lat, lng] = countryarr.capitalInfo.latlng;
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const apiDate = today.toISOString().split("T")[0];
  const displayDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
 let sunTimes = await sunsetapi(lat, lng, apiDate);
 let dayLengthSeconds = sunTimes.day_length;
  let dayHoursDecimal = dayLengthSeconds / 3600;
  let nightHoursDecimal = 24 - dayHoursDecimal;
  let hours = Math.floor(dayLengthSeconds / 3600);
  let minutes = Math.floor((dayLengthSeconds % 3600) / 60);
 let nightHours = Math.floor(nightHoursDecimal);
 let nightMinutes = Math.round((nightHoursDecimal - nightHours) * 60);
 let percentage = ((dayLengthSeconds / 86400) * 100).toFixed(1);
 let darkness = `${nightHours}h ${nightMinutes}m`;
  let dayLengthFormatted = `${hours}h ${minutes}m`;

  let cartona = `  <div class="current-selection-badge">
                <img src="${countryarr.flags.svg}" alt="${countryarr.name.common}" class="selection-flag">
                <span>${countryarr.name.common}</span>
                <span class="selection-city">• ${citySelect.value}</span>
              </div> `;
              let citytime =`
               <div class="sun-location">
                  <h2><i class="fa-solid fa-location-dot"></i>${countryarr.capital }</h2>
                  <p>Sun times for your selected location</p>
                </div>
                <div class="sun-date-display">
                  <div class="date">${today}</div>
                  <div class="day">${dayName}</div>
                </div>
              `;
  let content = `
              <div class="sun-main-header">
                <div class="sun-location">
                  <h2><i class="fa-solid fa-location-dot"></i>  ${citySelect.value}</h2>
                  <p>Sun times for your selected location</p>
                </div>
                <div class="sun-date-display">
                  <div class="date">${displayDate}</div>
                  <div class="day">${dayName}</div>
                </div>
              </div>
              
              <div class="sun-times-grid">
                <div class="sun-time-card dawn">
                  <div class="icon"><i class="fa-solid fa-moon"></i></div>
                  <div class="label">Dawn</div>
                  <div class="time">${formatTime(sunTimes.civil_twilight_begin)}</div>
                  <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card sunrise">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Sunrise</div>
                  <div class="time">${formatTime(sunTimes.sunrise)}</div>
                  <div class="sub-label">Golden Hour Start</div>
                </div>
                <div class="sun-time-card noon">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Solar Noon</div>
                  <div class="time">${formatTime(sunTimes.solar_noon)}</div>
                  <div class="sub-label">Sun at Highest</div>
                </div>
                <div class="sun-time-card sunset">
                  <div class="icon"><i class="fa-solid fa-sun"></i></div>
                  <div class="label">Sunset</div>
                  <div class="time">${formatTime(sunTimes.sunset)}</div>
                  <div class="sub-label">Golden Hour End</div>
                </div>
                <div class="sun-time-card dusk">
                  <div class="icon"><i class="fa-solid fa-moon"></i></div>
                  <div class="label">Dusk</div>
                  <div class="time">${formatTime(sunTimes.civil_twilight_end)}</div>
                  <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card daylight">
                  <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
                  <div class="label">Day Length</div>
                  <div class="time">${dayLengthFormatted}</div>
                  <div class="sub-label">Total Daylight</div>
                </div>
                </div>
              `;
  let info = ` <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
              <div class="day-progress">
                <div class="day-progress-bar">
                  <div class="day-progress-fill" style="width: ${percentage}"></div>
                </div>
              </div>
              <div class="day-length-stats">
                <div class="day-stat">
                  <div class="value">${dayLengthFormatted}</div>
                  <div class="label">Daylight</div>
                </div>
                <div class="day-stat">
                  <div class="value">${percentage}</div>
                  <div class="label">of 24 Hours</div>
                </div>
                <div class="day-stat">
                  <div class="value">${darkness}</div>
                  <div class="label">Darkness</div>
                </div>
              </div>

            `;
  document.querySelector("#sun-times-view .view-header-selection").innerHTML =cartona;
    document.querySelector("#sun-times-content .sun-main-header").innerHTML=citytime;
  document.querySelector("#sun-times-content .sun-main-card").innerHTML = content;
  document.querySelector("#sun-times-content .day-length-card").innerHTML = info;
}

function formatTime(utcTime) {
 let date = new Date(utcTime);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function addtopplan()
{
   let cartona = `
       <div class="plan-card">
  <span class="badge event">EVENT</span>

  <h3 class="title">Ballet Performance in Andorra la Vella</h3>

  <div class="info">
    <div class="row">
      <span class="icon">📅</span>
      <span>Feb 10, 2026</span>
    </div>
    <div class="row">
      <span class="icon">📍</span>
      <span>Andorra la Vella Opera House</span>
    </div>
  </div>

  <button class="remove-btn" data-id="event-123" onclick="">
  🗑 Remove
</button>
</div>`
}