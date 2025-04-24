const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const pagesWrapper = document.getElementById("pages-wrapper");

let currentPageIndex = 0;
let touchStartX = 0;
let currentX = 0;
let isDragging = false;
let menuWasOpen = false;
let selectedCity = "Hamburg";

// Drawer Handling
function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("active");
  document.body.classList.add("drawer-open");
}
function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("active");
  document.body.classList.remove("drawer-open");
}
overlay.addEventListener("click", closeDrawer);

// Swipe Handling
document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  currentX = touchStartX;
  menuWasOpen = drawer.classList.contains("open");
  isDragging = true;
  if (menuWasOpen) drawer.style.transition = "none";
});
document.addEventListener("touchmove", (e) => {
  currentX = e.touches[0].clientX;
  const deltaX = currentX - touchStartX;
  if (menuWasOpen) {
    const translateX = Math.min(0, deltaX);
    drawer.style.transform = `translateX(${translateX}px)`;
  }
});
document.addEventListener("touchend", () => {
  const deltaX = currentX - touchStartX;
  drawer.style.transition = "";
  drawer.style.transform = "";
  isDragging = false;
  if (menuWasOpen && deltaX < -80) closeDrawer();
  else if (!menuWasOpen && touchStartX < 40 && deltaX > 80 && currentPageIndex === 0) openDrawer();
  else if (!menuWasOpen && deltaX < -50 && currentPageIndex === 0) switchToPage(1);
  else if (!menuWasOpen && deltaX > 50 && currentPageIndex === 1) switchToPage(0);
});

function switchToPage(index) {
  currentPageIndex = index;
  pagesWrapper.style.transform = `translateX(-${index * 100}vw)`;
}

// Kleidungstabellen
const maleClothing = {
  m1: ["Winterhose", "Pulli", "Winterjacke", "Mütze", "Winterschuhe", "Schal"],
  m2: ["Lange Hose", "Pulli", "Jacke", "Regenschirm", "Gummistiefel"],
  m3: ["Lange Hose", "Pulli", "Jacke", "Sneaker"],
  m4: ["Lange Hose", "Pulli", "Jacke", "Regenschirm", "Gummistiefel"],
  m5: ["Lange Hose", "Pulli", "Jacke", "Sneaker"],
  m6: ["Lange Hose", "T-shirt", "Regenschirm", "Gummistiefel"],
  m7: ["Lange Hose", "T-shirt", "Sonnenbrille", "Sneaker"],
  m8: ["Lange Hose", "T-shirt", "Sneaker"],
  m9: ["Kurze Hose", "T-shirt", "Regenschirm", "Gummistiefel"],
  m10: ["Kurze Hose", "T-shirt", "Sonnenbrille", "Sneaker"],
  m11: ["Kurze Hose", "T-shirt", "Sneaker"]
};
const femaleClothing = {
  w1: ["Winterhose", "Pulli", "Winterjacke", "Mütze", "Winterschuhe", "Schal"],
  w2: ["Lange Hose", "Pulli", "Jacke", "Regenschirm", "Gummistiefel"],
  w3: ["Lange Hose", "Pulli", "Jacke", "Sneaker"],
  w4: ["Lange Hose", "Pulli", "Jacke", "Regenschirm", "Gummistiefel"],
  w5: ["Lange Hose", "Pulli", "Jacke", "Sneaker"],
  w6: ["Lange Hose", "T-shirt", "Regenschirm", "Gummistiefel"],
  w7: ["Lange Hose", "T-shirt", "Sonnenbrille", "Sneaker"],
  w8: ["Lange Hose", "T-shirt", "Sneaker"],
  w9: ["Kurze Hose", "T-shirt", "Top", "Rock", "Kleid", "Regenschirm", "Gummistiefel"],
  w10: ["Kurze Hose", "T-shirt", "Top", "Rock", "Kleid", "Sonnenbrille", "Sneaker"],
  w11: ["Kurze Hose", "T-shirt", "Top", "Rock", "Kleid", "Sneaker"]
};

function getFigureKey(temp, weather, gender, main) {
  const w = weather.toLowerCase();
  let index;
  if (temp < 0) index = 1;
  else if (temp < 16) index = w.includes("schnee") ? 1 : w.includes("regen") ? 2 : 3;
  else if (temp < 19) index = w.includes("regen") ? 4 : 5;
  else if (temp < 23) index = w.includes("regen") ? 6 : (w.includes("sonne") || main === "Clear") ? 7 : 8;
  else index = w.includes("regen") ? 9 : w.includes("sonne") ? 10 : 11;
  return gender + index;
}

function updateClothingList(containerId, figureKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const items = figureKey.startsWith("m") ? maleClothing[figureKey] : femaleClothing[figureKey];
  if (!items) return;
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "clothing-item";
    div.innerHTML = `<img src="kleidung/${item.toLowerCase()}.png" alt="${item}"><span>${item}</span>`;
    container.appendChild(div);
  });
}

function updateFigure(containerId, figureKey) {
  document.getElementById(containerId).style.backgroundImage = `url('figuren/figur_${figureKey}.png')`;
}

function updateBackground(containerId, desc, main) {
  const w = desc.toLowerCase();
  let img = "clear.png";
  if (main === "Rain") img = "rain.gif";
  else if (main === "Snow") img = "snow.gif";
  else if (w.includes("wind")) img = "wind.gif";
  else if (main === "Clouds") img = w.includes("sonne") ? "sun.gif" : "cloudy.gif";
  else if (main === "Clear") img = w.includes("sonne") ? "sun.gif" : "clear.png";
  document.getElementById(containerId).style.backgroundImage = `url('hintergruende/${img}')`;
}

// Wetter laden
function fetchWeather(city) {
  const apiKey = "cedb69e9dcd26a48e0809b510363f059";
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=de`)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const main = data.weather[0].main;
      const gender = localStorage.getItem("gender") || "m";
      document.getElementById("city-name").textContent = data.name;
      document.getElementById("temperature").textContent = `${temp} °C`;
      document.getElementById("description").textContent = desc;
      updateBackground("main-content", desc, main);
      const key = getFigureKey(temp, desc, gender, main);
      updateFigure("figure", key);
      updateClothingList("clothing-section", key);
    });
}

function fetchWeatherTomorrow(city) {
  const apiKey = "cedb69e9dcd26a48e0809b510363f059";
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=de`)
    .then(res => res.json())
    .then(data => {
      const forecast = data.list.find(x => x.dt_txt.includes("12:00:00"));
      if (!forecast) return;
      const temp = Math.round(forecast.main.temp);
      const desc = forecast.weather[0].description;
      const main = forecast.weather[0].main;
      const gender = localStorage.getItem("gender") || "m";
      document.getElementById("city-name-tomorrow").textContent = data.city.name + " Morgen";
      document.getElementById("temperature-tomorrow").textContent = `${temp} °C`;
      document.getElementById("description-tomorrow").textContent = desc;
      updateBackground("main-content-tomorrow", desc, main);
      const key = getFigureKey(temp, desc, gender, main);
      updateFigure("figure-tomorrow", key);
      updateClothingList("clothing-section-tomorrow", key);
    });
}

// Städte-Menü
const cityMenu = document.getElementById("city-menu");
const cityOptions = document.querySelectorAll(".city-option");

cityOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    const city = btn.dataset.city;
    selectedCity = city;
    fetchWeather(city);
    fetchWeatherTomorrow(city);
    cityMenu.classList.remove("show");
  });
});

function openCityMenuRelativeTo(button) {
  const wrapper = button.closest(".button-wrapper");
  wrapper.appendChild(cityMenu);
  cityMenu.classList.add("show");
}

document.getElementById("city-button").addEventListener("click", (e) => {
  openCityMenuRelativeTo(e.target);
});
document.getElementById("city-button-tomorrow").addEventListener("click", (e) => {
  openCityMenuRelativeTo(e.target);
});

document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener("change", () => {
    localStorage.setItem("gender", radio.value);
    fetchWeather(selectedCity);
    fetchWeatherTomorrow(selectedCity);
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#city-button") &&
      !e.target.closest("#city-button-tomorrow") &&
      !e.target.closest("#city-menu")) {
    cityMenu.classList.remove("show");
  }
});

fetchWeather(selectedCity);
fetchWeatherTomorrow(selectedCity);