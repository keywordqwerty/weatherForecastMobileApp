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

  
  private defaultPreferences: UserPreferences = {
    option1: false,
    option2: false,
    radioValue: 'C',
  };

  //REAL PREFERENCES OF USER FROM STRUCTURE OF DEFAULT PREFERENCES 
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
