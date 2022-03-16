const axios = require("axios");
const { createClient } = require("redis");
const AWS = require("aws-sdk");
const region = "us-west-1";
const secretName =
  "arn:aws:secretsmanager:us-west-1:150110673283:secret:test_api_key-QLsVo2";

//Create Redis client
const clientRedis = createClient({
  url: "redis://good-redis-001.m9hlg1.0001.usw1.cache.amazonaws.com:6379",
});

exports.handler = async (event) => {
  const city = event["queryStringParameters"]
    ? event["queryStringParameters"]["city"].toLowerCase()
    : null;

  try {
    await clientRedis.connect();
    if (!city) {
      throw { message: "Please entera valid city name. Cannot be blank." };
    }

    //check if city data is already in cache
    const cityInCache = await clientRedis.get(city);
    if (cityInCache) {
      await clientRedis.quit();
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: cityInCache,
      };
    } else {
      //City is not in cache. fetch weather data from API
      let weather = await getWeatherFromAPI(city);
      //add to cache and then return weather data
      await clientRedis.set(city, JSON.stringify(weather.data));
      await clientRedis.expire(city, 60);
      await clientRedis.quit();

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(weather.data),
      };
    }
  } catch (err) {
    await clientRedis.quit();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(err.message),
    };
  }
};

const getWeatherFromAPI = async (_city, _key) => {
  return new Promise(async (resolve, reject) => {
    let weather;
    try {
      // Create a Secrets Manager client
      const client = new AWS.SecretsManager({
        region: region,
      });
      //Fetch api key from Secrets Manager
      let weatherApiKey = await client
        .getSecretValue({ SecretId: secretName })
        .promise();

      weatherApiKey = JSON.parse(weatherApiKey.SecretString).weather_api;
      weather = await axios({
        method: "GET",
        url: `https://api.openweathermap.org/data/2.5/weather?q=${_city}&APPID=${weatherApiKey}&units=metric`,
      });
      resolve(weather);
    } catch (err) {
      reject({ message: "City not found, or unknown weather API issue." });
    }
  });
};
