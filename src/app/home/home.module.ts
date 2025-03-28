import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { HomePageRoutingModule } from './home-routing.module';
import { addIcons } from 'ionicons';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    IonButton,
    IonIcon,
    ],
  declarations: [HomePage]
})
export class HomePageModule {}
