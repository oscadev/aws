import axios from "axios";
import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  //convert deg to worded direction - solution found online
  function getCardinalDirection(angle) {
    const directions = [
      "N (North)",
      "NE (North East)",
      "E (East)",
      "SE (South East)",
      "S (South)",
      "SW (South West)",
      "W (West)",
      "NW (North West)",
    ];
    return directions[Math.round(angle / 45) % 8];
  }

  const fetchWeather = () => {
    axios({
      method: "GET",
      url: `https://mblbk667mb.execute-api.us-west-1.amazonaws.com/default/getCurrentWeather?city=${city}`,
    })
      .then((weatherData) => {
        if (typeof weatherData.data == "object") {
          setWeather(weatherData.data);
        } else {
          alert(weatherData.data);
        }
      })
      .catch((err) => alert(err.response.data));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        fetchWeather();
      }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div>
        <input
          type="text"
          placeholder="Enter a city"
          value={city}
          onChange={(e) => setCity(e.currentTarget.value)}
        />
        <button type="submit">Search</button>
      </div>
      <h3>
        Results for{" "}
        <span style={{ textTransform: "capitalize" }}>
          {city ? city : "city"}
        </span>
      </h3>
      {weather ? (
        <div
          style={{
            width: 300,
            border: "solid 1px lightgrey",
            height: 200,
            padding: 8,
          }}
        >
          <div>Temperature: {Math.round(weather.main.temp)} ℃</div>
          <div style={{ textTransform: "capitalize" }}>
            Weather conditions: {weather.weather[0].description}
          </div>
          <br />
          <div>Wind: {weather.wind.speed} km/h</div>
          <div>
            Wind direction: {getCardinalDirection(Math.round(weather.wind.deg))}
          </div>
          <div>Pressure: {Math.round(weather.main.pressure)}</div>
          <div>Humidity: {Math.round(weather.main.humidity)}</div>
        </div>
      ) : (
        <div
          style={{
            width: 300,
            border: "solid 1px lightgrey",
            height: 200,
            padding: 8,
          }}
        ></div>
      )}
    </form>
  );
}

export default App;
