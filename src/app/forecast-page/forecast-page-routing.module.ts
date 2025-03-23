import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForecastPagePage } from './forecast-page.page';

const routes: Routes = [
  {
    path: '',
    component: ForecastPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForecastPagePageRoutingModule {}
