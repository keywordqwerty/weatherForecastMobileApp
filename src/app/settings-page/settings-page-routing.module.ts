import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPagePage } from './settings-page.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPagePageRoutingModule {}
