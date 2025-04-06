import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForecastPagePageRoutingModule } from './forecast-page-routing.module';

import { ForecastPagePage } from './forecast-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForecastPagePageRoutingModule,
    ForecastPagePage,
  ],

})
export class ForecastPagePageModule {}
