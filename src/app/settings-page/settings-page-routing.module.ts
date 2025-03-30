import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-page.page').then((m) => m.SettingsPagePage), // Load the standalone component
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPagePageRoutingModule {}
