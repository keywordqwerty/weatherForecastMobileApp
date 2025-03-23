import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, UserPreferences } from '../services/preferences.service' 
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.page.html',
  styleUrls: ['./settings-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPagePage implements OnInit {
  currentPreference: UserPreferences = {
    option1: false,
    option2: false,
    radioValue: 'option1'
  };
  

  constructor(private preferencesService: PreferencesService) { }

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
}
