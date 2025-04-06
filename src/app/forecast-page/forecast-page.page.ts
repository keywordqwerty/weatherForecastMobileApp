import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation'
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import axios from 'axios';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-forecast-page',
  templateUrl: './forecast-page.page.html',
  styleUrls: ['./forecast-page.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ForecastPagePage implements OnInit {
  cityName: string = 'Loading...';
  dayTime: string = 'Loading...';
  manualCity: string = '';
  weatherData: any = null;
  hourlyWeather: any[] = [];
  dailyWeather: any[] = [];
  citySuggestions: any[] = []; 

  //=======SETTINGS MODAL============
  isSettingsOpen: boolean = false; // Controls the modal visibility
  isDarkMode: boolean = false; // Tracks dark mode state
  areNotificationsEnabled: boolean = false; // Tracks notification state
  temperatureUnit: 'C' | 'F' = 'C'; // Tracks temperature unit
  //=================================
  constructor(private router: Router, private alertController: AlertController) {}

 async ngOnInit() {
  await this.getCurrentLocationWeather();
  this.updateDateTime();

   // Initialize settings (e.g., from local storage)
   const savedDarkMode = localStorage.getItem('isDarkMode');
   const savedNotifications = localStorage.getItem('areNotificationsEnabled');
   const savedTemperatureUnit = localStorage.getItem('temperatureUnit');
    

   this.isDarkMode = savedDarkMode === 'true';
   this.areNotificationsEnabled = savedNotifications === 'true';
   console.log('Dark Mode State on Init: ', this.isDarkMode);
   this.temperatureUnit = (savedTemperatureUnit as 'C' | 'F') || 'C';

   
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode calss added to body');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode is not enabled'); 
    }
  }


  
  ionViewWillEnter() {

    //WEATHERDATA-----------------
     
    const cachedData = localStorage.getItem('cachedWeatherData');
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      this.cityName = parsedData.cityName;
      this.weatherData = parsedData.weatherData;
      this.hourlyWeather = parsedData.hourlyWeather;
      this.dailyWeather = parsedData.dailyWeather;

      console.log('Loaded cached weather data:', parsedData);
    } else {
      console.log('No cached weather data found.');
    }
    //WEATHERDATA---------------------

 
    //SEVERE WEATHER NOTIFICATIONS---------
    const savedNotifications = localStorage.getItem('areNotificationsEnabled');
    this.areNotificationsEnabled = savedNotifications === 'true'; 
    console.log('Severe Weather Notifications Enabled:', this.areNotificationsEnabled);
     if (this.areNotificationsEnabled) {
    this.checkForSevereWeatherAlerts();
  }
    //SEVERE WEATHER NOTIFICATIONS----------

    //TEMPS-----------
    console.log("SAVED TEMPERATURE UNIT: ", localStorage.getItem('temperatureUnit'));
    const savedTemperatureUnit = localStorage.getItem('temperatureUnit') || 'C'; 
    
    this.temperatureUnit = savedTemperatureUnit as 'C' | 'F'; 
    console.log('Temperature unit retrieved:', this.temperatureUnit);

    //temp conversion
    this.updateTemperatureUnit();
    //TEMPS------------

    //DARK MODE---------------
    const savedDarkMode = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedDarkMode === 'true'; 

   
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode class added to body');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode class removed from body');
    }
    //DARK MODE-----------------
  }

  //TEMPERATURE CONVERSION
  updateTemperatureUnit() {
    if (this.weatherData) {
      const tempInCelsius = parseFloat(this.weatherData.temperature.replace('°C', ''));
      this.weatherData.temperature =
        this.temperatureUnit === 'F'
          ? `${Math.round(tempInCelsius * 9 / 5 + 32)}°F` // Convert to Fahrenheit
          : `${Math.round(tempInCelsius)}°C`; // Keep in Celsius
    }
  
    if (this.hourlyWeather.length > 0) {
      this.hourlyWeather = this.hourlyWeather.map((hour) => {
        const tempInCelsius = parseFloat(hour.temperature.replace('°C', ''));
        return {
          ...hour,
          temperature:
            this.temperatureUnit === 'F'
              ? `${Math.round(tempInCelsius * 9 / 5 + 32)}°F` // Convert to Fahrenheit
              : `${Math.round(tempInCelsius)}°C`, // Keep in Celsius
        };
      });
    }
  
    if (this.dailyWeather.length > 0) {
      this.dailyWeather = this.dailyWeather.map((day) => {
        const tempInCelsius = parseFloat(day.temperature.replace('°C', ''));
        return {
          ...day,
          temperature:
            this.temperatureUnit === 'F'
              ? `${Math.round(tempInCelsius * 9 / 5 + 32)}°F` // Convert to Fahrenheit
              : `${Math.round(tempInCelsius)}°C`, // Keep in Celsius
        };
      });
    }
  }

  
  openSettings() {
    console.log('Opening settings modal...');
    this.isSettingsOpen = true;
  }
  
  closeSettings() {
    console.log('Closing settings modal...');
    this.isSettingsOpen = false;
  }


  toggleDarkMode(isDarkMode: boolean) {
    console.log('Dark Mode Toggled:', this.isDarkMode);
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('isDarkMode', String(this.isDarkMode));
  }

  
  toggleNotifications() {
    console.log('Notifications Toggled:', this.areNotificationsEnabled);
    localStorage.setItem('areNotificationsEnabled', String(this.areNotificationsEnabled));
  }

 
  changeTemperatureUnit() {
    console.log('Temperature Unit Changed:', this.temperatureUnit);
    localStorage.setItem('temperatureUnit', this.temperatureUnit);
  
  }

  //SEVERE WEATHER ALERT CHECKER------------
  checkForSevereWeatherAlerts() {
    if (!this.weatherData) {
      console.log('No weather data available to check for alerts.');
      return;
    }
  
    const severeConditions = ['storm', 'thunderstorm', 'tornado', 'hurricane', 'heavy rain', 'snow'];
    const currentCondition = this.weatherData.description.toLowerCase();
  
    const isSevere = severeConditions.some(condition => currentCondition.includes(condition));
    if (isSevere) {
      this.showSevereWeatherAlert(currentCondition);
    } else {
      console.log('No severe weather conditions detected.');
    }
  }
  //SEVERE WEATHER ALERT CHECKER----------------

  async showSevereWeatherAlert(condition: string) {
    const alert = await this.alertController.create({
      header: 'Severe Weather Alert',
      message: `Severe weather detected: ${condition}. Please take precautions!`,
      buttons: ['OK'],
    });
  
    await alert.present();
  }



  //CITY SUGGESTIONS------------------------
async onCityInput(event: any) {
  const query = event.target.value;
  if (query.trim().length === 0) {
    this.citySuggestions = [];
    return;
  }

  try {
    const apiKey = '';
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`
    );
    this.citySuggestions = response.data.list.map((city: any) => ({
      name: city.name,
      country: city.sys.country,
    }));
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    this.citySuggestions = [];
  }
}


selectCity(city: any) {
  this.manualCity = city.name;
  this.citySuggestions = []; 
}
//CITY SUGGESTIONS------------------------


  async getCurrentLocationWeather() {
    //CACHING WEATHER----------
    try {
      
      if (!navigator.onLine) {
        console.warn('Device is offline. Loading cached weather data.');
        const cachedData = localStorage.getItem('cachedWeatherData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          this.cityName = parsedData.cityName;
          this.weatherData = parsedData.weatherData;
          this.hourlyWeather = parsedData.hourlyWeather;
          this.dailyWeather = parsedData.dailyWeather;
        } else {
          this.cityName = 'No cached data available';
        }
        return;
      }
      
      // If online, fetch weather data
      const coordinates = await Geolocation.getCurrentPosition();
      const latitude = coordinates.coords.latitude;
      const longitude = coordinates.coords.longitude;
  
      console.log('Latitude:', latitude, 'Longitude:', longitude);
  
      await this.fetchWeatherByCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error getting location', error);
      this.cityName = 'Unable to fetch location';
    }
    //CACHING WEATHER--------------

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
      const apiKey = '';
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      this.updateWeatherData(response.data);
    }

    async fetchWeatherByCity(city: string) {
      try {
        const apiKey = '';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );
    
        if (!response.data || !response.data.list) {
          throw new Error('Invalid API response');
        }
    
        this.updateWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather for city:', error);
        this.cityName = 'City not found';
        this.weatherData = null;
        this.hourlyWeather = [];
        this.dailyWeather = [];
      }
    }

    updateWeatherData(data: any) {
      if (!data.list || data.list.length === 0) {
        console.error('No weather data available for the selected city.');
        this.cityName = 'City not found';
        this.weatherData = null;
        this.hourlyWeather = [];
        this.dailyWeather = [];
        return;
      }

      // Update current weather
      const currentWeather = data.list[0];
      this.cityName = `${data.city.name}, ${data.city.country}`;
      this.weatherData = {
        temperature: `${Math.round(currentWeather.main.temp)}°C`,
        description: currentWeather.weather[0].description,
        humidity: `${currentWeather.main.humidity}%`,
        wind: `${currentWeather.wind.speed} m/s`,
      };

    
        localStorage.setItem('cachedWeatherData', JSON.stringify({
        cityName: this.cityName,
        weatherData: this.weatherData,
        hourlyWeather: this.hourlyWeather,
        dailyWeather: this.dailyWeather,
     }));

      console.log('Weather data cached:', localStorage.getItem('cachedWeatherData'));
     
      
      const timezoneOffset = data.city.timezone; 
    
     
      this.hourlyWeather = [];
      for (let i = 0; i < 4; i++) {
        const hourData = data.list[i];
        this.hourlyWeather.push({
          time: new Date(hourData.dt * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temperature: `${Math.round(hourData.main.temp)}°C`,
          humidity: `${hourData.main.humidity}%`,
          wind: `${hourData.wind.speed} m/s`,
          description: hourData.weather[0].description,
        });
      }  


     
      this.dailyWeather = [];
      const dailyData: any[] = [];
      const seenDates = new Set();
    

      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
        if (!seenDates.has(date)) {
          dailyData.push(item);
          seenDates.add(date);
        }
      });
    
    
      // populate dailyWeather array
      dailyData.forEach((day: any) => {
        const localTimestamp = day.dt * 1000; // Use the raw timestamp from the API
        this.dailyWeather.push({
          date: new Date(localTimestamp).toLocaleDateString('en-US', {
            weekday: 'long',
          }),
          temperature: `${Math.round(day.main.temp)}°C`,
          humidity: `${day.main.humidity}%`,
          wind: `${day.wind.speed} m/s`,
          description: day.weather[0].description,
          icon: this.getWeatherIcon(day.weather[0].description), 
        });
      });
      
      this.updateTemperatureUnit();
      console.log('Daily Weather:', this.dailyWeather); 
    }


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


  getWeatherIcon(description: string): any{
    const lowerDescription = description.toLowerCase();
    if (lowerDescription.includes('sun') || lowerDescription.includes('clear')) {
      return 'fa-solid fa-sun'; // Sunny icon
    } else if (lowerDescription.includes('cloud')) {
      return 'fa-solid fa-cloud'; // Cloudy icon
    } else if (lowerDescription.includes('rain')) {
      return 'fa-solid fa-cloud-rain'; // Rainy icon
    } else if (lowerDescription.includes('storm') || lowerDescription.includes('thunder')) {
      return 'fa-solid fa-bolt'; // Thunderstorm icon
    } else if (lowerDescription.includes('snow')) {
      return 'fa-solid fa-snowflake'; // Snow icon
    } else if (lowerDescription.includes('mist') || lowerDescription.includes('fog')) {
      return 'fa-solid fa-smog'; // Fog/Mist icon
    }
    return 'fa-solid fa-question'; // for unknown description
  }

  onGearClick() {
    this.router.navigate(['/settings-page']);
    console.log('Gear button clicked');
  }




}
