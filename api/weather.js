const NOT_FOUND_MESSAGE = "We couldn't find that city. Please check the spelling and try again.";
const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";

// weatherapi.com error codes that mean "no city to look up" (q missing, or no match)
const NOT_FOUND_CODES = [1003, 1006];

module.exports = async function handler(req, res) {
  const rawCity = Array.isArray(req.query.city) ? req.query.city[0] : req.query.city;
  const city = typeof rawCity === "string" ? rawCity.trim() : "";

  if (city === "" || city.length > 100) {
    return res.status(404).json({ message: NOT_FOUND_MESSAGE });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    console.error("Weather lookup failed: WEATHER_API_KEY is not set.");
    return res.status(500).json({ message: UNAVAILABLE_MESSAGE });
  }

  try {
    const url =
      "https://api.weatherapi.com/v1/current.json" +
      "?key=" + encodeURIComponent(apiKey) +
      "&q=" + encodeURIComponent(city);

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    let data = null;
    try {
      data = await response.json();
    } catch (parseError) {
      data = null;
    }

    if (!response.ok) {
      const code = data && data.error ? data.error.code : undefined;
      if (NOT_FOUND_CODES.includes(code)) {
        return res.status(404).json({ message: NOT_FOUND_MESSAGE });
      }
      console.error("Weather lookup failed: weatherapi.com answered with status " + response.status + ", code " + code + ".");
      return res.status(502).json({ message: UNAVAILABLE_MESSAGE });
    }

    if (!data || !data.location || !data.current || !data.current.condition) {
      console.error("Weather lookup failed: unexpected answer from weatherapi.com.");
      return res.status(502).json({ message: UNAVAILABLE_MESSAGE });
    }

    let icon = data.current.condition.icon;
    if (typeof icon === "string" && icon.startsWith("//")) {
      icon = "https:" + icon;
    }

    return res.status(200).json({
      city: data.location.name,
      country: data.location.country,
      localTime: data.location.localtime,
      description: data.current.condition.text,
      icon: icon,
      temperatureC: data.current.temp_c,
      feelsLikeC: data.current.feelslike_c,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      windDirection: data.current.wind_dir,
    });
  } catch (error) {
    console.error("Weather lookup failed: could not reach weatherapi.com.");
    return res.status(502).json({ message: UNAVAILABLE_MESSAGE });
  }
};
