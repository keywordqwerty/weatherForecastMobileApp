import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation'
import { Router } from '@angular/router';
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
  dailyWeather: any[] = [];

  //=======SETTINGS MODAL============
  isSettingsOpen: boolean = false; // Controls the modal visibility
  isDarkMode: boolean = false; // Tracks dark mode state
  areNotificationsEnabled: boolean = false; // Tracks notification state
  temperatureUnit: 'C' | 'F' = 'C'; // Tracks temperature unit
  //=================================
  constructor(private router: Router) {}

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

   // Apply dark mode class if dark mode is enabled
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode calss added to body');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode is not enabled'); 
    }
  }


  // Called every time the page is about to enter and become active
  ionViewWillEnter() {
    const savedDarkMode = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedDarkMode === 'true'; // Check for 'true'

    // Apply dark mode class if dark mode is enabled
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode class added to body');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode class removed from body');
    }
  }

  // Method to open the settings modal
  openSettings() {
    console.log('Opening settings modal...');
    this.isSettingsOpen = true;
  }
  
  closeSettings() {
    console.log('Closing settings modal...');
    this.isSettingsOpen = false;
  }

  // Method to toggle dark mode
  toggleDarkMode(isDarkMode: boolean) {
    console.log('Dark Mode Toggled:', this.isDarkMode);
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('isDarkMode', String(this.isDarkMode));
  }

  // Method to toggle severe weather notifications
  toggleNotifications() {
    console.log('Notifications Toggled:', this.areNotificationsEnabled);
    localStorage.setItem('areNotificationsEnabled', String(this.areNotificationsEnabled));
  }

  // Method to change the temperature unit
  changeTemperatureUnit() {
    console.log('Temperature Unit Changed:', this.temperatureUnit);
    localStorage.setItem('temperatureUnit', this.temperatureUnit);
    // Update temperature display logic here if needed
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
      const apiKey = '';
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      this.updateWeatherData(response.data);
    }

    async fetchWeatherByCity(city: string){
      try{
        const apiKey = ''
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        this.updateWeatherData(response.data);
      } catch (error) {
        console.error ('Error fetching weather for city:', error);
        this.cityName = 'City not found';
      }
    }

    updateWeatherData(data: any) {
      // Update current weather
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
    
      // Update hourly weather
      this.hourlyWeather = [];
      for (let i = 0; i < 4; i++) {
        const hourData = data.list[i];
        const utcTimestamp = hourData.dt * 1000; // Convert to milliseconds
        const localTimestamp = utcTimestamp + timezoneOffset * 1000;
    
        this.hourlyWeather.push({
          time: new Date(localTimestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temperature: `${Math.round(hourData.main.temp)}°C`,
          humidity: `${hourData.main.humidity}%`,
          wind: `${hourData.wind.speed} m/s`,
          description: hourData.weather[0].description,
        });
      }
    
      // Update daily weather
      this.dailyWeather = [];
      const dailyData: any[] = [];
      const seenDates = new Set();
    
      // Extract one forecast per day (first available entry for each day)
      data.list.forEach((item: any) => {
        const utcTimestamp = item.dt * 1000; // Convert to milliseconds
        const localTimestamp = utcTimestamp + timezoneOffset * 1000;
        const date = new Date(localTimestamp).toLocaleDateString('en-US');
    
        // Add the first entry for each day
        if (!seenDates.has(date)) {
          dailyData.push(item);
          seenDates.add(date);
        }
      });
    
      // Populate dailyWeather array
      dailyData.forEach((day: any) => {
        const localTimestamp = day.dt * 1000 + timezoneOffset * 1000;
        this.dailyWeather.push({
          date: new Date(localTimestamp).toLocaleDateString('en-US', {
            weekday: 'long',
          }),
          temperature: `${Math.round(day.main.temp)}°C`,
          humidity: `${day.main.humidity}%`,
          wind: `${day.wind.speed} m/s`,
          description: day.weather[0].description,
          icon: this.getWeatherIcon(day.weather[0].description), // Get icon for weather
        });
      });
    
      console.log('Daily Weather:', this.dailyWeather); // Debugging: Log dailyWeather array
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
    return 'fa-solid fa-question'; // Default icon for unknown description
  }

  onGearClick() {
    this.router.navigate(['/settings-page']);
    console.log('Gear button clicked');
  }




}
