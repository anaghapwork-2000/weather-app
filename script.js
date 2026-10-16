const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const result = document.getElementById("result");

const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";

function showResult(data) {
  document.getElementById("icon").src = data.icon;
  document.getElementById("icon").alt = data.description;
  document.getElementById("city").textContent = data.city;
  document.getElementById("country").textContent = data.country;
  document.getElementById("time").textContent = "Local time: " + data.localTime;
  document.getElementById("temp").textContent = Math.round(data.temperatureC) + "°C";
  document.getElementById("desc").textContent = data.description;
  document.getElementById("feels").textContent = Math.round(data.feelsLikeC) + "°C";
  document.getElementById("humidity").textContent = data.humidity + "%";
  document.getElementById("wind").textContent = Math.round(data.windKph) + " km/h " + data.windDirection;
  result.hidden = false;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  message.textContent = "";
  result.hidden = true;

  try {
    const response = await fetch("/api/weather?city=" + encodeURIComponent(cityInput.value));
    const data = await response.json();
    if (response.ok) {
      showResult(data);
    } else {
      message.textContent = data.message || UNAVAILABLE_MESSAGE;
    }
  } catch (error) {
    message.textContent = UNAVAILABLE_MESSAGE;
  }
});
