import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation'
import axios from 'axios';

@Component({
  selector: 'app-forecast-page',
  templateUrl: './forecast-page.page.html',
  styleUrls: ['./forecast-page.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ForecastPagePage implements OnInit {
  cityName: string = 'Loading...';
  dayTime: string = 'Loading...';
  manualCity: string = '';
  weatherData: any = null;
  hourlyWeather: any[] = [];


  constructor() { }

 async ngOnInit() {
  await this.getCurrentLocationWeather();
  this.updateDateTime();
  }

  async getCurrentLocationWeather() {
    try { 
      const coordinates = await Geolocation.getCurrentPosition();
      const latitude = coordinates.coords.latitude;
      const longitude = coordinates.coords.longitude;

      console.log('Latitude:', latitude, 'Latitude:', longitude);

      await this.fetchWeatherByCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error getting location', error);
      this.cityName = 'Unable to fetch location';
    }
  }

    async fetchWeatherByCoordinates(latitude: number, longitude: number) {
      const apiKey = '8d1b670fb95048a38798edeb193ddc99';
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      this.updateWeatherData(response.data);
    }

    async fetchWeatherByCity(city: string){
      try{
        const apiKey = '8d1b670fb95048a38798edeb193ddc99'
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        this.updateWeatherData(response.data);
      } catch (error) {
        console.error ('Error fetching weather for city:', error);
        this.cityName = 'City not found';
      }
    }

    updateWeatherData(data: any){
     const currentWeather = data.list[0];
  this.cityName = `${data.city.name}, ${data.city.country}`;
  this.weatherData = {
    temperature: `${Math.round(currentWeather.main.temp)}°C`,
    description: currentWeather.weather[0].description,
    humidity: `${currentWeather.main.humidity}%`,
    wind: `${currentWeather.wind.speed} m/s`,
  };

  // Get the timezone offset (in seconds) from the API response
  const timezoneOffset = data.city.timezone; // Offset in seconds

  // Update hourly weather with interpolation for 1-hour intervals
  this.hourlyWeather = [];
  for (let i = 0; i < 4; i++) {
    const hourData1 = data.list[i]; // Current 3-hour interval
    const hourData2 = data.list[i + 1]; // Next 3-hour interval

    // Calculate the UTC timestamps for the current and next intervals
    const utcTimestamp1 = hourData1.dt * 1000; // Convert to milliseconds
    const utcTimestamp2 = hourData2.dt * 1000; // Convert to milliseconds

    // Adjust the timestamps to the local timezone using the API's timezone offset
    const localTimestamp1 = utcTimestamp1 + timezoneOffset * 1000;
    const localTimestamp2 = utcTimestamp2 + timezoneOffset * 1000;

    // Interpolate for 1-hour intervals
    for (let j = 0; j < 3; j++) {
      const interpolatedTimestamp =
        localTimestamp1 + (j * (localTimestamp2 - localTimestamp1)) / 3;

      const interpolatedTemperature =
        hourData1.main.temp +
        (j * (hourData2.main.temp - hourData1.main.temp)) / 3;

      const interpolatedDescription = hourData1.weather[0].description; // Use the description from the first interval

      // Format the interpolated time as a string
      const formattedTime = new Date(interpolatedTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      this.hourlyWeather.push({
        time: formattedTime,
        temperature: `${Math.round(interpolatedTemperature)}°C`,
        description: interpolatedDescription,
      });
    }
  }
   /*   this.cityName = `${data.name}, ${data.sys.country}`;
      this.weatherData = {
        temperature: `${Math.round(data.main.temp)}°C`,
        description: data.weather[0].description,
        humidity: `${data.main.humidity}%`,
        wind: `${data.wind.speed} m/s`,
      };

      //hourly
      this.hourlyWeather = data.list.slice(1, 5).map((hour: any) => ({
        time: new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: `${Math.round(hour.main.temp)}°C`,
        description: hour.weather[0].description,
      }));  */
    }

    /*  if (response.data && response.data.results.length > 0) {
        const location = response.data.results[0].components;
        this.cityName = '${location.city || location.town || location.village}, ${location.country}';
        document.getElementById('cityName')!.innerText = this.cityName;
      } else {
        this.cityName = 'Location not found';
        document.getElementById('cityName')!.innerText = this.cityName;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      this.cityName = 'Error fetching location';
      document.getElementById('cityName')!.innerText = this.cityName;
    }
  } */

  updateDateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric'});
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'});

    this.dayTime =  `${day}, ${date}, ${time}`;
    document.getElementById('dayTime')!.innerText = this.dayTime;
  }

  async onManualCitySubmit(){
    if (this.manualCity.trim() !== ``){
      await this.fetchWeatherByCity(this.manualCity);
    }
  }
}
