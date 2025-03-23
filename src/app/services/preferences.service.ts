import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface UserPreferences{
  option1: boolean;
  option2: boolean;
  radioValue: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  //create object for default settings using the structure of UserPreferences
  private defaultPreferences: UserPreferences = {
    option1: false,
    option2: false,
    radioValue: 'option1',
  };

  //uses this object to hold the real preferences of the user
  private preferences: UserPreferences = {...this.defaultPreferences};

  constructor() { 
    this.loadPreferences();
    }
   
  async loadPreferences(): Promise<void>{
    const { value } = await Preferences.get({ key: 'userPreferences'});
    if(value) {
      this.preferences = JSON.parse(value);
    }
  }  

  async savePreferences(newPreferences: Partial<UserPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await Preferences.set({
      key: 'userPreferences',
      value: JSON.stringify(this.preferences),
    });
  }

  async resetPreferences(): Promise<void>{
    this.preferences = { ...this.defaultPreferences };
    await Preferences.set({
      key:'userPreferences',
      value: JSON.stringify(this.preferences),
    });
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

}
