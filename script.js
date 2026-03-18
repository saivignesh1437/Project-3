// script.js

const API_KEY = "84fc06aa3d734cafbf9130042261703";

/* ELEMENTS */
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const cityName    = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition   = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const addFavBtn   = document.getElementById("addFavBtn");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const successMsg  = document.getElementById("successMsg");
const cityList    = document.getElementById("cityList");
const dayButtons  = document.querySelectorAll(".days button");

/* STATE */
let forecastData = [];
let currentCity  = "";
let activeDayIndex = 0;

/* ── FETCH WEATHER ── */
async function getWeather(city) {
  try {
    const res  = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5`);
    const data = await res.json();

    if (data.error) { alert("City not found!"); return; }

    currentCity    = data.location.name;
    forecastData   = data.forecast.forecastday;
    activeDayIndex = 0;

    updateWeatherUI(forecastData[0]);
    setupForecastButtons();
  } catch (err) {
    console.error(err);
    alert("Error fetching weather");
  }
}

/* ── UPDATE UI ── */
function updateWeatherUI(day) {
  if (!day || !cityName) return;
  const date = new Date(day.date);
  const formatted = date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });
  cityName.textContent    = `${currentCity} - ${formatted}`;
  temperature.textContent = day.day.avgtemp_c + "°C";
  condition.textContent   = day.day.condition.text;
  weatherIcon.src         = "https:" + day.day.condition.icon;
}

/* ── FORECAST BUTTONS ── */
function setupForecastButtons() {
  if (!dayButtons.length) return;
  dayButtons.forEach((btn, i) => {
    const day = forecastData[i];
    if (!day) return;
    btn.textContent = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
    btn.onclick = () => {
      activeDayIndex = i;
      dayButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateWeatherUI(day);
    };
  });
  dayButtons.forEach(b => b.classList.remove("active"));
  if (dayButtons[activeDayIndex]) dayButtons[activeDayIndex].classList.add("active");
}

/* ── SEARCH ── */
if (searchBtn && cityInput) {
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  });
  cityInput.addEventListener("keypress", e => { if (e.key === "Enter") searchBtn.click(); });
}

/* ── FAVORITES HELPERS ── */
function getFavorites() { return JSON.parse(localStorage.getItem("favorites")) || []; }
function saveFavorites(favs) { localStorage.setItem("favorites", JSON.stringify(favs)); }

/* ── ADD FAVORITE ── */
if (addFavBtn) {
  addFavBtn.addEventListener("click", () => {
    if (!currentCity) { alert("Search for a city first!"); return; }
    const favs = getFavorites();
    if (!favs.includes(currentCity)) {
      favs.push(currentCity);
      saveFavorites(favs);
      alert(`${currentCity} added to favorites!`);
    } else {
      alert(`${currentCity} is already in favorites!`);
    }
  });
}

/* ── RENDER FAVORITES ── */
function renderFavorites(filter = "") {
  if (!cityList) return;
  const favs     = getFavorites();
  cityList.innerHTML = "";
  const filtered = favs.filter(c => c.toLowerCase().includes(filter.toLowerCase()));

  if (filtered.length === 0) {
    cityList.innerHTML = `<p class="empty-text">No matching cities found.</p>`;
    return;
  }

  filtered.forEach(city => {
    const div = document.createElement("div");
    div.className = "city-item";
    div.innerHTML = `
      <span>${city}</span>
      <div>
        <button class="view">View</button>
        <button class="remove">Remove</button>
      </div>`;
    div.querySelector(".view").addEventListener("click", () => {
      localStorage.setItem("selectedCity", city);
      window.location.href = "index.html";
    });
    div.querySelector(".remove").addEventListener("click", () => {
      saveFavorites(getFavorites().filter(c => c !== city));
      renderFavorites(filter);
    });
    cityList.appendChild(div);
  });
}

/* ── CONTACT FORM ── */
if (contactForm) {
  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !email || !message) { alert("Please fill all fields"); return; }
    if (successMsg) { successMsg.style.display = "block"; }
    contactForm.reset();
    setTimeout(() => { if (successMsg) successMsg.style.display = "none"; }, 3000);
  });
}

/* ── DARK MODE ── */
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });
}

/* ── INIT ── */
const selectedCity = localStorage.getItem("selectedCity");
if (selectedCity) {
  getWeather(selectedCity);
  localStorage.removeItem("selectedCity");
} else if (cityName) {
  getWeather("Hyderabad");
}