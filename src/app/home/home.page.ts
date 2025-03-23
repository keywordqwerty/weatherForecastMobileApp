import { Component, OnInit } from '@angular/core';
import { PreferencesService, UserPreferences} from '../services/preferences.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{
preferences: UserPreferences = {
  option1: false,
  option2: false,
  radioValue: 'option1'
};

  constructor(private preferencesService: PreferencesService) {}

  async ngOnInit(){
    await this.preferencesService.loadPreferences();
    this.preferences = this.preferencesService.getPreferences();
    console.log("Preferences Loaded", this.preferences);
  

  if(this.preferences.option2) {
    document.body.classList.add('dark');
   }else{
    document.body.classList.remove('dark');
  }
 }
}
