import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'forecast-page',
    pathMatch: 'full'
  },
  {
    path: 'settings-page',
    loadChildren: () => import('./settings-page/settings-page-routing.module').then( m => m.SettingsPagePageRoutingModule)
  },
  {
    path: 'forecast-page',
    loadChildren: () => import('./forecast-page/forecast-page.module').then( m => m.ForecastPagePageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
