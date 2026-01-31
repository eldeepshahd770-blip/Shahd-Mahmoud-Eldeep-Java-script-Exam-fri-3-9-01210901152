export async function getCountries() {
  let response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
  if (response.ok) {
    let data = await response.json();
    console.log(data);
    return data;
  } else if (response.status === 400) {
    alert("Bad Data");
    return "bad";
  }
}
export async function getCountrybyCode(CountryCode) {
  let response = await fetch(
    `https://restcountries.com/v3.1/alpha/${CountryCode}`
  );
  if (response.ok) {
    let data = await response.json();
    console.log(data);
    return data;
  } else if (response.status === 400) {
    alert("Bad Data");
    return "bad";
  }
}


export async function getGetPublicHolidaysbyYear(year,code) {
    let response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`);
     if(response.ok)
     {
        let data = await response.json();
        return data;
     }
     else if (response.status=== 400) {
          alert("Bad Data");
     }
 }
export async function SearchEventsbyCity(city,code)
{
   
const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y&city=${city}&countryCode=${code}&size=20`)
    if(response.ok)
     {
        let data = await response.json();
         console.log(data);
        return data;
     }
     else if (response.status=== 400) {
          alert("Bad Data");
     }
}

export async function GetWeatherForecast(latitude, longitude) {
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`;
  const res = await fetch(url);
   if(res.ok)
     {
        let data = await res.json();
         console.log(data);
        return data;
     }
     else if (res.status=== 400) {
          alert("Bad Data");
     }
}

export async function Getweekendlogday(year,countrycode) {
  const response = await fetch(`https://date.nager.at/api/v3/LongWeekend/${year}/${countrycode}`)
    if(response.ok)
     {
        let data = await response.json();
         console.log(data);
        return data;
     }
     else if (response.status=== 400) {
          alert("Bad Data"); 
     }
} 


export async function getconver(from,to,amount) {
   const url = `https://v6.exchangerate-api.com/v6/805842951e5953ad31497176/pair/${from}/${to}/${amount}`;
  const res = await fetch(url);
   if(res.ok)
     {
        let data = await res.json();
         console.log(data);
        return data;
     }
     else if (res.status=== 400) {
          alert("Bad Data");
     }
}
export async function Getexchangecurrent(base = "USD") {
   const url = `https://v6.exchangerate-api.com/v6/805842951e5953ad31497176/latest/${base}`;
  const res = await fetch(url);
   if(res.ok)
     {
        let data = await res.json();
         console.log(data);
         return data;
     }
     else if (res.status=== 400) {
          alert("Bad Data");
     }
}

export async function sunsetapi(lat, lng,date) {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`;
  const res = await fetch(url);
   if(res.ok)
     {
        let data = await res.json();
         console.log(data);
         return data.results;
     }
     else if (res.status=== 400) {
          alert("Bad Data");
     }
}