


export function updateHeaderDateTime() {
  const now = new Date();


  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

  const day = days[now.getDay()]; 
  const month = months[now.getMonth()];
  const date = now.getDate(); 

  
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; 

  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  const timeStr = `${hours}:${formattedMinutes} ${ampm}`;


  const dateTimeStr = `${day}, ${month} ${date}, ${timeStr}`;

 
  document.getElementById("current-datetime").textContent = dateTimeStr;
}

export function fillCountriesSelect(select, countries) {
  select.innerHTML = '<option value="">Select Country</option>';

  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.countryCode; 
    option.textContent = country.name; 
    select.appendChild(option);
  });
}

export function fillCitiesSelect(select, cities) {
  select.innerHTML = '<option value="">Select City</option>';

  const citiesArray = Array.isArray(cities) ? cities : [];

  if (citiesArray.length === 0) return null;

  citiesArray.forEach((city, index) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;

    if (index === 0) {
      option.selected = true; 
    }

    select.appendChild(option);
  });

  
  return citiesArray[0];
}
