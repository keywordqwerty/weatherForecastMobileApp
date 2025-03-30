import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, UserPreferences } from '../services/preferences.service' 
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.page.html',
  styleUrls: ['./settings-page.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPagePage implements OnInit {
  currentPreference: UserPreferences = {
    option1: false,
    option2: false,
    radioValue: 'option1'
  };
  

  constructor(private preferencesService: PreferencesService, private router: Router) { }

  async ngOnInit() {
    await this.preferencesService.loadPreferences();
    this.currentPreference = this.preferencesService.getPreferences();
  }

  async savePreferences(){
    await Preferences.set({
      key: 'userPreferences',
      value: JSON.stringify(this.currentPreference),
    })
   // await this.preferencesService.savePreferences(this.currentPreference);
   // console.log('User Preference saved:', this.currentPreference);
  }

  async resetPreferences(){
    
    await this.preferencesService.resetPreferences();
    this.currentPreference = this.preferencesService.getPreferences();
    console.log('Preferences have been reset', this.currentPreference);


  }

  toggleDarkMode() {
    console.log("Hello");
   // this.currentPreference.option2 = !this.currentPreference.option2; // Toggle the dark mode state
    localStorage.setItem('isDarkMode', String(this.currentPreference.option2)); // Save the state

    if (this.currentPreference.option2) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode on');
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode off');
    }
  }

  goBack(){
    this.router.navigate(['/forecast-page']);
  }
}
